"""
Feature Flag Management API Endpoint

Allows controlled activation/deactivation of feature flags.
Only available to admin users.
Changes are logged for audit trail.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Optional

from app.core.feature_flags import feature_flags
from app.core.logging import get_logger
from app.api.deps import get_admin_context, SecurityContext

logger = get_logger("feature_flags_api")

router = APIRouter(prefix="/admin/feature-flags", tags=["admin"])


class FlagUpdateRequest(BaseModel):
    """Request to update a feature flag."""
    flag_name: str
    enabled: bool
    reason: Optional[str] = None


class FlagResponse(BaseModel):
    """Response with current flag state."""
    flag_name: str
    enabled: bool


class AllFlagsResponse(BaseModel):
    """Response with all flags."""
    flags: Dict[str, bool]


@router.get("/", response_model=AllFlagsResponse)
async def get_all_flags(
    ctx: SecurityContext = Depends(get_admin_context),
):
    """
    Get all current feature flags.
    Admin only.
    """
    return AllFlagsResponse(flags=feature_flags.all_flags())


@router.get("/{flag_name}", response_model=FlagResponse)
async def get_flag(
    flag_name: str,
    ctx: SecurityContext = Depends(get_admin_context),
):
    """
    Get a specific feature flag status.
    Admin only.
    """
    if flag_name not in feature_flags.DEFAULTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown flag: {flag_name}"
        )

    return FlagResponse(
        flag_name=flag_name,
        enabled=feature_flags.get(flag_name)
    )


@router.patch("/{flag_name}", response_model=FlagResponse)
async def update_flag(
    flag_name: str,
    request: FlagUpdateRequest,
    ctx: SecurityContext = Depends(get_admin_context),
):
    """
    Update a feature flag (runtime override).

    ⚠️ Admin only. Changes are logged.

    This performs a RUNTIME override (in-memory only).
    For persistent storage, implement database-backed flag system.
    """
    if flag_name not in feature_flags.DEFAULTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown flag: {flag_name}"
        )

    # Log the change
    logger.warning(
        f"[admin] Feature flag updated: {flag_name} = {request.enabled}",
        extra={
            "admin_id": ctx.user_id,
            "admin_email": ctx.user.get("email"),
            "flag_name": flag_name,
            "enabled": request.enabled,
            "reason": request.reason,
        }
    )

    # Apply runtime override
    feature_flags.set_runtime(flag_name, request.enabled)

    return FlagResponse(
        flag_name=flag_name,
        enabled=request.enabled
    )


@router.post("/batch-update", response_model=Dict[str, bool])
async def batch_update_flags(
    updates: Dict[str, bool],
    ctx: SecurityContext = Depends(get_admin_context),
):
    """
    Update multiple flags at once.
    Admin only.
    """
    results = {}

    for flag_name, enabled in updates.items():
        if flag_name not in feature_flags.DEFAULTS:
            logger.warning(
                f"[admin] Unknown flag in batch update: {flag_name}",
                extra={"admin_id": ctx.user_id}
            )
            continue

        logger.warning(
            f"[admin] Feature flag batch update: {flag_name} = {enabled}",
            extra={
                "admin_id": ctx.user_id,
                "admin_email": ctx.user.get("email"),
            }
        )

        feature_flags.set_runtime(flag_name, enabled)
        results[flag_name] = enabled

    return results


@router.post("/rollout/start/{flag_name}")
async def start_rollout(
    flag_name: str,
    percentage: int = 1,  # Start with 1% of traffic
    ctx: SecurityContext = Depends(get_admin_context),
):
    """
    Start gradual rollout of a feature flag.

    ⚠️ This is a helper endpoint. Production implementation would:
    1. Store percentage in database
    2. Hash user IDs to determine if included
    3. Gradually increase percentage
    4. Monitor metrics before increasing
    """
    if flag_name not in feature_flags.DEFAULTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown flag: {flag_name}"
        )

    if not (1 <= percentage <= 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Percentage must be between 1 and 100"
        )

    logger.warning(
        f"[admin] Rollout started: {flag_name} at {percentage}%",
        extra={
            "admin_id": ctx.user_id,
            "admin_email": ctx.user.get("email"),
            "flag_name": flag_name,
            "percentage": percentage,
        }
    )

    return {
        "status": "rollout_started",
        "flag_name": flag_name,
        "percentage": percentage,
        "note": "Production implementation would hash user IDs for gradual rollout",
    }


@router.post("/rollout/stop/{flag_name}")
async def stop_rollout(
    flag_name: str,
    ctx: SecurityContext = Depends(get_admin_context),
):
    """
    Stop/rollback a feature flag rollout.
    Instantly disable the flag.
    """
    if flag_name not in feature_flags.DEFAULTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown flag: {flag_name}"
        )

    logger.warning(
        f"[admin] Rollout stopped (ROLLBACK): {flag_name}",
        extra={
            "admin_id": ctx.user_id,
            "admin_email": ctx.user.get("email"),
            "flag_name": flag_name,
        }
    )

    # Instantly disable flag
    feature_flags.set_runtime(flag_name, False)

    return {
        "status": "rollout_stopped",
        "flag_name": flag_name,
        "enabled": False,
        "note": "Flag instantly disabled (rollback complete)",
    }
