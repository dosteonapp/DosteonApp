from app.db.prisma import db
from typing import List, Optional
from uuid import UUID
from prisma.models import ContextualProduct, CanonicalProduct, InventoryEvent
from prisma import Json
from app.core.metrics import INVENTORY_OPENING_EVENTS_COUNTER


class InventoryRepository:
    async def get_by_organization(
        self,
        organization_id: UUID,
        skip: int = 0,
        take: Optional[int] = None,
        brand_id: Optional[str] = None,
    ) -> List[dict]:
        # Fallback rule: null brand_id rows are visible to all brands in the org
        # (preserves existing data). Scoped rows match the resolved brand.
        where: dict = {"organization_id": str(organization_id), "is_active": True}
        if brand_id:
            where["OR"] = [{"brand_id": None}, {"brand_id": brand_id}]

        products = await db.contextualproduct.find_many(
            where=where,
            include={
                "canonical": True,
                "location": True
            },
            skip=skip or 0,
            take=take,
        )

        result = []
        for p in products:
            try:
                loc = "Main Storage"
                if p.location:
                    loc = p.location.location_type
                elif p.storage_type:
                    loc = p.storage_type

                result.append({
                    "id": p.id,
                    "name": p.name or (p.canonical.name if p.canonical else "Unknown Item"),
                    "category": p.canonical.category if p.canonical else "General",
                    "subcategory": p.canonical.subcategory if p.canonical else "Other",
                    "sku": p.sku or (p.canonical.sku if p.canonical else "N/A"),
                    "brand": p.brand_name or "Generic",
                    "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units"),
                    "current_stock": p.current_stock,
                    "min_level": float(p.reorder_threshold or 0),
                    "location": loc,
                    "status": p.status or "active",
                    "imageUrl": p.image_url,
                    "canonical_id": p.canonical_product_id,
                    "created_at": p.created_at,
                    "updated_at": p.updated_at
                })
            except Exception:
                continue
        return result

    async def get_low_stock(self, organization_id: UUID) -> List[dict]:
        products = await db.contextualproduct.find_many(
            where={"organization_id": str(organization_id)},
            include={"canonical": True}
        )

        result = []
        for p in products:
            try:
                threshold = float(p.reorder_threshold or 0)
                if p.current_stock <= threshold or p.status in ["Critical", "Low"]:
                    result.append({
                        "id": p.id,
                        "name": p.name or (p.canonical.name if p.canonical else "Unknown"),
                        "currentStock": p.current_stock,
                        "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units")
                    })
            except:
                continue
        return result

    async def get_by_id(self, item_id: UUID) -> Optional[dict]:
        p = await db.contextualproduct.find_unique(
            where={"id": str(item_id)},
            include={"canonical": True, "inventory_events": True, "location": True}
        )
        if not p:
            return None

        try:
            loc = "Main Storage"
            if p.location:
                loc = p.location.location_type
            elif p.storage_type:
                loc = p.storage_type

            return {
                "id": p.id,
                "organization_id": p.organization_id,
                "name": p.name or (p.canonical.name if p.canonical else "Unknown Item"),
                "category": p.canonical.category if p.canonical else "General",
                "subcategory": p.canonical.subcategory if p.canonical else "Other",
                "sku": p.sku or (p.canonical.sku if p.canonical else "N/A"),
                "brand": p.brand_name or "Generic",
                "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units"),
                "current_stock": p.current_stock,
                "min_level": float(p.reorder_threshold or 0),
                "critical_level": float(p.critical_threshold or 0),
                "location": loc,
                "status": p.status or "active",
                "image_url": p.image_url,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "canonical_id": p.canonical_product_id,
            }
        except Exception as e:
            print(f"Error in get_by_id: {e}")
            return None

    async def ensure_canonical(self, name: str, category: str) -> str:
        """Find or create a canonical product for the given name/category.

        This uses a slightly more robust lookup than a plain name match by
        checking both the primary name (case-insensitive) and any stored
        synonyms before creating a new canonical row. This helps avoid
        accidental duplicates when the same product is entered with small
        spelling or casing differences.
        """

        # Normalize input for comparison; keep the original for storage.
        normalized_name = name.strip()

        existing = await db.canonicalproduct.find_first(
            where={
                "OR": [
                    {"name": {"equals": normalized_name, "mode": "insensitive"}},
                    {"synonyms": {"has": normalized_name}},
                ]
            }
        )
        if existing:
            return existing.id

        import re, uuid
        prefix = re.sub(r"[^A-Z]", "", normalized_name.upper())[:3] or "USR"
        new_sku = f"{prefix}-{str(uuid.uuid4())[:8].upper()}"

        new_c = await db.canonicalproduct.create(
            data={
                "sku": new_sku,
                "name": normalized_name,
                "category": category,
                "base_unit": "units",
                "is_public": False,
                # Store the raw name as a synonym in case we later
                # adjust naming conventions but still want to match it.
                "synonyms": [name] if name != normalized_name else [],
            }
        )
        return new_c.id

    async def search_catalog(self, query: str, organization_id: str = None) -> List[dict]:
        existing_ids = []
        if organization_id:
            existing = await db.contextualproduct.find_many(
                where={"organization_id": organization_id, "is_active": True}
            )
            existing_ids = [p.canonical_product_id for p in existing]

        where_filter: dict = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"sku": {"contains": query, "mode": "insensitive"}}
            ]
        }

        if existing_ids:
            where_filter["id"] = {"not_in": existing_ids}

        canonicals = await db.canonicalproduct.find_many(
            where=where_filter,
            take=10,
            order={"name": "asc"}
        )

        return [
            {
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "subcategory": c.subcategory,
                "sku": c.sku,
                "unit": c.base_unit,
                "is_public": c.is_public
            }
            for c in canonicals
        ]

    async def get_catalog(self) -> List[dict]:
        canonicals = await db.canonicalproduct.find_many(
            where={"is_public": True},
            order={"category": "asc"}
        )
        return [
            {
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "subcategory": c.subcategory,
                "sku": c.sku,
                "base_unit": c.base_unit,
                "product_type": c.product_type,
                "is_critical_item": c.is_critical_item,
                "synonyms": c.synonyms,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
            }
            for c in canonicals
        ]

    async def bootstrap_organization(self, organization_id: str):
        """
        Fast bulk bootstrap — 2 queries instead of 58 sequential find+create pairs.
        """
        try:
            canonicals = await db.canonicalproduct.find_many(
                where={"is_public": True}
            )
            if not canonicals:
                print(f"  Bootstrap: no canonical products found")
                return True

            existing = await db.contextualproduct.find_many(
                where={"organization_id": organization_id},
            )
            existing_canonical_ids = {p.canonical_product_id for p in existing}

            missing = [c for c in canonicals if c.id not in existing_canonical_ids]

            if not missing:
                print(f"  Bootstrap: all {len(canonicals)} products already exist")
                return True

            await db.contextualproduct.create_many(
                data=[
                    {
                        "organization_id": organization_id,
                        "canonical_product_id": c.id,
                        "current_stock": 0.0,
                        "reorder_threshold": 5.0,
                        "critical_threshold": 2.0,
                        "status": "active",
                        "is_active": True,
                    }
                    for c in missing
                ],
                skip_duplicates=True
            )

            print(f"  Bootstrap complete: {len(missing)} created, {len(existing_canonical_ids)} already existed")
            return True

        except Exception as e:
            print(f"  Bootstrap error for {organization_id}: {e}")
            return False

    async def bulk_add_opening_events(self, organization_id: str, counts: dict):
        """
        Bulk update stock levels and create opening events.
        Uses a bulk insert for events and a single bulk UPDATE for
        current_stock, instead of per-item updates.

        This keeps the InventoryEvent log as the source of truth while
        avoiding N round-trips to the database when the opening
        checklist has many items.
        """
        if not counts:
            return

        # Validate and normalize IDs up-front; this also protects
        # against malformed UUID input before we build raw SQL.
        normalized_counts = {
            str(UUID(item_id)): float(quantity)
            for item_id, quantity in counts.items()
        }

        # 1. Bulk create all opening events in one query
        await db.inventoryevent.create_many(
            data=[
                {
                    "contextual_product_id": item_id,
                    "organization_id": organization_id,
                    "event_type": "OPENING_STOCK",
                    "quantity": quantity,
                    "unit": "units",
                    "metadata": Json({"reason": "Opening stock count"}),
                }
                for item_id, quantity in normalized_counts.items()
            ],
            skip_duplicates=True
        )

        # 2. Bulk update contextual_products.current_stock for all
        #    submitted items in a single SQL statement.
        #
        #    We construct a VALUES table of (id, quantity) pairs and
        #    join it against contextual_products.
        values_clause_parts = []
        for item_id, quantity in normalized_counts.items():
            # item_id is a validated UUID string; quantity is a float.
            values_clause_parts.append(
                f"('{item_id}'::uuid, {quantity})"
            )

        if values_clause_parts:
            values_clause = ",".join(values_clause_parts)
            query = f"""
UPDATE contextual_products AS cp
SET current_stock = v.quantity
FROM (VALUES {values_clause}) AS v(id, quantity)
WHERE cp.id = v.id;
"""
            await db.execute_raw(query)

        # Update Prometheus counter with the number of opening events recorded
        try:
            INVENTORY_OPENING_EVENTS_COUNTER.inc(len(normalized_counts))
        except Exception:
            # Metrics must never break business logic
            pass

    async def create_contextual_product(self, **kwargs) -> dict:
        data = {k: str(v) if isinstance(v, UUID) else v for k, v in kwargs.items()}
        data = {k: v for k, v in data.items() if v is not None}
        ctx = await db.contextualproduct.create(data=data)
        return ctx.__dict__

    async def update_contextual_product(self, item_id: UUID, data: dict) -> dict:
        ctx = await db.contextualproduct.update(
            where={"id": str(item_id)},
            data=data
        )
        return ctx.__dict__

    async def delete_contextual_product(self, item_id: UUID):
        # Soft-delete: archive product instead of hard delete to preserve history
        await db.contextualproduct.update(
            where={"id": str(item_id)},
            data={"is_active": False, "status": "archived"}
        )

    async def add_event(self, contextual_product_id: str, organization_id: str, event_type: str, quantity: float, unit: str, metadata: dict = None):
        event = await db.inventoryevent.create(
            data={
                "contextual_product_id": contextual_product_id,
                "organization_id": organization_id,
                "event_type": event_type,
                "quantity": quantity,
                "unit": unit,
                "metadata": Json(metadata or {})
            }
        )

        await db.contextualproduct.update(
            where={"id": contextual_product_id},
            data={"current_stock": {"increment": quantity}}
        )

        return event

    async def record_snapshot_event(self, contextual_product_id: str, organization_id: str, event_type: str, quantity: float, unit: str, metadata: dict = None):
        """Insert an audit event without mutating current_stock.

        Use for snapshot-style events (e.g. CLOSING_STOCK) where the quantity
        is a physical count, not a delta to apply to the running balance.
        """
        return await db.inventoryevent.create(
            data={
                "contextual_product_id": contextual_product_id,
                "organization_id": organization_id,
                "event_type": event_type,
                "quantity": quantity,
                "unit": unit,
                "metadata": Json(metadata or {})
            }
        )

    async def get_recent_events(
        self,
        organization_id: str,
        limit: int = 5,
        brand_id: Optional[str] = None,
    ) -> List[InventoryEvent]:
        # Fallback rule: events whose product has brand_id=null are visible to
        # all brands. Events whose product is brand-scoped match the resolved brand.
        where: dict = {"organization_id": organization_id}
        if brand_id:
            where["product"] = {
                "OR": [{"brand_id": None}, {"brand_id": brand_id}]
            }

        return await db.inventoryevent.find_many(
            where=where,
            include={
                "product": {
                    "include": {
                        "canonical": True,
                    }
                }
            },
            order={"created_at": "desc"},
            take=limit,
        )

    async def create_from_canonical_selection(self, organization_id: str, canonical_ids: List[str]) -> int:
        """Bulk-create ContextualProducts for the given canonical IDs.

        Idempotent: skips any canonical IDs that already have a ContextualProduct
        for this organization. Returns the count of newly created products.
        """
        if not canonical_ids:
            return 0

        existing = await db.contextualproduct.find_many(
            where={
                "organization_id": organization_id,
                "canonical_product_id": {"in": canonical_ids},
            }
        )
        existing_canonical_ids = {p.canonical_product_id for p in existing}
        missing_ids = [cid for cid in canonical_ids if cid not in existing_canonical_ids]

        if not missing_ids:
            return 0

        canonicals = await db.canonicalproduct.find_many(
            where={"id": {"in": missing_ids}}
        )
        if not canonicals:
            return 0

        await db.contextualproduct.create_many(
            data=[
                {
                    "organization_id": organization_id,
                    "canonical_product_id": c.id,
                    "current_stock": 0.0,
                    "reorder_threshold": 5.0,
                    "critical_threshold": 2.0,
                    "status": "active",
                    "is_active": True,
                }
                for c in canonicals
            ],
            skip_duplicates=True,
        )
        return len(canonicals)

    # -----------------------------------------------------------------------
    # Enhanced product catalog (Product Catalog tab)
    # -----------------------------------------------------------------------

    async def get_products_enhanced(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
        search: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List:
        conditions: list = [
            {"organization_id": organization_id},
            {"is_active": True},
        ]
        if brand_id:
            conditions.append({"OR": [{"brand_id": None}, {"brand_id": brand_id}]})
        if category:
            conditions.append(
                {"canonical": {"is": {"category": {"equals": category, "mode": "insensitive"}}}}
            )
        if search:
            conditions.append({
                "OR": [
                    {"name": {"contains": search, "mode": "insensitive"}},
                    {"sku":  {"contains": search, "mode": "insensitive"}},
                    {"canonical": {"is": {"name": {"contains": search, "mode": "insensitive"}}}},
                ]
            })

        return await db.contextualproduct.find_many(
            where={"AND": conditions},
            include={"canonical": True, "brand": True},
            order={"updated_at": "desc"},
        )

    async def get_inventory_counts(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
    ) -> dict:
        """Return current healthy / low / critical counts + last-week comparison."""
        from datetime import datetime, timedelta, timezone

        conditions: list = [
            {"organization_id": organization_id},
            {"is_active": True},
        ]
        if brand_id:
            conditions.append({"OR": [{"brand_id": None}, {"brand_id": brand_id}]})

        products = await db.contextualproduct.find_many(
            where={"AND": conditions},
        )

        def classify(p) -> str:
            crit = float(p.critical_threshold or 0)
            reorder = float(p.reorder_threshold or 0)
            if p.current_stock <= crit:
                return "critical"
            if p.current_stock <= reorder:
                return "low"
            return "healthy"

        current: dict = {"healthy": 0, "low": 0, "critical": 0}
        for p in products:
            current[classify(p)] += 1
        total = len(products)

        # Best-effort last-week comparison via opening stock events from 7 days ago
        target = datetime.now(timezone.utc) - timedelta(days=7)
        lw_events = await db.inventoryevent.find_many(
            where={
                "AND": [
                    {"organization_id": organization_id},
                    {"event_type": "OPENING_STOCK"},
                    {"occurred_at": {"gte": target - timedelta(hours=12),
                                     "lt":  target + timedelta(hours=12)}},
                ]
            }
        )

        lw_stock: dict[str, float] = {e.contextual_product_id: e.quantity for e in lw_events}
        lw: dict = {"total": 0, "healthy": 0, "low": 0, "critical": 0}

        if lw_stock:
            product_map = {p.id: p for p in products}
            for pid, qty in lw_stock.items():
                lw["total"] += 1
                p = product_map.get(pid)
                if p:
                    crit = float(p.critical_threshold or 0)
                    reorder = float(p.reorder_threshold or 0)
                    if qty <= crit:
                        lw["critical"] += 1
                    elif qty <= reorder:
                        lw["low"] += 1
                    else:
                        lw["healthy"] += 1

        def pct_change(now: int, then: int) -> Optional[float]:
            if then == 0:
                return None
            return round((now - then) / then * 100, 1)

        return {
            "items_in_stock": {"value": total,             "vs_last_week_pct": pct_change(total,             lw["total"])},
            "healthy_stock":  {"value": current["healthy"], "vs_last_week_pct": pct_change(current["healthy"], lw["healthy"])},
            "low_stock":      {"value": current["low"],     "vs_last_week_pct": pct_change(current["low"],     lw["low"])},
            "critical":       {"value": current["critical"],"vs_last_week_pct": pct_change(current["critical"],lw["critical"])},
        }

    # -----------------------------------------------------------------------
    # Stock-usage (Stock Usage tab)
    # -----------------------------------------------------------------------

    async def get_usage_stats_today(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
    ) -> dict:
        from datetime import datetime, timezone
        from collections import defaultdict

        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        product_cond: list = []
        if brand_id:
            product_cond.append({"OR": [{"brand_id": None}, {"brand_id": brand_id}]})

        base_where = {
            "AND": [
                {"organization_id": organization_id},
                {"occurred_at": {"gte": today_start}},
            ]
        }
        if product_cond:
            base_where["AND"].append({"product": {"AND": product_cond}})

        used_events = await db.inventoryevent.find_many(
            where={**base_where, "AND": base_where["AND"] + [{"event_type": "USED"}]},
            include={"product": {"include": {"canonical": True}}},
        )
        wasted_events = await db.inventoryevent.find_many(
            where={**base_where, "AND": base_where["AND"] + [{"event_type": "WASTED"}]},
            include={"product": {"include": {"canonical": True}}},
        )

        def _name(event) -> str:
            p = event.product
            if not p:
                return "Unknown"
            return p.name or (p.canonical.name if p.canonical else "Unknown")

        # Aggregate USED
        usage_by_product: dict = defaultdict(float)
        usage_names: dict = {}
        for e in used_events:
            pid = e.contextual_product_id
            usage_by_product[pid] += abs(e.quantity)
            usage_names[pid] = _name(e)

        # Aggregate WASTED
        waste_by_product: dict = defaultdict(float)
        waste_names: dict = {}
        for e in wasted_events:
            pid = e.contextual_product_id
            waste_by_product[pid] += abs(e.quantity)
            waste_names[pid] = _name(e)

        most_used_id    = max(usage_by_product, key=usage_by_product.get) if usage_by_product else None
        most_wasted_id  = max(waste_by_product, key=waste_by_product.get) if waste_by_product else None

        return {
            "most_used_item":    usage_names.get(most_used_id)  if most_used_id  else None,
            "consumption_today": round(sum(usage_by_product.values()), 3),
            "waste_today":       round(sum(waste_by_product.values()), 3),
            "most_wasted_item":  waste_names.get(most_wasted_id) if most_wasted_id else None,
        }

    async def get_usage_history(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
        limit: int = 10,
    ) -> List:
        conditions: list = [
            {"organization_id": organization_id},
            {"event_type": {"in": ["USED", "WASTED"]}},
        ]
        if brand_id:
            conditions.append({"product": {"AND": [
                {"OR": [{"brand_id": None}, {"brand_id": brand_id}]}
            ]}})

        return await db.inventoryevent.find_many(
            where={"AND": conditions},
            include={"product": {"include": {"canonical": True}}},
            order={"occurred_at": "desc"},
            take=limit,
        )

    async def add_usage_event(
        self,
        contextual_product_id: str,
        organization_id: str,
        event_type: str,          # "USED" | "WASTED"
        quantity: float,           # positive; stored as negative delta
        unit: str,
        consumption_reason: Optional[str] = None,
        waste_reason: Optional[str]       = None,
        actor_id: Optional[str]           = None,
    ):
        from prisma import Json

        data: dict = {
            "contextual_product_id": contextual_product_id,
            "organization_id": organization_id,
            "event_type": event_type,
            "quantity": -abs(quantity),    # delta is always negative for usage
            "unit": unit,
        }
        if consumption_reason:
            data["consumption_reason"] = consumption_reason
        if waste_reason:
            data["waste_reason"] = waste_reason
        if actor_id:
            data["actor_id"] = actor_id

        event = await db.inventoryevent.create(data=data)

        # Decrement the cached current_stock
        await db.contextualproduct.update(
            where={"id": contextual_product_id},
            data={"current_stock": {"decrement": abs(quantity)}},
        )

        return event

    async def get_pending_review_products(self) -> List[dict]:
        """Return all ContextualProducts flagged for admin promotion review."""
        products = await db.contextualproduct.find_many(
            where={"pending_canonical_review": True},
            include={"canonical": True, "organization": True},
        )
        result = []
        for p in products:
            result.append({
                "id": p.id,
                "organization_id": p.organization_id,
                "organization_name": p.organization.name if p.organization else None,
                "name": p.name or (p.canonical.name if p.canonical else "Unknown"),
                "category": p.canonical.category if p.canonical else "General",
                "sku": p.sku or (p.canonical.sku if p.canonical else None),
                "canonical_product_id": p.canonical_product_id,
                "created_at": p.created_at,
            })
        return result


inventory_repo = InventoryRepository()