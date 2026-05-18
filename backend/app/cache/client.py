import os
import logging
from typing import Optional

logger = logging.getLogger("cache")

try:
    import redis.asyncio as aioredis
    _redis_available = True
except ImportError:
    _redis_available = False

_redis_client: Optional["aioredis.Redis"] = None  # type: ignore[name-defined]

REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "true").lower() == "true"
REDIS_URL: str = os.getenv("REDIS_URL", "")
CACHE_VERSION: str = os.getenv("CACHE_VERSION", "v1")


async def get_redis() -> Optional["aioredis.Redis"]:  # type: ignore[name-defined]
    """Return the shared Redis client, or None if disabled/unavailable."""
    global _redis_client
    if not _redis_available or not REDIS_ENABLED or not REDIS_URL:
        return None
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=1,
                retry_on_timeout=False,
            )
            await _redis_client.ping()
            safe_url = REDIS_URL.split("@")[-1] if "@" in REDIS_URL else REDIS_URL
            logger.info("Redis connected: %s", safe_url)
        except Exception as e:
            logger.warning("Redis unavailable — cache disabled: %s", e)
            _redis_client = None
    return _redis_client


async def connect_cache() -> None:
    await get_redis()


async def disconnect_cache() -> None:
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.aclose()
        except Exception:
            pass
        _redis_client = None
