from time import perf_counter
from typing import Dict, List

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class MetricsStore:
    """In-memory request metrics store.

    Tracks per-path request counts, error counts, and recent latencies.
    This is intentionally simple and process-local – suitable for a single
    FastAPI instance or small MVP deployment.
    """

    def __init__(self, max_samples_per_path: int = 200) -> None:
        self._max_samples = max_samples_per_path
        self._per_path: Dict[str, Dict[str, object]] = {}

    def _get_path_bucket(self, path: str) -> Dict[str, object]:
        bucket = self._per_path.get(path)
        if bucket is None:
            bucket = {"count": 0, "error_count": 0, "latencies_ms": []}
            self._per_path[path] = bucket
        return bucket

    def record(self, path: str, status_code: int, latency_ms: float) -> None:
        bucket = self._get_path_bucket(path)
        bucket["count"] = int(bucket["count"]) + 1
        # Treat all 4xx/5xx as errors for the purposes of error rate.
        if status_code >= 400:
            bucket["error_count"] = int(bucket["error_count"]) + 1

        latencies: List[float] = bucket["latencies_ms"]  # type: ignore[assignment]
        latencies.append(latency_ms)
        # Keep only the most recent N samples per path to bound memory.
        if len(latencies) > self._max_samples:
            overflow = len(latencies) - self._max_samples
            del latencies[0:overflow]

    @staticmethod
    def _p95(latencies: List[float]) -> float | None:
        if not latencies:
            return None
        ordered = sorted(latencies)
        idx = max(0, int(0.95 * len(ordered)) - 1)
        return ordered[idx]

    def summary(self) -> Dict[str, object]:
        total_requests = 0
        total_errors = 0
        all_latencies: List[float] = []
        per_path_summary: Dict[str, object] = {}

        for path, bucket in self._per_path.items():
            count = int(bucket["count"])
            error_count = int(bucket["error_count"])
            latencies: List[float] = bucket["latencies_ms"]  # type: ignore[assignment]
            total_requests += count
            total_errors += error_count
            all_latencies.extend(latencies)

            per_path_summary[path] = {
                "count": count,
                "error_count": error_count,
                "error_rate": (error_count / count) if count else 0.0,
                "p95_latency_ms": self._p95(latencies),
            }

        error_rate = (total_errors / total_requests) if total_requests else 0.0

        return {
            "total_requests": total_requests,
            "total_errors": total_errors,
            "error_rate": error_rate,
            "p95_latency_ms": self._p95(all_latencies),
            "per_path": per_path_summary,
        }


class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware that records basic metrics for each HTTP request."""

    def __init__(self, app, store: MetricsStore) -> None:  # type: ignore[no-untyped-def]
        super().__init__(app)
        self.store = store

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        start = perf_counter()
        response: Response | None = None
        try:
            response = await call_next(request)
            return response
        finally:
            end = perf_counter()
            latency_ms = (end - start) * 1000.0
            path = request.url.path
            status_code = response.status_code if response is not None else 500
            self.store.record(path, status_code, latency_ms)
