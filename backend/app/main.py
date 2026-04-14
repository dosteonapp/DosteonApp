from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator, metrics as prom_metrics

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.prisma import connect_db, disconnect_db, ensure_connected
from app.middleware.request_id import RequestIDMiddleware, get_request_id
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.metrics import MetricsMiddleware, MetricsStore
from app.core.rate_limit import setup_rate_limiting

# Initialize logging as early as possible
setup_logging()

import logging as _logging
_startup_logger = _logging.getLogger("dosteon.startup")
_startup_logger.info(f"Starting Dosteon API | env={settings.APP_ENV} | debug={settings.DEBUG}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if not settings.is_production else None,
)

metrics_store = MetricsStore()
app.state.metrics_store = metrics_store

# Prometheus metrics instrumentator
instrumentator = Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
)

instrumentator.add(prom_metrics.default())

# Core Middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(MetricsMiddleware, store=metrics_store)

# Rate Limiting
setup_rate_limiting(app)

async def _purge_stale_deleted_records():
    """GDPR data retention — hard-delete anonymized records older than 90 days.

    Profiles deleted via /auth/account are anonymized immediately but kept
    for 90 days for audit/recovery purposes. This task permanently removes them.
    Runs once at startup; for production, wire this to a nightly cron instead.
    """
    from app.db.prisma import db
    from app.core.logging import get_logger
    from datetime import timedelta

    logger = get_logger("retention")
    cutoff = datetime.utcnow() - timedelta(days=90)

    try:
        deleted_profiles = await db.profile.delete_many(
            where={"deleted_at": {"lt": cutoff}}
        )
        deleted_orgs = await db.organization.delete_many(
            where={"deleted_at": {"lt": cutoff}}
        )
        if deleted_profiles or deleted_orgs:
            logger.info(
                f"Retention purge: removed {deleted_profiles} profiles, "
                f"{deleted_orgs} organizations older than 90 days."
            )
    except Exception as e:
        logger.warning(f"Retention purge failed (non-fatal): {e}")


async def _validate_supabase_admin():
    """Verify the Supabase client is using the service role key.

    Makes a cheap admin API call at startup. If it returns 403 or throws,
    we log a loud CRITICAL error so Render logs surface the problem
    immediately — instead of discovering it from user signup complaints.
    """
    from app.core.logging import get_logger
    from app.core.supabase import supabase

    logger = get_logger("startup.supabase")
    try:
        # Cheapest admin call: list 1 user — just to verify key permissions
        supabase.auth.admin.list_users(page=1, per_page=1)
        logger.info("Supabase admin client: OK (service role key confirmed)")
    except Exception as e:
        err = str(e).lower()
        if "403" in err or "user not allowed" in err or "forbidden" in err:
            logger.critical(
                "SUPABASE ADMIN CLIENT IS MISCONFIGURED — "
                "admin.list_users returned 403. The service role key is missing, "
                "wrong, or Supabase has disabled admin access. "
                "Signup and email verification WILL FAIL until this is fixed. "
                f"Raw error: {e}"
            )
        else:
            logger.error(
                f"Supabase admin client check failed (non-403): {e}. "
                "Signup may be degraded."
            )


@app.on_event("startup")
async def startup_event():
    try:
        await connect_db()
    except Exception as e:
        from app.core.logging import get_logger
        logger = get_logger("startup")
        logger.error(f"Failed to connect to database on startup: {e}")

    # Validate Supabase admin client — loud failure if service role key is wrong
    import asyncio
    asyncio.create_task(_validate_supabase_admin())

    # Run GDPR retention purge in the background — non-blocking, non-fatal
    asyncio.create_task(_purge_stale_deleted_records())

    # Attach Prometheus metrics endpoint and instrumentation
    try:
        instrumentator.instrument(app).expose(app, include_in_schema=False, endpoint="/metrics")
    except Exception as e:
        from app.core.logging import get_logger
        logger = get_logger("metrics")
        logger.error(f"Failed to initialize Prometheus metrics: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await disconnect_db()

# CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.middleware("http")
async def db_reconnect_middleware(request: Request, call_next):
    """Ensure DB is connected before every request — handles Supabase free tier drops."""
    try:
        await ensure_connected()
    except Exception as e:
        from app.core.logging import get_logger
        logger = get_logger("db_middleware")
        logger.error(f"DB reconnect failed: {e}")
    return await call_next(request)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    from app.core.logging import get_logger
    logger = get_logger("root")
    logger.info("Root endpoint accessed")
    return {
        "service": "Dosteon API",
        "version": "1.0.0"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    """Health check — accepts GET and HEAD. Includes supabase_admin signal."""
    from app.core.supabase import supabase
    try:
        supabase.auth.admin.list_users(page=1, per_page=1)
        supabase_admin = "ok"
    except Exception:
        supabase_admin = "degraded"
    return {"status": "ok", "supabase_admin": supabase_admin}


@app.get("/health/live")
async def health_live():
    """Liveness probe — no DB check, just confirms the process is running."""
    response: dict = {"status": "ok"}
    if not settings.is_production:
        response["env"] = settings.APP_ENV
    return response


@app.get("/health/ready")
async def health_ready():
    """Readiness probe — verifies Prisma can reach the database.

    Returns 200 with {"status": "ok"} on success or 503 with
    {"status": "error", "detail": "..."} on failure.
    """
    from app.db.prisma import db
    from app.core.logging import get_logger
    logger = get_logger("health_ready")
    try:
        await db.execute_raw("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        logger.error("Readiness check failed", exc_info=e)
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "detail": "Dependency check failed. See logs with this request_id for details.",
                "request_id": get_request_id(),
            },
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    from app.core.logging import get_logger
    logger = get_logger("http_exception")
    logger.warning(
        "HTTPException raised",
        extra={"extra_context": {"status_code": exc.status_code, "detail": exc.detail}},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "request_id": get_request_id(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    from app.core.logging import get_logger
    logger = get_logger("unhandled_exception")
    logger.error("Unhandled exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "request_id": get_request_id(),
        },
    )

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path_name: str, request: Request):
    """Fallback handler for unmatched routes.

    Returns a proper 404 status code and logs the path for debugging,
    instead of printing to stdout.
    """
    from app.core.logging import get_logger
    logger = get_logger("not_found")
    logger.info("404 catch-all hit", extra={"extra_context": {"path": path_name, "method": request.method}})
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Not Found by Dosteon Backend",
            "path_received": path_name,
            "request_id": get_request_id(),
        },
    )