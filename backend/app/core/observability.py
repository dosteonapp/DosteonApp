"""
Structured observability layer for production-safe migration tracking.

Logs critical events without modifying business logic:
- Inventory mutations
- POS order flow
- Sales creation
- Failure points

All logs include correlation_id for end-to-end tracing.
"""

import json
import logging
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID

logger = logging.getLogger("dosteon.observability")


class ObservabilityEvent:
    """Structured event for observability tracking."""

    def __init__(
        self,
        event_type: str,
        organization_id: str,
        brand_id: Optional[str] = None,
        correlation_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.event_type = event_type
        self.organization_id = organization_id
        self.brand_id = brand_id
        self.correlation_id = correlation_id or "unknown"
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow().isoformat()

    def log_success(self):
        """Log successful event."""
        log_data = {
            "event": self.event_type,
            "status": "success",
            "org_id": str(self.organization_id),
            "brand_id": str(self.brand_id) if self.brand_id else None,
            "correlation_id": self.correlation_id,
            "timestamp": self.timestamp,
            **self.metadata,
        }
        logger.info(json.dumps(log_data))

    def log_failure(self, error: str):
        """Log failed event."""
        log_data = {
            "event": self.event_type,
            "status": "failure",
            "error": error,
            "org_id": str(self.organization_id),
            "brand_id": str(self.brand_id) if self.brand_id else None,
            "correlation_id": self.correlation_id,
            "timestamp": self.timestamp,
            **self.metadata,
        }
        logger.error(json.dumps(log_data))

    def log_discrepancy(self, expected: Any, actual: Any):
        """Log data discrepancy (shadow system validation)."""
        log_data = {
            "event": self.event_type,
            "status": "discrepancy",
            "expected": expected,
            "actual": actual,
            "org_id": str(self.organization_id),
            "brand_id": str(self.brand_id) if self.brand_id else None,
            "correlation_id": self.correlation_id,
            "timestamp": self.timestamp,
            **self.metadata,
        }
        logger.warning(json.dumps(log_data))


class InventoryObservability:
    """Inventory mutation observability."""

    @staticmethod
    def log_stock_mutation(
        correlation_id: str,
        organization_id: str,
        product_id: str,
        stock_before: float,
        stock_after: float,
        mutation_type: str,  # "USED", "WASTED", "RECEIVED", etc.
        quantity: float,
        brand_id: Optional[str] = None,
    ):
        """Log inventory stock change."""
        event = ObservabilityEvent(
            event_type="inventory_stock_mutation",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "product_id": str(product_id),
                "mutation_type": mutation_type,
                "quantity": quantity,
                "stock_before": stock_before,
                "stock_after": stock_after,
                "delta": stock_after - stock_before,
            },
        )
        event.log_success()

    @staticmethod
    def log_event_created(
        correlation_id: str,
        organization_id: str,
        event_id: str,
        product_id: str,
        event_type: str,
        brand_id: Optional[str] = None,
    ):
        """Log inventory event creation."""
        event = ObservabilityEvent(
            event_type="inventory_event_created",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "event_id": str(event_id),
                "product_id": str(product_id),
                "inventory_event_type": event_type,
            },
        )
        event.log_success()

    @staticmethod
    def log_event_creation_failed(
        correlation_id: str,
        organization_id: str,
        product_id: str,
        event_type: str,
        error: str,
        brand_id: Optional[str] = None,
    ):
        """Log inventory event creation failure."""
        event = ObservabilityEvent(
            event_type="inventory_event_creation_failed",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "product_id": str(product_id),
                "inventory_event_type": event_type,
                "error_detail": error,
            },
        )
        event.log_failure(error)


class POSObservability:
    """POS order observability."""

    @staticmethod
    def log_order_started(
        correlation_id: str,
        organization_id: str,
        brand_id: Optional[str] = None,
    ):
        """Log POS order started."""
        event = ObservabilityEvent(
            event_type="pos_order_started",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
        )
        event.log_success()

    @staticmethod
    def log_order_completed(
        correlation_id: str,
        organization_id: str,
        order_id: str,
        total_revenue: float,
        items_count: int,
        brand_id: Optional[str] = None,
    ):
        """Log POS order completed."""
        event = ObservabilityEvent(
            event_type="pos_order_completed",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "order_id": str(order_id),
                "total_revenue": total_revenue,
                "items_count": items_count,
            },
        )
        event.log_success()

    @staticmethod
    def log_order_failed(
        correlation_id: str,
        organization_id: str,
        error: str,
        brand_id: Optional[str] = None,
    ):
        """Log POS order failed."""
        event = ObservabilityEvent(
            event_type="pos_order_failed",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
        )
        event.log_failure(error)

    @staticmethod
    def log_inventory_deduction_failed(
        correlation_id: str,
        organization_id: str,
        order_id: str,
        product_id: str,
        error: str,
        brand_id: Optional[str] = None,
    ):
        """Log inventory deduction failure during POS order."""
        event = ObservabilityEvent(
            event_type="pos_inventory_deduction_failed",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "order_id": str(order_id),
                "product_id": str(product_id),
                "error_detail": error,
            },
        )
        event.log_failure(error)


class SalesObservability:
    """Sales order observability."""

    @staticmethod
    def log_order_created(
        correlation_id: str,
        organization_id: str,
        order_id: str,
        total_revenue: float,
        total_cogs: float,
        gross_profit: float,
        items_count: int,
        brand_id: Optional[str] = None,
    ):
        """Log sales order created."""
        event = ObservabilityEvent(
            event_type="sales_order_created",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "order_id": str(order_id),
                "total_revenue": total_revenue,
                "total_cogs": total_cogs,
                "gross_profit": gross_profit,
                "items_count": items_count,
            },
        )
        event.log_success()

    @staticmethod
    def log_inventory_deduction_failed(
        correlation_id: str,
        organization_id: str,
        order_id: str,
        product_id: str,
        error: str,
        brand_id: Optional[str] = None,
    ):
        """Log inventory deduction failure during sales order."""
        event = ObservabilityEvent(
            event_type="sales_inventory_deduction_failed",
            organization_id=organization_id,
            brand_id=brand_id,
            correlation_id=correlation_id,
            metadata={
                "order_id": str(order_id),
                "product_id": str(product_id),
                "error_detail": error,
            },
        )
        event.log_failure(error)
