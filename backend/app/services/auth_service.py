from app.core.supabase import supabase
from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest
from app.repositories.profile_repository import profile_repo
from fastapi import HTTPException, status

class AuthService:
    async def signup(self, user_data: UserSignup):
        try:
            # Use native signUp with metadata
            res = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "email_redirect_to": "http://localhost:3000/auth/callback",
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
                "user_id": res.user.id
            }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def login(self, login_data: UserLogin):
        try:
            # Native signInWithPassword
            auth_response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
            
            if not auth_response.user or not auth_response.session:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

            # Backend propagates session directly
            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "role": auth_response.user.user_metadata.get("role", "restaurant"),
                    "first_name": auth_response.user.user_metadata.get("first_name"),
                    "last_name": auth_response.user.user_metadata.get("last_name")
                }
            }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def get_me(self, token: str):
        try:
            # Verify token via Supabase
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid session",
                )
                
            return {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "role": user_response.user.user_metadata.get("role"),
                "first_name": user_response.user.user_metadata.get("first_name"),
                "last_name": user_response.user.user_metadata.get("last_name")
            }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def forgot_password(self, request: ForgotPasswordRequest):
        try:
            # Native resetPasswordForEmail with unified callback
            supabase.auth.reset_password_for_email(request.email, {
                "redirect_to": "http://localhost:3000/auth/callback"
            })
            return {"message": "Password reset link sent to your email"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def reset_password(self, request: PasswordResetConfirm):
        # Note: Frontend handles the session exchange from the code in the URL.
        # This endpoint is for when the user is already authenticated (session is set).
        try:
            # In Supabase, if we have an access_token, we set it and then update the user
            supabase.auth.set_session(request.access_token, "") 
            supabase.auth.update_user({
                "password": request.new_password
            })
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def sign_in_with_magic_link(self, request: MagicLinkRequest):
        try:
            # Use unified callback
            supabase.auth.sign_in_with_otp({
                "email": request.email,
                "options": {
                    "email_redirect_to": "http://localhost:3000/auth/callback"
                }
            })
            return {"message": "Magic link sent to your email"}
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
