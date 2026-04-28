"""
Brand service — CRUD for Organisation brands.

All write methods verify the brand belongs to the caller's org before acting.
Deletion is soft (sets deleted_at). A brand with deleted_at set is excluded
from the active list but its rows remain so existing FKs are not broken.
"""
from datetime import datetime, timezone
from app.db.prisma import db
from app.schemas.brand import BrandCreate, BrandUpdate
from fastapi import HTTPException, status


class BrandService:

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def _get_brand_for_org(self, brand_id: str, organization_id: str) -> dict:
        """Fetch a brand and assert it belongs to the caller's org.

        Raises 404 if not found, 403 if org mismatch.
        """
        brand = await db.brand.find_unique(where={"id": brand_id})
        if not brand:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
        if str(brand.organization_id) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brand does not belong to your organisation")
        return brand

    # ------------------------------------------------------------------
    # POST /brands
    # ------------------------------------------------------------------

    async def create_brand(self, data: BrandCreate, organization_id: str) -> dict:
        brand = await db.brand.create(
            data={
                "organization_id": organization_id,
                "name": data.name,
                "logo_url": data.logo_url,
                "is_active": True,
            }
        )
        return brand

    # ------------------------------------------------------------------
    # GET /brands
    # ------------------------------------------------------------------

    async def list_brands(self, organization_id: str) -> list:
        """Return all active (non-deleted) brands for the org, oldest first.

        If the org has no brands (pre-migration users), auto-create one from the
        org name so the BrandSwitcherCard always has something to display.
        """
        brands = await db.brand.find_many(
            where={
                "organization_id": organization_id,
                "deleted_at": None,
            },
            order={"created_at": "asc"},
        )
        if not brands:
            org = await db.organization.find_unique(where={"id": organization_id})
            if org:
                try:
                    brand = await db.brand.create(
                        data={"organization_id": organization_id, "name": org.name}
                    )
                    brands = [brand]
                except Exception:
                    pass
        return brands

    # ------------------------------------------------------------------
    # PATCH /brands/:id
    # ------------------------------------------------------------------

    async def update_brand(self, brand_id: str, data: BrandUpdate, organization_id: str) -> dict:
        await self._get_brand_for_org(brand_id, organization_id)

        update_data: dict = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.logo_url is not None:
            update_data["logo_url"] = data.logo_url
        if data.is_active is not None:
            update_data["is_active"] = data.is_active

        if not update_data:
            # Nothing to update — return current record
            return await db.brand.find_unique(where={"id": brand_id})

        brand = await db.brand.update(
            where={"id": brand_id},
            data=update_data,
        )
        return brand

    # ------------------------------------------------------------------
    # DELETE /brands/:id  (soft delete)
    # ------------------------------------------------------------------

    async def delete_brand(self, brand_id: str, organization_id: str) -> None:
        await self._get_brand_for_org(brand_id, organization_id)

        # Guard: cannot delete the org's last active brand
        active_count = await db.brand.count(
            where={
                "organization_id": organization_id,
                "deleted_at": None,
                "is_active": True,
            }
        )
        if active_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last active brand. Deactivate it instead or create another brand first.",
            )

        await db.brand.update(
            where={"id": brand_id},
            data={"deleted_at": datetime.now(timezone.utc)},
        )


brand_service = BrandService()
