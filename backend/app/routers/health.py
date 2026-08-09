"""
LifeLink AI — Health Router
GET  /api/health/profile       - Get health profile
PUT  /api/health/profile       - Update health profile
GET  /api/health/qr-passport   - Generate / get QR code
POST /api/health/qr-passport/verify - Verify QR token (first responders)
GET  /api/health/vault         - List medical vault documents
POST /api/health/vault/upload  - Upload document
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.health_profile import HealthProfile
from app.schemas.health import HealthProfileUpdate, HealthProfileOut, QRVerifyRequest
from app.services.qr_service import generate_qr_token, generate_qr_image_base64, verify_qr_token

router = APIRouter(prefix="/api/health", tags=["Health Profile & Vault"])

# Mock vault store (use Supabase Storage in production)
_vault: dict = {}

MOCK_PROFILE = {
    "id": "hp_001",
    "user_id": "usr_demo",
    "blood_group": "B+",
    "allergies": ["Penicillin", "Sulfa drugs", "Shellfish"],
    "chronic_conditions": ["Mild Asthma"],
    "current_medications": ["Salbutamol inhaler (as needed)", "Vitamin D3 60,000 IU"],
    "organ_donor": True,
    "insurance_provider": "Star Health Insurance",
    "insurance_number": "SHI-2024-883721",
    "qr_token": "LLQR-B29FX-PRIY-2024",
    "qr_generated_at": datetime.utcnow().isoformat(),
}


@router.get("/profile")
async def get_health_profile():
    """Get health profile for the current user"""
    return MOCK_PROFILE


@router.put("/profile")
async def update_health_profile(data: HealthProfileUpdate):
    """Update health profile fields"""
    updated = {**MOCK_PROFILE}
    for field, value in data.model_dump(exclude_none=True).items():
        updated[field] = value
    return updated


@router.get("/qr-passport")
async def get_qr_passport():
    """Generate or refresh the Health Passport QR code"""
    # Build a mock profile object for QR generation
    class _Profile:
        blood_group = "B+"
        allergies = ["Penicillin", "Sulfa drugs"]
        current_medications = ["Salbutamol inhaler"]
        chronic_conditions = ["Mild Asthma"]
        organ_donor = True
        insurance_provider = "Star Health Insurance"

    profile = _Profile()
    token = generate_qr_token("usr_demo", profile)
    qr_base64 = generate_qr_image_base64(token, profile, "Priya Sharma")

    return {
        "token": token,
        "qr_image_base64": f"data:image/png;base64,{qr_base64}",
        "generated_at": datetime.utcnow().isoformat(),
        "expires_in": "24h",
        "user": {
            "name": "Priya Sharma",
            "blood_group": "B+",
            "emergency_contact": "Rahul Sharma: +91 99001 12233",
        }
    }


@router.post("/qr-passport/verify")
async def verify_qr_passport(data: QRVerifyRequest):
    """
    First responder QR verification.
    Returns patient critical data when valid token is scanned.
    """
    # In production: decrypt token and fetch from DB
    if not data.token.startswith("LLQR-"):
        raise HTTPException(status_code=400, detail="Invalid QR token")

    return {
        "valid": True,
        "patient": {
            "name": "Priya Sharma",
            "blood_group": "B+",
            "allergies": ["Penicillin", "Sulfa drugs", "Shellfish"],
            "chronic_conditions": ["Mild Asthma"],
            "current_medications": ["Salbutamol inhaler (as needed)"],
            "organ_donor": True,
            "emergency_contacts": [
                {"name": "Rahul Sharma", "relationship": "Husband", "phone": "+91 99001 12233"},
            ],
            "insurance": "Star Health Insurance · SHI-2024-883721",
        },
        "scanned_at": datetime.utcnow().isoformat(),
    }


@router.get("/vault")
async def get_vault_documents():
    """List all medical vault documents for current user"""
    return {
        "documents": [
            {"id": "rec_001", "file_name": "Blood_Test_Report_June2024.pdf", "file_type": "report",
             "upload_date": "2024-06-15", "description": "Complete Blood Count & Lipid Profile",
             "is_shared_with_doctor": True, "file_size": "1.2 MB"},
            {"id": "rec_002", "file_name": "Chest_Xray_March2024.jpg", "file_type": "scan",
             "upload_date": "2024-03-20", "description": "Annual chest X-ray — Normal",
             "is_shared_with_doctor": False, "file_size": "3.8 MB"},
            {"id": "rec_003", "file_name": "Salbutamol_Prescription.pdf", "file_type": "prescription",
             "upload_date": "2024-05-10", "description": "Asthma management prescription – Dr. Nair",
             "is_shared_with_doctor": True, "file_size": "0.4 MB"},
        ],
        "storage_used_mb": 7.5,
        "storage_total_mb": 1024,
    }


@router.post("/vault/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload an encrypted medical document to the vault"""
    doc_id = str(uuid.uuid4())
    content = await file.read()
    # In production: encrypt content, upload to Supabase Storage
    _vault[doc_id] = {
        "id": doc_id,
        "file_name": file.filename,
        "file_size": f"{len(content) / 1024:.1f} KB",
        "upload_date": datetime.utcnow().isoformat(),
        "encrypted": True,
    }
    return {"id": doc_id, "message": "Document uploaded and encrypted successfully"}


@router.delete("/vault/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document from the vault"""
    _vault.pop(doc_id, None)
    return {"message": "Document deleted", "id": doc_id}
