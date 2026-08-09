"""
LifeLink AI — Hospital & ER Management Router
GET  /api/hospital/nearby          - Nearby hospitals by lat/lng
GET  /api/hospital/search          - Search/filter hospitals
GET  /api/hospital/{id}            - Hospital detail
GET  /api/hospital/{id}/er-status  - Real-time ER beds (legacy)
GET  /api/hospital/{id}/er-dashboard - Full ER dashboard
POST /api/hospital/{id}/pre-arrival-alert - Pre-arrival ER alert
GET  /api/hospital/{id}/route      - Routing metadata
"""
import math
import uuid
import random
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/hospital", tags=["Hospitals"])


# ─────────────────────────────────────────────
# Mock Data — 8 Hospitals with extended fields
# ─────────────────────────────────────────────
MOCK_HOSPITALS = [
    {
        "id": "hosp_001",
        "name": "Apollo Hospitals",
        "address": "Sarita Vihar, Delhi, 110076",
        "lat": 28.5355, "lng": 77.2690,
        "phone": "+91 11 7179 1090",
        "type": "private",
        "specialties": ["Cardiac", "Neuro", "Orthopedic", "Trauma", "Pediatric"],
        "accepted_insurance": ["Star Health", "ICICI Lombard", "HDFC Ergo", "Max Bupa", "Bajaj Allianz"],
        "er_beds_total": 80, "er_beds_available": 23,
        "icu_beds_total": 30, "icu_beds_available": 8,
        "er_wait_minutes": 12,
        "active_specialists": ["Cardiologist", "Neurologist", "Orthopedic"],
        "on_call_specialists": [
            {"name": "Dr. Preethi Suresh", "specialization": "Cardiologist", "available_since": "06:00"},
            {"name": "Dr. Anand Rao", "specialization": "Neurologist", "available_since": "08:00"},
            {"name": "Dr. Kavita Sharma", "specialization": "Orthopedic Surgeon", "available_since": "07:30"},
        ],
        "trauma_level": "I",
        "has_helipad": True, "has_blood_bank": True,
        "rating": 4.7, "is_partner": True,
    },
    {
        "id": "hosp_002",
        "name": "Max Super Speciality Hospital",
        "address": "Saket, New Delhi, 110017",
        "lat": 28.5247, "lng": 77.2066,
        "phone": "+91 11 2651 5050",
        "type": "private",
        "specialties": ["Cardiac", "Gastro", "Pulmonology", "Oncology"],
        "accepted_insurance": ["Star Health", "ICICI Lombard", "CGHS", "HDFC Ergo"],
        "er_beds_total": 60, "er_beds_available": 8,
        "icu_beds_total": 24, "icu_beds_available": 3,
        "er_wait_minutes": 28,
        "active_specialists": ["Pulmonologist", "Gastroenterologist"],
        "on_call_specialists": [
            {"name": "Dr. Arjun Kapoor", "specialization": "Emergency Medicine", "available_since": "05:00"},
            {"name": "Dr. Nidhi Verma", "specialization": "Pulmonologist", "available_since": "09:00"},
        ],
        "trauma_level": "I",
        "has_helipad": True, "has_blood_bank": True,
        "rating": 4.5, "is_partner": True,
    },
    {
        "id": "hosp_003",
        "name": "Fortis Escorts Heart Institute",
        "address": "Okhla Road, New Delhi, 110025",
        "lat": 28.5514, "lng": 77.2770,
        "phone": "+91 11 4713 5000",
        "type": "private",
        "specialties": ["Cardiac", "Cardiac Surgery", "Vascular"],
        "accepted_insurance": ["Star Health", "Max Bupa", "Bajaj Allianz"],
        "er_beds_total": 40, "er_beds_available": 15,
        "icu_beds_total": 18, "icu_beds_available": 6,
        "er_wait_minutes": 8,
        "active_specialists": ["Cardiologist", "Cardiac Surgeon"],
        "on_call_specialists": [
            {"name": "Dr. Ashok Seth", "specialization": "Interventional Cardiologist", "available_since": "07:00"},
            {"name": "Dr. Ritu Garg", "specialization": "Cardiac Surgeon", "available_since": "06:30"},
        ],
        "trauma_level": "II",
        "has_helipad": False, "has_blood_bank": True,
        "rating": 4.8, "is_partner": False,
    },
    {
        "id": "hosp_004",
        "name": "AIIMS Delhi",
        "address": "Sri Aurobindo Marg, Ansari Nagar, 110029",
        "lat": 28.5672, "lng": 77.2100,
        "phone": "+91 11 2658 8500",
        "type": "government",
        "specialties": ["Cardiac", "Neuro", "Trauma", "Pediatric", "Burns", "Orthopedic", "Oncology"],
        "accepted_insurance": ["CGHS", "ESIC", "Ayushman Bharat", "Star Health"],
        "er_beds_total": 150, "er_beds_available": 42,
        "icu_beds_total": 60, "icu_beds_available": 14,
        "er_wait_minutes": 45,
        "active_specialists": ["All Specialities"],
        "on_call_specialists": [
            {"name": "Dr. Randeep Guleria", "specialization": "Pulmonology", "available_since": "06:00"},
            {"name": "Dr. Deepak Gupta", "specialization": "Trauma Surgery", "available_since": "08:00"},
            {"name": "Dr. Suman Bhandari", "specialization": "Neuro Surgery", "available_since": "07:00"},
            {"name": "Dr. Pooja Khosla", "specialization": "Pediatric Emergency", "available_since": "09:00"},
        ],
        "trauma_level": "I",
        "has_helipad": True, "has_blood_bank": True,
        "rating": 4.9, "is_partner": False,
    },
    {
        "id": "hosp_005",
        "name": "Safdarjung Hospital",
        "address": "Ansari Nagar West, New Delhi, 110029",
        "lat": 28.5685, "lng": 77.2075,
        "phone": "+91 11 2616 4033",
        "type": "government",
        "specialties": ["Trauma", "Burns", "Orthopedic", "Pediatric"],
        "accepted_insurance": ["CGHS", "ESIC", "Ayushman Bharat"],
        "er_beds_total": 120, "er_beds_available": 35,
        "icu_beds_total": 40, "icu_beds_available": 10,
        "er_wait_minutes": 55,
        "active_specialists": ["Trauma Surgeon", "Burns Specialist", "Orthopedic"],
        "on_call_specialists": [
            {"name": "Dr. Vinod Kumar", "specialization": "Trauma Surgery", "available_since": "06:00"},
            {"name": "Dr. Rekha Mishra", "specialization": "Burns & Plastics", "available_since": "08:00"},
        ],
        "trauma_level": "I",
        "has_helipad": True, "has_blood_bank": True,
        "rating": 4.3, "is_partner": False,
    },
    {
        "id": "hosp_006",
        "name": "BLK-Max Super Speciality Hospital",
        "address": "Pusa Road, Rajinder Nagar, 110005",
        "lat": 28.6380, "lng": 77.1820,
        "phone": "+91 11 3040 3040",
        "type": "private",
        "specialties": ["Cardiac", "Neuro", "Oncology", "Liver Transplant"],
        "accepted_insurance": ["Star Health", "ICICI Lombard", "HDFC Ergo", "Max Bupa", "CGHS"],
        "er_beds_total": 50, "er_beds_available": 18,
        "icu_beds_total": 22, "icu_beds_available": 7,
        "er_wait_minutes": 15,
        "active_specialists": ["Oncologist", "Hepatologist", "Cardiologist"],
        "on_call_specialists": [
            {"name": "Dr. Suresh Advani", "specialization": "Oncologist", "available_since": "07:00"},
            {"name": "Dr. Sanjiv Saigal", "specialization": "Hepatologist", "available_since": "08:30"},
        ],
        "trauma_level": "II",
        "has_helipad": False, "has_blood_bank": True,
        "rating": 4.6, "is_partner": True,
    },
    {
        "id": "hosp_007",
        "name": "Sir Ganga Ram Hospital",
        "address": "Rajinder Nagar, New Delhi, 110060",
        "lat": 28.6400, "lng": 77.1870,
        "phone": "+91 11 2586 1052",
        "type": "private",
        "specialties": ["Pediatric", "Neuro", "Orthopedic", "Gastro"],
        "accepted_insurance": ["Star Health", "Bajaj Allianz", "CGHS", "ESIC"],
        "er_beds_total": 45, "er_beds_available": 20,
        "icu_beds_total": 20, "icu_beds_available": 9,
        "er_wait_minutes": 10,
        "active_specialists": ["Pediatrician", "Neurologist", "Gastroenterologist"],
        "on_call_specialists": [
            {"name": "Dr. Dheeraj Shah", "specialization": "Pediatrician", "available_since": "06:30"},
            {"name": "Dr. Amitabh Vyas", "specialization": "Gastroenterologist", "available_since": "09:00"},
        ],
        "trauma_level": "II",
        "has_helipad": False, "has_blood_bank": True,
        "rating": 4.5, "is_partner": False,
    },
    {
        "id": "hosp_008",
        "name": "GTB Hospital",
        "address": "Dilshad Garden, Delhi, 110095",
        "lat": 28.6820, "lng": 77.3120,
        "phone": "+91 11 2258 8700",
        "type": "government",
        "specialties": ["Trauma", "Burns", "Orthopedic", "Pediatric"],
        "accepted_insurance": ["CGHS", "ESIC", "Ayushman Bharat"],
        "er_beds_total": 100, "er_beds_available": 28,
        "icu_beds_total": 35, "icu_beds_available": 5,
        "er_wait_minutes": 40,
        "active_specialists": ["Trauma Surgeon", "Orthopedic"],
        "on_call_specialists": [
            {"name": "Dr. Mahesh Chandra", "specialization": "Trauma Surgery", "available_since": "06:00"},
            {"name": "Dr. Seema Rani", "specialization": "Orthopedic", "available_since": "07:00"},
        ],
        "trauma_level": "I",
        "has_helipad": True, "has_blood_bank": True,
        "rating": 4.1, "is_partner": False,
    },
]


