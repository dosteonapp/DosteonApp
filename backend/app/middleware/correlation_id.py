"""
Correlation ID middleware for end-to-end request tracing.

Every request gets a unique correlation_id that propagates through:
- API layer
- Service layer
- Repository layer
- Database operations

This enables complete audit trails and debugging for production issues.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import uuid
import contextvars
from typing import Optional

# Context variable for correlation ID (thread-safe, async-aware)
correlation_id_context: contextvars.ContextVar[str] = contextvars.ContextVar(
    "correlation_id", default=None
)


def get_correlation_id() -> str:
    """Get current request's correlation ID."""
    cid = correlation_id_context.get()
    return cid or "unknown"


def set_correlation_id(correlation_id: str):
    """Set correlation ID for current request."""
    correlation_id_context.set(correlation_id)


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds correlation_id to every request.

    If request contains 'X-Correlation-ID' header, use it.
    Otherwise, generate a new UUID.
    """

    async def dispatch(self, request: Request, call_next):
        # Try to get correlation ID from request header
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            request.headers.get("x-correlation-id", None),
        )

        # If not provided, generate new UUID
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        # Set in context variable (available to all async code)
        set_correlation_id(correlation_id)

        # Process request
        response = await call_next(request)

        # Add correlation ID to response headers for client reference
        response.headers["X-Correlation-ID"] = correlation_id

        return response
