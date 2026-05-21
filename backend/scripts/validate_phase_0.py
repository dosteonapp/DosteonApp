"""
PHASE 0 VALIDATION TEST

Verifies that all Phase 0 safety infrastructure is working correctly:
- Feature flags initialized
- Observability logging available
- Correlation IDs propagating

This is a safety checkpoint before proceeding to Phase 1.

Run: python scripts/validate_phase_0.py
"""

import sys
import asyncio
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.core.feature_flags import feature_flags, is_observability_enabled
from app.core.observability import (
    InventoryObservability,
    POSObservability,
    SalesObservability,
)
from app.middleware.correlation_id import get_correlation_id, set_correlation_id


def test_feature_flags():
    """Test feature flag system."""
    print("\n🧪 Testing Feature Flags...")

    flags = feature_flags.all_flags()
    print(f"  ✓ Loaded {len(flags)} feature flags")

    # Verify defaults are safe (all disabled)
    shadow_flags = {k: v for k, v in flags.items() if "SHADOW" in k}
    for flag_name, value in shadow_flags.items():
        assert not value, f"ERROR: {flag_name} should be False by default!"
    print(f"  ✓ All shadow systems disabled (safe)")

    # Verify observability is enabled
    assert is_observability_enabled(), "ERROR: Observability should be enabled!"
    print(f"  ✓ Observability logging enabled")

    # Test runtime override
    feature_flags.set_runtime("ENABLE_SHADOW_INVENTORY_LOGIC", True)
    assert feature_flags.get("ENABLE_SHADOW_INVENTORY_LOGIC"), "Runtime override failed!"
    feature_flags.set_runtime("ENABLE_SHADOW_INVENTORY_LOGIC", False)  # Reset
    print(f"  ✓ Runtime override working")


def test_correlation_ids():
    """Test correlation ID system."""
    print("\n🧪 Testing Correlation IDs...")

    # Test default (no ID set)
    assert get_correlation_id() == "unknown", "Should default to 'unknown'"
    print(f"  ✓ Default correlation ID: 'unknown'")

    # Test setting correlation ID
    test_id = "test-correlation-123"
    set_correlation_id(test_id)
    assert get_correlation_id() == test_id, "Failed to set correlation ID!"
    print(f"  ✓ Correlation ID set and retrieved: {test_id}")

    # Reset
    set_correlation_id("unknown")


def test_observability_logging():
    """Test observability logging system (doesn't require async)."""
    print("\n🧪 Testing Observability Logging...")

    set_correlation_id("test-obs-123")

    # Test inventory observability
    try:
        InventoryObservability.log_stock_mutation(
            correlation_id="test-obs-123",
            organization_id="test-org-1",
            product_id="test-product-1",
            stock_before=100.0,
            stock_after=95.0,
            mutation_type="USED",
            quantity=5.0,
            brand_id=None,
        )
        print(f"  ✓ Inventory observability logging works")
    except Exception as e:
        print(f"  ✗ Inventory observability failed: {e}")
        raise

    # Test POS observability
    try:
        POSObservability.log_order_started(
            correlation_id="test-obs-123",
            organization_id="test-org-1",
            brand_id=None,
        )
        print(f"  ✓ POS observability logging works")
    except Exception as e:
        print(f"  ✗ POS observability failed: {e}")
        raise

    # Test Sales observability
    try:
        SalesObservability.log_order_created(
            correlation_id="test-obs-123",
            organization_id="test-org-1",
            order_id="test-order-1",
            total_revenue=150.0,
            total_cogs=60.0,
            gross_profit=90.0,
            items_count=3,
            brand_id=None,
        )
        print(f"  ✓ Sales observability logging works")
    except Exception as e:
        print(f"  ✗ Sales observability failed: {e}")
        raise


def main():
    """Run all Phase 0 validation tests."""
    print("\n" + "=" * 70)
    print("🛡️  PHASE 0 SAFETY INFRASTRUCTURE VALIDATION")
    print("=" * 70)

    try:
        test_feature_flags()
        test_correlation_ids()
        test_observability_logging()

        print("\n" + "=" * 70)
        print("✅ PHASE 0 VALIDATION PASSED")
        print("=" * 70)
        print("\nAll safety infrastructure is working correctly.")
        print("Ready to proceed to Phase 1: Shadow Mode Implementation\n")
        return 0

    except Exception as e:
        print("\n" + "=" * 70)
        print("❌ PHASE 0 VALIDATION FAILED")
        print("=" * 70)
        print(f"\nError: {e}\n")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
