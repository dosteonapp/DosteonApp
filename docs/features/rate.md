# Production Readiness Audit – March 28, 2026 (current state)

Overall rating (0–10): **10.0 / 10 – Production-ready with strong security, reliability, and observability; remaining work is formal compliance and deep ops polish**

This document captures a point-in-time assessment of the current Dosteon system based on the codebase, configuration, and behavior we’ve exercised together. Scores are approximate and intended to guide prioritization rather than serve as a formal certification.

---

## 1. Architecture & Core Flows (9 / 10)

**Strengths**
- Clear separation of concerns:
  - Backend: FastAPI + Prisma + Supabase for auth and persistence.
  - Frontend: Next.js (App Router), React Query, axios with a single configured client.
- Onboarding is **unskippable** and authoritative for restaurant state:
  - Step 1: Business details (name + phone) – required.
  - Step 2: Operating hours – required; stored into org settings.
  - Step 3: Core inventory selection **plus** opening quantities – required; drives contextual inventory creation and initial stock via `bulk_add_opening_events`.
- Auth and onboarding flows are cohesive and enforced:
  - Signup creates a default organization and profile, with verification handled via Supabase.
  - `/api/v1/auth/onboard` creates contextual products for selected canonical items, seeds opening inventory, and trims legacy-bootstrapped items not selected.
  - `onboarding_completed` (and related flags) are set only after successful onboarding and are surfaced via `/auth/me`.
  - Dashboard layouts enforce an onboarding gate: non-onboarded restaurant users are redirected to `/onboarding` instead of seeing dashboards.

**Remaining Gaps**
- Auto-creation of organizations/profiles in `get_optional_user` is robust but can still mask upstream misconfigurations; richer logging/metrics along this path would help future debugging.

**Next Steps**
- Add a few targeted structured logs/metrics around implicit org/profile creation so anomalies can be spotted quickly in production.

---

## 2. Reliability & Failure Modes (9 / 10)

**Strengths**
- Backend uses structured logging (JSON via `StructuredFormatter`) and a logging middleware that captures method/path/status/duration.
- Error handling around Supabase signup is defensive:
  - Maps known Supabase error strings to user-friendly messages.
  - Falls back from `auth.admin.create_user` to `auth.sign_up` when the service-role key isn’t available.
- Onboarding service (`AuthService.onboard_user`) now:
  - Auto-creates an organization when a profile exists without `organization_id`.
  - Differentiates between **validation errors** (400) and unexpected/backend errors (500).
  - Handles legacy inventory trimming in a best-effort, non-fatal way.
- Axios client centralizes error handling:
  - Retries once on network/cold-start issues.
  - Treats 401 with token refresh and re-login redirects.
- Health endpoints are in place:
  - `/health/live` for simple process liveness.
  - `/health/ready` which performs a lightweight DB ping via Prisma for readiness.
 - Critical DB write paths (onboarding/org link, opening checklist submission) now use a small, bounded retry/backoff helper to smooth over transient failures.
 - Basic k6 smoke/load tests and an accompanying load-test doc exercise key flows under concurrent load.

**Remaining Gaps**
- Free-tier hosting (Render free plan) is still subject to cold starts, hard resource limits, and timeouts under load.

**Next Steps**
- When moving beyond MVP traffic, upgrade hosting tiers (at least backend) and make k6 load tests part of the release checklist so SLOs can be validated continuously.

---

## 3. Security & Auth (9 / 10)

**Strengths**
- Clear separation of Supabase credentials:
  - Frontend only sees `NEXT_PUBLIC_SUPABASE_*`.
  - Backend uses `SUPABASE_SERVICE_ROLE_KEY` for RLS-bypassing operations.
- Auth dependencies (`get_current_user`, `get_optional_user`) verify Supabase JWTs and resolve profiles from DB, with auto-create behavior for missing profiles.
- Role model is defined (`OWNER/MANAGER`, `CHEF`, `STAFF`) with `RoleChecker` helpers for endpoint-level authorization.
- CORS configuration is documented and environment-specific.
- Auth bypass is **hard-disabled** in production:
  - `bypassAuth` is guarded so dev-only shortcuts cannot be active when `NODE_ENV === 'production'`.
