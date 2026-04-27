"""
Onboarding service — handles the 4-step guided setup for new restaurant accounts.

Each method is scoped to the caller's organization_id so data never crosses tenants.
All write methods are idempotent (safe to call multiple times from the same session).
"""
import json
from datetime import datetime
from prisma import Json
from typing import Optional
from app.db.prisma import db
from app.core.supabase import supabase
from app.schemas.onboarding import (
    BusinessRequest,
    HoursRequest,
    MenuRequest,
    InventoryRequest,
    OnboardingCompleteResponse,
    BrandOut,
)
from fastapi import HTTPException, status
from app.core.metrics import ONBOARDING_COMPLETED_COUNTER


# Day abbreviation order used in the completion screen display
_DAY_ORDER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
_DAY_SHORT = {
    "SUN": "Sun", "MON": "Mon", "TUE": "Tue", "WED": "Wed",
    "THU": "Thur", "FRI": "Fri", "SAT": "Sat",
}


def _fmt_time_display(t: str) -> str:
    """Convert '09:00' → '09:00 AM', '13:30' → '01:30 PM'."""
    if not t:
        return t
    try:
        h, m = map(int, t.split(":"))
        suffix = "AM" if h < 12 else "PM"
        h12 = h % 12 or 12
        return f"{h12:02d}:{m:02d} {suffix}"
    except Exception:
        return t


