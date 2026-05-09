# Legacy Feature Catalog (Quarantined for Post-MVP)

This document tracks **features that have been deliberately quarantined or marked legacy** for the initial restaurant MVP. They are **not part of the live MVP surface**, but their code is preserved in organized places so they can be revisited and upgraded later.

For each feature you will find:
- **Status**: Legacy / Mock-only / Experimental
- **User-facing entry points**: URL(s), navigation, and CTAs that used to lead here
- **Current code location**: where the legacy implementation now lives
- **Integration notes**: how it would plug back into the current system when revived

Use this catalog when you want to **reactivate** or **upgrade** one of these features.

---

## 1. Restaurant Orders v1 (Mock-First)

**Status**: Legacy (code removed), mock-driven, not in MVP

**Previous routes (restaurant context):**
- `/dashboard/orders`
- `/dashboard/orders/[id]`
- `/dashboard/orders/new`

**Previous legacy code locations (now removed):**
- `frontend/legacy_routes/dashboard/@restaurant/orders/page.tsx`
- `frontend/legacy_routes/dashboard/@restaurant/orders/loading.tsx`
- `frontend/legacy_routes/dashboard/@restaurant/orders/new/page.tsx`
- `frontend/legacy_routes/dashboard/@restaurant/orders/[id]/page.tsx`

**Previous main entry points in the UI:**
- Restaurant dashboard and supplier pages linked into these routes (e.g. "Order" buttons, order history links, and schedule flows).
- Mock notifications used `actionLink.href` values such as `/dashboard/orders/new?...`.

**What exists in the legacy implementation:**
- Order list/history views backed by **mock data** (e.g. `orders` arrays and `@/mocks/orders.mock`).
- New-order creation page with **local state only** and `router.push("/dashboard/orders")` on submit.
- Order detail view using mock data, with supplier info, timeline, items table, and payment/inventory cards.

**How to bring it back later (high level):**
1. **Domain & API:**
   - Ensure backend `Order` domain and endpoints are fully defined (create/read/update, order items, suppliers, payments).
   - Replace all legacy usages of `@/mocks/orders.mock` with calls to real API hooks (e.g. `useQuery` fetching from `/api/v1/orders` and `/api/v1/orders/:id`).
2. **Routing:**
   - Move the legacy route files from `frontend/legacy_routes/dashboard/@restaurant/orders/**` back under `frontend/app/dashboard/@restaurant/orders/**`.
   - Re-enable only the flows that are backed by real data; keep unfinished flows in `legacy_routes`.
3. **Navigation & CTAs:**
   - Reintroduce carefully chosen entry points (e.g. from inventory low-stock notifications or supplier views) once those flows are verified with real APIs.
4. **Lifecycle & Access Control:**
   - If you want orders to be part of the restaurant day lifecycle, add `/dashboard/orders` back into `RESTAURANT_MODULE_CONFIG` in `frontend/lib/dayLifecycle/restaurantModuleAccess.ts` with appropriate `allowReadOnly`/`requiresOpen` flags.

---

## 2. Restaurant Analytics v1

**Status**: Legacy (code removed), mostly mock dashboards, not in MVP

**Previous route (restaurant context):**
- `/dashboard/analytics`

**Previous legacy code location (now removed):**
- `frontend/legacy_routes/dashboard/@restaurant/analytics/page.tsx`

**What exists in the legacy implementation:**
- A dashboard-style page with **charts and KPIs** driven by mock data:
  - Revenue/usage over time
  - Breakdown cards and tabbed views
- Uses chart libraries (e.g. Recharts) and shared UI components.

**How to bring it back later:**
1. **Decide scope:** Is this restaurant-only analytics, or shared across restaurant & supplier? Define the metrics and their source tables.
2. **Wire to real data:** Replace mock datasets with queries to analytics endpoints (or directly to time-series tables) using React Query hooks.
3. **Route placement:** Either reintroduce `/dashboard/analytics` under `@restaurant`, or create distinct routes if analytics are split by role (restaurant vs supplier).
4. **Performance & UX:** Add loading/skeleton states and handle large datasets or empty states explicitly.

