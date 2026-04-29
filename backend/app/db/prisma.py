import asyncio
import time
import traceback
from prisma import Prisma
import logging

logger = logging.getLogger("prisma")
logger.setLevel(logging.DEBUG)

db = Prisma(auto_register=True)

# Only ping the DB once every 30s — not on every single request.
_last_ping_success: float = 0.0
_PING_INTERVAL = 30.0

async def connect_db():
    """Connect to DB with retry logic."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if not db.is_connected():
                await asyncio.wait_for(db.connect(), timeout=10.0)
                logger.info("Database connected successfully")
            return
        except Exception as e:
            logger.error(f"DB connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)  # exponential backoff: 1s, 2s
            else:
                logger.error("All DB connection attempts failed")
                raise

async def disconnect_db():
    """Safely disconnect from DB."""
    try:
        if db.is_connected():
            await db.disconnect()
            logger.info("Database disconnected")
    except Exception as e:
        logger.error(f"Error disconnecting from DB: {e}")
        logger.error(traceback.format_exc()) # Log the full traceback

async def ensure_connected():
    """Ensure DB is connected, reconnect if needed. Called before every request.

    Pings the DB at most once every 30 seconds to detect stale Supabase sockets
    without adding a round-trip to every single HTTP request.
    """
    global _last_ping_success

    if not db.is_connected():
        logger.warning("DB disconnected — attempting reconnect")
        await connect_db()
        _last_ping_success = time.monotonic()
        return

    # Skip ping if we pinged recently — fast path for the common case.
    if time.monotonic() - _last_ping_success < _PING_INTERVAL:
        return

    # Validate the connection is still alive (Supabase drops idle sockets after ~60s)
    try:
        await asyncio.wait_for(db.execute_raw("SELECT 1"), timeout=3.0)
        _last_ping_success = time.monotonic()
    except Exception as e:
        logger.warning(f"DB ping failed (stale connection) — reconnecting: {e}")
        try:
            await db.disconnect()
        except Exception:
            pass
        await asyncio.sleep(1.0)
        await connect_db()
        _last_ping_success = time.monotonic()