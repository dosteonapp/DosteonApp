# Deprecated / Mock-Only Routes (Removed)

The following routes are built using 100% mock data or are not prioritized for the current **Restaurant MVP**. They have been removed from the active restaurant routing tree and navigation, and their legacy route implementations have now been removed from the codebase.

For historical notes and guidance on how these flows could be reimplemented in the future, see:
- `docs/LEGACY_FEATURE_CATALOG.md`

## Restaurant routes

These were previously under `app/dashboard/@restaurant/**` and were later quarantined in `frontend/legacy_routes/...` before being fully removed:

- `/dashboard/orders`: Procurement order tracking (Mock)
- `/dashboard/orders/[id]`: Order detail (Mock)
- `/dashboard/orders/new`: Order creation (Mock)
- `/dashboard/analytics`: Detailed consumption and wastage trends (Mock)
- `/dashboard/finance`: Restaurant spending and expense tracking (Mock)

## Other non-MVP surfaces

- Older, mock-only versions of `/dashboard/notifications` and `/dashboard/settings` (restaurant) have been superseded by newer integrated flows.

## Why are they quarantined?

We are focusing on a **narrow, production-ready Restaurant Workflow** (inventory, kitchen usage/waste, daily closing, core notifications/settings). Orders, analytics, and finance v1 are kept as reference implementations and will be revisited in later phases.
