from app.core.supabase import supabase
from app.schemas.auth import Profile
from typing import Optional

class ProfileRepository:
    def __init__(self):
        self.table = "profiles"

    def create_profile(self, profile_data: dict) -> dict:
        result = supabase.table(self.table).upsert(profile_data).execute()
        return result.data[0]

    def get_profile_by_id(self, user_id: str) -> Optional[dict]:
        result = supabase.table(self.table).select("*").eq("id", user_id).single().execute()
        return result.data if result.data else None

    def get_profile_by_email(self, email: str) -> Optional[dict]:
        result = supabase.table(self.table).select("*").eq("email", email).single().execute()
        return result.data if result.data else None

    def update(self, user_id: str, data: dict) -> dict:

        result = supabase.table(self.table).update(data).eq("id", user_id).execute()
        return result.data[0]

profile_repo = ProfileRepository()

