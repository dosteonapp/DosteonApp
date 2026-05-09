import asyncio
from typing import Any, Awaitable, Callable, TypeVar

from app.core.logging import get_logger

T = TypeVar("T")

logger = get_logger("retry")


async def with_retry(
    fn: Callable[[], Awaitable[T]],
    max_attempts: int = 3,
    base_delay: float = 0.1,
) -> T:
    """Execute an async operation with exponential backoff.

    Retries on any exception up to `max_attempts` times, waiting
    `base_delay * 2**(attempt-1)` seconds between attempts.

    A warning is logged on each retry attempt with the attempt number
    and exception message. The final failure is re-raised.
    """
    attempt = 1
    while True:
        try:
            return await fn()
        except Exception as exc:  # noqa: BLE001
            if attempt >= max_attempts:
                # Give callers the original exception once retries are exhausted
                raise

            # Log a structured warning for observability
            logger.warning(
                "Operation failed, retrying",
                extra={
                    "extra_context": {
                        "attempt": attempt,
                        "max_attempts": max_attempts,
                        "error": str(exc),
                    }
                },
            )

            delay = base_delay * (2 ** (attempt - 1))
            await asyncio.sleep(delay)
            attempt += 1
