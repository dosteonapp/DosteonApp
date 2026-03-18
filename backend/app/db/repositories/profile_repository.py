from app.db.prisma import db
from typing import Optional
from uuid import UUID

class ProfileRepository:
    async def create_profile(self, profile_data: dict) -> dict:
        profile = await db.profile.upsert(
            where={"id": profile_data["id"]},
            data={
                "create": profile_data,
                "update": profile_data
            }
        )
        return profile.model_dump()

    async def get_profile_by_id(self, user_id: str) -> Optional[dict]:
        profile = await db.profile.find_unique(where={"id": user_id})
        return profile.__dict__ if profile else None

    async def get_profile_by_email(self, email: str) -> Optional[dict]:
        profile = await db.profile.find_first(where={"email": email})
        return profile.__dict__ if profile else None

    async def update(self, user_id: str, data: dict) -> dict:
        profile = await db.profile.update(
            where={"id": user_id},
            data=data
        )
        return profile.__dict__

profile_repo = ProfileRepository()
