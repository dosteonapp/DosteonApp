"""
Rollout Monitoring & Metrics - Phase 3

Tracks performance of shadow systems vs. old systems.
Enables data-driven decisions about when to enable flags.
Provides alerting on discrepancies.
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
import json

logger = logging.getLogger("dosteon.rollout_monitor")


class SystemType(str, Enum):
    """System type for metrics."""
    OLD = "old"
    SHADOW_INVENTORY = "shadow_inventory"
    SHADOW_POS = "shadow_pos"


class RolloutMetrics:
    """
    Tracks metrics for rollout monitoring.

    Stores:
    - Success rates per system
    - Discrepancy counts
    - Latency comparison
    - Error rates
    """

    def __init__(self):
        self.metrics: Dict[str, Any] = {
            "shadow_inventory": {
                "total_operations": 0,
                "successful_operations": 0,
                "failed_operations": 0,
                "discrepancies": 0,
                "avg_latency_ms": 0.0,
            },
            "shadow_pos": {
                "total_operations": 0,
                "successful_operations": 0,
                "failed_operations": 0,
                "discrepancies": 0,
                "avg_latency_ms": 0.0,
            },
            "old_system": {
                "total_operations": 0,
                "successful_operations": 0,
                "failed_operations": 0,
                "avg_latency_ms": 0.0,
            },
        }
        self.start_time = datetime.utcnow()

    def record_shadow_inventory_operation(
        self,
        success: bool,
        discrepancy: bool = False,
        latency_ms: float = 0.0,
    ):
        """Record shadow inventory operation."""
        metrics = self.metrics["shadow_inventory"]
        metrics["total_operations"] += 1
        if success:
            metrics["successful_operations"] += 1
        else:
            metrics["failed_operations"] += 1
        if discrepancy:
            metrics["discrepancies"] += 1
        # Update rolling average
        self._update_latency(metrics, latency_ms)

    def record_shadow_pos_operation(
        self,
        success: bool,
        discrepancy: bool = False,
        latency_ms: float = 0.0,
    ):
        """Record shadow POS operation."""
        metrics = self.metrics["shadow_pos"]
        metrics["total_operations"] += 1
        if success:
            metrics["successful_operations"] += 1
        else:
            metrics["failed_operations"] += 1
        if discrepancy:
            metrics["discrepancies"] += 1
        self._update_latency(metrics, latency_ms)

    def record_old_system_operation(
        self,
        success: bool,
        latency_ms: float = 0.0,
    ):
        """Record old system operation."""
        metrics = self.metrics["old_system"]
        metrics["total_operations"] += 1
        if success:
            metrics["successful_operations"] += 1
        else:
            metrics["failed_operations"] += 1
        self._update_latency(metrics, latency_ms)

    @staticmethod
    def _update_latency(metrics: dict, latency_ms: float):
        """Update rolling average latency."""
        current_avg = metrics.get("avg_latency_ms", 0.0)
        total = metrics["total_operations"]
        if total > 0:
            new_avg = (current_avg * (total - 1) + latency_ms) / total
            metrics["avg_latency_ms"] = new_avg

    def get_summary(self) -> Dict[str, Any]:
        """Get current metrics summary."""
        uptime_seconds = (
            datetime.utcnow() - self.start_time
        ).total_seconds()

        return {
            "uptime_seconds": uptime_seconds,
            "shadow_inventory": self._calculate_system_stats(
                self.metrics["shadow_inventory"]
            ),
            "shadow_pos": self._calculate_system_stats(
                self.metrics["shadow_pos"]
            ),
            "old_system": self._calculate_system_stats(
                self.metrics["old_system"]
            ),
            "readiness": self._calculate_readiness(),
        }

    @staticmethod
    def _calculate_system_stats(metrics: dict) -> dict:
        """Calculate success rate and error rate."""
        total = metrics["total_operations"]
        if total == 0:
            return {
                "operations": 0,
                "success_rate": 0.0,
                "error_rate": 0.0,
                "discrepancies": 0,
                "discrepancy_rate": 0.0,
                "avg_latency_ms": 0.0,
            }

        success_rate = (
            metrics["successful_operations"] / total * 100
        )
        error_rate = metrics["failed_operations"] / total * 100
        discrepancy_rate = (
            metrics.get("discrepancies", 0) / total * 100
        )

        return {
            "operations": total,
            "success_rate": round(success_rate, 2),
            "error_rate": round(error_rate, 2),
            "discrepancies": metrics.get("discrepancies", 0),
            "discrepancy_rate": round(discrepancy_rate, 2),
            "avg_latency_ms": round(metrics.get("avg_latency_ms", 0.0), 2),
        }

    def _calculate_readiness(self) -> Dict[str, Any]:
        """Determine if systems are ready for rollout."""
        inventory_ready = self._is_system_ready(
            self.metrics["shadow_inventory"]
        )
        pos_ready = self._is_system_ready(self.metrics["shadow_pos"])

        return {
            "shadow_inventory_ready": inventory_ready,
            "shadow_pos_ready": pos_ready,
            "all_systems_ready": inventory_ready and pos_ready,
            "recommendation": self._get_recommendation(
                inventory_ready, pos_ready
            ),
        }

    @staticmethod
    def _is_system_ready(metrics: dict) -> bool:
        """
        Determine if system is ready for production rollout.

        Criteria:
        - Minimum 100+ operations
        - Success rate >= 99.5%
        - Discrepancy rate <= 0.5%
        """
        total = metrics["total_operations"]
        if total < 100:
            return False  # Need more data

        success_rate = (
            metrics["successful_operations"] / total * 100
        )
        if success_rate < 99.5:
            return False

        discrepancy_rate = (
            metrics.get("discrepancies", 0) / total * 100
        )
        if discrepancy_rate > 0.5:
            return False

        return True

    @staticmethod
    def _get_recommendation(inventory_ready: bool, pos_ready: bool) -> str:
        """Get rollout recommendation based on readiness."""
        if inventory_ready and pos_ready:
            return "✅ All systems ready for production rollout"
        elif inventory_ready:
            return "⚠️ Shadow inventory ready; shadow POS needs more validation"
        elif pos_ready:
            return "⚠️ Shadow POS ready; shadow inventory needs more validation"
        else:
            return "⏳ Both systems still validating; continue monitoring"


# Global instance
rollout_metrics = RolloutMetrics()


def log_rollout_status():
    """Log current rollout status."""
    summary = rollout_metrics.get_summary()
    logger.info(
        f"[rollout] Status: {json.dumps(summary, indent=2)}"
    )
