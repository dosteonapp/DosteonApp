# Dosteon Deployment Guidelines

This document outlines the steps required to deploy the **Frontend (Next.js)** and **Backend (FastAPI)** to a production environment.

## 🏛️ Infrastructure Overview

- **Database**: Supabase (PostgreSQL) + Prisma ORM.
- **Authentication**: Supabase Auth (JWT).
- **Backend**: FastAPI (Python 3.10+).
- **Frontend**: Next.js 15 (App Router).

At a high level, you deploy **one Supabase project**, **one FastAPI backend**, and **one Next.js frontend**, and keep them wired together via environment variables. All changes should be rolled out in a way that **never corrupts user data** and that allows the UI to pick up improvements without breaking existing sessions.

---

## 🐍 Backend Deployment (FastAPI)

### 1. Environment Variables
Ensure the following variables are set in your production environment (e.g., Railway, Render, or Docker):

```env
DATABASE_URL=         # Connection pooling URL (port 6543)
DIRECT_URL=           # Direct DB URL for migrations (port 5432)
SUPABASE_URL=         # Your Supabase Project URL
SUPABASE_ANON_KEY=     # Project Anon Key
SUPABASE_SERVICE_ROLE_KEY= # Service Role Key (CRITICAL for RLS bypass)
AUTH_REDIRECT_URL=    # e.g., https://yourapp.com/auth/callback
ENV=production
```

For local development, mirror these variables in `backend/.env` (use `backend/.env.example` as a template) and point them to your **development** Supabase project.

### 2. Database Migrations
Before starting the server, apply Prisma migrations:
```bash
cd backend
npx prisma migrate deploy
```

### 3. Production Server
Do **NOT** use `uvicorn --reload` in production. Use a process manager like `gunicorn`:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

#### Zero-downtime & data-safe changes
- Always ship **backwards-compatible migrations** first:
	- Add new columns as nullable or with safe defaults.
	- Backfill data in a separate migration before making columns non-null.
	- Avoid dropping columns or tables until you are certain no code or data depends on them.
- Deploy in this order when changing contracts:
	1. **DB migration** (additive/compatible).
	2. **Backend** (reads/writes both old and new fields if needed).
	3. **Frontend** (consumes the new API/fields).
- Use feature flags where needed so old users can continue using existing flows while new UI is rolling out.

---

## ⚛️ Frontend Deployment (Next.js)

### 1. Environment Variables
Next.js requires these at **Build Time** (for client-side access):

```env
NEXT_PUBLIC_API_URL=          # e.g., https://api.yourapp.com
NEXT_PUBLIC_SUPABASE_URL=     
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

For local development, mirror these variables in `frontend/.env.local` (use `frontend/.env.example` as a template) and ensure:

- `BACKEND_URL=http://localhost:8000`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` point to your **development** Supabase project.

### 2. Build & Optimization
1. **Build**: `npm run build`
2. **Start**: `npm run start`

### 3. Rewrites & Proxy
Ensure `next.config.mjs` is configured to point to your production backend URL. If you are using a separate domain for the API (e.g., `api.dosteon.com`), ensure **CORS** is correctly configured in `backend/app/core/config.py`.

The frontend should always talk to the backend through its internal `/api` proxy, which forwards to `${BACKEND_URL}/api`. This keeps local, staging, and production behavior consistent.

---

## 🔐 Production Checklist

1. **CORS Settings**: Update `BACKEND_CORS_ORIGINS` in `config.py` to only allow your production domain.
2. **Supabase RLS**: Ensure your tables have proper RLS policies enabled. The backend uses the `SERVICE_ROLE_KEY` to bypass these, but client-side calls (via Supabase Client) will respect them.
3. **SSL**: Ensure both Frontend and Backend are served over HTTPS.
4. **Error Masking**: Ensure `ENV=production` is set so the backend doesn't leak tracebacks to the client.

5. **Schema & Migration Safety**:
	- Run Prisma migrations against a staging database before production.
	- Validate that existing data loads correctly in the new schema using smoke tests.
	- Keep migrations small and reversible where possible.

