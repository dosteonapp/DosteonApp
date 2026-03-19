from starlette.types import ASGIApp, Receive, Scope, Send
import time
from app.core.logging import get_logger

logger = get_logger("middleware.logging")

class RequestLoggingMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.perf_counter()
        path = scope.get("path", "")
        method = scope.get("method", "")
        # BRUTE FORCE LOGGING FOR 404 DEBUGGING
        print(f"DEBUG: INCOMING REQUEST: {method} {path}")
        
        # Log request start
        logger.info(
            f"Request started: {method} {path}",
            extra={"extra_context": {
                "method": method,
                "path": path,
            }}
        )
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                process_time = time.perf_counter() - start_time
                status_code = message.get("status", 0)
                
                logger.info(
                    f"Request finished: {method} {path} - Status: {status_code} - Duration: {process_time:.4f}s",
                    extra={"extra_context": {
                        "method": method,
                        "path": path,
                        "status_code": status_code,
                        "duration": process_time
                    }}
                )
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as e:
            process_time = time.perf_counter() - start_time
            logger.error(
                f"Request failed: {method} {path} - Error: {str(e)} - Duration: {process_time:.4f}s",
                extra={"extra_context": {
                    "method": method,
                    "path": path,
                    "error": str(e),
                    "duration": process_time
                }}
            )
            raise e

