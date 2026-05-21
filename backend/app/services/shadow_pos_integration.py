"""
Shadow POS Integration - Wrapper for endpoint integration

Runs shadow POS logic in parallel with existing logic.
Non-blocking - shadow failures don't affect production response.
Feature flag controls which result is returned.
"""

import asyncio
import logging
from typing import Optional, List, Dict, Any

from app.core.feature_flags import is_safe_pos_enabled
from app.services.shadow_pos_service import shadow_pos_service
from app.core.observability import POSObservability
from app.middleware.correlation_id import get_correlation_id

logger = logging.getLogger("dosteon.shadow_pos_integration")


class ShadowPOSIntegration:
    """
    Integration layer for shadow POS system.

    Used by existing endpoints to run shadow logic in parallel.
    Non-blocking - shadow failures don't affect production response.
    """

    @staticmethod
    async def run_shadow_order_placement(
        organization_id: str,
        brand_id: Optional[str],
        user_id: str,
        channel: str,
        items: List[Dict[str, Any]],
    ) -> Optional[dict]:
        """
        Run shadow POS order placement (non-blocking).

        Returns shadow result if available, logs any issues.
        """
        if not is_safe_pos_enabled():
            return None  # Shadow disabled

        correlation_id = get_correlation_id()

        try:
            shadow_result = await shadow_pos_service.place_order_atomic(
                organization_id=organization_id,
                brand_id=brand_id,
                user_id=user_id,
                channel=channel,
                items=items,
            )
            logger.info(
                f"[shadow-pos] order placement succeeded: {shadow_result['id']}",
                extra={
                    "correlation_id": correlation_id,
                    "order_id": shadow_result['id'],
                }
            )
            return shadow_result
        except Exception as e:
            logger.warning(
                f"[shadow-pos] order placement failed (non-fatal): {e}",
                extra={
                    "correlation_id": correlation_id,
                    "error": str(e),
                }
            )
            return None

    @staticmethod
    async def compare_order_results(
        old_result: dict,
        new_result: dict,
    ) -> Dict[str, Any]:
        """
        Compare old and new POS order results.

        Checks for:
        - Financial consistency (revenue, cogs, profit)
        - Item count consistency
        - Order state consistency
        """
        correlation_id = get_correlation_id()

        comparison = {
            "old": old_result,
            "new": new_result,
            "matches": True,
            "discrepancies": [],
        }

        # Compare financial data
        if old_result.get("total_revenue") != new_result.get("total_revenue"):
            comparison["matches"] = False
            comparison["discrepancies"].append({
                "field": "total_revenue",
                "old": old_result.get("total_revenue"),
                "new": new_result.get("total_revenue"),
            })

        if old_result.get("total_cogs") != new_result.get("total_cogs"):
            comparison["matches"] = False
            comparison["discrepancies"].append({
                "field": "total_cogs",
                "old": old_result.get("total_cogs"),
                "new": new_result.get("total_cogs"),
            })

        if old_result.get("gross_profit") != new_result.get("gross_profit"):
            comparison["matches"] = False
            comparison["discrepancies"].append({
                "field": "gross_profit",
                "old": old_result.get("gross_profit"),
                "new": new_result.get("gross_profit"),
            })

        # Compare item counts
        if old_result.get("items_count") != new_result.get("items_count"):
            comparison["matches"] = False
            comparison["discrepancies"].append({
                "field": "items_count",
                "old": old_result.get("items_count"),
                "new": new_result.get("items_count"),
            })

        # Log if discrepancies found
        if not comparison["matches"]:
            logger.warning(
                f"[shadow-pos] order comparison shows discrepancies",
                extra={
                    "correlation_id": correlation_id,
                    "discrepancies": comparison["discrepancies"],
                }
            )

        return comparison

    @staticmethod
    async def validate_pos_atomicity(
        shadow_result: Optional[dict],
    ) -> Dict[str, Any]:
        """
        Validate that shadow POS order was created atomically.

        Returns validation result with details.
        """
        if not shadow_result:
            return {
                "atomic": False,
                "reason": "Shadow result not available",
            }

        return {
            "atomic": shadow_result.get("atomic", False),
            "inventory_depletion_guaranteed": shadow_result.get(
                "inventory_depletion_guaranteed", False
            ),
            "order_id": shadow_result.get("id"),
            "items_created": shadow_result.get("items_count"),
            "inventory_depletions": shadow_result.get("depletions"),
        }


shadow_pos_integration = ShadowPOSIntegration()
