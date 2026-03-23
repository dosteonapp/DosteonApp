import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx

from app.core.config import settings


class EmailService:
    def __init__(self) -> None:
        # SMTP config (used as fallback or for local/dev)
        self.smtp_host = getattr(settings, "SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = getattr(settings, "SMTP_PORT", 587)
        self.smtp_user = getattr(settings, "SMTP_USER", None)
        self.smtp_pass = getattr(settings, "SMTP_PASS", None)
        self.from_email = getattr(settings, "FROM_EMAIL", None) or self.smtp_user

        # Resend configuration (primary provider in production)
        self.resend_api_key = getattr(settings, "RESEND_API_KEY", None)
        # Prefer RESEND_FROM_EMAIL, fall back to FROM_EMAIL/SMTP user
        self.resend_from_email = getattr(settings, "RESEND_FROM_EMAIL", None) or self.from_email

    def _send_via_resend(
        self,
        to_email: str,
        subject: str,
        html: str,
        email_type: str,
    ) -> bool:
        """Send an email using Resend HTTP API if configured.

        Returns True on success, False if Resend is not configured or the API call fails.
        """

        if not self.resend_api_key:
            return False

        from_address = self.resend_from_email or self.from_email
        if not from_address:
            print(
                "Resend configured but no FROM address set "
                "(RESEND_FROM_EMAIL or FROM_EMAIL)."
            )
            return False

        try:
            response = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {self.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"Dosteon <{from_address}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
                timeout=10.0,
            )
            if response.status_code in (200, 201):
                print(f"{email_type} email sent via Resend to {to_email}")
                return True
            else:
                print(
                    f"Resend API error sending {email_type} email to {to_email}: "
                    f"status={response.status_code}, body={response.text}"
                )
                return False
        except httpx.HTTPError as e:
            print(f"HTTP error calling Resend for {email_type} email to {to_email}: {e}")
            return False

    def send_verification_email(
        self,
        to_email: str,
        verification_link: str,
        first_name: str,
    ) -> bool:
        subject = "Activate Your Dosteon Account"

        html = f"""
        <html>
          <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #2563eb;">Welcome to Dosteon, {first_name}!</h2>
              <p>Thank you for signing up. Please click the button below to verify your email address and activate your restaurant dashboard.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                   Verify Email Address
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 12px; color: #2563eb;">{verification_link}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
        """

        # 1) Try Resend first if configured (best option in production)
        if self._send_via_resend(to_email, subject, html, email_type="Verification"):
            return True

        # 2) Fallback to SMTP if configured (useful for local dev or alternative provider)
        if self.smtp_user and self.smtp_pass:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"Dosteon <{self.from_email}>"
            message["To"] = to_email
            message.attach(MIMEText(html, "html"))

            try:
                # 10 second timeout — prevents the 3 minute hang when network is unreachable
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.sendmail(self.from_email, to_email, message.as_string())
                print(f"Verification email sent to {to_email} via SMTP")
                return True
            except smtplib.SMTPAuthenticationError:
                print("SMTP auth failed — check SMTP_USER and SMTP_PASS in .env")
            except smtplib.SMTPException as e:
                print(f"SMTP error sending verification email to {to_email}: {e}")
            except OSError as e:
                print(
                    "Network error sending verification email "
                    f"(is SMTP_HOST reachable?): {e}"
                )
                print(f"\nFallback — Verification link for {to_email}:\n{verification_link}\n")

        # 3) Final dev fallback: just print the link so flows still work
        print(f"\n{'='*60}")
        print("DEV MODE — No email provider configured.")
        print(f"Verification link for {to_email}:")
        print(verification_link)
        print(f"{'='*60}\n")
        return True

    def send_magic_link_email(
        self,
        to_email: str,
        magic_link: str,
        first_name: str,
    ) -> bool:
        """Send a sign-in magic link email.

        Prefers Resend if configured, falls back to SMTP, then dev print.
        """

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

        # 1) Try Resend first
        if self._send_via_resend(to_email, subject, html, email_type="Magic link"):
            return True

        # 2) Fallback to SMTP if configured
        if self.smtp_user and self.smtp_pass:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"Dosteon <{self.from_email}>"
            message["To"] = to_email
            message.attach(MIMEText(html, "html"))

            try:
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.sendmail(self.from_email, to_email, message.as_string())
                print(f"Magic link email sent to {to_email} via SMTP")
                return True
            except smtplib.SMTPAuthenticationError:
                print("SMTP auth failed — check SMTP_USER and SMTP_PASS in .env")
            except smtplib.SMTPException as e:
                print(f"SMTP error sending magic link to {to_email}: {e}")
            except OSError as e:
                print(
                    "Network error sending magic link email "
                    f"(is SMTP_HOST reachable?): {e}"
                )
                print(f"\nFallback — Magic sign-in link for {to_email}:\n{magic_link}\n")

        # 3) Final dev fallback: print link
        print(f"\n{'='*60}")
        print("DEV MODE — No email provider configured.")
        print(f"Magic sign-in link for {to_email}:")
        print(magic_link)
        print(f"{'='*60}\n")
        return True

    def send_password_reset_email(
        self,
        to_email: str,
        reset_link: str,
        first_name: str,
    ) -> bool:
        """Send a password reset email.

        Prefers Resend if configured, falls back to SMTP, then dev print.
        """

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

        # 1) Try Resend first
        if self._send_via_resend(to_email, subject, html, email_type="Password reset"):
            return True

        # 2) Fallback to SMTP if configured
        if self.smtp_user and self.smtp_pass:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"Dosteon <{self.from_email}>"
            message["To"] = to_email
            message.attach(MIMEText(html, "html"))

            try:
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.sendmail(self.from_email, to_email, message.as_string())
                print(f"Password reset email sent to {to_email} via SMTP")
                return True
            except smtplib.SMTPAuthenticationError:
                print("SMTP auth failed — check SMTP_USER and SMTP_PASS in .env")
            except smtplib.SMTPException as e:
                print(f"SMTP error sending password reset to {to_email}: {e}")
            except OSError as e:
                print(
                    "Network error sending password reset email "
                    f"(is SMTP_HOST reachable?): {e}"
                )
                print(f"\nFallback — Password reset link for {to_email}:\n{reset_link}\n")

        # 3) Final dev fallback: print link
        print(f"\n{'='*60}")
        print("DEV MODE — No email provider configured.")
        print(f"Password reset link for {to_email}:")
        print(reset_link)
        print(f"{'='*60}\n")
        return True


email_service = EmailService()