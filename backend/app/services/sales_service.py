"""
Sales service — menu management, sale logging, stats, and history.
All methods are scoped to organization_id so data never crosses tenants.
Brand scoping follows the standard fallback rule:
  - brand_id set → show rows where brand_id = ? OR brand_id IS NULL
  - brand_id None → show all org rows (no brand filter applied)
"""
from datetime import date, datetime, timedelta, time as time_
from typing import Optional, List
from app.db.prisma import db
from app.core.logging import get_logger
from fastapi import HTTPException

logger = get_logger("sales")

# ---------------------------------------------------------------------------
# Unit conversion helpers
# ---------------------------------------------------------------------------

_UNIT_FAMILIES: dict[str, dict[str, float]] = {
    "mass":   {"g": 1.0, "kg": 1000.0, "mg": 0.001},
    "volume": {"ml": 1.0, "l": 1000.0, "cl": 10.0},
    "count":  {"pcs": 1.0, "pieces": 1.0, "units": 1.0, "pc": 1.0},
}


def _convert_unit(qty: float, from_unit: Optional[str], to_unit: Optional[str]) -> float:
    """Convert qty from from_unit to to_unit within the same SI family.
    Returns qty unchanged if units are the same, unknown, or from different families."""
    if not from_unit or not to_unit:
        return qty
    f, t = from_unit.lower().strip(), to_unit.lower().strip()
    if f == t:
        return qty
    for family in _UNIT_FAMILIES.values():
        if f in family and t in family:
            return qty * family[f] / family[t]
    return qty  # incompatible families — pass through unchanged


