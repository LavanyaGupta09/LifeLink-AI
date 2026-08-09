import httpx
from typing import Dict, Any, List
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
    Send email alerts via Resend API.
    Free tier allows 3,000 emails per month.
    """
    if settings.USE_MOCK_APIS or not settings.RESEND_API_KEY:
        print(f"[MOCK RESEND] Sending email to {to_email}: {subject}")
        return True

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "onboarding@resend.dev",
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                return True
            print(f"Resend HTTP Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"Resend Exception: {e}")
    return False
