# Operational Runbooks

These runbooks describe **practical procedures** for operating the MVP in production. They assume:

- Backend: FastAPI + Prisma, deployed to a managed environment.
- Database: Supabase Postgres.
- Frontend: Next.js, deployed separately.

---

## 1. Backend can't reach the database (Prisma `ClientNotConnectedError`)

### 1.1 How to detect

- Symptoms:
  - API responses return `500` with messages mentioning Prisma or
    `ClientNotConnectedError`.
  - `/health/ready` returns `503` with `{ "status": "error", "detail": "..." }`.
- Logs:
  - Backend logs show messages like `DB connection attempt ... failed` or
    `Client is not connected to the query engine`.

### 1.2 Immediate mitigation steps

1. Check the hosting provider status (Render/Supabase/Postgres):
   - Ensure the Postgres instance is running and not under maintenance.
2. Verify environment variables:
   - `DATABASE_URL` and `DIRECT_URL` are set correctly for the backend service.
3. Restart the backend service:
   - Trigger a redeploy/restart on your hosting platform.
4. For Supabase-managed Postgres:
   - From the Supabase SQL editor, run `SELECT 1;` to confirm connectivity.

### 1.3 Verify recovery

- Call `/health/ready`; it should return `{ "status": "ok" }`.
- Run a simple API request (e.g. `/api/v1/inventory` or `/api/v1/restaurant/stats`).
- Confirm no new `ClientNotConnectedError` entries appear in the logs.

---

## 2. Supabase auth is degraded (JWT verification failing)

### 2.1 How to detect

- Symptoms on the frontend:
  - Users are unexpectedly redirected to signin pages.
  - Global toasts show generic auth errors or `Session expired` even
    for recently logged-in users.
- Backend:
  - `/api/v1/auth/me` or other protected endpoints return `401` with
    `Invalid or expired authentication token`.
- Logs:
  - Backend logs from `verify_supabase_token` or `deps.py` show
    repeated token verification errors.

### 2.2 Immediate mitigation steps

1. Check Supabase status page for incidents related to Auth or JWT.
2. Confirm that env vars are consistent across environments:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. If keys were rotated:
   - Update them in the backend and frontend environments.
   - Trigger a redeploy/restart.
4. Ask affected users to fully sign out and sign back in:
   - This refreshes their tokens and ensures they match the new keys.

### 2.3 Verify recovery

- Create a fresh test user signup and verify email.
- Confirm login works and `/api/v1/auth/me` returns a valid profile.
- Monitor logs for a reduction in token verification failures.

---

## 3. Render free plan throttling or cold start causing timeouts

### 3.1 How to detect

- Symptoms on the frontend:
  - First request after inactivity takes 10–30 seconds.
  - Network errors or `Connection Error` toast appears, sometimes
    followed by a successful retry.
- Backend:
  - No traffic for a while, then a burst of cold-start logs when a
    new request arrives.

### 3.2 Immediate mitigation steps

1. Confirm the plan level:
   - On Render, check whether the backend/DB services are on free
     or hobby plans, which can sleep when idle.
2. Increase plan or add a keep-alive:
   - Consider upgrading backend/DB services to non-sleeping plans.
   - Optionally configure an uptime monitor to ping `/health/live` at
     a safe interval to reduce cold starts.
3. Ensure frontend retry logic is active:
   - The axios client already retries network errors once and shows
     a `Waking up server...` toast. Avoid disabling this.

### 3.3 Verify recovery

- After upgrading or adding keep-alives, observe:
  - Initial request latency should drop to normal (<1–2 seconds).
  - Fewer or no `Connection Error` toasts on first navigation.
- Check hosting metrics for fewer restarts/cold starts over time.

---

## 4. Local observability stack (Prometheus + Grafana)

This stack is for local debugging and performance exploration. It should not be exposed directly to the public internet.

### 4.1 Starting Prometheus and Grafana

1. Ensure the backend is running locally on port `8000` and exposes `/metrics`.
2. From the repository root, start the observability stack:

  ```bash
  docker compose -f docker-compose.observability.yml up -d
  ```

3. Services:
  - Prometheus: http://localhost:9090
  - Grafana: http://localhost:3001 (default login `admin` / `admin`)

Prometheus is configured via `prometheus.yml` to scrape `host.docker.internal:8000/metrics` every 15 seconds.

### 4.2 Importing the default dashboard

1. Open Grafana at http://localhost:3001 and log in.
2. Add a Prometheus data source pointing to `http://prometheus:9090`.
3. Go to "Dashboards" → "Import".
4. Upload or paste the contents of [docs/grafana_dashboard.json](docs/grafana_dashboard.json).
5. When prompted, select the Prometheus data source for `${DS_PROMETHEUS}`.

You should now see:

- Request rate and p95 latency by endpoint.
- Error rates by endpoint.
- Business counters for onboarding completions and opening inventory events.

### 4.3 Tearing down

To stop the local observability stack:

```bash
docker compose -f docker-compose.observability.yml down
```

This will stop Prometheus and Grafana containers but preserve Grafana data in the named volume.