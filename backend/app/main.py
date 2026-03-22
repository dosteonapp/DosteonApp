from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.prisma import connect_db, disconnect_db, ensure_connected
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.metrics import MetricsMiddleware, MetricsStore
from app.core.rate_limit import setup_rate_limiting

# Initialize logging as early as possible
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

metrics_store = MetricsStore()
app.state.metrics_store = metrics_store

# Core Middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(MetricsMiddleware, store=metrics_store)

# Rate Limiting
setup_rate_limiting(app)

@app.on_event("startup")
async def startup_event():
    try:
        await connect_db()
    except Exception as e:
        from app.core.logging import get_logger
        logger = get_logger("startup")
        logger.error(f"Failed to connect to database on startup: {e}")

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

@app.get("/health")
async def health():
    """Health check endpoint — used by UptimeRobot to keep Render warm."""
    return {"status": "ok"}


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    from app.core.logging import get_logger
    logger = get_logger("http_exception")
    logger.warning("HTTPException raised", extra={"extra_context": {"status_code": exc.status_code, "detail": exc.detail}})
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    from app.core.logging import get_logger
    logger = get_logger("unhandled_exception")
    logger.error("Unhandled exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
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
        },
    )