class OnboardingService:

    # -----------------------------------------------------------------------
    # Step 1 — Business details
    # -----------------------------------------------------------------------

    async def save_business(self, data: BusinessRequest, organization_id: str) -> dict:
        """Update org fields and upsert Brand rows."""
        # 1. Update the Organization row
        await db.organization.update(
            where={"id": organization_id},
            data={
                "name": data.name,
                "type": data.business_type,
                "city": data.city,
                "phone": data.phone,
                "daily_stock_count": data.daily_stock_count,
            },
        )

        # 2. Determine brand names to create
        if data.has_multiple_brands:
            brand_names = [n for n in data.brands if n]
            if len(brand_names) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least 2 brand names are required when using multiple brands",
                )
        else:
            brand_names = [data.name]

        # 3. Delete all existing brands for this org, then recreate (idempotent)
        await db.brand.delete_many(where={"organization_id": organization_id})
        for brand_name in brand_names:
            await db.brand.create(
                data={
                    "organization_id": organization_id,
                    "name": brand_name,
                }
            )

        # Return the created brands with IDs so the frontend can scope menus per brand
        created_brands = await db.brand.find_many(
            where={"organization_id": organization_id},
            order={"created_at": "asc"},
        )
        return {
            "status": "ok",
            "brands": [{"id": str(b.id), "name": b.name} for b in created_brands],
        }

    # -----------------------------------------------------------------------
    # Step 2 — Operating hours
    # -----------------------------------------------------------------------

    async def save_hours(self, data: HoursRequest, organization_id: str) -> dict:
        """Persist operating schedule into org.settings JSON."""
        # Build a clean serialisable structure
        schedule = [
            {
                "day": d.day.value,
                "opening_time": d.opening_time,
                "closing_time": d.closing_time,
                "is_open": d.is_open,
            }
            for d in data.operating_days
        ]

        # Read current settings so we don't clobber unrelated keys
        org = await db.organization.find_unique(where={"id": organization_id})
        existing_settings: dict = {}
        if org and org.settings:
            if isinstance(org.settings, dict):
                existing_settings = org.settings
            elif isinstance(org.settings, str):
                try:
                    existing_settings = json.loads(org.settings)
                except (json.JSONDecodeError, ValueError):
                    existing_settings = {}

        # Derive a simple opening/closing time from the first open day for
        # backward-compatibility with parts of the app that use those flat keys.
        open_days = [d for d in data.operating_days if d.is_open]
        first_open = open_days[0] if open_days else None

        new_settings = {
            **existing_settings,
            "operating_days": schedule,
            "opening_time": first_open.opening_time if first_open else existing_settings.get("opening_time", "09:00"),
            "closing_time": first_open.closing_time if first_open else existing_settings.get("closing_time", "23:00"),
        }

        await db.organization.update(
            where={"id": organization_id},
            data={"settings": json.dumps(new_settings)},
        )

        return {"status": "ok"}

    # -----------------------------------------------------------------------
    # Step 3 — Menu
    # -----------------------------------------------------------------------

    async def save_menu(self, data: MenuRequest, organization_id: str) -> dict:
        """Replace all onboarding menu items with the submitted list.

        Each DishItem may carry an optional brand_id:
        - brand_id = None  → org-level (shared across all brands)
        - brand_id = <uuid> → scoped to that brand only
        """
        named_dishes = [d for d in data.dishes if d.name]
        if len(named_dishes) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 3 dishes are required to enable sales logging",
            )

        # Delete previous onboarding dishes and recreate (idempotent)
        await db.menuitem.delete_many(
            where={"organization_id": organization_id, "source": "onboarding"}
        )
        for dish in named_dishes:
            await db.menuitem.create(
                data={
                    "organization_id": organization_id,
                    "brand_id": dish.brand_id,   # null = shared, set = brand-specific
                    "name": dish.name,
                    "price": dish.price,
                    "category": dish.category,
                    "source": "onboarding",
                }
            )

        return {"status": "ok", "dishes_saved": len(named_dishes)}

    # -----------------------------------------------------------------------
    # Step 4 — Inventory
    # -----------------------------------------------------------------------

    async def save_inventory(self, data: InventoryRequest, organization_id: str, user_id: str) -> dict:
        """Upsert ContextualProducts and create OPENING_STOCK events.

        Uses bulk queries to avoid N+1 round trips over the pooler connection:
        1 fetch existing → 1 create_many new → 1 fetch new IDs → N updates (existing only) → 1 create_many events
        """
        if not data.items:
            return {"status": "ok", "items_saved": 0}

        canonical_ids = [item.canonical_product_id for item in data.items]
        item_map = {item.canonical_product_id: item for item in data.items}

        # 1. Fetch all already-existing contextual products for this org in one query
        existing_products = await db.contextualproduct.find_many(
            where={
                "organization_id": organization_id,
                "canonical_product_id": {"in": canonical_ids},
            }
        )
        cp_map = {p.canonical_product_id: p for p in existing_products}

        # 2. Bulk-create any that don't exist yet
        new_canonical_ids = [cid for cid in canonical_ids if cid not in cp_map]
        if new_canonical_ids:
            await db.contextualproduct.create_many(
                data=[
                    {
                        "canonical_product_id": cid,
                        "organization_id": organization_id,
                        "current_stock": item_map[cid].opening_quantity,
                        "preferred_unit": item_map[cid].unit,
                    }
                    for cid in new_canonical_ids
                ],
                skip_duplicates=True,
            )
            # Fetch the newly created records to get their IDs
            new_products = await db.contextualproduct.find_many(
                where={
                    "organization_id": organization_id,
                    "canonical_product_id": {"in": new_canonical_ids},
                }
            )
            for p in new_products:
                cp_map[p.canonical_product_id] = p

        # 3. Update stock for any that already existed (idempotent retry support)
        for cp in existing_products:
            item = item_map[cp.canonical_product_id]
            await db.contextualproduct.update(
                where={"id": cp.id},
                data={"current_stock": item.opening_quantity},
            )

        # 4. Bulk-create all OPENING_STOCK events in one query
        await db.inventoryevent.create_many(
            data=[
                {
                    "contextual_product_id": cp_map[item.canonical_product_id].id,
                    "organization_id": organization_id,
                    "event_type": "OPENING_STOCK",
                    "quantity": item.opening_quantity,
                    "unit": item.unit,
                    "actor_type": "user",
                    "actor_id": user_id,
                    "metadata": Json({"source": "onboarding"}),
                }
                for item in data.items
                if item.canonical_product_id in cp_map
            ],
            skip_duplicates=True,
        )

        return {"status": "ok", "items_saved": len(data.items)}

    # -----------------------------------------------------------------------
    # Complete — finalise onboarding
    # -----------------------------------------------------------------------

    async def complete_onboarding(self, organization_id: str, user_id: str) -> OnboardingCompleteResponse:
        """Mark onboarding complete and return the summary card data."""

        # 1. Set profile.onboarding_completed = True
        await db.profile.update(
            where={"id": user_id},
            data={"onboarding_completed": True},
        )
        ONBOARDING_COMPLETED_COUNTER.inc()

        # 2. Mirror the flag to Supabase user_metadata for backward-compat
        try:
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {"onboarding_completed": True}},
            )
        except Exception as e:
            # Non-fatal — DB is the source of truth now
            print(f"[onboarding] Supabase metadata update warning for {user_id}: {e}")

        # 3. Create DayStatus CLOSED if none exists yet
        existing_ds = await db.daystatus.find_unique(where={"organization_id": organization_id})
        if not existing_ds:
            await db.daystatus.create(
                data={
                    "organization_id": organization_id,
                    "state": "CLOSED",
                }
            )

        # 4. Gather summary data for the completion screen
        org = await db.organization.find_unique(where={"id": organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        settings: dict = {}
        if org.settings:
            if isinstance(org.settings, dict):
                settings = org.settings
            elif isinstance(org.settings, str):
                try:
                    settings = json.loads(org.settings)
                except (json.JSONDecodeError, ValueError):
                    settings = {}

        # Build hours display string from the first open day in the schedule
        hours_display: Optional[str] = None
        operating_days_display: Optional[str] = None
        schedule = settings.get("operating_days", [])
        if schedule:
            open_days = [d for d in schedule if d.get("is_open")]
            if open_days:
                first = open_days[0]
                hours_display = (
                    f"{_fmt_time_display(first['opening_time'])} - "
                    f"{_fmt_time_display(first['closing_time'])}"
                )
                # Sort open days by canonical week order
                sorted_open = sorted(
                    open_days,
                    key=lambda d: _DAY_ORDER.index(d["day"]) if d["day"] in _DAY_ORDER else 99,
                )
                operating_days_display = ", ".join(
                    _DAY_SHORT.get(d["day"], d["day"]) for d in sorted_open
                )
        else:
            # Fallback to flat keys
            ot = settings.get("opening_time")
            ct = settings.get("closing_time")
            if ot and ct:
                hours_display = f"{_fmt_time_display(ot)} - {_fmt_time_display(ct)}"

        menu_count = await db.menuitem.count(where={"organization_id": organization_id})
        inventory_count = await db.contextualproduct.count(where={"organization_id": organization_id})

        # Fetch phone from org (stored during Step 1)
        phone = org.phone if hasattr(org, "phone") else None

        # Fetch all active brands so the frontend can initialize its brand context
        active_brands = await db.brand.find_many(
            where={"organization_id": organization_id, "is_active": True, "deleted_at": None},
            order={"created_at": "asc"},
        )

        return OnboardingCompleteResponse(
            onboarding_completed=True,
            organization_id=organization_id,
            organization_name=org.name,
            phone=phone,
            hours_display=hours_display,
            operating_days_display=operating_days_display,
            menu_dishes_count=menu_count,
            inventory_items_count=inventory_count,
            brands=[BrandOut(id=str(b.id), name=b.name) for b in active_brands],
        )


onboarding_service = OnboardingService()
