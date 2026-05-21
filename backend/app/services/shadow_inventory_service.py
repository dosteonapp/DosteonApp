"""
Shadow Inventory Service — NEW atomic transaction logic

This implements the CORRECT inventory mutation logic:
- All stock changes wrapped in transactions
- Event creation + stock update atomic
- No race conditions
- No partial failures

Runs in parallel with existing logic for validation.
Feature flag determines if results are used for production.
"""

import logging
from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status

from app.db.prisma import db
from app.core.observability import InventoryObservability
from app.middleware.correlation_id import get_correlation_id

logger = logging.getLogger("dosteon.shadow_inventory")


class ShadowInventoryService:
    """
    Shadow (new) inventory service with atomic transactions.

    All operations are wrapped in transactions to prevent:
    - Partial failures (event without stock update)
    - Race conditions (check-then-act)
    - Orphaned data
    """

    async def log_consumption_atomic(
        self,
        organization_id: str,
        brand_id: Optional[str],
        product_id: str,
        quantity: float,
        consumption_reason: str,
        actor_id: Optional[str] = None,
    ) -> dict:
        """
        Log consumption ATOMICALLY.

        Guarantees:
        - Event created AND stock decremented together
        - Transaction rolls back if either fails
        - No partial state possible
        """
        correlation_id = get_correlation_id()

        try:
            # Validate product exists and belongs to org
            product = await db.contextualproduct.find_unique(
                where={"id": product_id}
            )
            if not product or str(product.organization_id) != organization_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found"
                )

            # ATOMIC: Both writes inside transaction
            async with db.tx() as tx:
                # Step 1: Create event
                event = await tx.inventoryevent.create(
                    data={
                        "contextual_product_id": product_id,
                        "organization_id": organization_id,
                        "event_type": "USED",
                        "quantity": quantity,
                        "unit": product.base_unit or "units",
                        "actor_id": actor_id,
                        "actor_type": "USER",
                        "consumption_reason": consumption_reason,
                        "occurred_at": datetime.utcnow(),
                    }
                )

                # Step 2: Decrement stock (within same transaction)
                updated_product = await tx.contextualproduct.update(
                    where={"id": product_id},
                    data={"current_stock": {"decrement": quantity}},
                )

                # Log success
                InventoryObservability.log_stock_mutation(
                    correlation_id=correlation_id,
                    organization_id=organization_id,
                    product_id=product_id,
                    stock_before=product.current_stock,
                    stock_after=updated_product.current_stock,
                    mutation_type="USED",
                    quantity=quantity,
                    brand_id=brand_id,
                )

            return {
                "id": event.id,
                "status": "logged",
                "event_type": "USED",
                "stock_after": updated_product.current_stock,
                "atomic": True,  # ← Key indicator this is atomic
            }

        except HTTPException:
            raise
        except Exception as e:
            InventoryObservability.log_event_creation_failed(
                correlation_id=correlation_id,
                organization_id=organization_id,
                product_id=product_id,
                event_type="USED",
                error=str(e),
                brand_id=brand_id,
            )
            logger.error(f"[shadow] consumption failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to log consumption"
            )

    async def log_waste_atomic(
        self,
        organization_id: str,
        brand_id: Optional[str],
        product_id: str,
        quantity: float,
        waste_reason: str,
        actor_id: Optional[str] = None,
    ) -> dict:
        """
        Log waste ATOMICALLY.

        Same guarantees as log_consumption_atomic.
        """
        correlation_id = get_correlation_id()

        try:
            product = await db.contextualproduct.find_unique(
                where={"id": product_id}
            )
            if not product or str(product.organization_id) != organization_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found"
                )

            # ATOMIC: Both writes inside transaction
            async with db.tx() as tx:
                # Step 1: Create event
                event = await tx.inventoryevent.create(
                    data={
                        "contextual_product_id": product_id,
                        "organization_id": organization_id,
                        "event_type": "WASTED",
                        "quantity": quantity,
                        "unit": product.base_unit or "units",
                        "actor_id": actor_id,
                        "actor_type": "USER",
                        "waste_reason": waste_reason,
                        "occurred_at": datetime.utcnow(),
                    }
                )

                # Step 2: Decrement stock (within same transaction)
                updated_product = await tx.contextualproduct.update(
                    where={"id": product_id},
                    data={"current_stock": {"decrement": quantity}},
                )

                # Log success
                InventoryObservability.log_stock_mutation(
                    correlation_id=correlation_id,
                    organization_id=organization_id,
                    product_id=product_id,
                    stock_before=product.current_stock,
                    stock_after=updated_product.current_stock,
                    mutation_type="WASTED",
                    quantity=quantity,
                    brand_id=brand_id,
                )

            return {
                "id": event.id,
                "status": "logged",
                "event_type": "WASTED",
                "stock_after": updated_product.current_stock,
                "atomic": True,  # ← Key indicator this is atomic
            }

        except HTTPException:
            raise
        except Exception as e:
            InventoryObservability.log_event_creation_failed(
                correlation_id=correlation_id,
                organization_id=organization_id,
                product_id=product_id,
                event_type="WASTED",
                error=str(e),
                brand_id=brand_id,
            )
            logger.error(f"[shadow] waste failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to log waste"
            )

    async def get_stock_after_mutation(
        self,
        product_id: str,
    ) -> Optional[float]:
        """
        Get current stock for a product (for validation).
        """
        product = await db.contextualproduct.find_unique(
            where={"id": product_id}
        )
        return product.current_stock if product else None


# Singleton instance
shadow_inventory_service = ShadowInventoryService()
