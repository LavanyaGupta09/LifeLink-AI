"""
LifeLink AI — Ambulance Router
GET  /api/ambulance/nearby     - List nearby available ambulances
POST /api/ambulance/dispatch   - Dispatch ambulance to coordinates
GET  /api/ambulance/{id}/location - Current ambulance position
WS   /api/ambulance/ws/{id}   - Live tracking WebSocket
"""
import math
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, Set

from app.services.map_service import get_route_osrm
from app.services.transit_service import generate_uber_deep_link

router = APIRouter(prefix="/api/ambulance", tags=["Ambulance Dispatch"])

MOCK_AMBULANCES = [
    {"id": "amb_001", "vehicle_number": "DL-01-AB-1234",
     "driver_name": "Suresh Kumar", "hospital_name": "Apollo Hospitals",
     "status": "available", "lat": 28.5320, "lng": 77.2650,
     "eta_minutes": 4, "equipment": ["AED", "Oxygen", "Stretcher", "IV Kit"]},
    {"id": "amb_002", "vehicle_number": "DL-04-CD-5678",
     "driver_name": "Mohan Lal", "hospital_name": "Max Hospital",
     "status": "available", "lat": 28.5290, "lng": 77.2780,
     "eta_minutes": 7, "equipment": ["AED", "Oxygen", "Stretcher"]},
]

# WebSocket manager for ambulance tracking
class AmbulanceConnectionManager:
    def __init__(self):
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, amb_id: str, ws: WebSocket):
        await ws.accept()
        self.connections.setdefault(amb_id, set()).add(ws)

    def disconnect(self, amb_id: str, ws: WebSocket):
        self.connections.get(amb_id, set()).discard(ws)

    async def broadcast(self, amb_id: str, data: dict):
        for ws in list(self.connections.get(amb_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                self.connections[amb_id].discard(ws)

amb_manager = AmbulanceConnectionManager()


def _haversine(lat1, lng1, lat2, lng2) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


@router.get("/nearby")
async def get_nearby_ambulances(
    lat: float = Query(...),
    lng: float = Query(...),
):
    """Get available ambulances sorted by proximity using OSRM"""
    result = []
    for a in MOCK_AMBULANCES:
        if a["status"] == "available":
            # Real OSRM call (or mock if no key/flag set)
            route_info = await get_route_osrm(lat, lng, a["lat"], a["lng"])
            if route_info["distance_km"] > 0:
                dist = route_info["distance_km"]
                eta = max(1, route_info["eta_mins"])
            else:
                dist = _haversine(lat, lng, a["lat"], a["lng"])
                eta = max(1, int(dist * 3))
            
            result.append({**a, "distance_km": dist, "eta_minutes": eta})
            
    result.sort(key=lambda x: x["distance_km"])
    return {"ambulances": result, "count": len(result)}


@router.post("/dispatch")
async def dispatch_ambulance(
    lat: float,
    lng: float,
    sos_id: str,
    triage_level: str = "critical",
):
    """Dispatch nearest ambulance and generate fallback Uber Deep-Link"""
    available = [a for a in MOCK_AMBULANCES if a["status"] == "available"]
    
    # Generate an Uber Deep-Link fallback (to the nearest major hospital)
    # Mocking hospital drop-off for demo (Apollo Delhi)
    uber_link = generate_uber_deep_link(lat, lng, 28.5320, 77.2650)

    if not available:
        return {
            "error": "No ambulances available", 
            "fallback": "Calling 112",
            "uber_deep_link": uber_link
        }

    nearest = min(available, key=lambda a: _haversine(lat, lng, a["lat"], a["lng"]))
    nearest["status"] = "dispatched"

    return {
        "dispatched": True,
        "ambulance": nearest,
        "sos_id": sos_id,
        "message": f"Ambulance {nearest['vehicle_number']} dispatched. ETA {nearest['eta_minutes']} minutes.",
        "uber_deep_link": uber_link
    }


@router.get("/{amb_id}/location")
async def get_ambulance_location(amb_id: str):
    """Get current ambulance position"""
    amb = next((a for a in MOCK_AMBULANCES if a["id"] == amb_id), None)
    if not amb:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return {"id": amb_id, "lat": amb["lat"], "lng": amb["lng"], "status": amb["status"], "eta_minutes": amb.get("eta_minutes")}


@router.websocket("/ws/{amb_id}")
async def ambulance_ws(websocket: WebSocket, amb_id: str):
    """WebSocket for live ambulance tracking"""
    await amb_manager.connect(amb_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "location_update":
                await amb_manager.broadcast(amb_id, {
                    "type": "location_update",
                    "amb_id": amb_id,
                    "lat": data["lat"],
                    "lng": data["lng"],
                })
    except WebSocketDisconnect:
        amb_manager.disconnect(amb_id, websocket)