def _haversine(lat1, lng1, lat2, lng2) -> float:
    """Distance in km between two geo points"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


# ─────────────────────────────────────────────
# GET /api/hospital/nearby
# ─────────────────────────────────────────────
@router.get("/nearby")
async def get_nearby_hospitals(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(25.0, description="Search radius in km"),
):
    """Get nearby hospitals sorted by distance with ER availability"""
    result = []
    for h in MOCK_HOSPITALS:
        dist = _haversine(lat, lng, h["lat"], h["lng"])
        if dist <= radius_km:
            result.append({**h, "distance_km": round(dist, 2)})
    result.sort(key=lambda x: x["distance_km"])
    return {"hospitals": result, "count": len(result)}


# ─────────────────────────────────────────────
# GET /api/hospital/search
# ─────────────────────────────────────────────
@router.get("/search")
async def search_hospitals(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(25.0),
    specialty: Optional[str] = Query(None, description="Filter by specialty (e.g. Cardiac, Trauma)"),
    hospital_type: Optional[str] = Query(None, description="Filter by type: private or government"),
    insurance: Optional[str] = Query(None, description="Filter by accepted insurance network"),
    query: Optional[str] = Query(None, description="Free-text search on name/address"),
):
    """Smart hospital discovery — search & filter nearby hospitals"""
    result = []
    for h in MOCK_HOSPITALS:
        dist = _haversine(lat, lng, h["lat"], h["lng"])
        if dist > radius_km:
            continue

        # Specialty filter
        if specialty and specialty.lower() not in [s.lower() for s in h["specialties"]]:
            continue

        # Type filter
        if hospital_type and h["type"] != hospital_type.lower():
            continue

        # Insurance filter
        if insurance and insurance.lower() not in [i.lower() for i in h["accepted_insurance"]]:
            continue

        # Free-text search
        if query:
            q = query.lower()
            if q not in h["name"].lower() and q not in h["address"].lower():
                continue

        result.append({**h, "distance_km": round(dist, 2)})

    result.sort(key=lambda x: x["distance_km"])
    return {"hospitals": result, "count": len(result), "filters_applied": {
        "specialty": specialty, "hospital_type": hospital_type,
        "insurance": insurance, "query": query
    }}


# ─────────────────────────────────────────────
# GET /api/hospital/{id}
# ─────────────────────────────────────────────
@router.get("/{hospital_id}")
async def get_hospital(hospital_id: str):
    """Get hospital details"""
    hospital = next((h for h in MOCK_HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital


# ─────────────────────────────────────────────
# GET /api/hospital/{id}/er-status (legacy)
# ─────────────────────────────────────────────
@router.get("/{hospital_id}/er-status")
async def get_er_status(hospital_id: str):
    """Get real-time ER bed availability"""
    hospital = next((h for h in MOCK_HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    pct = int(hospital["er_beds_available"] / hospital["er_beds_total"] * 100)
    return {
        "hospital_id": hospital_id,
        "hospital_name": hospital["name"],
        "er_beds_total": hospital["er_beds_total"],
        "er_beds_available": hospital["er_beds_available"],
        "occupancy_percent": 100 - pct,
        "availability_status": "high" if pct > 50 else "medium" if pct > 20 else "critical",
        "active_specialists": hospital["active_specialists"],
    }


# ─────────────────────────────────────────────
# GET /api/hospital/{id}/er-dashboard
# ─────────────────────────────────────────────
@router.get("/{hospital_id}/er-dashboard")
async def get_er_dashboard(hospital_id: str):
    """Full real-time ER & ICU dashboard"""
    hospital = next((h for h in MOCK_HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    er_pct = int(hospital["er_beds_available"] / hospital["er_beds_total"] * 100)
    icu_pct = int(hospital["icu_beds_available"] / hospital["icu_beds_total"] * 100)

    return {
        "hospital_id": hospital_id,
        "hospital_name": hospital["name"],
        "er_beds_total": hospital["er_beds_total"],
        "er_beds_available": hospital["er_beds_available"],
        "er_occupancy_percent": 100 - er_pct,
        "icu_beds_total": hospital["icu_beds_total"],
        "icu_beds_available": hospital["icu_beds_available"],
        "icu_occupancy_percent": 100 - icu_pct,
        "er_wait_minutes": hospital["er_wait_minutes"],
        "availability_status": "high" if er_pct > 50 else "medium" if er_pct > 20 else "critical",
        "on_call_specialists": hospital["on_call_specialists"],
        "trauma_level": hospital["trauma_level"],
        "has_helipad": hospital["has_helipad"],
        "has_blood_bank": hospital["has_blood_bank"],
        "last_updated": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────
# POST /api/hospital/{id}/pre-arrival-alert
# ─────────────────────────────────────────────
class PreArrivalAlertRequest(BaseModel):
    triage_level: str = "critical"
    eta_minutes: int = 10
    transport_mode: str = "ambulance"
    sos_id: Optional[str] = None
    patient_name: Optional[str] = "Priya Sharma"
    blood_group: Optional[str] = "B+"
    allergies: Optional[list] = ["Penicillin", "Sulfa drugs"]


@router.post("/{hospital_id}/pre-arrival-alert")
async def send_pre_arrival_alert(hospital_id: str, alert: PreArrivalAlertRequest):
    """
    Pre-Arrival ER Alert — transmits patient Digital Health Profile
    and live ETA to the destination hospital's ER desk.
    """
    hospital = next((h for h in MOCK_HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Build the prep team based on triage level
    prep_team = []
    if alert.triage_level in ("critical", "high"):
        prep_team = [
            "ER Attending Physician",
            "Trauma Nurse (Lead)",
            "Anesthesiologist (Standby)",
            "Lab Technician (STAT orders)",
        ]
    else:
        prep_team = ["ER Resident", "Triage Nurse"]

    er_bay = f"ER Bay {random.choice(['A1', 'A2', 'B1', 'B3', 'C1'])}"

    return {
        "alert_id": f"alert_{uuid.uuid4().hex[:8]}",
        "hospital_id": hospital_id,
        "hospital_name": hospital["name"],
        "status": "acknowledged",
        "message": f"Pre-arrival alert received by {hospital['name']} ER desk",
        "prep_team": prep_team,
        "er_bay_assigned": er_bay,
        "patient_profile_received": True,
        "triage_level": alert.triage_level,
        "estimated_arrival": f"{alert.eta_minutes} minutes",
        "transport_mode": alert.transport_mode,
        "acknowledged_at": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────
# GET /api/hospital/{id}/route
# ─────────────────────────────────────────────
@router.get("/{hospital_id}/route")
async def get_hospital_route(
    hospital_id: str,
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lng: float = Query(..., description="Origin longitude"),
):
    """Get routing metadata: distance, duration, traffic condition"""
    hospital = next((h for h in MOCK_HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    dist = _haversine(origin_lat, origin_lng, hospital["lat"], hospital["lng"])

    # Simulate traffic-aware travel time
    # Average urban speed: 25-40 km/h depending on traffic
    traffic = random.choice(["clear", "moderate", "heavy"])
    speed_map = {"clear": 40, "moderate": 25, "heavy": 15}
    speed = speed_map[traffic]
    duration = (dist / speed) * 60  # minutes

    return {
        "hospital_id": hospital_id,
        "hospital_name": hospital["name"],
        "origin": {"lat": origin_lat, "lng": origin_lng},
        "destination": {"lat": hospital["lat"], "lng": hospital["lng"]},
        "distance_km": round(dist, 2),
        "duration_minutes": round(duration, 1),
        "traffic_condition": traffic,
        "google_maps_url": f"https://www.google.com/maps/dir/{origin_lat},{origin_lng}/{hospital['lat']},{hospital['lng']}",
        "calculated_at": datetime.utcnow().isoformat(),
    }
