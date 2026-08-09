"""
LifeLink AI — SOS Router
POST /api/sos/trigger         - Trigger SOS
POST /api/sos/{id}/cancel     - Cancel SOS
POST /api/sos/{id}/resolve    - Resolve SOS
GET  /api/sos/{id}/status     - Get SOS status
WS   /api/sos/ws/{id}         - Live WebSocket feed
POST /api/sos/{id}/location   - Send live location update
"""
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.sos import SOSTriggerRequest, SOSStatusResponse, SOSLocationUpdate
from app.services import sos_service

router = APIRouter(prefix="/api/sos", tags=["SOS & Emergency"])


@router.post("/trigger", response_model=SOSStatusResponse, status_code=201)
async def trigger_sos(data: SOSTriggerRequest, db: AsyncSession = Depends(get_db)):
    """Trigger an SOS event — dispatches ambulance and notifies contacts"""
    event = await sos_service.create_sos_event(
        db,
        user_id="usr_demo",        # In prod: extracted from JWT
        lat=data.lat,
        lng=data.lng,
        triage_level=data.triage_level,
        trigger_method=data.trigger_method,
        address=data.address,
    )
    return event


@router.get("/{sos_id}/status", response_model=SOSStatusResponse)
async def get_sos_status(sos_id: str, db: AsyncSession = Depends(get_db)):
    """Get live SOS event status"""
    event = await sos_service.get_sos_event(db, sos_id)
    if not event:
        raise HTTPException(status_code=404, detail="SOS event not found")
    return event


@router.post("/{sos_id}/cancel")
async def cancel_sos(sos_id: str, db: AsyncSession = Depends(get_db)):
    """Cancel an active SOS (false alarm)"""
    event = await sos_service.update_sos_status(db, sos_id, "cancelled")
    if not event:
        raise HTTPException(status_code=404, detail="SOS event not found")
    return {"message": "SOS cancelled", "sos_id": sos_id}


@router.post("/{sos_id}/resolve")
async def resolve_sos(sos_id: str, db: AsyncSession = Depends(get_db)):
    """Mark SOS as resolved"""
    event = await sos_service.update_sos_status(db, sos_id, "resolved")
    if not event:
        raise HTTPException(status_code=404, detail="SOS event not found")
    return {"message": "SOS resolved", "sos_id": sos_id}


@router.post("/{sos_id}/location")
async def update_location(sos_id: str, data: SOSLocationUpdate):
    """Broadcast live location update via WebSocket (no DB write)"""
    await sos_service.update_sos_location(sos_id, data.lat, data.lng)
    return {"ok": True}


@router.websocket("/ws/{sos_id}")
async def sos_websocket(websocket: WebSocket, sos_id: str):
    """
    WebSocket endpoint for real-time SOS tracking.
    Family members and first responders connect here.
    """
    await sos_service.sos_manager.connect(sos_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Client can send location pings
            if data.get("type") == "location_ping":
                await sos_service.update_sos_location(
                    sos_id, data["lat"], data["lng"]
                )
    except WebSocketDisconnect:
        sos_service.sos_manager.disconnect(sos_id, websocket)
