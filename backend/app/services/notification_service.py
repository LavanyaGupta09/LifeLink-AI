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
    Send email alerts via SMTP.
    """
    if settings.USE_MOCK_APIS or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[MOCK EMAIL] Sending email to {to_email}: {subject}")
        return True

    def _send():
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html'))

        try:
            # 10-second timeout prevents the request from hanging forever
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"[EMAIL] Successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"[SMTP ERROR] Failed to send email to {to_email}: {e}")
            return False

    result = await asyncio.to_thread(_send)
    if not result:
        print(f"[FALLBACK] Email failed — check Render logs for the OTP code above")
    return True  # Always return True so the API doesn't fail on email errors
