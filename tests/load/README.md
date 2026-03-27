# k6 Smoke Load Test

This directory contains a simple k6 smoke test for the Dosteon backend. It exercises health checks, login, and a basic inventory read under light load.

## Prerequisites

- k6 installed locally (see https://k6.io/docs/get-started/installation/)
- Backend running and reachable (default: http://localhost:8000)
- A test restaurant user with valid credentials

## Environment variables

The script is configured via environment variables:

- `K6_BASE_URL` – Base URL of the backend (e.g. `https://dosteon-backend.onrender.com`); defaults to `http://localhost:8000`.
- `K6_LOGIN_EMAIL` – Email for the test user.
- `K6_LOGIN_PASSWORD` – Password for the test user.

## Running locally

From the repository root:

```bash
k6 run tests/load/k6_smoke.js \
  -e K6_BASE_URL=http://localhost:8000 \
  -e K6_LOGIN_EMAIL="test@example.com" \
  -e K6_LOGIN_PASSWORD="password123"
```

The script will:

1. Call `GET /api/v1/health/ready` as a baseline health check.
2. Call `POST /api/v1/auth/login` with the provided credentials.
3. Call `GET /api/v1/inventory` with the returned Bearer token.

It runs with 5 virtual users for 30 seconds and enforces the following thresholds:

- `http_req_duration`: p95 < 500ms
- `http_req_failed`: rate < 1%

## Running in CI

In CI, you can add a job that:

1. Starts the backend (or points to a deployed staging environment).
2. Exports `K6_BASE_URL`, `K6_LOGIN_EMAIL`, and `K6_LOGIN_PASSWORD` as environment variables.
3. Runs:

```bash
k6 run tests/load/k6_smoke.js
```

If thresholds fail, k6 exits with a non-zero status code, causing the CI job to fail. This gives you a basic performance gate before deploying to production.
