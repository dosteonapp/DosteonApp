# Inventory Model & Onboarding

This document explains the current inventory model and how onboarding
relates to contextual products and opening stock.

---

## 1. Layers

The inventory system is split into three logical layers:

1. **Canonical layer** (`canonical_products`)
	 - Global catalog of products (e.g. "Tomatoes", "Chicken Breast").
	 - Shared across all organizations.
	 - Safe to read publicly (via RLS policy `Public Read for Canonical`).

2. **Contextual layer** (`contextual_products`)
	 - Per-organization view of the catalog.
	 - A contextual product ties a canonical product to an organization
		 and may introduce local naming/packaging (brand, pack size, etc.).

3. **Event layer** (`inventory_events`)
	 - Append-only log of stock movements (OPENING_STOCK, RECEIVED, USED,
		 WASTED, ADJUSTED, TRANSFER, CLOSING_STOCK).
	 - `current_stock` on contextual_products is a performance cache that
		 can be recomputed from the event log if needed.

---

## 2. Legacy bootstrap vs onboarding-driven creation

Historically, new organizations were initialized by **bootstrapping the
entire canonical catalog** into contextual products:

- Script: `backend/bootstrap_inventory.py`
- Repository helper: `InventoryRepository.bootstrap_organization()`

This created a contextual product for every public canonical product
for a given organization, even if the restaurant did not actually stock
that item.

### 2.1 Onboarding-first model (current)

The current model is **onboarding-driven**:

- Endpoint: `POST /api/v1/auth/onboard`
- Service: `AuthService.onboard_user`
- Repo helper: `InventoryRepository.create_from_canonical_selection()`

Flow:

1. User completes onboarding step 3 (core inventory selection) in the
	 frontend (`/onboarding`).
2. The payload includes `selected_canonical_ids` and optional
	 `opening_quantities` keyed by canonical product ID.
3. Backend behavior:
	 - Calls `create_from_canonical_selection(org_id, selected_canonical_ids)`
		 to create contextual products **only** for selected canonical items.
	 - Translates `opening_quantities` into contextual product IDs and
		 calls `bulk_add_opening_events()` to seed opening stock.

This means new organizations now have a **minimal, curated inventory**
matching the items they actually stock, rather than a full canonical
catalog clone.

### 2.2 Legacy bootstrap compatibility

For organizations created before this model existed, you may still have
been using `bootstrap_organization()` or the `bootstrap_inventory.py`
script. To avoid confusion between legacy-bootstrapped items and
onboarding-driven items:

- A one-time script `backend/scripts/mark_legacy_bootstrap.py` can be
	run against the existing database to mark all current
	`contextual_products` with a JSON metadata flag:

	- `metadata.legacy_bootstrapped = true`

This lets you:

- Identify which items were created by legacy bootstrap vs onboarding.
- Build analytics or migrations that treat legacy items differently
	(e.g. hide rarely-used legacy items from UI by default).

---

## 3. Recommended usage going forward

### 3.1 New organizations

- Do **not** call `bootstrap_organization()` as part of normal
	provisioning.
- Rely on the onboarding flow to:
	- Create an organization (if missing).
	- Select core inventory items.
	- Seed opening stock for those items.

### 3.2 Existing organizations (migrating off full bootstrap)

For tenants already using a full bootstrap:

1. Run `python -m scripts.mark_legacy_bootstrap` from the `backend/`
	 directory with the correct `DATABASE_URL`.
2. Optionally, add UI affordances to:
	 - Filter out `legacy_bootstrapped` items that have never been used.
	 - Encourage users to curate their core inventory and rely on
		 onboarding-style selection for new locations.

### 3.3 Future scripts & tooling

- New scripts should prefer `create_from_canonical_selection()` for
	inventory seeding, using explicit canonical IDs based on the
	restaurant’s choices.
- `bootstrap_organization()` can remain as an internal maintenance
	helper, but should not be part of the standard onboarding path.

---

## 4. Quick reference

- **Canonical catalog API**: `GET /api/v1/inventory/catalog`
- **Onboarding submit API**: `POST /api/v1/auth/onboard`
- **Contextual creation**: `InventoryRepository.create_from_canonical_selection()`
- **Opening stock seeding**: `InventoryRepository.bulk_add_opening_events()`
- **Legacy full bootstrap**: `InventoryRepository.bootstrap_organization()` (deprecated for new orgs)
- **Legacy marker script**: `backend/scripts/mark_legacy_bootstrap.py`