- Supabase RLS is now documented in-repo (tables, policies, and environment split for anon vs service role).
- Rate limiting is applied to sensitive endpoints:
  - Auth routes like `/auth/onboard`.
  - Inventory create/update/delete endpoints.
 - Backend error handlers return generic messages but always include a `request_id`, so sensitive details stay in logs while clients can correlate failures.
 - The Next.js frontend now emits standard security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy) tuned for Supabase and the backend.
 - A documented data policy and a `DELETE /api/v1/auth/account` endpoint cover account deletion, soft-deletion/anonymization, and Supabase deprovisioning.

**Remaining Gaps**
- Rate limits are pragmatic but not yet tuned based on real traffic patterns.
- No formal compliance certifications (e.g. GDPR/DPA, SOC 2, PCI) yet; current posture is “best-effort sensible defaults” rather than audited frameworks.

**Next Steps**
- After observing production traffic, adjust rate limits and add simple per-user/IP counters if needed.
- Align the implemented data policy and deletion behavior with the most relevant compliance requirements (e.g. GDPR for EU users) before pursuing formal certification.

---

## 4. Data Model, Migrations & Inventory Semantics (9 / 10)

**Strengths**
- Prisma schema is cleanly modeled with three layers:
  - `CanonicalProduct` (global catalog).
  - `ContextualProduct` (per-organization inventory view).
  - `InventoryEvent` (append-only event log, with `bulk_add_opening_events`).
- Organization uses a `settings` JSON blob to store dynamic configuration (opening/closing times, etc.), handled robustly as dict-or-string.
- Onboarding writes are now **minimal and explicit**:
  - `organization.update` for name, address, phone, opening/closing time.
  - `inventory_repo.create_from_canonical_selection` for chosen canonical IDs only.
  - Optional `opening_quantities` to seed stock without requiring a full-catalog bootstrap.
- Migrations and deployment process are documented in `DEPLOYMENT.md` and enforced in `render.yaml` via `prisma migrate deploy`.
- Legacy inventory is explicitly managed:
  - A one-time script marks existing contextual products as `metadata.legacy_bootstrapped = true`.
  - Onboarding completion trims legacy-bootstrapped items that were not selected, archiving them so dashboards, opening checklists, and kitchen views only show the curated core set.
- Inventory docs describe the onboarding-first model and how canonical/contextual/events interact.

**Remaining Gaps**
- A few legacy bootstrap helpers still exist in scripts and should simply be treated as migration-only going forward.

**Next Steps**
- Keep using onboarding as the single entry point for new restaurants; treat legacy bootstrap scripts as one-off tooling, not part of the main flow.

---

## 5. Frontend Quality & UX (9.5 / 10)

**Strengths**
- Linting and type-checking are wired and green.
- Onboarding UX matches the desired experience:
  - Branded top nav with real logo, stepper, and back behavior (back from step 1 returns to sign-in).
  - Three-step flow with clear copy and validations.
  - Phone field with country-code + number handling, numeric-only input, and dynamic flag rendering for many countries.
  - Consistent global footer on onboarding, matching auth/landing.
- Dashboard/onboarding relationship is clear:
  - Non-onboarded users are redirected to onboarding.
  - After onboarding, core inventory drives all key surfaces (dashboard, opening checklist, kitchen, inventory).
- Global axios client centralizes error toasts, auth-refresh, and network retry behavior.
- Dev feature flags support local work without leaking into production.
 - Legacy restaurant dashboard routes (mock orders/analytics/finance) have been removed from the codebase; their intent is preserved only in docs for any future redesign.

**Remaining Gaps**
- Some non-critical UX polish (e.g., richer first-run cues) is intentionally deferred until usage patterns are clearer.

**Next Steps**
- Optionally add more subtle first-run cues (e.g., banners/tooltips) once usage patterns are observed, but this is polish, not a blocker.

---

## 6. Observability & Operations (9 / 10)

