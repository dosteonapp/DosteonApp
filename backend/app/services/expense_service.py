from datetime import date, datetime, timedelta, time as time_, timezone
from typing import Optional

from fastapi import HTTPException

from app.core.logging import get_logger
from app.db.prisma import db
from app.schemas.expense import ExpenseCreate

logger = get_logger("expense")


class ExpenseService:

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _to_dt(self, d: date) -> datetime:
        """Convert a date to a midnight datetime for Prisma date comparisons."""
        return datetime.combine(d, time_.min)

    def _brand_where(self, brand_id: Optional[str]) -> dict:
        """Return a brand filter clause.

        When brand_id is set: match expenses for that brand only.
        When None: return all expenses for the org (no brand filter).
        """
        if brand_id:
            return {"brand_id": brand_id}
        return {}

    def _serialize(self, expense) -> dict:
        return {
            "id": expense.id,
            "organization_id": expense.organization_id,
            "brand_id": expense.brand_id,
            "item_name": expense.item_name,
            "expense_type": expense.expense_type,
            "source": expense.source,
            "amount": expense.amount,
            "quantity": expense.quantity,
            "unit": expense.unit,
            "contextual_product_id": expense.contextual_product_id,
            "business_date": expense.business_date.isoformat() if expense.business_date else None,
            "occurred_at": expense.occurred_at.isoformat() if expense.occurred_at else None,
            "logged_by": expense.logged_by,
            "idempotency_key": expense.idempotency_key,
            "created_at": expense.created_at.isoformat() if expense.created_at else None,
        }

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------

    async def create_expense(
        self,
        org_id: str,
        brand_id: Optional[str],
        user_id: str,
        data: ExpenseCreate,
    ) -> dict:
        now = datetime.now(timezone.utc)
        today = date.today()
        inventory_updated = False
        note = None
        linked_product_id = None

        # Idempotency pre-check (outside tx to avoid holding a lock)
        if data.idempotency_key:
            existing = await db.expense.find_first(
                where={
                    "organization_id": org_id,
                    "idempotency_key": data.idempotency_key,
                }
            )
            if existing:
                raise HTTPException(
                    status_code=409,
                    detail="Duplicate request: expense with this idempotency_key already exists.",
                )

        try:
            async with db.tx() as tx:
                # 1. Create the expense record
                expense = await tx.expense.create(
                    data={
                        "organization_id": org_id,
                        "brand_id": brand_id,
                        "item_name": data.item_name,
                        "expense_type": data.expense_type.value,
                        "source": data.source,
                        "amount": data.amount,
                        "quantity": data.quantity,
                        "unit": data.unit,
                        "business_date": self._to_dt(today),
                        "occurred_at": now,
                        "logged_by": user_id,
                        "idempotency_key": data.idempotency_key,
                    }
                )

                # 2. If INGREDIENT + quantity provided → attempt inventory update
                if data.expense_type.value == "INGREDIENT" and data.quantity:
                    product = await tx.contextualproduct.find_first(
                        where={
                            "organization_id": org_id,
                            "name": {
                                "contains": data.item_name,
                                "mode": "insensitive",
                            },
                            "is_active": True,
                        }
                    )

                    if product:
                        unit_to_use = data.unit or product.preferred_unit or "units"

                        # Create RECEIVED inventory event
                        await tx.inventoryevent.create(
                            data={
                                "contextual_product_id": product.id,
                                "organization_id": org_id,
                                "event_type": "RECEIVED",
                                "quantity": data.quantity,
                                "unit": unit_to_use,
                                "actor_type": "USER",
                                "actor_id": user_id,
                                "reference_id": expense.id,
                                "occurred_at": now,
                            }
                        )

                        # Increment the stock cache
                        await tx.contextualproduct.update(
                            where={"id": product.id},
                            data={"current_stock": {"increment": data.quantity}},
                        )

                        # Back-link expense → product
                        await tx.expense.update(
                            where={"id": expense.id},
                            data={"contextual_product_id": product.id},
                        )

                        inventory_updated = True
                        linked_product_id = product.id
                    else:
                        note = (
                            f"'{data.item_name}' was not found in your inventory catalog. "
                            "Stock was not updated. Add the item to your inventory to enable "
                            "automatic stock tracking."
                        )
                        logger.info(
                            f"[expense] INGREDIENT expense '{data.item_name}' has no matching "
                            f"ContextualProduct in org {org_id} — inventory not updated."
                        )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[expense] create_expense transaction failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to log expense.")

        result = self._serialize(expense)
        result["inventory_updated"] = inventory_updated
        result["note"] = note
        if linked_product_id:
            result["contextual_product_id"] = linked_product_id

        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        await cache_delete(
            CacheKeys.expense_today_stats(org_id, brand_id),
            CacheKeys.expense_today_stats(org_id, None),
            CacheKeys.inventory_stats(org_id),
            CacheKeys.products(org_id),
        )
        return result

    # ------------------------------------------------------------------
    # Stats — today
    # ------------------------------------------------------------------

    async def get_today_stats(self, org_id: str, brand_id: Optional[str]) -> dict:
        from app.cache.ops import cache_get, cache_set
        from app.cache.keys import CacheKeys
        _cache_key = CacheKeys.expense_today_stats(org_id, brand_id)
        _cached = await cache_get(_cache_key, resource="expense_today_stats")
        if _cached is not None:
            return _cached

        today = date.today()
        expenses = await db.expense.find_many(
            where={
                "organization_id": org_id,
                "business_date": self._to_dt(today),
                **self._brand_where(brand_id),
            }
        )
        total = sum(e.amount for e in expenses)
        cogs = sum(e.amount for e in expenses if e.expense_type == "INGREDIENT")
        overhead = sum(e.amount for e in expenses if e.expense_type == "OVERHEAD")
        _result = {
            "total_expenses": round(total, 2),
            "cogs": round(cogs, 2),
            "overhead": round(overhead, 2),
            "expense_count": len(expenses),
        }
        await cache_set(_cache_key, _result, ttl=300)
        return _result

    # ------------------------------------------------------------------
    # Today — list all today's expenses
    # ------------------------------------------------------------------

    async def get_today(self, org_id: str, brand_id: Optional[str]) -> list:
        today = date.today()
        expenses = await db.expense.find_many(
            where={
                "organization_id": org_id,
                "business_date": self._to_dt(today),
                **self._brand_where(brand_id),
            },
            order={"occurred_at": "desc"},
        )
        return [
            {
                "id": e.id,
                "item_name": e.item_name,
                "expense_type": e.expense_type,
                "source": e.source,
                "amount": e.amount,
                "quantity": str(e.quantity) if e.quantity is not None else None,
                "unit": e.unit,
                "category": None,  # Expense model has no category field
                "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
            }
            for e in expenses
        ]

    async def update_expense(self, org_id: str, expense_id: str, data: dict) -> dict:
        expense = await db.expense.find_unique(where={"id": expense_id})
        if not expense or str(expense.organization_id) != org_id:
            raise HTTPException(status_code=404, detail="Expense not found")
        old = {
            "item_name": expense.item_name,
            "amount": expense.amount,
            "expense_type": str(expense.expense_type),
            "category": None,
        }
        # Only update allowed fields that exist on the Expense model
        allowed_fields = {"item_name", "amount", "quantity", "unit", "expense_type"}
        update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
        if "quantity" in update_data:
            # quantity is Float? on the DB — convert string to float if needed
            try:
                update_data["quantity"] = float(update_data["quantity"])
            except (TypeError, ValueError):
                update_data.pop("quantity", None)
        if update_data:
            await db.expense.update(where={"id": expense_id}, data=update_data)
        new = {**old, **{k: data.get(k, old.get(k)) for k in ("item_name", "amount", "expense_type")}, "category": None}
        from app.cache.ops import cache_delete
        from app.cache.keys import CacheKeys
        _exp_brand_id = str(expense.brand_id) if expense.brand_id else None
        await cache_delete(
            CacheKeys.expense_today_stats(org_id, _exp_brand_id),
            CacheKeys.expense_today_stats(org_id, None),
        )
        return {"old": old, "new": new}

    # ------------------------------------------------------------------
    # Stats — rolling 7-day week
    # ------------------------------------------------------------------

    async def get_week_stats(self, org_id: str, brand_id: Optional[str]) -> dict:
        today = date.today()
        week_start = today - timedelta(days=6)
        prev_start = week_start - timedelta(days=7)
        prev_end = week_start - timedelta(days=1)

        base_where = {
            "organization_id": org_id,
            **self._brand_where(brand_id),
        }

        current_expenses = await db.expense.find_many(
            where={
                **base_where,
                "business_date": {
                    "gte": self._to_dt(week_start),
                    "lte": self._to_dt(today),
                },
            }
        )
        prev_expenses = await db.expense.find_many(
            where={
                **base_where,
                "business_date": {
                    "gte": self._to_dt(prev_start),
                    "lte": self._to_dt(prev_end),
                },
            }
        )

        current_total = sum(e.amount for e in current_expenses)
        prev_total = sum(e.amount for e in prev_expenses)
        current_cogs = sum(e.amount for e in current_expenses if e.expense_type == "INGREDIENT")
        current_overhead = sum(e.amount for e in current_expenses if e.expense_type == "OVERHEAD")

        vs_last_week_pct: Optional[float] = None
        if prev_total > 0:
            vs_last_week_pct = round(((current_total - prev_total) / prev_total) * 100, 1)

        # Build daily breakdown
        day_map: dict = {}
        for e in current_expenses:
            d = e.business_date
            if hasattr(d, "date"):
                d = d.date()
            key = d.isoformat()
            if key not in day_map:
                day_map[key] = {"date": key, "total": 0.0, "cogs": 0.0, "overhead": 0.0}
            day_map[key]["total"] = round(day_map[key]["total"] + e.amount, 2)
            if e.expense_type == "INGREDIENT":
                day_map[key]["cogs"] = round(day_map[key]["cogs"] + e.amount, 2)
            else:
                day_map[key]["overhead"] = round(day_map[key]["overhead"] + e.amount, 2)

        daily_breakdown = sorted(day_map.values(), key=lambda x: x["date"])

        return {
            "total": round(current_total, 2),
            "cogs": round(current_cogs, 2),
            "overhead": round(current_overhead, 2),
            "vs_last_week_pct": vs_last_week_pct,
            "daily_breakdown": daily_breakdown,
        }

    # ------------------------------------------------------------------
    # History — paginated
    # ------------------------------------------------------------------

    async def get_history(
        self,
        org_id: str,
        brand_id: Optional[str],
        page: int = 1,
        limit: int = 20,
        days: int = 7,
    ) -> dict:
        cutoff = date.today() - timedelta(days=days - 1)
        where = {
            "organization_id": org_id,
            "business_date": {"gte": self._to_dt(cutoff)},
            **self._brand_where(brand_id),
        }

        total = await db.expense.count(where=where)
        expenses = await db.expense.find_many(
            where=where,
            order={"occurred_at": "desc"},
            skip=(page - 1) * limit,
            take=limit,
        )

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": max(1, (total + limit - 1) // limit),
            "items": [
                {
                    "id": e.id,
                    "item_name": e.item_name,
                    "expense_type": e.expense_type,
                    "source": e.source,
                    "amount": e.amount,
                    "quantity": e.quantity,
                    "unit": e.unit,
                    "brand_id": e.brand_id,
                    "business_date": e.business_date.isoformat() if e.business_date else None,
                    "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
                }
                for e in expenses
            ],
        }


expense_service = ExpenseService()
