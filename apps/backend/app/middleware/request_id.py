from starlette.types import ASGIApp, Receive, Scope, Send
import uuid
from contextvars import ContextVar

request_id_ctx_var: ContextVar[str] = ContextVar("request_id", default="")

class RequestIDMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Simple header check for request id
        headers = dict(scope.get("headers", []))
        request_id = headers.get(b"x-request-id", str(uuid.uuid4()).encode()).decode()
        
        token = request_id_ctx_var.set(request_id)
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = message.get("headers", [])
                headers.append((b"x-request-id", request_id.encode()))
                message["headers"] = headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            request_id_ctx_var.reset(token)

def get_request_id() -> str:
    return request_id_ctx_var.get()

