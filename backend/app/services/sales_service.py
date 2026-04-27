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
        """Return active menu items grouped by category."""
        where: dict = {
            "organization_id": organization_id,
            "status": "active",
            **self._brand_where(brand_id),
        }
        if search:
            where["name"] = {"contains": search, "mode": "insensitive"}

        items = await db.menuitem.find_many(where=where, order={"name": "asc"})

        groups: dict[str, list] = {}
        for item in items:
            cat = item.category or "Uncategorized"
            groups.setdefault(cat, []).append(self._item_out(item))

        return {
            "categories": [
                {"category": cat, "items": items_list}
                for cat, items_list in sorted(groups.items())
            ]
        }

    async def create_menu_item(
        self,
        organization_id: str,
        brand_id: Optional[str],
        data: dict,
    ) -> dict:
        item = await db.menuitem.create(
            data={
                "organization_id": organization_id,
                "brand_id": brand_id,
                "name": data["name"],
                "price": data.get("price", 0),
                "cost": data.get("cost", 0),
                "category": data.get("category", "Signature"),
                "source": "manual",
            }
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
        return self._item_out(updated)

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
        return {"status": "archived"}

    # -----------------------------------------------------------------------
    # Stats — today
    # -----------------------------------------------------------------------

    async def get_today_stats(
        self,
        organization_id: str,
        brand_id: Optional[str],
    ) -> dict:
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

        return {
            "today_revenue": round(total_revenue, 2),
            "today_cogs": round(total_cogs, 2),
            "today_gross_profit": round(gross_profit, 2),
            "categories_count": categories_count,
        }

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
        item_ids = [i["menu_item_id"] for i in items]
        menu_items = await db.menuitem.find_many(
            where={
                "id": {"in": item_ids},
                "organization_id": organization_id,
                "status": "active",
            }
        )
        menu_map = {m.id: m for m in menu_items}

        missing = [mid for mid in item_ids if mid not in menu_map]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Menu item(s) not found or inactive: {', '.join(missing)}",
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

        # Sum revenue across ALL matching orders for the period total
        all_orders_rev = await db.saleorder.find_many(where=where)
        period_revenue = sum(o.total_revenue for o in all_orders_rev)

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


sales_service = SalesService()
