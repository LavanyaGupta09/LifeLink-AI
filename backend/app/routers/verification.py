import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.config import settings
from app.services.abdm_mock_service import abdm_mock_service

router = APIRouter(prefix="/api/v1/verification", tags=["Verification"])

class SubmitCredentialsRequest(BaseModel):
    provider_id: str
    license_id: str
    document_url: str
    provider_type: str = "doctor" # e.g. "doctor", "hospital", "ambulance"

@router.post("/submit-credentials")
async def submit_credentials(payload: SubmitCredentialsRequest):
    """
    Submits provider credentials to the ABDM mock service for verification
    and updates the provider_profiles table in Supabase.
    """
    # 1. Mock ABDM Verification
    if payload.provider_type == "doctor":
        mock_response = await abdm_mock_service.mock_verify_hpr(payload.license_id)
    elif payload.provider_type in ["hospital", "lab", "pharmacy"]:
        mock_response = await abdm_mock_service.mock_verify_hfr(payload.license_id)
    elif payload.provider_type == "ambulance":
        mock_response = await abdm_mock_service.mock_verify_vahan(payload.license_id, "mock_rc_data")
    else:
        # Default to HPR
        mock_response = await abdm_mock_service.mock_verify_hpr(payload.license_id)

    status = mock_response.get("status")

    # Determine Supabase db_status
    if status == "verified":
        db_status = "verified"
    elif status == "rejected":
        db_status = "rejected"
    else:
        db_status = "pending_approval"

    # 2. Update Supabase provider_profiles table
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        url = f"{settings.SUPABASE_URL}/rest/v1/provider_profiles?id=eq.{payload.provider_id}"
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        update_payload = {
            "verification_status": db_status
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.patch(url, json=update_payload, headers=headers)
                resp.raise_for_status()
        except Exception as e:
            print(f"Failed to update Supabase verification_status: {e}")

    # 3. Return response according to status
    if status == "rejected":
        # Return 400 as per instructions
        raise HTTPException(
            status_code=400,
            detail={"status": "rejected", "reason": mock_response.get("reason", "Invalid ID format"), "verification_status": db_status}
        )
    elif status == "verified":
        # Return 200 as per instructions
        return JSONResponse(status_code=200, content={"status": "verified", "verification_status": db_status})
    else:
        # Return 202 as per instructions
        return JSONResponse(status_code=202, content={"status": "pending_manual_verification", "verification_status": db_status})

