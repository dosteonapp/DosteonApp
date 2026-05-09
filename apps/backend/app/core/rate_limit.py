from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request


def get_real_ip(request: Request) -> str:
    """Read the originating IP, honouring X-Forwarded-For / X-Real-IP set by
    Cloudflare or any other reverse proxy in front of the API."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    return get_remote_address(request)


limiter = Limiter(key_func=get_real_ip)

def setup_rate_limiting(app: FastAPI):
    """
    Setup rate limiting for the FastAPI application.
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
