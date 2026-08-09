"""
LifeLink AI — Doctor / Blood / Pharmacy / Lab / Family routers
"""
import uuid
import math
from fastapi import APIRouter, Query
from datetime import datetime

# ─────────────────────────────────────────────
# DOCTOR ROUTER
# ─────────────────────────────────────────────
doctor_router = APIRouter(prefix="/api/doctor", tags=["Doctor On-Call"])

MOCK_DOCTORS = [
    {"id": "doc_001", "name": "Dr. Meera Nair", "specialization": "General Physician",
     "hospital_name": "Apollo Hospitals", "is_on_call": True, "status": "available",
     "consultation_fee": 800, "rating": 4.9, "video_call_available": True, "experience_years": 14,
     "license_number": "MCI-2010-48291"},
    {"id": "doc_002", "name": "Dr. Arjun Kapoor", "specialization": "Emergency Medicine",
     "hospital_name": "Max Hospital", "is_on_call": True, "status": "available",
     "consultation_fee": 1200, "rating": 4.7, "video_call_available": True, "experience_years": 9,
     "license_number": "MCI-2015-72011"},
    {"id": "doc_003", "name": "Dr. Preethi Suresh", "specialization": "Cardiologist",
     "hospital_name": "Fortis Escorts", "is_on_call": False, "status": "busy",
     "consultation_fee": 2000, "rating": 4.8, "video_call_available": False, "experience_years": 18,
     "license_number": "MCI-2008-30102"},
    {"id": "doc_004", "name": "Dr. Rajesh Menon", "specialization": "Pulmonologist",
     "hospital_name": "AIIMS Delhi", "is_on_call": True, "status": "available",
     "consultation_fee": 1500, "rating": 4.6, "video_call_available": True, "experience_years": 12,
     "license_number": "MCI-2012-55890"},
]

@doctor_router.get("/on-call")
async def get_on_call_doctors():
    available = [d for d in MOCK_DOCTORS if d["status"] == "available"]
    return {"doctors": MOCK_DOCTORS, "available_count": len(available)}

@doctor_router.get("/family-doctor/{user_id}")
async def get_family_doctor(user_id: str):
    return {"family_doctor": MOCK_DOCTORS[0], "pre_registered": True}

@doctor_router.post("/family-doctor")
async def register_family_doctor(doctor_id: str):
    doc = next((d for d in MOCK_DOCTORS if d["id"] == doctor_id), None)
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Family doctor registered", "doctor": doc}

@doctor_router.post("/session/create")
async def create_session(doctor_id: str, user_id: str = "usr_demo"):
    session_id = str(uuid.uuid4())
    return {
        "session_id": session_id,
        "doctor_id": doctor_id,
        "user_id": user_id,
        "webrtc_room": f"lifelink-{session_id[:8]}",
        "created_at": datetime.utcnow().isoformat(),
        "status": "waiting",
    }

@doctor_router.post("/session/{session_id}/join")
async def join_session(session_id: str):
    return {
        "session_id": session_id,
        "webrtc_room": f"lifelink-{session_id[:8]}",
        "joined_at": datetime.utcnow().isoformat(),
        "status": "connected",
    }




def _haversine(lat1, lng1, lat2, lng2) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1); dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


# ─────────────────────────────────────────────
# PHARMACY ROUTER
# ─────────────────────────────────────────────
pharmacy_router = APIRouter(prefix="/api/pharmacy", tags=["Pharmacy"])

GENERIC_MAP = {
    "ventolin": "Salbutamol Inhaler",
    "crocin": "Paracetamol 500mg",
    "augmentin": "Amoxicillin 500mg",
    "glucophage": "Metformin 500mg",
    "pan40": "Pantoprazole 40mg",
}

MOCK_PHARMACIES = [
    {"id": "pharm_001", "name": "Apollo Pharmacy", "address": "Sarita Vihar Market",
     "lat": 28.5350, "lng": 77.2680, "phone": "+91 11 4567 8901", "is_24h": True, "rating": 4.5,
     "medicines": [
         {"name": "Ventolin", "available": True, "quantity": 5, "price": 450},
         {"name": "Salbutamol Inhaler", "available": True, "quantity": 12, "price": 180},
         {"name": "Crocin", "available": True, "quantity": 30, "price": 50},
         {"name": "Paracetamol 500mg", "available": True, "quantity": 50, "price": 25},
         {"name": "Amoxicillin 500mg", "available": False},
         {"name": "Metformin 500mg", "available": True, "quantity": 30, "price": 65},
     ]},
    {"id": "pharm_002", "name": "MedPlus Pharmacy", "address": "Okhla Phase 1",
     "lat": 28.5280, "lng": 77.2770, "phone": "+91 11 2233 4455", "is_24h": False, "rating": 4.2,
     "medicines": [
         {"name": "Salbutamol Inhaler", "available": True, "quantity": 5, "price": 175},
         {"name": "Augmentin", "available": True, "quantity": 10, "price": 280},
         {"name": "Amoxicillin 500mg", "available": True, "quantity": 20, "price": 120},
         {"name": "Pan40", "available": True, "quantity": 25, "price": 140},
         {"name": "Pantoprazole 40mg", "available": True, "quantity": 45, "price": 55},
     ]},
]

@pharmacy_router.get("/nearby")
async def get_nearby_pharmacies(lat: float = Query(...), lng: float = Query(...)):
    result = []
    for p in MOCK_PHARMACIES:
        dist = _haversine(lat, lng, p["lat"], p["lng"])
        result.append({**p, "distance_km": round(dist, 2)})
    result.sort(key=lambda x: x["distance_km"])
    return {"pharmacies": result}

