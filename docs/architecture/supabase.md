# Supabase & Database Runbook

## 1. Symptoms from Production Logs

- Intermittent 404s on `/api/v1/auth/me`, `/api/v1/restaurant/settings`, `/api/v1/restaurant/inventory/items`, `/api/v1/restaurant/day-status`, `/api/v1/restaurant/closing/indicators`, `/api/v1/restaurant/recent-activities`, `/api/v1/restaurant/stats`.
- Log lines like:
  - `Auto-create profile failed: Timed out fetching a new connection from the connection pool ... (connection limit: 1)`
  - `User profile not found and could not be created. Please contact support.`
  - `httpx.ReadTimeout` inside Prisma engine HTTP calls.
- Very long request durations (≈ 90–110s) followed by 404 or 500.
- Multiple `Profile not found — auto-creating` warnings for the same email/user ID, sometimes resulting in duplicate organizations.

## 2. Root Causes (High Level)

1. **Prisma connection pool is configured with `connection_limit=1`**
   - Under concurrent requests (dashboard loads several endpoints in parallel), the single DB connection is exhausted.
   - Prisma times out waiting for a connection and returns `P2024` (`Timed out fetching a new connection from the connection pool`).
   - The profile auto-create logic fails during these timeouts, emitting the 404 "profile not found and could not be created" error.

2. **Profile bootstrap is sensitive to transient DB failures and can be triggered in parallel**
   - Dependency in `dosteon.deps`:
     - If `findUniqueProfile`/`findFirstProfile` returns no row, it logs `Profile not found — auto-creating` and calls `createOneOrganization` + `createOneProfile`.
   - With timeouts and races, multiple requests for the same user can:
     - All decide the profile is missing.
     - All try to create a new organization and profile.
     - Some fail (connection errors) and throw 404.
     - Some eventually succeed, producing duplicate organization rows.

3. **Heavy dashboard queries amplify the issue**
   - Endpoints like `recent-activities` and `stats` read from `InventoryEvent` and `ContextualProduct`.
   - When the connection pool is already starved, those calls hit `httpx.ReadTimeout` talking to the Prisma query engine.

## 3. Required Supabase & DATABASE_URL Fixes

> Goal: ensure the backend has a **sane connection pool size** and uses the **correct Supabase pooled URL**.

### 3.1. Collect the correct Supabase URLs

In Supabase dashboard:

1. Go to **Project → Settings → Database → Connection string**.
2. Under **Pooled connection** (pgBouncer):
   - Copy the **connection string (Postgres)** – this is the one intended for app servers.
3. Under **Direct connection**:
   - Copy the **direct Postgres URL** (non-pooled). This is used only for migrations / admin operations.

You should end up with:

- `SUPABASE_POOLED_URL`: `postgres://...:5432/postgres?pgbouncer=true&...`
- `SUPABASE_DIRECT_URL`: `postgres://...:5432/postgres` (no `pgbouncer=true`).

### 3.2. Set Render backend env vars correctly

In the Render backend service (`dosteon-backend`):

1. Open **Environment → Environment Variables**.
2. Set / verify:
   - `DATABASE_URL = <SUPABASE_POOLED_URL>`
   - `DIRECT_URL   = <SUPABASE_DIRECT_URL>`

3. Ensure **no extra `connection_limit=1`** is appended to `DATABASE_URL`:
   - If you see `?pgbouncer=true&connection_limit=1` (or similar):
     - Change it to a higher value, e.g. `connection_limit=5` or `connection_limit=10`.
     - Example: `...?pgbouncer=true&connection_limit=10`.
   - If there is no `connection_limit` at all, you can:
     - Either leave it off (let Prisma manage), or
     - Explicitly set `connection_limit=5` for small scale and increase if needed.

4. Redeploy the backend from Render so the new variables take effect.

### 3.3. Capacity sanity check

- Start with `connection_limit=5`–`10` depending on expected concurrent users.
- Monitor:
  - Prisma logs: ensure `connection_limit` in `P2024` meta **no longer shows 1**.
  - Supabase: keep an eye on max connections for your plan. Total from all app instances + tools must stay under Supabase limits.

