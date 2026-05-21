"""
Inventory Shadow Integration - Simplified dual-write wrapper

Instead of replacing existing endpoints, this wraps them to run
shadow logic in parallel without breaking production.

Integrates cleanly with existing endpoints.
"""

import asyncio
import logging
from typing import Optional
from uuid import UUID

from app.core.feature_flags import is_shadow_inventory_enabled
from app.services.shadow_inventory_service import shadow_inventory_service
from app.core.observability import InventoryObservability
from app.middleware.correlation_id import get_correlation_id

logger = logging.getLogger("dosteon.shadow_integration")


class ShadowInventoryIntegration:
    """
    Integration layer for shadow inventory system.

    Used by existing endpoints to run shadow logic in parallel.
    Non-blocking - shadow failures don't affect production response.
    """

    @staticmethod
    async def run_shadow_consumption(
        organization_id: str,
        brand_id: Optional[str],
        product_id: str,
        quantity: float,
        consumption_reason: str,
        actor_id: Optional[str] = None,
    ) -> dict:
        """
        Run shadow consumption logic (non-blocking).

        Returns shadow result if available, logs any discrepancies.
        """
        if not is_shadow_inventory_enabled():
            return None  # Shadow disabled

        correlation_id = get_correlation_id()

        try:
            shadow_result = await shadow_inventory_service.log_consumption_atomic(
                organization_id=organization_id,
                brand_id=brand_id,
                product_id=product_id,
                quantity=quantity,
                consumption_reason=consumption_reason,
                actor_id=actor_id,
            )
            logger.info(
                f"[shadow] consumption succeeded: {shadow_result}",
                extra={"correlation_id": correlation_id}
            )
            return shadow_result
        except Exception as e:
            logger.warning(
                f"[shadow] consumption failed (non-fatal): {e}",
                extra={"correlation_id": correlation_id}
            )
            return None

    @staticmethod
    async def run_shadow_waste(
        organization_id: str,
        brand_id: Optional[str],
        product_id: str,
        quantity: float,
        waste_reason: str,
        actor_id: Optional[str] = None,
    ) -> dict:
        """
        Run shadow waste logic (non-blocking).

        Returns shadow result if available, logs any discrepancies.
        """
        if not is_shadow_inventory_enabled():
            return None  # Shadow disabled

        correlation_id = get_correlation_id()

        try:
            shadow_result = await shadow_inventory_service.log_waste_atomic(
                organization_id=organization_id,
                brand_id=brand_id,
                product_id=product_id,
                quantity=quantity,
                waste_reason=waste_reason,
                actor_id=actor_id,
            )
            logger.info(
                f"[shadow] waste succeeded: {shadow_result}",
                extra={"correlation_id": correlation_id}
            )
            return shadow_result
        except Exception as e:
            logger.warning(
                f"[shadow] waste failed (non-fatal): {e}",
                extra={"correlation_id": correlation_id}
            )
            return None

    @staticmethod
    async def compare_stock_states(
        organization_id: str,
        product_id: str,
        old_stock: float,
        new_stock: float,
    ):
        """
        Compare stock states between old and new systems.

        Logs discrepancies for monitoring.
        """
        if old_stock != new_stock:
            logger.warning(
                f"[shadow] stock discrepancy detected: "
                f"old={old_stock} vs new={new_stock} (delta={new_stock - old_stock})",
                extra={
                    "organization_id": organization_id,
                    "product_id": product_id,
                    "old_stock": old_stock,
                    "new_stock": new_stock,
                }
            )


shadow_integration = ShadowInventoryIntegration()
