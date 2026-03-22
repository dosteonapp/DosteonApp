# Operational Runbooks

These runbooks describe **practical procedures** for operating the MVP in production. They assume:

- Backend: FastAPI + Prisma, deployed to a managed environment.
- Database: Supabase Postgres.
- Frontend: Next.js, deployed separately.

---

## 1. Roll Back a Faulty Deployment

### 1.1 Symptoms

- Elevated error rate or P95 latency after a deploy.
- Key flows broken (auth, inventory, opening checklist, orders).
- Backend or frontend fails to start.

### 1.2 Quick Triage

1. Check the **metrics dashboard**:
   - Look at error rate and latency for key endpoints.
2. Check **logs** for the new deployment:
   - Look for unhandled exceptions, migration errors, or connection issues.

If a clear root cause is not quickly fixable, proceed to rollback.

### 1.3 Rollback Procedure (Code-Only Change)

1. Identify the last **known good commit** in source control.
2. Redeploy backend and frontend using that commit:
   - Backend: deploy the previous container/image or commit.
   - Frontend: redeploy the previous build.
3. Verify health:
   - Health endpoints respond OK.
   - Smoke test: login, dashboard, inventory list.

### 1.4 Rollback Procedure (Schema + Code Change)

If the faulty deployment included **database migrations**:

1. Check the migration history to find the latest applied migration.
2. If the migration is reversible:
   - Apply the **down** migration (if available and safe).
   - Redeploy the previous backend commit.
3. If the migration is not safely reversible:
   - Use Supabase backups:
     - Restore a backup (or PITR) from just before the migration **to a new database instance**.
     - Point a **staging environment** at the restored DB.
     - Verify core flows.
   - Once validated, switch production to the restored DB **during a maintenance window**.

Document the incident, root cause, and the final DB state.

---

## 2. Safe Schema Change Procedure

This sequence minimizes downtime and compatibility issues.

### 2.1 Additive Changes (Preferred)

Use a **migration-first, additive** pattern:

1. **Plan the migration**:
   - Decide which tables/columns/indexes to add.
   - Ensure changes are backwards compatible (no immediate removals/renames).
2. **Create and test the migration** locally and on staging.
3. **Deploy migration to production** (DB only):
   - Apply with the migration tool, monitor for errors.
4. **Deploy backend** using the new schema:
   - Code reads/writes new columns, but still tolerates missing data where reasonable.
5. Optional: **Deploy frontend** that depends on the new backend behavior.

### 2.2 Destructive Changes (Dropping/Renaming)

When you must drop or rename columns/tables:

1. **Two-phase rollout**:
   - Phase A:
     - Add new columns/tables.
     - Backfill data from old columns.
     - Update backend to write to both old and new, read from new.
   - Phase B (later deploy):
     - Confirm no code reads the old columns.
     - Take a **backup/snapshot**.
     - Drop/rename old columns in a migration.
2. Never perform destructive changes without:
   - A recent backup.
   - A tested rollback strategy.

---

## 3. Bringing Up a New Staging Environment

Use staging to test migrations and deployments before production.

### 3.1 Prerequisites

- New Supabase project or database instance for staging.
- Staging backend deployment target (separate from production).
- Staging frontend deployment target.

### 3.2 Procedure

1. **Clone configuration**:
   - Copy environment variables from production, adjusting keys/URLs for staging.
2. **Initialize the database**:
   - Apply all current migrations to the staging DB.
   - Optionally, import a **sanitized copy** of production data (no secrets/PII), or seed with test data using existing seed scripts.
3. **Deploy backend to staging**:
   - Use the same branch/commit that you intend to deploy to production.
   - Point it at the staging DB connection string.
4. **Deploy frontend to staging**:
   - Point API calls to the staging backend.
5. **Run smoke tests**:
   - Auth + onboarding.
   - Inventory: add product → adjust stock → check activities.
   - Opening checklist and basic day lifecycle.

Only after staging passes smoke tests should you promote the same commit + migrations to production.

---

## 4. On-Call / Incident Checklist (MVP)

When an incident occurs in production:

1. Acknowledge and log the incident.
2. Check metrics and logs to understand scope and impact.
3. If severe and not immediately fixable, **roll back** using section 1.
4. Communicate status to stakeholders (impact, workaround, ETA).
5. After resolution, write a brief incident summary:
   - What happened.
   - Root cause.
   - Fix applied.
   - Follow-up actions (tests, guards, or process changes).

These runbooks can be refined as operations mature, but they provide a clear starting point for safe deployments and incident response.