"""
LifeLink AI — SOS Service
Dispatch logic, contact notifications, WebSocket broadcast
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import WebSocket

from app.models.sos_event import SOSEvent
from app.models.user import User


# ─────────────────────────────────────────────
# In-memory WebSocket connection registry
# ─────────────────────────────────────────────
class SOSConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}   # sos_id → set of WebSockets

    async def connect(self, sos_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(sos_id, set()).add(ws)

    def disconnect(self, sos_id: str, ws: WebSocket):
        if sos_id in self.active:
            self.active[sos_id].discard(ws)

    async def broadcast(self, sos_id: str, message: dict):
        for ws in list(self.active.get(sos_id, [])):
            try:
                await ws.send_json(message)
            except Exception:
                self.active[sos_id].discard(ws)


sos_manager = SOSConnectionManager()


# ─────────────────────────────────────────────
# SOS CRUD
# ─────────────────────────────────────────────
async def create_sos_event(
    db: AsyncSession,
    user_id: str,
    lat: float,
    lng: float,
    triage_level: str = "critical",
    trigger_method: str = "button",
    address: Optional[str] = None,
) -> SOSEvent:
    event = SOSEvent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        status="active",
        triage_level=triage_level,
        trigger_method=trigger_method,
        lat=lat,
        lng=lng,
        address=address or "Location captured via GPS",
        created_at=datetime.utcnow(),
    )
    db.add(event)
    await db.flush()

    # Broadcast via WebSocket to any connected family members
    await sos_manager.broadcast(event.id, {
        "type": "sos_created",
        "sos_id": event.id,
        "user_id": user_id,
        "triage_level": triage_level,
        "lat": lat,
        "lng": lng,
        "timestamp": datetime.utcnow().isoformat(),
    })

    # Trigger Push Notifications (FCM / Resend fallback)
    from app.services.notification_service import send_push_notification
    # Mocking device tokens for family members
    mock_family_tokens = ["token_f1", "token_f2"]
    await send_push_notification(
        device_tokens=mock_family_tokens,
        title="🚨 SOS TRIGGERED",
        body=f"Your family member has triggered a {triage_level.upper()} SOS.",
        data={"sos_id": event.id, "lat": lat, "lng": lng}
    )

    return event


async def get_sos_event(db: AsyncSession, sos_id: str) -> Optional[SOSEvent]:
    result = await db.execute(select(SOSEvent).where(SOSEvent.id == sos_id))
    return result.scalar_one_or_none()


async def update_sos_status(
    db: AsyncSession,
    sos_id: str,
    status: str,
) -> Optional[SOSEvent]:
    event = await get_sos_event(db, sos_id)
    if not event:
        return None
    event.status = status
    if status in ("resolved", "cancelled", "false_alarm"):
        event.resolved_at = datetime.utcnow()
    await db.flush()

    # Notify via WebSocket
    await sos_manager.broadcast(sos_id, {
        "type": "sos_status_update",
        "sos_id": sos_id,
        "status": status,
        "timestamp": datetime.utcnow().isoformat(),
    })

    return event


async def update_sos_location(sos_id: str, lat: float, lng: float):
    """Broadcast live location update without DB write (high-frequency)"""
    await sos_manager.broadcast(sos_id, {
        "type": "location_update",
        "sos_id": sos_id,
        "lat": lat,
        "lng": lng,
        "timestamp": datetime.utcnow().isoformat(),
    })
