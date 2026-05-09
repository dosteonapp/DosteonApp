from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/metrics")
async def get_metrics(request: Request):
    """Return in-process metrics for the current FastAPI instance.

    This is intentionally JSON-based (not Prometheus text format) so the
    frontend ops dashboard can consume it directly.
    """

    store = getattr(request.app.state, "metrics_store", None)
    if store is None:
        return {
            "total_requests": 0,
            "total_errors": 0,
            "error_rate": 0.0,
            "p95_latency_ms": None,
            "per_path": {},
        }

    return store.summary()
