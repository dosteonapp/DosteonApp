from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.prisma import connect_db, disconnect_db
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.core.rate_limit import setup_rate_limiting

# Initialize logging as early as possible
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Core Middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RequestLoggingMiddleware)

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

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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


 