6. **Release Gating**:
	- Only promote commits to production when the CI workflow at [.github/workflows/ci.yml](.github/workflows/ci.yml) is green (backend tests, frontend lint and type-checks).
	- Treat a failing CI run on `main` as a blocker for any deployment until addressed.

---

## 🚀 Recommended Hosting
- **Frontend**: [Vercel](https://vercel.com) (native support for Next.js).
- **Backend/DB**: [Railway](https://railway.app) or [Render](https://render.com) (Native Python support + Docker).
- **Database**: [Supabase](https://supabase.com).

---

## 🛠️ Automated Deployment (Render)

A `render.yaml` file has been provided in the root directory. This allows for:
1. **One-click deployment** in Render.
2. Correct **Python 3.11.9** pinning to avoid Rust compilation issues with Pydantic.
3. Automated **Prisma Client** generation during the build phase.
4. Correct use of **Gunicorn** for the backend production server.

Simply connect your repository to Render using the "Blueprint" feature.

---

## 🌊 Supabase Setup (Local & Production)

### 1. Supabase Project(s)
- Use **one production Supabase project** and, ideally, a **separate development/staging project**.
- Configure RLS policies carefully and test them from both the backend (service role) and frontend (anon key) contexts.

### 2. Backend ↔ Supabase
- Backend uses:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to the browser).
- These are set in:
	- Local: [`backend/.env`](backend/.env) (copied from [`backend/.env.example`](backend/.env.example)).
	- Production: Render Dashboard env vars for `dosteon-backend` (as referenced in [render.yaml](render.yaml)).

### 3. Frontend ↔ Supabase
- Frontend uses **public** env vars:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- These are set in:
	- Local: [`frontend/.env.local`](frontend/.env.local) (copied from [`frontend/.env.example`](frontend/.env.example)).
	- Production: Render Dashboard env vars for `dosteon-frontend` (or your hosting provider’s env config).

### 4. Protecting User Data While Evolving the UI
- Always keep Supabase schemas and RLS policies **backwards compatible** when introducing new UI flows.
- When adding new tables or columns, default them so that existing rows/users behave exactly as before until they opt into new features.
- Avoid destructive SQL changes (drops, renames) until all old code paths and data have been migrated or archived.

---

## 🧩 Environment & File Checklist for Deployment

Before you deploy (or promote to production), verify:

- **Environment files**
	- [backend/.env](backend/.env) exists locally and is based on [backend/.env.example](backend/.env.example).
	- [frontend/.env.local](frontend/.env.local) exists locally and is based on [frontend/.env.example](frontend/.env.example).
	- Production env vars are configured in your hosting provider for both backend and frontend (match names used in [render.yaml](render.yaml)).

- **Core config files**
	- [render.yaml](render.yaml) is up to date with backend and frontend build/start commands.
	- [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) reflects the current env variable naming and local setup.
	- `next.config.mjs` in [frontend/](frontend) proxies `/api` to `${BACKEND_URL}/api`.

- **Migrations & schema**
	- All Prisma migrations are committed and applied via `npx prisma migrate deploy` during deployment.
	- Any manual Supabase SQL migrations (policies, functions) are stored in version control (e.g., under `backend/prisma/sql/` or a similar folder) and applied consistently to dev and prod.

This checklist helps ensure that improvements to the UI/UX and backend behavior are reflected in production without surprising users or harming existing data.

---

## 🧪 Staging Rollout Flow (End-to-End Testing Before Production)

Use a **staging environment** that mirrors production as closely as possible (same Supabase schema, similar env vars, smaller but realistic data sample).

Recommended flow for any non-trivial change:

1. **Prepare staging**
	- Create a separate Render (or host) service pair for backend and frontend pointing to a **staging Supabase project**.
	- Apply Prisma and Supabase migrations to staging first.

2. **Deploy backend to staging**
	- Push code to a staging branch.
	- Let CI or Render apply migrations (`npx prisma migrate deploy`) and start the FastAPI app.

3. **Deploy frontend to staging**
	- Build the Next.js app against staging env vars (`BACKEND_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
	- Verify that `/api` proxying works and that auth flows succeed.

4. **Run end-to-end checks**
	- Manually or via automated tests, run through:
	  - Signup/login (or test login) → onboarding.
	  - Opening checklist → inventory/kitchen flows → closing checklist.
	  - Settings updates and notifications views.
	- Confirm no console errors, API failures, or schema mismatches.

5. **Promote to production**
	- Once staging is green, apply **the same migrations** to production.
	- Deploy the backend, then the frontend, using the same artifact or commit SHA tested on staging.
	- Monitor logs and metrics (error rates, latency) closely for the first rollout window.
	- Ensure the CI workflow at [.github/workflows/ci.yml](.github/workflows/ci.yml) is green for the commit being promoted (backend tests, frontend lint and type-checks).

This staging loop ensures that any breaking changes are caught before user data is at risk, while still allowing you to ship UI/UX improvements rapidly.

---

## ✅ Production Go/No-Go Checklist

Use this list **before every production deployment**. If any item is not checked, treat it as a **NO-GO** and fix it first.

### 1. Source & CI

- [ ] Target commit is merged to `main` (or your release branch).
- [ ] CI workflow for that commit is green (backend tests, frontend lint + type-check, any integration tests).
- [ ] No open, known-critical bugs in core flows (auth, onboarding, inventory, opening/closing).

### 2. Supabase / Database

- [ ] All Prisma migrations for this release are committed.
- [ ] The same migrations have been applied successfully to **staging**.
- [ ] Supabase automatic backups are enabled and retention is acceptable for your risk tolerance.
- [ ] (If doing non-trivial schema changes) A **manual backup or snapshot** was taken before applying migrations in production.
- [ ] RLS policies have been verified for key tables from both backend (service role) and frontend (anon key).

### 3. Backend (FastAPI)

- [ ] Production backend env vars are set: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_REDIRECT_URL`, `ENV=production`.
- [ ] `npx prisma migrate deploy` runs successfully against the production database in a dry run or local connection.
- [ ] Local or staging `pytest -q` is fully green for the target commit.
- [ ] Health endpoints (`/health`, `/health/live`, `/health/ready`) return OK in staging.
- [ ] Basic metrics endpoint (`/api/v1/metrics`) is reachable and reporting request counts and error rates.

### 4. Frontend (Next.js)

- [ ] Production frontend env vars are set: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] `npm run build` passes for the target commit.
- [ ] Staging frontend successfully talks to staging backend via `/api` proxy.
- [ ] Manual smoke test on staging: login, dashboard load, inventory list, opening checklist, and at least one end-to-end restaurant flow complete without errors.

### 5. Staging Sign-off

- [ ] Staging backend and frontend are running the **exact commit/artefacts** planned for production.
- [ ] All DB migrations for this release are applied to staging.
- [ ] Core flows verified on staging:
	- [ ] Auth + onboarding journey.
	- [ ] Inventory: add product → adjust stock → view activities.
	- [ ] Opening lifecycle: opening checklist → service usage/waste (as implemented) → day open state.
- [ ] No blocking logs in staging (no repeated 5xxs, DB errors, or schema mismatches).

### 6. Operational Readiness

- [ ] Compliance baseline and runbooks exist and are up to date (see `docs/COMPLIANCE_BASELINE.md` and `docs/RUNBOOKS.md`).
- [ ] On-call contact (even if it’s just you) knows how to roll back a deployment.
- [ ] Monitoring/metrics dashboard is available to watch error rate and p95 latency during/after deploy.

### 7. Go / No-Go Decision

- **GO**: All sections above are checked, and staging is green → proceed to:
	- Apply migrations to production.
	- Deploy backend.
	- Deploy frontend.
	- Monitor metrics and logs for at least one full opening/service/closing cycle.

- **NO-GO**: Any box unchecked, or new critical issue discovered in staging or during rollout →
	- Stop further rollout.
	- Roll back using the procedures in `docs/RUNBOOKS.md`.
	- Fix the issue, re-run staging flow, and only then retry production.

This checklist is intentionally strict so that when you answer “yes, we’re good for production”, it is based on concrete, repeatable checks rather than gut feel.