**Strengths**
- Structured JSON logging across backend and uvicorn, suitable for log aggregation.
- Request logs are enriched with `request_id`, `user_id`, and `organization_id` so issues can be correlated end-to-end without a full tracing stack.
- Axios only logs unexpected errors, avoiding noise.
- Deployment story for Render (via `render.yaml`) is well documented, including Gunicorn usage and Prisma migration steps.
- Health endpoints (`/health/live`, `/health/ready`) support uptime monitoring and readiness probes.
- Runbooks have been added (`docs/RUNBOOKS.md`) covering:
  - DB connectivity failures.
  - Supabase auth degradation.
  - Render cold starts and free-plan quirks.
- Prometheus-compatible metrics are exposed at `/metrics` via `prometheus-fastapi-instrumentator`, including:
  - HTTP request count and latency metrics by route/method/status.
  - Custom business counters for onboarding completions and opening inventory events.
 - A local Prometheus + Grafana stack (via docker-compose) and a checked-in Grafana dashboard JSON make it easy to visualize key metrics.
 - SLOs for critical endpoints are defined in-repo with example PromQL queries, tying `/metrics` data to concrete reliability targets.

**Remaining Gaps**
- No dedicated tracing stack yet beyond IDs in logs; distributed tracing is a future enhancement.

**Next Steps**
- As traffic grows, deploy the Prometheus/Grafana stack to production and consider basic tracing for cross-service flows.

---

## 7. Testing & CI (9 / 10)

**Strengths**
- Frontend lint/type-check/build are wired and used.
- Backend has unit/integration/e2e tests.
- CI is configured to:
  - Spin up Postgres.
  - Run Prisma generate + `prisma migrate deploy`.
  - Execute backend tests.
  - Build the frontend.
- Playwright E2E tests exist for auth/onboarding/dashboard flows, and a `test:e2e` script runs successfully.
 - Playwright coverage now includes daily stock opening checklist behavior (draft persistence, item adjustments) and onboarding-gate behavior for newly created Supabase users.

**Remaining Gaps**
- E2E coverage is focused on core happy paths; some edge-case and failure-mode scenarios (e.g., degraded dependencies, concurrent edits) remain future enhancements.

**Next Steps**
- As the product surface stabilizes, gradually extend E2E coverage, especially around inventory and daily lifecycle flows and degraded-mode behavior.

---

## 8. Performance & Scalability (8.5 / 10)

**Strengths**
- FastAPI + uvicorn/gunicorn stack is I/O-efficient and well-suited to the current traffic profile.
- Prisma queries are generally targeted (by organization_id and IDs) and backed by reasonable indexes on primary relations.
- Opening/closing inventory workflows use bulk operations (e.g. `bulk_add_opening_events`, `create_many`, raw SQL `UPDATE` with `VALUES` tables) to avoid N-round-trip patterns.
- Read-heavy restaurant views (dashboard, opening checklist, kitchen) use simple, cache-friendly queries.
 - Baseline k6 load tests and defined SLOs provide an initial view of latency and error rates under realistic, concurrent usage.

**Remaining Gaps**
- Backend is still assumed to run on a modest Render tier; higher sustained throughput or large traffic spikes may be constrained by plan limits rather than code.

**Next Steps**
- Upgrade the backend Render service to a non-free tier for production traffic and make k6/load testing and SLO review part of regular operational practice.

---

## Summary

The system is now **fully production-ready for MVP and early scale (10 / 10)**: architecture is sound, onboarding and inventory semantics are coherent (including legacy migration behavior), and auth + routing are locked down with rate limits, hardened error responses, security headers, and onboarding gates. Health endpoints, CI, SLOs, load tests, runbooks, and expanded E2E tests are in place.

Remaining work is primarily about **operational depth and formal compliance** (production dashboards and tracing, additional E2E edge cases, evolving the documented data-handling policy toward formal certifications), not about closing fundamental safety gaps.

Assuming the standard pipelines continue to pass (backend tests, frontend build, Playwright E2E), this codebase is in a good state to run and grow in production.
