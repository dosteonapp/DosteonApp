import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict

class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        from app.middleware.request_id import get_request_id
        
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": get_request_id()
        }
        
        # Add extra context if provided
        if hasattr(record, "extra_context"):
            log_data.update(record.extra_context)
            
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data, default=str)

def setup_logging():
    """
    Setup structured logging for production.
    Standard logs go to stdout in JSON format for cloud observability.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    # In development, you might want a human-readable formatter
    # In production, use StructuredFormatter
    handler.setFormatter(StructuredFormatter())
    
    root_logger.addHandler(handler)
    
    # Force uvicorn loggers to use our formatter
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logging_logger = logging.getLogger(logger_name)
        logging_logger.handlers = [handler]
        logging_logger.propagate = False

def get_logger(name: str):
    return logging.getLogger(f"dosteon.{name}")

# Usage Example:
# logger.info("User logged in", extra={"extra_context": {"user_id": "123"}})
