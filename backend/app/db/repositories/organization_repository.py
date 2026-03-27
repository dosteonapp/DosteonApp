from typing import Optional
from uuid import UUID
from app.db.prisma import db
import json
import asyncio


class OrganizationRepository:
    def create(self, name: str, org_type: str = "restaurant") -> dict:
        return asyncio.run(self._create_async(name, org_type))

    async def _create_async(self, name: str, org_type: str = "restaurant") -> dict:
        org = await db.organization.create(
            data={
                "name": name,
                "type": org_type,
                "settings": json.dumps({
                    "opening_time": "08:00",
                    "closing_time": "22:00"
                })
            }
        )
        return {"id": org.id, "name": org.name, "type": org.type, "settings": org.settings}

    def get_by_id(self, org_id: UUID) -> Optional[dict]:
        return asyncio.run(self._get_by_id_async(org_id))

    async def _get_by_id_async(self, org_id: UUID) -> Optional[dict]:
        org = await db.organization.find_unique(where={"id": str(org_id)})
        if not org:
            return None
        return {"id": org.id, "name": org.name, "type": org.type, "settings": org.settings}

    def update_settings(self, org_id: UUID, settings: dict) -> dict:
        return asyncio.run(self._update_settings_async(org_id, settings))

    async def _update_settings_async(self, org_id: UUID, settings: dict) -> dict:
        org = await db.organization.update(
            where={"id": str(org_id)},
            data={"settings": json.dumps(settings)}
        )
        return {"id": org.id, "name": org.name, "settings": org.settings}

    def update_name(self, org_id: str, name: str) -> dict:
        return asyncio.run(self._update_name_async(org_id, name))

    async def _update_name_async(self, org_id: str, name: str) -> dict:
        org = await db.organization.update(
            where={"id": org_id},
            data={"name": name}
        )
        return {"id": org.id, "name": org.name}

    async def update(self, org_id: str, data: dict) -> dict:
        """Flexible update for organization fields"""
        # Extract fields that belong to the model direct, others go to settings
        # Keep the top-level model footprint minimal; most configurable
        # organization properties (address, phone, opening/closing times)
        # are stored in the settings JSON blob for forward-compatibility
        # across schema changes.
        model_fields = ["name", "type", "logo_url"]
        update_data = {}
        settings_data = {}

        for k, v in data.items():
            if k in model_fields:
                update_data[k] = v
            else:
                settings_data[k] = v
        
        if settings_data:
            # Get current settings first
            current = await db.organization.find_unique(where={"id": org_id})

            # Prisma may return settings either as a JSON string or a dict,
            # depending on how the field is defined and previous writes.
            raw_settings = current.settings if current else None
            if raw_settings:
                if isinstance(raw_settings, str):
                    current_settings = json.loads(raw_settings)
                elif isinstance(raw_settings, dict):
                    current_settings = raw_settings.copy()
                else:
                    current_settings = {}
            else:
                current_settings = {}

            current_settings.update(settings_data)
            update_data["settings"] = json.dumps(current_settings)

        org = await db.organization.update(
            where={"id": org_id},
            data=update_data
        )
        return {"id": org.id, "name": org.name, "logo_url": org.logo_url, "settings": org.settings}


organization_repo = OrganizationRepository()