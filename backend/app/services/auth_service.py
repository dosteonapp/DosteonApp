from app.core.supabase import supabase
from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest
from app.repositories.profile_repository import profile_repo
from fastapi import HTTPException, status

class AuthService:
    async def signup(self, user_data: UserSignup):
        try:
            # Sign up with Supabase Auth
            # This triggers the 'on_auth_user_created' trigger in Postgres to create a profile
            res = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "email_redirect_to": f"http://localhost:3000/auth/{user_data.role}/signin",
                    "data": {
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "role": user_data.role
                    }
                }
            })
            
            if res.user is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup failed")

            return {
                "status": "ok",
                "message": "Signup successful. Check email to confirm.",
                "user_id": res.user.id,
                "email": res.user.email,
                "confirmed": res.user.email_confirmed_at is not None
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def login(self, login_data: UserLogin):
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
            
            if not auth_response.user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

            if not auth_response.user.email_confirmed_at:
                 raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please check your inbox.")

            # Get user profile from our profiles table
            profile = profile_repo.get_profile_by_id(auth_response.user.id)
            if not profile:
                # If profile missing, attempt to create it (fallback if trigger failed)
                profile_data = {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "first_name": auth_response.user.user_metadata.get("first_name"),
                    "last_name": auth_response.user.user_metadata.get("last_name"),
                    "role": auth_response.user.user_metadata.get("role", "restaurant")
                }
                profile = profile_repo.create_profile(profile_data)

            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": profile["id"],
                    "email": profile["email"],
                    "role": profile["role"],
                    "first_name": profile.get("first_name"),
                    "last_name": profile.get("last_name"),
                    "created_at": profile.get("created_at")
                }
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def get_me(self, token: str):
        try:
            # Verify the token with Supabase and get user
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid session",
                )
            
            # Fetch profile for role and extra data
            profile = profile_repo.get_profile_by_id(user_response.user.id)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found",
                )
                
            return {
                "id": profile["id"],
                "email": profile["email"],
                "role": profile["role"],
                "first_name": profile.get("first_name"),
                "last_name": profile.get("last_name"),
                "created_at": profile.get("created_at"),
                "session_valid": True
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def refresh_token(self, request: RefreshTokenRequest):
        try:
            res = supabase.auth.refresh_session(request.refresh_token)
            if not res.session:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
            
            profile = profile_repo.get_profile_by_id(res.user.id)
            
            return {
                "access_token": res.session.access_token,
                "refresh_token": res.session.refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": profile["id"],
                    "email": profile["email"],
                    "role": profile["role"],
                    "first_name": profile.get("first_name"),
                    "last_name": profile.get("last_name"),
                    "created_at": profile.get("created_at")
                }
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def sign_in_with_magic_link(self, request: MagicLinkRequest):
        try:
            # Look up profile by email to determine role and redirect
            profile = profile_repo.get_profile_by_email(request.email)
            
            # Default redirect if no profile found (or onboarding)
            redirect_to = "http://localhost:3000/auth/callback"
            
            if profile:
                redirect_to = f"http://localhost:3000/dashboard/{profile['role']}"

            supabase.auth.sign_in_with_otp({
                "email": request.email,
                "options": {
                    "email_redirect_to": redirect_to
                }
            })
            return {"message": "Magic link sent to your email"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def forgot_password(self, request: ForgotPasswordRequest):
        try:
            supabase.auth.reset_password_for_email(request.email, {
                "redirect_to": "http://localhost:3000/auth/reset-password"
            })
            return {"message": "Password reset link sent to your email"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def reset_password(self, request: PasswordResetConfirm):
        try:
            # Set the temporary session for the update
            supabase.auth.set_session(request.access_token, "") 
            supabase.auth.update_user({
                "password": request.new_password
            })
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    def get_social_login_url(self, provider: str):
        try:
            res = supabase.auth.sign_in_with_oauth({
                "provider": provider,
                "options": {
                    "redirect_to": "http://localhost:3000/auth/callback"
                }
            })
            return {"url": res.url}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

auth_service = AuthService()
