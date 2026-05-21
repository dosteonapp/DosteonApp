"""
Inventory Dual-Write Orchestration Layer

This layer:
1. Runs OLD inventory logic (production, active)
2. Runs NEW shadow logic in parallel
3. Compares outputs
4. Logs discrepancies
5. Returns result based on feature flag

Enables safe migration from old → new system.
"""

import logging
import asyncio
from typing import Optional, Dict, Any
from datetime import datetime

from app.core.feature_flags import is_shadow_inventory_enabled
from app.services.inventory_service import inventory_service as old_inventory_service
from app.services.shadow_inventory_service import shadow_inventory_service
from app.core.observability import ObservabilityEvent
from app.middleware.correlation_id import get_correlation_id

logger = logging.getLogger("dosteon.inventory_orchestration")


class InventoryOrchestration:
    """Dual-write orchestration for safe inventory migration."""

    @staticmethod
    def _compare_results(old_result: dict, new_result: dict) -> Dict[str, Any]:
        """Compare old and new results, log discrepancies."""
        correlation_id = get_correlation_id()

        comparison = {
            "old": old_result,
            "new": new_result,
            "match": False,
            "discrepancy": None,
        }

        # Compare key fields
        old_stock = old_result.get("stock_after")
        new_stock = new_result.get("stock_after")

        if old_stock != new_stock:
            comparison["discrepancy"] = {
                "field": "stock_after",
                "old_value": old_stock,
                "new_value": new_stock,
                "difference": new_stock - old_stock if both_numbers else None,
            }
            both_numbers = isinstance(old_stock, (int, float)) and isinstance(new_stock, (int, float))

            # Log discrepancy
            event = ObservabilityEvent(
                event_type="inventory_dual_write_discrepancy",
                organization_id=old_result.get("organization_id", "unknown"),
                correlation_id=correlation_id,
                metadata=comparison["discrepancy"],
            )
            event.log_discrepancy(old_stock, new_stock)
            logger.warning(f"Inventory discrepancy: {comparison['discrepancy']}")
        else:
            comparison["match"] = True

        return comparison

    @staticmethod
    async def log_consumption_dual_write(
        organization_id: str,
        brand_id: Optional[str],
        product_id: str,
        quantity: float,
        consumption_reason: str,
        actor_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Log consumption using DUAL-WRITE strategy.

        1. Run OLD logic (production)
        2. Run NEW shadow logic in parallel
        3. Compare results
        4. Log discrepancies
        5. Return based on feature flag
        """
        correlation_id = get_correlation_id()

        # Always run OLD logic (production-safe)
        try:
            old_result = await old_inventory_service.log_consumption(
                organization_id=organization_id,
                brand_id=brand_id,
                data=type('obj', (object,), {
                    'product_id': product_id,
                    'quantity': quantity,
                    'consumption_reason': type('obj', (object,), {'value': consumption_reason})(),
                })(),
                actor_id=actor_id,
            )
            # Normalize result
            old_result = {
                "id": old_result.id,
                "event_type": "USED",
                "status": "logged",
                "stock_after": None,  # Old logic doesn't return this
                "organization_id": organization_id,
            }
        except Exception as e:
            logger.error(f"[dual-write] old logic failed: {e}")
            raise  # Old logic failure = abort (production safety)

        # Run NEW shadow logic in parallel (non-blocking)
        shadow_result = None
        shadow_error = None
        try:
            shadow_result = await shadow_inventory_service.log_consumption_atomic(
                organization_id=organization_id,
                brand_id=brand_id,
                product_id=product_id,
                quantity=quantity,
                consumption_reason=consumption_reason,
                actor_id=actor_id,
            )
        except Exception as e:
            shadow_error = str(e)
            logger.warning(f"[dual-write] shadow logic failed (non-fatal): {e}")

        # Compare if shadow succeeded
        if shadow_result:
            comparison = InventoryOrchestration._compare_results(
                old_result, shadow_result
            )
            logger.info(f"[dual-write] comparison: {comparison}")

        # Decide which result to return
        if is_shadow_inventory_enabled() and shadow_result and not shadow_error:
            logger.info("[dual-write] returning SHADOW result (feature flag enabled)")
            return shadow_result
        else:
            logger.info("[dual-write] returning OLD result (shadow disabled or failed)")
            return old_result

    @staticmethod
    async def log_waste_dual_write(
        organization_id: str,
        brand_id: Optional[str],
        product_id: str,
        quantity: float,
        waste_reason: str,
        actor_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Log waste using DUAL-WRITE strategy.

        Same as log_consumption_dual_write.
        """
        correlation_id = get_correlation_id()

        # Always run OLD logic (production-safe)
        try:
            old_result = await old_inventory_service.log_waste(
                organization_id=organization_id,
                brand_id=brand_id,
                data=type('obj', (object,), {
                    'product_id': product_id,
                    'quantity': quantity,
                    'waste_reason': type('obj', (object,), {'value': waste_reason})(),
                })(),
                actor_id=actor_id,
            )
            # Normalize result
            old_result = {
                "id": old_result.id,
                "event_type": "WASTED",
                "status": "logged",
                "stock_after": None,  # Old logic doesn't return this
                "organization_id": organization_id,
            }
        except Exception as e:
            logger.error(f"[dual-write] old logic failed: {e}")
            raise

        # Run NEW shadow logic in parallel (non-blocking)
        shadow_result = None
        shadow_error = None
        try:
            shadow_result = await shadow_inventory_service.log_waste_atomic(
                organization_id=organization_id,
                brand_id=brand_id,
                product_id=product_id,
                quantity=quantity,
                waste_reason=waste_reason,
                actor_id=actor_id,
            )
        except Exception as e:
            shadow_error = str(e)
            logger.warning(f"[dual-write] shadow logic failed (non-fatal): {e}")

        # Compare if shadow succeeded
        if shadow_result:
            comparison = InventoryOrchestration._compare_results(
                old_result, shadow_result
            )
            logger.info(f"[dual-write] comparison: {comparison}")

        # Decide which result to return
        if is_shadow_inventory_enabled() and shadow_result and not shadow_error:
            logger.info("[dual-write] returning SHADOW result (feature flag enabled)")
            return shadow_result
        else:
            logger.info("[dual-write] returning OLD result (shadow disabled or failed)")
            return old_result


# Export for use in endpoints
inventory_orchestration = InventoryOrchestration()
