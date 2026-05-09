# Security & Supabase RLS

This document captures the minimum security model and Row Level Security (RLS) policies required for the Dosteon MVP when deployed on Supabase.

The goals are:
- Every request made with the **anon key** is constrained by RLS.
- The **service role key** is used **only** by the backend for trusted, administrative paths.
- Tenancy is enforced at the **organization** level for all inventory and operational data.

---

## 1. Key Concepts

- **Auth identity**: `auth.uid()` is the Supabase user ID from `auth.users`.
- **Application profile**: `public.profiles` links `auth.users.id` to app-level fields (role, organization_id, etc.).
- **Organization tenancy**: Most business data is keyed by `organization_id` and scoped to the organization derived from the current user’s profile.

A helper function centralizes this mapping:

```sql
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
```

This function is referenced in multiple RLS policies to avoid duplicating logic.

---

## 2. Tables managed by Supabase and RLS

Supabase manages the underlying Postgres database and enforces RLS on any queries made with the **anon key** or user JWT. For the Dosteon MVP, the main tables which should have RLS enabled are:

- `public.profiles`
- `public.organizations`
- `public.teams`
- `public.canonical_products`
- `public.locations`
- `public.contextual_products`
- `public.inventory_events`
- `public.day_status`

RLS should be enabled for each table:

```sql
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contextual_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_status         ENABLE ROW LEVEL SECURITY;
```

---

## 3. RLS policy snippets by table

### 3.1 Profiles

The `profiles` table mirrors auth users and stores the user’s organization and role.

```sql
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Optionally allow self-updates via Supabase client (if ever used directly)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

Profile rows are automatically created from Supabase `auth.users` via the trigger defined in
`backend/prisma/sql/layered_inventory.sql` (`handle_new_user` + `on_auth_user_created`).


### 3.2 Organizations

Organizations are tenant boundaries. Users should only see their own organization record.

```sql
DROP POLICY IF EXISTS "Org Access for Organizations" ON public.organizations;
CREATE POLICY "Org Access for Organizations" ON public.organizations
  FOR SELECT
  USING (id = public.get_my_org_id());
```

In the current architecture, **writes** to `organizations` (create/update) are done only from the backend via Prisma with the service role key, so no insert/update policies are required for anon clients.


### 3.3 Teams

Teams are scoped to a single organization.

```sql
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Only see teams in your own organization
DROP POLICY IF EXISTS "Org Access for Teams" ON public.teams;
CREATE POLICY "Org Access for Teams" ON public.teams
  FOR SELECT
  USING (organization_id = public.get_my_org_id());
```

Team creation and membership changes are performed via the backend using the service role key.


### 3.4 Canonical Products

Canonical products are global and safe to read by everyone.

```sql
DROP POLICY IF EXISTS "Public Read for Canonical" ON public.canonical_products;
CREATE POLICY "Public Read for Canonical" ON public.canonical_products
  FOR SELECT
  USING (true);
```

Writes (creating or editing canonical catalog entries) are reserved for admin flows via the backend and the service role key.


### 3.5 Locations

Locations belong to a single organization.

```sql
DROP POLICY IF EXISTS "Org Access for Locations" ON public.locations;
CREATE POLICY "Org Access for Locations" ON public.locations
  FOR ALL
  USING (organization_id = public.get_my_org_id());
```

This ensures that any read or write via anon key is constrained to the current tenant. In practice, location writes are handled by the backend using Prisma + service role.


### 3.6 Contextual Products (Inventory)

Contextual products represent inventory items as seen by a specific organization.

```sql
DROP POLICY IF EXISTS "Org Access for Contextual" ON public.contextual_products;
CREATE POLICY "Org Access for Contextual" ON public.contextual_products
  FOR ALL
  USING (organization_id = public.get_my_org_id());
```

This enforces that any inventory listing or update coming directly from a Supabase client (if ever used) is scoped to the user’s organization.


### 3.7 Inventory Events (Ledger)

Inventory events form an immutable(ish) ledger of stock movements, keyed through `contextual_product_id`.

```sql
DROP POLICY IF EXISTS "Org Access for Events" ON public.inventory_events;
CREATE POLICY "Org Access for Events" ON public.inventory_events
  FOR ALL
  USING (
    contextual_product_id IN (
      SELECT id FROM public.contextual_products
      WHERE organization_id = public.get_my_org_id()
    )
  );
```

All reads and writes through anon key are restricted to events associated with products in the caller’s organization.


### 3.8 Day Status (Operational State)

Day status is per-organization, used to track opening/closing state.

```sql
DROP POLICY IF EXISTS "Org Access for Day Status" ON public.day_status;
CREATE POLICY "Org Access for Day Status" ON public.day_status
  FOR ALL
  USING (organization_id = public.get_my_org_id());
```

---

## 4. Anon key vs Service role key

### 4.1 Anon key

Used by:
- The **Next.js frontend** Supabase client (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Any browser-side interaction with Supabase (auth flows, potential direct table reads in the future).

Properties:
- Subject to RLS.
- Limited privileges as defined by Supabase.

Typical operations with anon key:
- Authentication: `signUp`, `signInWithPassword`, `signInWithOAuth`, `getSession`, `refreshSession`.
- (Optionally) Safe `SELECT` queries against tables with the policies above, if you decide to use Supabase client for data instead of the backend for some flows.


### 4.2 Service role key

Used by:
- The **backend** Supabase client in `backend/app/core/supabase.py`:
  - Reads `settings.s_service_role_key` and falls back to `s_anon_key` if missing.

The service role key is required for:
- Admin user operations: `supabase.auth.admin.create_user`, `update_user_by_id`, `generate_link`, `delete_user`.
- Backend-managed signup and onboarding flows that must bypass RLS.

Because the service role key bypasses RLS, **it must never be exposed to the browser or logged**. It should only be present in backend environment variables (e.g., `SUPABASE_SERVICE_ROLE_KEY`) and consumed from there.


### 4.3 Backend DB access via Prisma

The backend also talks directly to the Postgres database via Prisma (`backend/app/db/prisma.py`).

- Connections use `DATABASE_URL` / `DIRECT_URL`, which typically resolve to the same Postgres used by Supabase.
- These connections are **trusted** and not subject to Supabase RLS.

Implications:
- All server-side handlers must enforce authorization and tenancy **in application code**.
- RLS still protects you if any flows later use the anon key directly from the browser or another untrusted environment.

---

## 5. Operational Checklist

When provisioning a new environment (staging or production):

1. Apply base schema and RLS scripts
   - Run the SQL in:
     - `backend/prisma/sql/layered_inventory.sql`
     - `backend/prisma/sql/init_all.sql` (if used) or equivalent migrations.

2. Verify RLS is active
   - In Supabase SQL editor:
     - `SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles';`
     - Repeat for `organizations`, `contextual_products`, `inventory_events`, etc.

3. Confirm anon vs service role wiring
   - Frontend env vars:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Backend env vars:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_ANON_KEY` (optional fallback)

4. Run smoke tests
   - Login and onboarding with a test user.
   - Confirm that:
     - A user cannot see another organization’s inventory.
     - Canonical catalog is globally readable.
     - Organization-specific data is invisible when using a JWT from another tenant.
