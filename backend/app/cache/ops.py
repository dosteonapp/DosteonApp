import json
import logging
from typing import Any, Optional

from app.cache.client import get_redis

logger = logging.getLogger("cache")

# Simple in-process counters (not Prometheus — avoids import overhead).
# /metrics endpoint can expose these via MetricsStore.cache_summary().
_hits: dict[str, int] = {}
_misses: dict[str, int] = {}


def _record_hit(resource: str) -> None:
    _hits[resource] = _hits.get(resource, 0) + 1


def _record_miss(resource: str) -> None:
    _misses[resource] = _misses.get(resource, 0) + 1


def cache_summary() -> dict:
    """Return hit/miss counts and hit rates per resource. Called by /metrics."""
    result: dict[str, dict] = {}
    all_resources = set(list(_hits.keys()) + list(_misses.keys()))
    for r in all_resources:
        h = _hits.get(r, 0)
        m = _misses.get(r, 0)
        total = h + m
        result[r] = {
            "hits": h,
            "misses": m,
            "hit_rate": round(h / total, 3) if total > 0 else 0.0,
        }
    return result


async def cache_get(key: str, resource: str = "unknown") -> Optional[Any]:
    """Return deserialized value for key, or None on miss/error."""
    try:
        r = await get_redis()
        if r is None:
            return None
        raw = await r.get(key)
        if raw is None:
            _record_miss(resource)
            return None
        _record_hit(resource)
        return json.loads(raw)
    except Exception as e:
        logger.warning("cache_get failed key=%s: %s", key, e)
        return None


async def cache_set(key: str, value: Any, ttl: int) -> None:
    """Serialize value and store with TTL in seconds. Silently no-ops on error."""
    try:
        r = await get_redis()
        if r is None:
            return
        await r.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.warning("cache_set failed key=%s: %s", key, e)


async def cache_delete(*keys: str) -> None:
    """Delete one or more keys. Silently no-ops on error."""
    if not keys:
        return
    try:
        r = await get_redis()
        if r is None:
            return
        await r.delete(*keys)
    except Exception as e:
        logger.warning("cache_delete failed keys=%s: %s", keys, e)
