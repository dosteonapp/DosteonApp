"""
Centralized feature flag system for production-safe migrations.

Supports:
- Environment variable defaults
- Runtime override (to be implemented)
- Per-request caching
- System-wide and module-level flags
"""

import os
from typing import Dict, Optional
from functools import lru_cache
import logging

logger = logging.getLogger("dosteon.feature_flags")


class FeatureFlags:
    """Feature flag manager with environment + optional runtime override."""

    # Default feature flags (all disabled for safe gradual rollout)
    DEFAULTS = {
        # Shadow systems (validation before production)
        "ENABLE_SHADOW_INVENTORY_LOGIC": False,
        "ENABLE_SHADOW_POS_ORDER_FLOW": False,
        "ENABLE_SHADOW_SALES_FLOW": False,

        # Atomic transaction rewrites (after shadow validation)
        "ENABLE_ATOMIC_INVENTORY_TX": False,
        "ENABLE_SAFE_POS_ORDER_FLOW": False,
        "ENABLE_SAFE_SALES_TX": False,

        # Schema enforcement (after data validation)
        "ENABLE_NEW_SCHEMA_CONSTRAINTS": False,

        # Observability (always enabled in Phase 0)
        "ENABLE_OBSERVABILITY_LOGGING": True,
    }

    def __init__(self):
        """Initialize with env vars, ready for runtime override."""
        self._flags: Dict[str, bool] = {}
        self._load_from_env()

    def _load_from_env(self):
        """Load all flags from environment variables (with defaults)."""
        for flag_name, default_value in self.DEFAULTS.items():
            env_value = os.getenv(flag_name, "").lower()
            if env_value in ("true", "1", "yes"):
                self._flags[flag_name] = True
            elif env_value in ("false", "0", "no"):
                self._flags[flag_name] = False
            else:
                self._flags[flag_name] = default_value
        logger.info(f"Feature flags initialized: {self._flags}")

    def get(self, flag_name: str) -> bool:
        """Get flag value (cached)."""
        return self._flags.get(flag_name, False)

    def set_runtime(self, flag_name: str, value: bool):
        """
        Override flag at runtime (for testing, or future DB-backed system).

        ⚠️ NOTE: This is in-memory only. For persistent runtime overrides,
        implement a database-backed system or config server.
        """
        if flag_name in self.DEFAULTS:
            self._flags[flag_name] = value
            logger.warning(f"Feature flag runtime override: {flag_name} = {value}")
        else:
            logger.error(f"Unknown feature flag: {flag_name}")

    def all_flags(self) -> Dict[str, bool]:
        """Return all current flag values (for debugging)."""
        return self._flags.copy()


# Global singleton instance
feature_flags = FeatureFlags()


# Convenience functions for common checks
def is_shadow_inventory_enabled() -> bool:
    """Check if shadow inventory logic is enabled."""
    return feature_flags.get("ENABLE_SHADOW_INVENTORY_LOGIC")


def is_shadow_pos_enabled() -> bool:
    """Check if shadow POS logic is enabled."""
    return feature_flags.get("ENABLE_SHADOW_POS_ORDER_FLOW")


def is_shadow_sales_enabled() -> bool:
    """Check if shadow sales logic is enabled."""
    return feature_flags.get("ENABLE_SHADOW_SALES_FLOW")


def is_atomic_inventory_enabled() -> bool:
    """Check if atomic inventory transactions are enabled."""
    return feature_flags.get("ENABLE_ATOMIC_INVENTORY_TX")


def is_safe_pos_enabled() -> bool:
    """Check if safe POS order flow is enabled."""
    return feature_flags.get("ENABLE_SAFE_POS_ORDER_FLOW")


def is_safe_sales_enabled() -> bool:
    """Check if safe sales transactions are enabled."""
    return feature_flags.get("ENABLE_SAFE_SALES_TX")


def is_observability_enabled() -> bool:
    """Check if observability logging is enabled."""
    return feature_flags.get("ENABLE_OBSERVABILITY_LOGGING")
