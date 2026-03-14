import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import os

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_pass = settings.SMTP_PASS
        self.from_email = settings.FROM_EMAIL or self.smtp_user


    def send_verification_email(self, to_email: str, verification_link: str, first_name: str):
        if not self.smtp_user or not self.smtp_pass:
            print(f"WARNING: SMTP credentials missing. Verification Link for {to_email}: {verification_link}")
            return False

        message = MIMEMultipart("alternative")
        message["Subject"] = "Activate Your Dosteon Account"
        message["From"] = f"Dosteon <{self.from_email}>"
        message["To"] = to_email

        html = f"""
        <html>
          <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
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
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.sendmail(self.from_email, to_email, message.as_string())
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

email_service = EmailService()
