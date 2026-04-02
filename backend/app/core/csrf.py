"""CSRF protection — double-submit cookie pattern.

Flow:
  1. On authenticated GET (/auth/me), backend calls set_csrf_cookie() which
     writes a random token into a client-readable cookie (HttpOnly=False).
  2. For every state-changing request the frontend reads that cookie and
     echoes it back as the X-CSRF-Token request header.
  3. verify_csrf() compares the header value against the cookie value using
     a constant-time comparison.  Mismatch → 403.

No server-side token storage is needed; validity is proved by the fact that
only code running on the correct origin can read the cookie.
"""

import secrets

from fastapi import Cookie, Header, HTTPException, Response, status

from app.core.config import settings


def generate_csrf_token() -> str:
    """Return a cryptographically secure URL-safe token (≥ 32 bytes entropy)."""
    return secrets.token_urlsafe(32)


def set_csrf_cookie(response: Response) -> str:
    """Generate a new CSRF token, attach it as a cookie, and return the token.

    Cookie attributes:
    - HttpOnly=False : must be readable by frontend JavaScript.
    - Secure=True    : HTTPS only (disabled in development to allow plain HTTP).
    - SameSite=Lax   : blocks cross-site POSTs while allowing top-level GET navigations.
    - max_age=86400  : 24-hour lifetime; refreshed on every /auth/me call.
    """
    token = generate_csrf_token()
    is_production = settings.ENV == "production"
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=False,
        secure=is_production,
        samesite="lax",
        max_age=86400,
        path="/",
    )
    return token


async def verify_csrf(
    x_csrf_token: str | None = Header(None, alias="X-CSRF-Token"),
    csrf_token: str | None = Cookie(None),
) -> None:
    """FastAPI dependency — raise 403 if the CSRF double-submit check fails.

    Both the header and the cookie must be present and equal.
    secrets.compare_digest is used to prevent timing attacks.
    """
    if not x_csrf_token or not csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing. Reload the page and try again.",
        )
    if not secrets.compare_digest(x_csrf_token, csrf_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token invalid. Reload the page and try again.",
        )
