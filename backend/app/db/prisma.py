import asyncio
import traceback
from prisma import Prisma
import logging

logger = logging.getLogger("prisma")
logger.setLevel(logging.DEBUG)

db = Prisma(auto_register=True)

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
    """Ensure DB is connected, reconnect if needed. Called before every request."""
    if not db.is_connected():
        logger.warning("DB disconnected — attempting reconnect")
        await connect_db()
        return
    # Validate the connection is still alive (Supabase drops idle sockets after ~60s)
    try:
        await asyncio.wait_for(db.execute_raw("SELECT 1"), timeout=3.0)
    except Exception as e:
        logger.warning(f"DB ping failed (stale connection) — reconnecting: {e}")
        try:
            await db.disconnect()
        except Exception:
            pass
        await connect_db()