## 4. Optional: Make Profile Bootstrap More Resilient

> These are improvements to reduce noise and duplicate data. They are secondary to fixing the pool size.

### 4.1. Use idempotent upsert-style logic

In the `dosteon.deps` profile bootstrap (where it logs `Profile not found — auto-creating`):

1. Keep the current high-level flow:
   - Get Supabase user (id, email, name).
   - Try `findUniqueProfile` by `id`.
   - If not found, try `findFirstProfile` by `email`.
   - If still not found, create organization + profile.

2. Wrap the **create** path in safer logic:
   - First attempt `createOneOrganization` + `createOneProfile`.
   - On **unique constraint errors** (for profile or organization):
     - Re-run `findUniqueProfile` and `findUniqueOrganization`.
     - Use the existing row instead of failing.

3. Add a small, bounded retry around the auto-create for transient errors:
   - If Prisma returns a network/timeout error once, wait a short delay (e.g. 200–500 ms) and retry **once**.
   - If it still fails, log with full exception and let the 404 propagate.

### 4.2. Reduce parallel bootstraps

- The App Router currently fires several requests in parallel right after sign-in:
  - `/api/v1/auth/me`
  - `/api/v1/restaurant/settings`
  - `/api/v1/restaurant/day-status`
  - `/api/v1/restaurant/recent-activities`
  - `/api/v1/restaurant/stats`
- All of those depend on the profile being present, so they all trigger bootstrap if the profile is missing.

Two mitigation options (code-level, not mandatory once DB is stable):

1. **Frontend sequencing (lightweight)**
   - Ensure the first call is `/api/v1/auth/me`.
   - Only after `auth/me` returns 200 (which implies profile+org exist) should the dashboard fire the rest of the restaurant endpoints.

2. **Backend short-circuit**
   - In the dependency that fetches `SecurityContext`, if an auto-create is already "in progress" for this user, you can:
     - Return a 503/429 with a clear message asking the frontend to retry after a short delay, or
     - Use an in-memory flag / short-lived cache to avoid kicking off multiple bootstraps simultaneously for the same user.

## 5. Cleaning Up Duplicate Data (One-Time Maintenance)

After the pool fix and a clean bootstrap, you may have:

- Multiple `organization` rows named "Jules's Restaurant" tied to the same user email.
- Profiles pointing to different organizations.

Recommended cleanup steps (manually or via a script):

1. In Supabase SQL editor, inspect data:
   - List profiles for the email:
     - `SELECT * FROM profile WHERE email = 'gatetejules1@gmail.com';`
   - List organizations used:
     - `SELECT * FROM organization WHERE name = 'Jules''s Restaurant';`

2. Decide which organization/profile pair is canonical:
   - Likely the one that has inventory/events associated.

3. Update references if needed:
   - If there are inventory/location rows tied to a non-canonical org, either:
     - Migrate them to the canonical `organization_id`, or
     - Delete test data if safe.

4. Delete truly orphaned test orgs/profiles:
   - Only after confirming they are not referenced by inventory, locations, or events.

## 6. Verification Checklist After Changes

1. **Deploy with updated `DATABASE_URL` and `DIRECT_URL`.**
2. **New sign-up flow (fresh email):**
   - Sign up in the frontend.
   - Confirm:
     - `/api/v1/auth/me` returns 200 quickly (≤ 1–2s).
     - `/api/v1/restaurant/settings`, `/day-status`, `/inventory/items`, `/stats`, `/recent-activities` all return 200.
     - No new `P2024` or `ReadTimeout` errors in logs.
3. **Repeat dashboard loads:**
   - Refresh dashboard several times; simulate typical usage.
   - Check logs for any remaining `Profile not found — auto-creating` messages for existing users.
4. **Forgot password flow:**
   - Trigger and complete a password reset.
   - After login, verify the same API endpoints behave as above.
5. **Observe Supabase metrics:**
   - Ensure active connections stay within plan limits and there are no spikes/errors related to connection exhaustion.

If all the above pass without `P2024`, 404s for profile bootstrap, or `ReadTimeout` in Prisma engine logs, Supabase is considered correctly configured for this app’s current scale.