@pharmacy_router.get("/search")
async def search_medicine(medicine: str = Query(...)):
    results = []
    generic_alternatives = []
    
    # Check if the query matches a branded drug that has a generic alternative
    generic_name = GENERIC_MAP.get(medicine.lower())

    for p in MOCK_PHARMACIES:
        for m in p["medicines"]:
            # Exact match (branded or generic)
            if medicine.lower() in m["name"].lower():
                results.append({**m, "pharmacy_id": p["id"], "pharmacy_name": p["name"]})
            # Generic match
            elif generic_name and generic_name.lower() in m["name"].lower():
                generic_alternatives.append({**m, "pharmacy_id": p["id"], "pharmacy_name": p["name"], "is_generic_alternative": True})
                
    return {
        "results": results,
        "generic_alternatives": generic_alternatives,
        "generic_name": generic_name,
        "query": medicine
    }

@pharmacy_router.get("/{pharmacy_id}/inventory")
async def get_inventory(pharmacy_id: str):
    p = next((ph for ph in MOCK_PHARMACIES if ph["id"] == pharmacy_id), None)
    if not p:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    return {"pharmacy_id": pharmacy_id, "name": p["name"], "medicines": p["medicines"], "is_24h": p["is_24h"]}


# ─────────────────────────────────────────────
# LAB ROUTER
# ─────────────────────────────────────────────
lab_router = APIRouter(prefix="/api/labs", tags=["Diagnostic Labs"])

MOCK_LABS = [
    {"id": "lab_001", "name": "Dr. Lal PathLabs", "address": "Sarita Vihar, New Delhi",
     "lat": 28.5345, "lng": 77.2695, "rating": 4.6, "phone": "+91 11 3988 7654",
     "open_time": "07:00", "close_time": "21:00",
     "tests": [
         {"id": "t_001", "name": "Complete Blood Count (CBC)", "price": 350, "turnaround": "6 hours", "available": True},
         {"id": "t_002", "name": "HbA1c (Diabetes)", "price": 500, "turnaround": "4 hours", "available": True},
         {"id": "t_003", "name": "Lipid Profile", "price": 600, "turnaround": "8 hours", "available": True},
         {"id": "t_004", "name": "Thyroid (TSH, T3, T4)", "price": 800, "turnaround": "12 hours", "available": True},
     ]},
]

_bookings: dict = {}

@lab_router.get("/nearby")
async def get_nearby_labs(lat: float = Query(...), lng: float = Query(...)):
    result = []
    for lab in MOCK_LABS:
        dist = _haversine(lat, lng, lab["lat"], lab["lng"])
        result.append({**lab, "distance_km": round(dist, 2)})
    return {"labs": result}

@lab_router.get("/{lab_id}/tests")
async def get_lab_tests(lab_id: str):
    lab = next((l for l in MOCK_LABS if l["id"] == lab_id), None)
    if not lab:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Lab not found")
    return {"lab_id": lab_id, "name": lab["name"], "tests": lab["tests"]}

@lab_router.post("/book")
async def book_lab_test(lab_id: str, test_id: str, slot_time: str, user_id: str = "usr_demo"):
    booking_id = str(uuid.uuid4())
    lab = next((l for l in MOCK_LABS if l["id"] == lab_id), None)
    test = next((t for l in MOCK_LABS for t in l["tests"] if t["id"] == test_id), None)
    booking = {
        "id": booking_id, "lab_id": lab_id, "test_id": test_id,
        "lab_name": lab["name"] if lab else "Unknown",
        "test_name": test["name"] if test else "Unknown",
        "slot_time": slot_time,
        "status": "confirmed",
        "price": test["price"] if test else 0,
        "booking_date": datetime.utcnow().isoformat(),
    }
    _bookings[booking_id] = booking
    return booking

@lab_router.get("/bookings")
async def get_bookings():
    return {"bookings": list(_bookings.values())}


# ─────────────────────────────────────────────
# FAMILY ROUTER
# ─────────────────────────────────────────────
family_router = APIRouter(prefix="/api/family", tags=["Family Dashboard"])

MOCK_FAMILY = {
    "group_id": "grp_001",
    "name": "Sharma Family",
    "owner_id": "usr_demo",
    "members": [
        {"id": "fam_001", "name": "Rahul Sharma", "relationship": "Husband", "blood_group": "O+",
         "age": 36, "phone": "+91 99001 12233", "status": "safe", "last_seen": "2 min ago"},
        {"id": "fam_002", "name": "Aarav Sharma", "relationship": "Son", "blood_group": "B+",
         "age": 8, "status": "safe", "last_seen": "5 min ago"},
        {"id": "fam_003", "name": "Sunita Sharma", "relationship": "Mother", "blood_group": "A+",
         "age": 62, "phone": "+91 98765 00001", "status": "unknown", "last_seen": "2 hrs ago"},
    ]
}

@family_router.get("/group")
async def get_family_group():
    return MOCK_FAMILY

@family_router.post("/group")
async def create_family_group(name: str):
    return {"group_id": str(uuid.uuid4()), "name": name, "owner_id": "usr_demo", "members": []}

@family_router.post("/group/invite")
async def invite_member(phone: str, relationship: str):
    # In prod: send SMS invite
    return {"sent": True, "phone": phone, "relationship": relationship, "message": "Invite sent via SMS"}

@family_router.get("/group/members")
async def get_members():
    return {"members": MOCK_FAMILY["members"]}

@family_router.get("/group/sos-feed")
async def get_sos_feed():
    return {"events": [], "all_safe": True, "last_updated": datetime.utcnow().isoformat()}
