# Service Level Objectives (SLOs)

This document defines the performance and reliability targets for the Dosteon backend. These SLOs are intended to be enforced via automated monitoring on top of the existing `/metrics` Prometheus endpoint.

## Latency Targets (p95)

Latency is measured as the 95th percentile over rolling 5-minute windows, per endpoint category.

- **Health checks**
  - Endpoints: `GET /api/v1/health`, `GET /api/v1/health/live`, `GET /api/v1/health/ready`
  - Target: **p95 < 50ms**

- **Auth endpoints**
  - Endpoints: `/api/v1/auth/*` (login, refresh, magic link, password reset, onboarding)
  - Target: **p95 < 800ms**

- **Inventory reads**
  - Endpoints: `GET /api/v1/inventory`, `GET /api/v1/inventory/*`, `GET /api/v1/restaurant/inventory/*`
  - Target: **p95 < 300ms**

- **Inventory writes**
  - Endpoints: `POST/PATCH/DELETE /api/v1/inventory/*`, `POST /api/v1/restaurant/opening-checklist/*`, `POST /api/v1/restaurant/inventory/*`
  - Target: **p95 < 500ms**

## Error Rate

Error rate is defined as the proportion of 5xx responses over all responses for a given endpoint, measured over any rolling 5-minute window.

- **Target**: **< 0.5%** 5xx error rate per endpoint over any 5-minute window.

If a specific endpoint is expected to occasionally return 4xx for user errors (e.g. validation failures), these are **not** counted against this SLO.

## Availability

Availability is defined as the proportion of successful requests (non-5xx) over all requests over a calendar month.

- **Target**: **99.5% monthly uptime** for the core API surface (`/api/v1/**`).

## Tracking via /metrics

The FastAPI backend exposes a Prometheus-compatible metrics endpoint at `/metrics` (mounted on the same host as the API). Standard instrumentation provides:

- `http_requests_total` (or equivalent), labeled by method, path, and status.
- Request duration histograms (e.g. `http_request_duration_seconds_bucket`).

To track these SLOs:

- **Latency (p95)**
  - Use `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path))`
  - Filter by `path` to group health, auth, inventory-read, and inventory-write endpoints.

- **Error rate**
  - Compute `sum(rate(http_requests_total{status=~"5.."}[5m])) by (path) / sum(rate(http_requests_total[5m])) by (path)`
  - Alert if this exceeds `0.005` for any core endpoint.

- **Availability**
  - Over longer windows, use the same error-rate formula aggregated over a month.
  - Aggregate across all `2xx/3xx/4xx` vs `5xx` responses to estimate uptime.

## Grafana Dashboard

A minimal Grafana dashboard configuration is provided at [docs/grafana_dashboard.json](docs/grafana_dashboard.json). Import it into Grafana and point it at your Prometheus data source to visualize:

- Request rate by endpoint
- p95 latency by endpoint
- Error rate over time
- Onboarding completions
- Opening inventory events

When importing, select the Prometheus data source to bind to the `${DS_PROMETHEUS}` variable used in the dashboard definition.
