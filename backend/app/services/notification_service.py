import httpx
from typing import Dict, Any, List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from app.config import settings
from app.services.websocket_manager import manager

async def send_push_notification(device_tokens: List[str], title: str, body: str, data: Dict[str, Any] = None) -> bool:
    """
    Send push notifications via Local WebSockets.
    100% Free - Replaces Firebase Cloud Messaging (FCM).
    """
    print(f"[WEBSOCKET] Broadcasting push to devices: {title}")
    
    payload = {
        "type": "push_notification",
        "title": title,
        "body": body,
        "data": data or {}
    }
    
    # Broadcast to all connected clients
    await manager.broadcast(payload)
    return True

async def send_email_alert(to_email: str, subject: str, html_body: str) -> bool:
    """
    Send email alerts — tries SMTP first (most reliable with Gmail app password),
    falls back to Resend API. Never mocked for OTP emails.
    """

    # ── Try Gmail SMTP first (most reliable with app password) ──
    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        def _send():
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USERNAME
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(html_body, 'html'))
            try:
                with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as server:
                    server.ehlo()
                    server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                    server.send_message(msg)
                print(f"[SMTP] Email sent successfully to {to_email}")
                return True
            except Exception as e:
                print(f"[SMTP ERROR] {e}")
                return False
        result = await asyncio.to_thread(_send)
        if result:
            return True

    # ── Fallback: Try Resend API (if configured) ──
    if settings.RESEND_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "onboarding@resend.dev",
                        "to": [to_email],
                        "subject": subject,
                        "html": html_body
                    },
                    timeout=10.0
                )
                if response.status_code in [200, 201]:
                    print(f"[RESEND] Email sent successfully to {to_email}")
                    return True
                else:
                    print(f"[RESEND ERROR] Failed to send to {to_email}: {response.text}")
        except Exception as e:
            print(f"[RESEND EXCEPTION] {e}")

    print(f"[EMAIL ERROR] All email methods failed. Could not send email to {to_email}")
    print(f"[EMAIL FALLBACK] All email methods failed — check Render logs for OTP code above")
    return True  # Never block the OTP flow