class SalesService:

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------

    def _dt(self, d: date) -> datetime:
        """Convert date → datetime (midnight) for Prisma @db.Date filter queries."""
        return datetime.combine(d, time_.min)

    def _brand_where(self, brand_id: Optional[str]) -> dict:
        """Returns the brand portion of a Prisma where clause."""
        if brand_id:
            return {"OR": [{"brand_id": None}, {"brand_id": brand_id}]}
        return {}

    def _item_out(self, item) -> dict:
        return {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "cost": item.cost if item.cost is not None else 0,
            "category": item.category,
            "status": item.status,
            "source": item.source,
            "image_url": getattr(item, "image_url", None),
        }

    # -----------------------------------------------------------------------
    # Menu management
    # -----------------------------------------------------------------------

    async def get_menu(
        self,
        organization_id: str,
        brand_id: Optional[str],
        search: str = "",
    ) -> dict:
        """Return active and inactive menu items grouped by category (excludes archived)."""
        _is_unfiltered = not search
        if _is_unfiltered:
            from app.cache.ops import cache_get, cache_set
            from app.cache.keys import CacheKeys
            _menu_cache_key = CacheKeys.menu(organization_id, brand_id)
            _cached = await cache_get(_menu_cache_key, resource="menu")
            if _cached is not None:
                return _cached

        where: dict = {
            "organization_id": organization_id,
            "NOT": {"status": "archived"},
            **self._brand_where(brand_id),
        }
        if search:
            where["name"] = {"contains": search, "mode": "insensitive"}

        items = await db.menuitem.find_many(where=where, order={"name": "asc"})

        groups: dict[str, list] = {}
        for item in items:
            cat = item.category or "Uncategorized"
            groups.setdefault(cat, []).append(self._item_out(item))

        _result = {
            "categories": [
                {"category": cat, "items": items_list}
                for cat, items_list in sorted(groups.items())
            ]
        }
        if _is_unfiltered:
            await cache_set(_menu_cache_key, _result, ttl=3600)
        return _result

    async def create_menu_item(
        self,
        organization_id: str,
        brand_id: Optional[str],
        data: dict,
    ) -> dict:
        create_data: dict = {
            "organization_id": organization_id,
            "brand_id": brand_id,
            "name": data["name"],
            "price": data.get("price", 0),
            "cost": data.get("cost", 0),
            "category": data.get("category", "Signature"),
            "source": "manual",
        }
        if data.get("image_url"):
            create_data["image_url"] = data["image_url"]
        item = await db.menuitem.create(data=create_data)
        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(
            CacheKeys.menu(organization_id, brand_id),
            CacheKeys.menu(organization_id, None),
        )
        return self._item_out(item)

    async def update_menu_item(
        self,
        organization_id: str,
        item_id: str,
        data: dict,
    ) -> dict:
        item = await db.menuitem.find_unique(where={"id": item_id})
        if not item or str(item.organization_id) != organization_id:
            raise HTTPException(status_code=404, detail="Menu item not found")
        # Allow status change (e.g. archived → active) but block other edits on archived items
        if item.status == "archived" and not (len(data) == 1 and "status" in data):
            raise HTTPException(status_code=400, detail="Cannot update an archived item. Restore it first.")

        update_data = {k: v for k, v in data.items() if v is not None}
        updated = await db.menuitem.update(
            where={"id": item_id},
            data=update_data,
        )
        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(
            CacheKeys.menu(organization_id, str(item.brand_id) if item.brand_id else None),
            CacheKeys.menu(organization_id, None),
        )
        return self._item_out(updated)

    # -----------------------------------------------------------------------
    # Recipe management
    # -----------------------------------------------------------------------

    async def get_recipe(self, organization_id: str, item_id: str) -> list:
        from app.cache.ops import cache_get, cache_set
        from app.cache.keys import CacheKeys
        _recipe_cache_key = CacheKeys.recipe(organization_id, item_id)
        _cached = await cache_get(_recipe_cache_key, resource="recipe")
        if _cached is not None:
            return _cached

        item = await db.menuitem.find_unique(where={"id": item_id})
        if not item or str(item.organization_id) != organization_id:
            raise HTTPException(status_code=404, detail="Menu item not found")
        ingredients = await db.menuitemingredient.find_many(
            where={"menu_item_id": item_id},
            include={"contextual_product": True},
        )

        # Batch-load latest procurement unit cost for ingredients missing a stored cost
        product_ids = [ing.contextual_product_id for ing in ingredients if not ing.unit_cost]
        latest_cost_map: dict[str, float] = {}
        if product_ids:
            expenses = await db.expense.find_many(
                where={
                    "contextual_product_id": {"in": product_ids},
                    "expense_type": "INGREDIENT",
                    "quantity": {"gt": 0},
                },
                order={"occurred_at": "desc"},
            )
            for exp in expenses:
                pid = str(exp.contextual_product_id)
                if pid not in latest_cost_map and exp.quantity:
                    latest_cost_map[pid] = round(exp.amount / exp.quantity, 4)

        _recipe_result = [
            {
                "id": ing.id,
                "contextual_product_id": ing.contextual_product_id,
                "product_name": ing.contextual_product.name if ing.contextual_product else None,
                "quantity_per_unit": ing.quantity_per_unit,
                "unit": ing.unit,
                "unit_cost": ing.unit_cost or latest_cost_map.get(str(ing.contextual_product_id)),
                "base_unit": ing.contextual_product.base_unit if ing.contextual_product else None,
            }
            for ing in ingredients
        ]
        await cache_set(_recipe_cache_key, _recipe_result, ttl=86400)
        return _recipe_result

    async def set_recipe(self, organization_id: str, item_id: str, ingredients: list) -> list:
        item = await db.menuitem.find_unique(where={"id": item_id})
        if not item or str(item.organization_id) != organization_id:
            raise HTTPException(status_code=404, detail="Menu item not found")

        for ing in ingredients:
            product = await db.contextualproduct.find_unique(
                where={"id": ing["contextual_product_id"]}
            )
            if not product or str(product.organization_id) != organization_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Ingredient not found: {ing['contextual_product_id']}",
                )

        await db.menuitemingredient.delete_many(where={"menu_item_id": item_id})
        if ingredients:
            await db.menuitemingredient.create_many(data=[
                {
                    "menu_item_id": item_id,
                    "contextual_product_id": ing["contextual_product_id"],
                    "quantity_per_unit": ing["quantity_per_unit"],
                    "unit": ing.get("unit"),
                    "unit_cost": ing.get("unit_cost"),
                }
                for ing in ingredients
            ])

        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(CacheKeys.recipe(organization_id, item_id))
        return await self.get_recipe(organization_id, item_id)

    async def archive_menu_item(
        self,
        organization_id: str,
        item_id: str,
    ) -> dict:
        item = await db.menuitem.find_unique(where={"id": item_id})
        if not item or str(item.organization_id) != organization_id:
            raise HTTPException(status_code=404, detail="Menu item not found")
        if item.status == "archived":
            return {"status": "archived"}

        await db.menuitem.update(
            where={"id": item_id},
            data={"status": "archived"},
        )
        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(
            CacheKeys.menu(organization_id, str(item.brand_id) if item.brand_id else None),
            CacheKeys.menu(organization_id, None),
        )
        return {"status": "archived"}

    # -----------------------------------------------------------------------
    # Stats — today
    # -----------------------------------------------------------------------

    async def get_today_stats(
        self,
        organization_id: str,
        brand_id: Optional[str],
    ) -> dict:
        from app.cache.ops import cache_get, cache_set
        from app.cache.keys import CacheKeys
        _cache_key = CacheKeys.sales_today_stats(organization_id, brand_id)
        _cached = await cache_get(_cache_key, resource="sales_today_stats")
        if _cached is not None:
            return _cached

        today = date.today()
        orders = await db.saleorder.find_many(
            where={
                "organization_id": organization_id,
                "business_date": self._dt(today),
                "status": "COMPLETED",
                **self._brand_where(brand_id),
            }
        )

        total_revenue = sum(o.total_revenue for o in orders)
        total_cogs = sum(o.total_cogs for o in orders)
        gross_profit = sum(o.gross_profit for o in orders)

        menu_items = await db.menuitem.find_many(
            where={
                "organization_id": organization_id,
                "status": "active",
                **self._brand_where(brand_id),
            }
        )
        categories_count = len({i.category for i in menu_items})

        # Channel breakdown
        channel_map: dict = {}
        for o in orders:
            ch = (str(o.channel) if o.channel else "DINE_IN").upper()
            if ch not in channel_map:
                channel_map[ch] = {"revenue": 0.0, "count": 0}
            channel_map[ch]["revenue"] += o.total_revenue
            channel_map[ch]["count"] += 1

        def ch_pct(ch_key: str) -> float:
            rev = channel_map.get(ch_key, {}).get("revenue", 0)
            return round(rev / total_revenue * 100, 1) if total_revenue > 0 else 0.0

        # Compute dishes_sold from order items
        dishes_sold = 0
        if orders:
            order_ids = [o.id for o in orders]
            all_items = await db.saleorderitem.find_many(
                where={"sale_order_id": {"in": order_ids}}
            )
            dishes_sold = sum(i.quantity for i in all_items)

        _result = {
            "today_revenue": round(total_revenue, 2),
            "today_cogs": round(total_cogs, 2),
            "today_gross_profit": round(gross_profit, 2),
            "categories_count": categories_count,
            "dishes_sold": dishes_sold,
            "channels": {
                "dine_in": {
                    "revenue": round(channel_map.get("DINE_IN", {}).get("revenue", 0), 2),
                    "count": channel_map.get("DINE_IN", {}).get("count", 0),
                    "pct": ch_pct("DINE_IN"),
                },
                "takeaway": {
                    "revenue": round(channel_map.get("TAKEAWAY", {}).get("revenue", 0), 2),
                    "count": channel_map.get("TAKEAWAY", {}).get("count", 0),
                    "pct": ch_pct("TAKEAWAY"),
                },
                "delivery": {
                    "revenue": round(channel_map.get("DELIVERY", {}).get("revenue", 0), 2),
                    "count": channel_map.get("DELIVERY", {}).get("count", 0),
                    "pct": ch_pct("DELIVERY"),
                },
            },
        }
        await cache_set(_cache_key, _result, ttl=300)
        return _result

    async def get_today_orders(
        self,
        organization_id: str,
        brand_id: Optional[str],
    ) -> list:
        """Fetch all today's completed orders with their line items expanded.

        Uses 3 queries total (orders → all items → all menu items) instead of
        the previous N+1 pattern (1 + 2 queries per order).
        """
        today = date.today()
        orders = await db.saleorder.find_many(
            where={
                "organization_id": organization_id,
                "business_date": self._dt(today),
                "status": "COMPLETED",
                **self._brand_where(brand_id),
            },
            order={"occurred_at": "desc"},
        )
        if not orders:
            return []

        # Batch-load all order items in one query
        order_ids = [o.id for o in orders]
        all_items = await db.saleorderitem.find_many(
            where={"sale_order_id": {"in": order_ids}}
        )

        # Batch-load all referenced menu items in one query
        menu_ids = list({i.menu_item_id for i in all_items})
        menu_map = {}
        if menu_ids:
            menu_items = await db.menuitem.find_many(where={"id": {"in": menu_ids}})
            menu_map = {m.id: m for m in menu_items}

        # Map order items by sale_order_id for fast lookup
        items_by_order: dict[str, list] = {}
        for item in all_items:
            items_by_order.setdefault(item.sale_order_id, []).append(item)

        # Build channel map keyed by order id
        channel_by_order = {o.id: (str(o.channel) if o.channel else "DINE_IN") for o in orders}

        result = []
        for order in orders:
            channel = channel_by_order[order.id]
            for item in items_by_order.get(order.id, []):
                menu = menu_map.get(item.menu_item_id)
                unit_price = item.unit_price or (menu.price if menu else 0)
                cost = item.unit_cogs or 0
                margin = round((unit_price - cost) / unit_price * 100, 1) if unit_price > 0 else 0.0
                result.append({
                    "order_id":        order.id,
                    "item_id":         item.id,
                    "menu_item_id":    item.menu_item_id,
                    "menu_item_name":  menu.name if menu else "Unknown",
                    "quantity":        item.quantity,
                    "unit_price":      unit_price,
                    "line_total":      item.line_total,
                    "channel":         channel,
                    "margin_pct":      margin,
                })
        return result

    async def update_order_item(
        self,
        organization_id: str,
        order_id: str,
        item_id: str,
        quantity: int,
        unit_price: float,
    ) -> dict:
        """Update quantity and unit_price of a sale order item, then recalculate order totals."""
        order = await db.saleorder.find_unique(where={"id": order_id})
        if not order or str(order.organization_id) != organization_id:
            raise HTTPException(status_code=404, detail="Sale order not found")
        item = await db.saleorderitem.find_unique(where={"id": item_id})
        if not item or str(item.sale_order_id) != order_id:
            raise HTTPException(status_code=404, detail="Order item not found")

        old = {
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "line_total": item.line_total,
        }
        new_line_total = round(quantity * unit_price, 2)
        await db.saleorderitem.update(
            where={"id": item_id},
            data={"quantity": quantity, "unit_price": unit_price, "line_total": new_line_total},
        )

        # Recalculate order totals from all items
        all_items = await db.saleorderitem.find_many(where={"sale_order_id": order_id})
        new_total = round(sum(i.line_total for i in all_items), 2)
        new_cogs = order.total_cogs  # keep COGS unchanged
        await db.saleorder.update(
            where={"id": order_id},
            data={"total_revenue": new_total, "gross_profit": round(new_total - new_cogs, 2)},
        )

        new = {"quantity": quantity, "unit_price": unit_price, "line_total": new_line_total}
        return {"old": old, "new": new}

    # -----------------------------------------------------------------------
    # Stats — week (rolling 7 days vs previous 7 days)
    # -----------------------------------------------------------------------

    async def get_week_stats(
        self,
        organization_id: str,
        brand_id: Optional[str],
    ) -> dict:
        today = date.today()
        week_start = today - timedelta(days=6)
        prev_start = week_start - timedelta(days=7)
        prev_end = week_start - timedelta(days=1)

        base_where = {
            "organization_id": organization_id,
            "status": "COMPLETED",
            **self._brand_where(brand_id),
        }

        current_orders = await db.saleorder.find_many(
            where={**base_where, "business_date": {"gte": self._dt(week_start), "lte": self._dt(today)}}
        )
        prev_orders = await db.saleorder.find_many(
            where={**base_where, "business_date": {"gte": self._dt(prev_start), "lte": self._dt(prev_end)}}
        )

        week_revenue = sum(o.total_revenue for o in current_orders)
        prev_revenue = sum(o.total_revenue for o in prev_orders)

        week_revenue_pct: Optional[float] = None
        if prev_revenue > 0:
            week_revenue_pct = round(((week_revenue - prev_revenue) / prev_revenue) * 100, 1)

        days_with_sales = len({
            o.business_date if isinstance(o.business_date, date) else o.business_date.date()
            for o in current_orders
        })
        avg_daily_revenue = round(week_revenue / days_with_sales, 2) if days_with_sales else 0

        # Best day by revenue
        day_revenue: dict = {}
        for o in current_orders:
            d = o.business_date if isinstance(o.business_date, date) else o.business_date.date()
            day_revenue[d] = day_revenue.get(d, 0) + o.total_revenue
        best_day: Optional[str] = None
        if day_revenue:
            best_day = max(day_revenue, key=day_revenue.get).strftime("%A")

        # Gross margin %
        avg_gross_margin: float = 0
        if week_revenue > 0:
            total_profit = sum(o.gross_profit for o in current_orders)
            avg_gross_margin = round((total_profit / week_revenue) * 100, 1)

        avg_gross_margin_pts: Optional[float] = None
        if prev_revenue > 0:
            prev_profit = sum(o.gross_profit for o in prev_orders)
            prev_margin = (prev_profit / prev_revenue) * 100
            avg_gross_margin_pts = round(avg_gross_margin - prev_margin, 1)

        return {
            "week_revenue": round(week_revenue, 2),
            "week_revenue_pct": week_revenue_pct,
            "avg_daily_revenue": avg_daily_revenue,
            "best_day": best_day,
            "avg_gross_margin": avg_gross_margin,
            "avg_gross_margin_pts": avg_gross_margin_pts,
        }

    # -----------------------------------------------------------------------
    # Stats — menu
    # -----------------------------------------------------------------------

    async def get_menu_stats(
        self,
        organization_id: str,
        brand_id: Optional[str],
    ) -> dict:
        items = await db.menuitem.find_many(
            where={
                "organization_id": organization_id,
                "status": "active",
                **self._brand_where(brand_id),
            }
        )

        total_dishes = len(items)

        prices = [i.price for i in items if i.price and i.price > 0]
        avg_selling_price = round(sum(prices) / len(prices), 2) if prices else 0

        margins = []
        for i in items:
            if i.price and i.price > 0:
                cost = i.cost or 0
                margins.append(((i.price - cost) / i.price) * 100)
        avg_gross_margin = round(sum(margins) / len(margins), 1) if margins else 0

        # Top selling dish by quantity sold over the last 30 days
        top_selling_dish: Optional[str] = None
        try:
            thirty_days_ago = date.today() - timedelta(days=30)
            recent_orders = await db.saleorder.find_many(
                where={
                    "organization_id": organization_id,
                    "status": "COMPLETED",
                    "business_date": {"gte": self._dt(thirty_days_ago)},
                    **self._brand_where(brand_id),
                }
            )
            if recent_orders:
                order_ids = [o.id for o in recent_orders]
                order_items = await db.saleorderitem.find_many(
                    where={"sale_order_id": {"in": order_ids}}
                )
                if order_items:
                    item_qty: dict[str, int] = {}
                    for oi in order_items:
                        item_qty[oi.menu_item_id] = item_qty.get(oi.menu_item_id, 0) + oi.quantity
                    top_id = max(item_qty, key=item_qty.get)
                    top_item = await db.menuitem.find_unique(where={"id": top_id})
                    if top_item:
                        top_selling_dish = top_item.name
        except Exception as e:
            logger.warning(f"[sales] top_selling_dish lookup failed: {e}")

        return {
            "total_dishes": total_dishes,
            "top_selling_dish": top_selling_dish,
            "avg_selling_price": avg_selling_price,
            "avg_gross_margin": avg_gross_margin,
        }

    # -----------------------------------------------------------------------
    # Log a sale
    # -----------------------------------------------------------------------

    async def log_sale(
        self,
        organization_id: str,
        brand_id: Optional[str],
        user_id: str,
        channel: str,
        items: List[dict],
    ) -> dict:
        logger = get_logger("sales_service.log_sale")

        # Validate items have valid menu_item_ids
        for idx, item in enumerate(items):
            menu_item_id = item.get("menu_item_id", "").strip()
            if not menu_item_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Item {idx + 1} has invalid or missing menu_item_id",
                )

        logger.info(
            "log_sale called",
            extra={
                "extra_context": {
                    "organization_id": organization_id,
                    "brand_id": brand_id,
                    "channel": channel,
                    "item_count": len(items),
                    "items": items,
                }
            },
        )

        item_ids = [i["menu_item_id"] for i in items]
        menu_items = await db.menuitem.find_many(
            where={
                "id": {"in": item_ids},
                "organization_id": organization_id,
                "status": "active",
            }
        )
        menu_map = {m.id: m for m in menu_items}

        logger.info(
            "Menu items lookup",
            extra={
                "extra_context": {
                    "requested_ids": item_ids,
                    "found_count": len(menu_items),
                    "found_ids": [m.id for m in menu_items],
                }
            },
        )

        missing = [mid for mid in item_ids if mid not in menu_map]
        if missing:
            error_msg = f"Menu item(s) not found or inactive: {', '.join(missing)}"
            logger.warning(
                "Missing menu items",
                extra={"extra_context": {"missing_ids": missing}},
            )
            raise HTTPException(
                status_code=400,
                detail=error_msg,
            )

        order_items: List[dict] = []
        total_revenue = 0.0
        total_cogs = 0.0

        for i in items:
            mi = menu_map[i["menu_item_id"]]
            qty = i["quantity"]
            unit_price = mi.price or 0
            unit_cogs = mi.cost or 0
            line_total = unit_price * qty

            total_revenue += line_total
            total_cogs += unit_cogs * qty
            order_items.append({
                "menu_item_id": mi.id,
                "quantity": qty,
                "unit_price": unit_price,
                "unit_cogs": unit_cogs,
                "line_total": line_total,
            })

        gross_profit = total_revenue - total_cogs

        order = await db.saleorder.create(
            data={
                "organization_id": organization_id,
                "brand_id": brand_id,
                "channel": channel,
                "status": "COMPLETED",
                "total_revenue": round(total_revenue, 2),
                "total_cogs": round(total_cogs, 2),
                "gross_profit": round(gross_profit, 2),
                "logged_by": user_id,
                "business_date": self._dt(date.today()),
            }
        )

        for oi in order_items:
            await db.saleorderitem.create(
                data={"sale_order_id": order.id, **oi}
            )

        # Auto-deplete inventory from recipes (non-fatal — sale succeeds regardless)
        try:
            for i in items:
                ingredients = await db.menuitemingredient.find_many(
                    where={"menu_item_id": i["menu_item_id"]},
                    include={"contextual_product": True},
                )
                for ing in ingredients:
                    raw_qty = ing.quantity_per_unit * i["quantity"]
                    base_unit = ing.contextual_product.base_unit if ing.contextual_product else None
                    # Convert recipe unit → stock base_unit before decrementing
                    depletion_qty = _convert_unit(raw_qty, ing.unit, base_unit)
                    stock_unit = base_unit or ing.unit
                    await db.inventoryevent.create(data={
                        "contextual_product_id": ing.contextual_product_id,
                        "organization_id": organization_id,
                        "event_type": "USED",
                        "quantity": -depletion_qty,
                        "unit": stock_unit,
                        "actor_type": "sale",
                        "reference_id": order.id,
                        "consumption_reason": "CUSTOMER_SERVICE",
                    })
                    await db.contextualproduct.update(
                        where={"id": ing.contextual_product_id},
                        data={"current_stock": {"decrement": depletion_qty}},
                    )
        except Exception as e:
            logger.warning(f"[sales] inventory depletion failed for order {order.id}: {e}")

        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(
            CacheKeys.sales_today_stats(organization_id, brand_id),
            CacheKeys.sales_today_stats(organization_id, None),
            CacheKeys.inventory(organization_id),
            CacheKeys.inventory_stats(organization_id),
            CacheKeys.restaurant_stats(organization_id),
        )

        return {
            "id": order.id,
            "channel": order.channel,
            "status": order.status,
            "total_revenue": order.total_revenue,
            "total_cogs": order.total_cogs,
            "gross_profit": order.gross_profit,
            "business_date": order.business_date.isoformat() if order.business_date else None,
            "occurred_at": order.occurred_at.isoformat() if order.occurred_at else None,
            "items_count": len(order_items),
        }

    # -----------------------------------------------------------------------
    # History
    # -----------------------------------------------------------------------

    async def get_history(
        self,
        organization_id: str,
        brand_id: Optional[str],
        filter_date: Optional[date],
        start_date: Optional[date],
        end_date: Optional[date],
        channel: Optional[str],
        page: int,
        limit: int,
    ) -> dict:
        where: dict = {
            "organization_id": organization_id,
            **self._brand_where(brand_id),
        }
        if filter_date:
            where["business_date"] = self._dt(filter_date)
        elif start_date and end_date:
            where["business_date"] = {
                "gte": self._dt(start_date),
                "lte": self._dt(end_date),
            }
        if channel:
            where["channel"] = channel

        total = await db.saleorder.count(where=where)

        rev_rows = await db.saleorder.find_many(where=where)
        period_revenue = sum((r.total_revenue or 0.0) for r in rev_rows)

        orders = await db.saleorder.find_many(
            where=where,
            order={"occurred_at": "desc"},
            skip=(page - 1) * limit,
            take=limit,
        )

        # Batch-fetch item counts
        order_ids = [o.id for o in orders]
        item_qty_by_order: dict[str, int] = {}
        if order_ids:
            ois = await db.saleorderitem.find_many(
                where={"sale_order_id": {"in": order_ids}}
            )
            for oi in ois:
                item_qty_by_order[oi.sale_order_id] = (
                    item_qty_by_order.get(oi.sale_order_id, 0) + oi.quantity
                )

        return {
            "total": total,
            "period_revenue": period_revenue,
            "page": page,
            "limit": limit,
            "pages": max(1, (total + limit - 1) // limit),
            "orders": [
                {
                    "id": o.id,
                    "channel": o.channel,
                    "status": o.status,
                    "total_revenue": o.total_revenue,
                    "total_cogs": o.total_cogs,
                    "gross_profit": o.gross_profit,
                    "items_count": item_qty_by_order.get(o.id, 0),
                    "occurred_at": o.occurred_at.isoformat() if o.occurred_at else None,
                    "business_date": o.business_date.isoformat() if o.business_date else None,
                }
                for o in orders
            ],
        }

    async def get_order_detail(
        self,
        organization_id: str,
        order_id: str,
    ) -> dict:
        order = await db.saleorder.find_unique(where={"id": order_id})
        if not order or str(order.organization_id) != organization_id:
            raise HTTPException(status_code=404, detail="Sale order not found")

        order_items = await db.saleorderitem.find_many(
            where={"sale_order_id": order_id}
        )

        # Batch-fetch menu item names
        menu_ids = list({oi.menu_item_id for oi in order_items})
        menu_items = await db.menuitem.find_many(where={"id": {"in": menu_ids}})
        name_map = {m.id: m.name for m in menu_items}

        return {
            "id": order.id,
            "channel": order.channel,
            "status": order.status,
            "total_revenue": order.total_revenue,
            "total_cogs": order.total_cogs,
            "gross_profit": order.gross_profit,
            "occurred_at": order.occurred_at.isoformat() if order.occurred_at else None,
            "business_date": order.business_date.isoformat() if order.business_date else None,
            "items": [
                {
                    "id": oi.id,
                    "menu_item_id": oi.menu_item_id,
                    "menu_item_name": name_map.get(oi.menu_item_id, "Unknown"),
                    "quantity": oi.quantity,
                    "unit_price": oi.unit_price,
                    "unit_cogs": oi.unit_cogs,
                    "line_total": oi.line_total,
                }
                for oi in order_items
            ],
        }


    # -----------------------------------------------------------------------
    # Menu categories (org-scoped)
    # -----------------------------------------------------------------------

    async def get_categories(self, organization_id: str) -> list:
        """Return org's categories sorted alphabetically.
        On first call (empty table) auto-seeds from existing MenuItem.category values."""
        from app.cache.ops import cache_get, cache_set
        from app.cache.keys import CacheKeys
        key = CacheKeys.menu_categories(organization_id)
        cached = await cache_get(key, resource="menu_categories")
        if cached is not None:
            return cached

        cats = await db.menucategory.find_many(
            where={"organization_id": organization_id},
            order={"name": "asc"},
        )

        if not cats:
            # Auto-seed from distinct MenuItem.category values already in the org
            items = await db.menuitem.find_many(
                where={"organization_id": organization_id, "NOT": {"status": "archived"}},
            )
            seen: dict[str, bool] = {}
            for item in items:
                name = (item.category or "").strip()
                if name and name.lower() not in seen:
                    seen[name.lower()] = True
                    try:
                        await db.menucategory.create(
                            data={"organization_id": organization_id, "name": name}
                        )
                    except Exception:
                        pass  # unique constraint race — safe to ignore
            cats = await db.menucategory.find_many(
                where={"organization_id": organization_id},
                order={"name": "asc"},
            )

        result = [{"id": c.id, "name": c.name} for c in cats]
        await cache_set(key, result, ttl=3600)
        return result

    async def create_category(self, organization_id: str, name: str) -> dict:
        """Create a category (idempotent — returns existing if name already in use)."""
        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        name = name.strip()
        existing = await db.menucategory.find_first(
            where={"organization_id": organization_id, "name": {"equals": name, "mode": "insensitive"}}
        )
        if existing:
            return {"id": existing.id, "name": existing.name}
        cat = await db.menucategory.create(
            data={"organization_id": organization_id, "name": name}
        )
        await cache_delete(CacheKeys.menu_categories(organization_id))
        return {"id": cat.id, "name": cat.name}

    async def delete_category(self, organization_id: str, category_id: str) -> dict:
        """Delete a category. Blocked if any non-archived dishes use the category name."""
        cat = await db.menucategory.find_first(
            where={"id": category_id, "organization_id": organization_id}
        )
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")

        in_use = await db.menuitem.count(
            where={
                "organization_id": organization_id,
                "category": cat.name,
                "NOT": {"status": "archived"},
            }
        )
        if in_use > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete '{cat.name}' — {in_use} dish(es) still use this category. "
                       f"Reassign or archive them first.",
            )

        await db.menucategory.delete(where={"id": category_id})

        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(CacheKeys.menu_categories(organization_id))
        return {"success": True}


sales_service = SalesService()
