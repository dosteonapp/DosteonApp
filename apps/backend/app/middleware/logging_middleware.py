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
        
        # Extract basic auth context if it has been attached upstream
        # via dependencies (e.g. app.api.deps.SecurityContext bound into
        # request.state or scope["user"]). We keep this best-effort and
        # avoid importing FastAPI here to prevent cycles.
        user_id = None
        organization_id = None

        state = scope.get("state") or {}
        if isinstance(state, dict):
            user_id = state.get("user_id") or state.get("userId")
            organization_id = state.get("organization_id") or state.get("organizationId")

        # Log request start
        logger.info(
            f"Request started: {method} {path}",
            extra={"extra_context": {
                "method": method,
                "path": path,
                "user_id": user_id,
                "organization_id": organization_id,
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
                        "duration": process_time,
                        "user_id": user_id,
                        "organization_id": organization_id,
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
                    "duration": process_time,
                    "user_id": user_id,
                    "organization_id": organization_id,
                }}
            )
            raise e

