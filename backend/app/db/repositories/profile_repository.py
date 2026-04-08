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
        return profile.model_dump() if hasattr(profile, 'model_dump') else profile.__dict__

    async def get_profile_by_id(self, user_id: str) -> Optional[dict]:
        try:
            # Ensure it's a valid UUID string
            UUID(user_id)
            p = await db.profile.find_unique(where={"id": user_id})
            # Treat soft-deleted profiles as non-existent for auth resolution
            if not p or getattr(p, "deleted_at", None) is not None:
                return None
            return p.model_dump() if hasattr(p, 'model_dump') else p.__dict__
        except (ValueError, Exception):
            # If not a valid UUID or DB error, return None (auth dependency will handle fallback)
            return None

    async def get_profile_by_email(self, email: str) -> Optional[dict]:
        try:
            # Prefer the most recent non-deleted profile for this email.
            p = await db.profile.find_first(
                where={"email": email, "deleted_at": None},
                order={"created_at": "desc"},
            )
            if not p:
                return None
            return p.model_dump() if hasattr(p, 'model_dump') else p.__dict__
        except Exception:
            return None

    async def update(self, user_id: str, data: dict) -> dict:
        p = await db.profile.update(
            where={"id": user_id},
            data=data
        )
        return p.model_dump() if hasattr(p, 'model_dump') else p.__dict__

profile_repo = ProfileRepository()
