"""Login attempt tracking and temporary account lockout.

Strategy:
- Email is hashed (sha256) before storage — never persists plaintext.
- Lockout check happens BEFORE calling Supabase so we never reveal email existence.
- All failure paths return the same generic 401/403 message.

Backoff schedule:
  attempts >= 5  → lock for 1 minute
  attempts >= 7  → lock for 5 minutes
  attempts >= 10 → lock for 15 minutes
"""

import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.db.prisma import db


def _hash_email(email: str) -> str:
    return hashlib.sha256(email.lower().strip().encode()).hexdigest()


def _lockout_duration(attempts: int) -> timedelta | None:
    """Return the lockout window for a given attempt count, or None if no lockout."""
    if attempts >= 10:
        return timedelta(minutes=15)
    if attempts >= 7:
        return timedelta(minutes=5)
    if attempts >= 5:
        return timedelta(minutes=1)
    return None


async def check_lockout(email: str) -> None:
    """Raise 403 if the email is currently locked out.

    Called before the Supabase auth attempt so we never leak
    whether the email exists in the system.
    """
    email_hash = _hash_email(email)

    try:
        record = await db.loginattempt.find_unique(where={"email_hash": email_hash})
    except Exception:
        # DB unavailable — fail open (don't block legitimate users)
        return

    if not record or not record.last_failed_at:
        return

    duration = _lockout_duration(record.attempts)
    if duration is None:
        return

    now = datetime.now(timezone.utc)
    last_failed = record.last_failed_at
    if last_failed.tzinfo is None:
        last_failed = last_failed.replace(tzinfo=timezone.utc)

    if now - last_failed < duration:
        remaining = int((duration - (now - last_failed)).total_seconds())
        minutes = remaining // 60
        seconds = remaining % 60
        if minutes > 0:
            wait = f"{minutes} minute{'s' if minutes != 1 else ''}"
        else:
            wait = f"{seconds} second{'s' if seconds != 1 else ''}"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Too many failed login attempts. Please try again in {wait}.",
        )


async def record_failure(email: str) -> None:
    """Increment the failure counter for this email hash."""
    email_hash = _hash_email(email)
    now = datetime.now(timezone.utc)

    try:
        await db.loginattempt.upsert(
            where={"email_hash": email_hash},
            data={
                "create": {
                    "email_hash": email_hash,
                    "attempts": 1,
                    "last_failed_at": now,
                },
                "update": {
                    "attempts": {"increment": 1},
                    "last_failed_at": now,
                },
            },
        )
    except Exception:
        pass  # Don't break login flow if tracking fails


async def reset_attempts(email: str) -> None:
    """Clear the failure record on successful login."""
    email_hash = _hash_email(email)

    try:
        await db.loginattempt.delete_many(where={"email_hash": email_hash})
    except Exception:
        pass  # Non-critical cleanup — ignore errors
