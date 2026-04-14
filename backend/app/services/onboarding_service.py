"""
Onboarding service — handles the 4-step guided setup for new restaurant accounts.

Each method is scoped to the caller's organization_id so data never crosses tenants.
All write methods are idempotent (safe to call multiple times from the same session).
"""
from datetime import datetime, date
from typing import Optional
from app.db.prisma import db
from app.core.supabase import supabase
from app.schemas.onboarding import (
    BusinessRequest,
    HoursRequest,
    MenuRequest,
    InventoryRequest,
    OnboardingCompleteResponse,
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

        return {"status": "ok"}

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
            existing_settings = dict(org.settings) if isinstance(org.settings, dict) else {}

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
            data={"settings": new_settings},
        )

        return {"status": "ok"}

    # -----------------------------------------------------------------------
    # Step 3 — Menu
    # -----------------------------------------------------------------------

    async def save_menu(self, data: MenuRequest, organization_id: str) -> dict:
        """Replace all onboarding menu items with the submitted list."""
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
        """Upsert ContextualProducts and create OPENING_STOCK events."""
        if not data.items:
            return {"status": "ok", "items_saved": 0}

        saved = 0
        for item in data.items:
            # Upsert the ContextualProduct
            existing = await db.contextualproduct.find_first(
                where={
                    "organization_id": organization_id,
                    "canonical_product_id": item.canonical_product_id,
                }
            )

            if existing:
                cp_id = existing.id
                # Update the cached current_stock
                await db.contextualproduct.update(
                    where={"id": cp_id},
                    data={"current_stock": item.opening_quantity},
                )
            else:
                created = await db.contextualproduct.create(
                    data={
                        "canonical_product_id": item.canonical_product_id,
                        "organization_id": organization_id,
                        "current_stock": item.opening_quantity,
                        "preferred_unit": item.unit,
                    }
                )
                cp_id = created.id

            # Create the OPENING_STOCK event
            await db.inventoryevent.create(
                data={
                    "contextual_product_id": cp_id,
                    "organization_id": organization_id,
                    "event_type": "OPENING_STOCK",
                    "quantity": item.opening_quantity,
                    "unit": item.unit,
                    "actor_type": "user",
                    "actor_id": user_id,
                    "metadata": {"source": "onboarding"},
                }
            )
            saved += 1

        return {"status": "ok", "items_saved": saved}

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
            today = date.today()
            await db.daystatus.create(
                data={
                    "organization_id": organization_id,
                    "state": "CLOSED",
                    "business_date": today,
                }
            )

        # 4. Gather summary data for the completion screen
        org = await db.organization.find_unique(where={"id": organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        settings: dict = {}
        if org.settings and isinstance(org.settings, dict):
            settings = org.settings

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

        return OnboardingCompleteResponse(
            onboarding_completed=True,
            organization_id=organization_id,
            organization_name=org.name,
            phone=phone,
            hours_display=hours_display,
            operating_days_display=operating_days_display,
            menu_dishes_count=menu_count,
            inventory_items_count=inventory_count,
        )


onboarding_service = OnboardingService()
