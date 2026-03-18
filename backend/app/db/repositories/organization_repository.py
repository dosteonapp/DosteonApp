from typing import Optional, List
from uuid import UUID
from app.core.supabase import supabase

class OrganizationRepository:
    def create(self, name: str, org_type: str = "restaurant") -> dict:
        data = {
            "name": name,
            "type": org_type
        }
        res = supabase.table("organizations").insert(data).execute()
        return res.data[0]

    def get_by_id(self, org_id: UUID) -> Optional[dict]:
        res = supabase.table("organizations").select("*").eq("id", str(org_id)).execute()
        return res.data[0] if res.data else None

    def update_settings(self, org_id: UUID, settings: dict) -> dict:
        res = supabase.table("organizations")\
            .update({"settings": settings})\
            .eq("id", str(org_id))\
            .execute()
        return res.data[0]

organization_repo = OrganizationRepository()
