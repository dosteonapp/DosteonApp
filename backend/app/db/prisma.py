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

# Serialise concurrent connection attempts — only one db.connect() at a time.
_connect_lock = asyncio.Lock()

async def connect_db():
    """Connect to DB with retry logic. Max 2 attempts × 8s = 17s worst case."""
    max_retries = 2
    for attempt in range(max_retries):
        try:
            if not db.is_connected():
                await asyncio.wait_for(db.connect(), timeout=8.0)
                logger.info("Database connected successfully")
            return
        except Exception as e:
            logger.error(f"DB connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1.0)
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

    Uses a lock so concurrent page-load requests don't race to call db.connect()
    simultaneously (multiple concurrent connects corrupt the Prisma engine state).
    Pings the live DB at most once every 30 seconds to avoid a round-trip on
    every single HTTP request.
    """
    global _last_ping_success

    if not db.is_connected():
        async with _connect_lock:
            # Re-check inside the lock — a concurrent caller may have just connected.
            if not db.is_connected():
                logger.warning("DB disconnected — attempting reconnect")
                await connect_db()
                _last_ping_success = time.monotonic()
        return

    # Fast path: skip ping if we checked recently.
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