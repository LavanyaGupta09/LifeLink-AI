from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.database import get_db
from app.services.ai_service import analyze_symptoms
from app.services.telehealth_service import generate_telehealth_session

router = APIRouter(prefix="/api/v1/b2b", tags=["B2B Enterprise Ecosystem"])

# ==========================================
# 0. RBAC MIDDLEWARE
# ==========================================
def require_role(allowed_roles: List[str]):
    async def role_checker(x_provider_role: str = Header("guest")):
        if x_provider_role not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"RBAC Error: Role '{x_provider_role}' is not authorized. Allowed: {allowed_roles}")
        return x_provider_role
    return role_checker

# ==========================================
# 1. HOSPITAL ER DASHBOARD & EHR INTEGRATION
# ==========================================

class FHIRTraumaAlert(BaseModel):
    patient_id: str
    triage_level: str
    condition_summary: str
    eta_minutes: int
    ambulance_id: str

@router.post("/hospital/fhir-ingest")
async def hospital_fhir_ingest(payload: FHIRTraumaAlert, db: AsyncSession = Depends(get_db)):
    """
    EHR/FHIR Ingestion Mock: Direct API route for hospital Electronic Health Record (EHR)
    systems to receive patient trauma alerts securely.
    """
    # Mocking successful FHIR push to hospital system
    return {
        "status": "success",
        "resourceType": "Bundle",
        "message": f"Trauma alert for patient {payload.patient_id} ingested into EHR.",
        "hospital_ack": True
    }

class ResourceUpdate(BaseModel):
    er_wait_minutes: int
    icu_beds_available: int
    ventilators_available: int

@router.put("/hospital/resources", dependencies=[Depends(require_role(["hospital_admin"]))])
async def update_hospital_resources(payload: ResourceUpdate, hospital_id: str = "org_apollo_01", db: AsyncSession = Depends(get_db)):
    """
    Resource Management Interface: Update real-time capacities.
    """
    # In prod, this writes to the ERResource model
    return {"status": "success", "updated_capacities": payload.dict()}


# ==========================================
# 2. INDEPENDENT DOCTOR TELEHEALTH
# ==========================================

@router.post("/doctor/session/{session_id}/join")
async def join_telehealth_session(session_id: str, doctor_id: str = "usr_doc_01"):
    """
    Returns WebRTC credentials for a doctor to join a patient session.
    """
    session = generate_telehealth_session("patient_mock", doctor_id)
    return {"status": "success", "session": session}

class ClinicalNoteReq(BaseModel):
    transcript_text: str

@router.post("/doctor/session/{session_id}/notes/auto-generate", dependencies=[Depends(require_role(["doctor"]))])
async def generate_clinical_notes(session_id: str, payload: ClinicalNoteReq):
    """
    AI Clinical Note Assistant: Runs Gemini 2.5 to parse raw WebRTC transcript audio
    into a structured SOAP clinical note.
    """
    # Re-using the AI triage service logic slightly modified for transcription parsing
    ai_result = await analyze_symptoms(payload.transcript_text)
    
    soap_note = f"""
    SUBJECTIVE: Patient reports {payload.transcript_text[:50]}...
    OBJECTIVE: Vitals stable (Mock).
    ASSESSMENT: {ai_result['triage_level']} - {ai_result['recommended_action']}.
    PLAN: Follow up in 3 days.
    """
    
    return {"status": "success", "soap_note": soap_note}


# ==========================================
# 3. PHARMACY & DIAGNOSTIC LAB
# ==========================================

@router.get("/pharmacy/orders/pending")
async def get_pending_orders(pharmacy_id: str = "org_pharm_01"):
    return {
        "orders": [
            {"id": "ord_01", "patient_id": "usr_demo", "medication": "Amlodipine 5mg", "qty": 30, "referral_fee": 2.50}
        ]
    }

@router.put("/pharmacy/orders/{order_id}/fulfill")
async def fulfill_pharmacy_order(order_id: str):
    return {"status": "success", "message": f"Order {order_id} fulfilled. Referral fee credited."}

@router.post("/lab/upload-report", dependencies=[Depends(require_role(["lab_tech"]))])
async def upload_lab_report(patient_id: str, test_type: str):
    """
    Mock endpoint for Lab portal to directly upload PDFs into patient's Vault.
    In prod, this streams bytes to Supabase Storage.
    """
    return {
        "status": "success", 
        "message": f"{test_type} report uploaded for {patient_id}.",
        "vault_url": f"https://mock-storage.local/vault/{patient_id}/report.pdf"
    }


# ==========================================
# 4. AMBULANCE DISPATCH & DRIVER INTERFACE
# ==========================================

class CADDispatchTrigger(BaseModel):
    lat: float
    lng: float
    severity: str

@router.post("/dispatch/cad-trigger")
async def dispatch_cad_trigger(payload: CADDispatchTrigger):
    """
    Computer-Aided Dispatch (CAD) API: Pushes GPS coordinates to municipal 911.
    """
    return {
        "status": "success",
        "dispatch_id": f"CAD-{uuid.uuid4().hex[:8]}",
        "message": f"911 CAD triggered at {payload.lat}, {payload.lng} for {payload.severity} emergency."
    }

@router.get("/driver/route/{dispatch_id}")
async def get_driver_route(dispatch_id: str, lat: float, lng: float):
    """
    Provides OSRM turn-by-turn navigation data for the Driver Web App.
    """
    # Mock route to nearest hospital
    return {
        "status": "success",
        "dispatch_id": dispatch_id,
        "destination": {"lat": 28.5320, "lng": 77.2650, "name": "Apollo Hospitals"},
        "eta_minutes": 5,
        "distance_km": 2.4
    }
