import html as html_lib
import httpx

from app.core.config import settings
from app.core.logging import get_logger


logger = get_logger("email")


class EmailService:
    def __init__(self) -> None:
        # Resend configuration (primary and only provider)
        self.resend_api_key = getattr(settings, "RESEND_API_KEY", None)
        # Prefer RESEND_FROM_EMAIL, fall back to FROM_EMAIL if provided
        self.from_email = getattr(settings, "RESEND_FROM_EMAIL", None) or getattr(
            settings, "FROM_EMAIL", None
        )

    def send_email(
        self,
        to_email: str,
        subject: str,
        html: str,
        email_type: str = "Generic",
    ) -> None:
        """Send an email using the Resend HTTP API.

        - Uses RESEND_API_KEY and RESEND_FROM_EMAIL (or FROM_EMAIL) from settings.
        - In development: redirects all emails to DEV_EMAIL_OVERRIDE if set.
        - In staging: prepends [STAGING] to the subject line.
        - Logs structured success / error messages.
        - Raises RuntimeError if sending fails.
        """
        # --- Environment guards ---
        dev_override = settings.DEV_EMAIL_OVERRIDE
        if (settings.is_development or settings.is_staging) and dev_override:
            logger.warning(
                f"[DEV/STAGING] Email override active — redirecting to {dev_override} (original: {to_email})",
                extra={"extra_context": {"email_type": email_type, "original_to": to_email}},
            )
            to_email = dev_override

        if settings.is_staging:
            subject = f"[STAGING] {subject}"

        if not self.resend_api_key:
            logger.error(
                "Email sending is not configured: RESEND_API_KEY is missing",
                extra={
                    "extra_context": {
                        "email_type": email_type,
                        "to": to_email,
                    }
                },
            )
            raise RuntimeError("Email sending is not configured (missing RESEND_API_KEY)")

        if not self.from_email:
            logger.error(
                "Email sending is not configured: FROM email missing",
                extra={
                    "extra_context": {
                        "email_type": email_type,
                        "to": to_email,
                    }
                },
            )
            raise RuntimeError(
                "Email sending is not configured (missing RESEND_FROM_EMAIL / FROM_EMAIL)"
            )

        try:
            response = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {self.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"Dosteon <{self.from_email}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
                timeout=10.0,
            )
        except httpx.HTTPError as e:
            logger.exception(
                "HTTP error while calling Resend API",
                extra={
                    "extra_context": {
                        "email_type": email_type,
                        "to": to_email,
                    }
                },
            )
            raise RuntimeError("Failed to send email via Resend") from e

        if response.status_code not in (200, 201):
            logger.error(
                "Resend API returned error response",
                extra={
                    "extra_context": {
                        "email_type": email_type,
                        "to": to_email,
                        "status_code": response.status_code,
                        "body": response.text,
                    }
                },
            )
            raise RuntimeError(
                f"Failed to send {email_type} email via Resend (status {response.status_code})"
            )

        logger.info(
            "Email sent via Resend",
            extra={
                "extra_context": {
                    "email_type": email_type,
                    "to": to_email,
                }
            },
        )

    def send_verification_email(
        self,
        to_email: str,
        verification_link: str,
        first_name: str,
    ) -> None:
        subject = "Activate Your Dosteon Account"

        safe_link = html_lib.escape(verification_link, quote=True)
        safe_name = html_lib.escape(first_name)
        html = f"""
        <html>
          <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #2563eb;">Welcome to Dosteon, {safe_name}!</h2>
              <p>Thank you for signing up. Please click the button below to verify your email address and activate your restaurant dashboard.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{safe_link}"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                   Verify Email Address
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 12px; color: #2563eb;">{safe_link}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
        """
        # Always use Resend; callers decide how to handle failures.
        self.send_email(
            to_email=to_email,
            subject=subject,
            html=html,
            email_type="Verification",
        )

    def send_magic_link_email(
        self,
        to_email: str,
        magic_link: str,
        first_name: str,
    ) -> None:
        """Send a sign-in magic link email via Resend."""

        subject = "Your Dosteon Magic Sign-In Link"

        html = f"""
        <html>
          <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #2563eb;">Hi {first_name},</h2>
              <p>Here is your secure magic link to sign in to your Dosteon dashboard.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{magic_link}"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                   Sign In to Dosteon
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 12px; color: #2563eb;">{magic_link}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">If you didn't request this sign-in, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
        """
        self.send_email(
            to_email=to_email,
            subject=subject,
            html=html,
            email_type="Magic link",
        )

    def send_password_reset_email(
        self,
        to_email: str,
        reset_link: str,
        first_name: str,
    ) -> None:
        """Send a password reset email via Resend."""

        subject = "Reset Your Dosteon Password"

        html = f"""
        <html>
          <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #2563eb;">Reset your password, {first_name}</h2>
              <p>We received a request to reset your Dosteon password. Click the button below to choose a new password.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                   Reset Password
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 12px; color: #2563eb;">{reset_link}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
        """
        self.send_email(
            to_email=to_email,
            subject=subject,
            html=html,
            email_type="Password reset",
        )


email_service = EmailService()