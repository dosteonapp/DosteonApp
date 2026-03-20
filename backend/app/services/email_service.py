import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', None)
        self.smtp_pass = getattr(settings, 'SMTP_PASS', None)
        self.from_email = getattr(settings, 'FROM_EMAIL', None) or self.smtp_user

    def send_verification_email(self, to_email: str, verification_link: str, first_name: str) -> bool:
        if not self.smtp_user or not self.smtp_pass:
            # In development: just print the link to the terminal so you can test
            print(f"\n{'='*60}")
            print(f"DEV MODE — SMTP not configured.")
            print(f"Verification link for {to_email}:")
            print(f"{verification_link}")
            print(f"{'='*60}\n")
            return True  # Return True so signup doesn't fail in dev

        message = MIMEMultipart("alternative")
        message["Subject"] = "Activate Your Dosteon Account"
        message["From"] = f"Dosteon <{self.from_email}>"
        message["To"] = to_email

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

        message.attach(MIMEText(html, "html"))

        try:
            # 10 second timeout — prevents the 3 minute hang when network is unreachable
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.sendmail(self.from_email, to_email, message.as_string())
            print(f"Verification email sent to {to_email}")
            return True
        except smtplib.SMTPAuthenticationError:
            print(f"SMTP auth failed — check SMTP_USER and SMTP_PASS in .env")
            return False
        except smtplib.SMTPException as e:
            print(f"SMTP error sending to {to_email}: {e}")
            return False
        except OSError as e:
            print(f"Network error sending email (is SMTP_HOST reachable?): {e}")
            # Print the link to terminal as fallback so dev can still test
            print(f"\nFallback — Verification link for {to_email}:\n{verification_link}\n")
            return False


email_service = EmailService()