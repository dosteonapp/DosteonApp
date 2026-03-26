import secrets
from typing import List

from fastapi import HTTPException, status

from app.core.supabase import supabase
from app.core.config import settings
from app.db.repositories.profile_repository import profile_repo
from app.db.prisma import db
from app.services.email_service import email_service


INVITE_ROLE_MAP = {
    # Maps invite payload roles to Prisma UserRole enum + human-readable label
    # OWNER/MANAGER → full access + settings
    # CHEF (Procurement Officer) → inventory write + kitchen
    # STAFF (Kitchen Staff) → kitchen only
    "owner_manager":       ("MANAGER", "Owner/Manager"),
    "procurement_officer": ("CHEF",    "Procurement Officer"),
    "kitchen_staff":       ("STAFF",   "Kitchen Staff"),
}


class TeamService:
    async def list_team_members(self, organization_id: str) -> List[dict]:
        profiles = await db.profile.find_many(where={"organization_id": organization_id})
        result: List[dict] = []
        for p in profiles:
            data = p.model_dump() if hasattr(p, "model_dump") else p.__dict__
            result.append(
                {
                    "id": data.get("id"),
                    "email": data.get("email"),
                    "first_name": data.get("first_name"),
                    "last_name": data.get("last_name"),
                    "role": data.get("role"),
                    "organization_id": data.get("organization_id"),
                }
            )
        return result

    async def invite_member(self, organization_id: str, inviter_id: str, payload: dict) -> dict:
        email = payload.get("email")
        first_name = payload.get("first_name") or "there"
        last_name = payload.get("last_name")
        role_key = payload.get("role")

        if not email or not role_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and role are required for invitations.",
            )

        if role_key not in INVITE_ROLE_MAP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role for invitation.",
            )

        prisma_role, rbac_label = INVITE_ROLE_MAP[role_key]

        # Prevent inviting an already existing user in this organization
        existing = await profile_repo.get_profile_by_email(email)
        if existing and str(existing.get("organization_id")) == str(organization_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists in your organization.",
            )

        temp_password = secrets.token_urlsafe(16)

        user_res = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": temp_password,
                "email_confirm": True,
                "user_metadata": {
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": prisma_role,
                    "rbac_role": rbac_label,
                    "organization_id": str(organization_id),
                    "invited_by": inviter_id,
                    "invited": True,
                },
            }
        )

        if not user_res or not user_res.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create invited user.",
            )

        invited_user_id = str(user_res.user.id)

        # Ensure profile exists with correct role and org
        profile_data = {
            "id": invited_user_id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": prisma_role,
            "organization_id": str(organization_id),
        }
        await profile_repo.create_profile(profile_data)

        # Generate a password setup (recovery) link so the invitee can set
        # their password on first login.
        setup_link = None
        try:
            link_res = supabase.auth.admin.generate_link(
                {
                    "type": "recovery",
                    "email": email,
                    "options": {"redirect_to": settings.AUTH_REDIRECT_URL},
                }
            )
            if (
                link_res
                and getattr(link_res, "properties", None)
                and getattr(link_res.properties, "action_link", None)
            ):
                setup_link = link_res.properties.action_link
        except Exception as e:
            # Log but don't fail the invite entirely
            print(f"Invite: failed to generate setup link for {email}: {e}")

        if setup_link:
            try:
                email_service.send_password_reset_email(email, setup_link, first_name)
            except Exception as e:  # pragma: no cover - operational logging path
                print(f"Invite: failed to send invitation email to {email}: {e}")

        return {
            "status": "ok",
            "user_id": invited_user_id,
            "organization_id": str(organization_id),
        }

    async def update_member_role(self, organization_id: str, user_id: str, role_key: str) -> dict:
        if role_key not in INVITE_ROLE_MAP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role for update.",
            )

        prisma_role, rbac_label = INVITE_ROLE_MAP[role_key]

        # Ensure the user belongs to this organization
        profile = await profile_repo.get_profile_by_id(user_id)
        if not profile or str(profile.get("organization_id")) != str(organization_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in this organization.",
            )

        updated = await profile_repo.update(user_id, {"role": prisma_role})

        # Keep Supabase user_metadata in sync with the new role
        try:
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {"role": prisma_role, "rbac_role": rbac_label}},
            )
        except Exception as e:
            print(f"Team: failed to sync Supabase metadata for {user_id}: {e}")

        return updated

    async def remove_member(self, organization_id: str, user_id: str) -> dict:
        # Ensure the user belongs to this organization
        profile = await profile_repo.get_profile_by_id(user_id)
        if not profile or str(profile.get("organization_id")) != str(organization_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in this organization.",
            )

        # Delete from Supabase auth (soft fail if it errors)
        try:
            supabase.auth.admin.delete_user(user_id)
        except Exception as e:
            print(f"Team: failed to delete Supabase user {user_id}: {e}")

        # Remove profile from Prisma
        p = await db.profile.delete(where={"id": user_id})
        return p.model_dump() if hasattr(p, "model_dump") else p.__dict__


team_service = TeamService()
