# Compliance & Data Safety Baseline

This document defines a **soft compliance baseline** for the MVP. It focuses on practical data safety and recoverability, not formal certifications.

---

## 1. Data Retention

### 1.1 Operational Tables

- **Inventory & events**
  - `contextual_products`, `inventory_events`, `day_status`, and related inventory tables are **retained indefinitely** by default.
  - Soft-delete is preferred over hard-delete (e.g. `is_active` / `status` flags) so historical records remain for audit.
  - Event tables (e.g. `inventory_events`) are never truncated; use time-based filters for reporting.

- **Orders & kitchen service data**
  - Orders, order items, and kitchen-related logs are **retained indefinitely** by default.
  - If pruning is ever needed, it must be done via **time-based archival**, not in-place destructive deletes.

- **User & organization profiles**
  - Organization and user records are retained as long as the organization is active.
  - When an organization is deactivated, related users are deactivated but not hard-deleted.

### 1.2 Logs & Metrics

- **Application logs**
  - Structured logs (API requests, errors) are stored by the hosting platform or log sink according to its defaults.
  - For the MVP, logs should be **kept for at least 14–30 days** where feasible for incident investigation.

- **Metrics**
  - Basic metrics (request counts, error rates, latency) are aggregated in-process and can be exported or scraped by external tools.
  - Long-term retention of metrics is optional at MVP but recommended if using an external APM/observability stack.

---

## 2. Backups & Restore

### 2.1 Supabase / Postgres Backups

- **Automatic backups**
  - Rely on Supabase-managed Postgres backups (scheduled snapshots and point-in-time recovery where available).
  - Confirm in the Supabase project settings that automatic backups are **enabled** and the retention window meets your needs (e.g. 7–30 days).

- **Manual backups before risky changes**
  - Before applying **non-trivial schema migrations**, take a manual snapshot or export using Supabase tools.
  - Document the backup ID or timestamp in the deployment notes / changelog.

- **Point-in-time recovery (PITR)**
  - If PITR is enabled, record how far back you can safely rewind (e.g. `X` days).
  - For severe incidents (data corruption, bad migration), you can:
    - Restore to a **new database instance** from a backup or PITR time.
    - Point the staging environment at that restored instance to verify integrity.

### 2.2 What Must Be Recoverable

In an incident, the following must be recoverable from backups or logs:

- Organization and user accounts.
- Inventory master data and all `InventoryEvent` history.
- Orders and any kitchen/inventory actions that affect stock or reports.

Configuration and code deployments are treated as **reproducible from source control**, not from DB backups.

---

## 3. Access & Safety Practices

- **Database access**
  - Limit direct database access to a small set of operators.
  - Prefer migrations and scripted fixes over ad-hoc `UPDATE` / `DELETE` in production.

- **Secrets management**
  - Store Supabase keys and backend secrets only in the platform’s environment variable management (not in the codebase).
  - Rotate secrets if they are ever exposed or suspected to be compromised.

- **Multi-tenancy safety**
  - All queries must be scoped by `organization_id` in application code.
  - Operational queries run by operators must include explicit org filters where applicable and never join across tenants without a clear reason.

---

## 4. Change Management

- Treat schema and data changes as **versioned, reversible migrations**.
- For any migration that drops/renames columns or tables:
  - Prefer a two-step rollout (add new column → backfill → update code → remove old column later).
  - Ensure a backup/snapshot exists immediately before the migration.

This baseline is intentionally lightweight; it can be tightened later (e.g. formal retention policies per table, DPA, audit logging) once you move beyond MVP.