---

## 3. Restaurant Finance v1

**Status**: Legacy (code removed), mock-driven, not in MVP

**Previous route (restaurant context):**
- `/dashboard/finance`

**Previous legacy code location (now removed):**
- `frontend/legacy_routes/dashboard/@restaurant/finance/page.tsx`

**What exists in the legacy implementation:**
- Finance overview UI with tabs and cards based on mock data.
- CTAs for exports and detailed transaction views.

**Related redirects & CTAs (now neutralized):**
- `frontend/app/dashboard/@restaurant/petty-cash/page.tsx` previously redirected to `/dashboard/finance?tab=petty-cash`; it now redirects to `/dashboard/closing`.

**How to bring it back later:**
1. **Backoffice schema:** Define the full finance model (transactions, petty cash, invoices) in the backend and Prisma schema.
2. **End-to-end flow:** Confirm how finance interacts with orders (`Order`, `Payment`, `Invoice`) so analytics and balances are consistent.
3. **Route and UX:** When the data model is ready, move the page back into `app/dashboard/@restaurant/finance/page.tsx` and restore only the tabs backed by real data.

---

## 4. Supplier Orders & Finance Surfaces

**Status**: Mixed — supplier-side UIs for orders/finance are still **visible for suppliers**, but they are **non-MVP for the restaurant vertical** and heavily mock-led.

**Key supplier routes (still under @supplier):**
- `frontend/app/dashboard/@supplier/orders/page.tsx`
- `frontend/app/dashboard/@supplier/finance/page.tsx` and nested routes (sales, invoices, expenses)
- `frontend/app/dashboard/@supplier/analytics/**`

**Navigation changes already made:**
- The supplier sidebar in `frontend/components/supplier-sidebar.tsx` no longer exposes the `/dashboard/orders` entry. The underlying pages are still present for when supplier flows become a focus.

**How to treat these going forward:**
- Consider the supplier flows as a **separate phase** from the restaurant MVP.
- When you decide to prioritize supplier features, create a dedicated section in this catalog for:
  - Supplier Orders v1
  - Supplier Finance v1
  - Supplier Analytics v1
- At that point, document:
  - Which APIs are required
  - Which parts are still mock-only
  - How they should interact with restaurant data (shared Order/Inventory/Invoice models).

---

## 5. Legacy / Debug Backend Scripts

**Status**: Preserved as tools, not part of runtime

**Current legacy locations:**
- `backend/scripts/legacy/check_catalog.py`
- `backend/scripts/legacy/check_cols.py`
- `backend/scripts/legacy/check_item.py`
- `backend/scripts/legacy/test_api.py`

**What they do:**
- `check_catalog.py`: Connects to Prisma and prints counts of canonical products (total vs public).
- `check_cols.py`: Lists columns of `contextual_products` via raw SQL.
- `check_item.py`: Checks for a specific `ContextualProduct` by ID.
- `test_api.py`: Tests `restaurant_service.get_inventory_item_by_id` for a hard-coded item ID.

**How to use them later:**
- These are **diagnostic scripts**. If you need similar tooling in the future, use them as starting points for more formal CLI tools or admin endpoints.
- They should **not** be wired into any automated process; run on-demand from the `backend` root with the correct virtualenv and environment variables.

---

## 6. Conventions for Future Legacy/Quarantine

To keep this catalog useful over time:

- When you **quarantine a feature**, do the following:
  1. Move its frontend pages under a clearly named folder such as `frontend/legacy_routes/...` or `frontend/app/labs/...`.
  2. Move any one-off backend scripts to `backend/scripts/legacy/`.
  3. Add a short entry to this file with:
     - Feature name
     - Status
     - Routes and code locations
     - One or two bullet points on "how to bring it back".

- When you **reactivate a feature**:
  - Update this catalog to mark it as **Upgraded** or move its section to a "Completed" part of the file.
  - Ensure all references to mocks are removed or behind appropriate flags.

This way, whenever you ask to "implement" or "revive" a feature (orders, analytics, finance, etc.), we know exactly **what exists**, **where it lives now**, and **how it should be integrated back** into the current MVP system.
