"""
LifeLink AI — Admin Router
Handles super admin operations like verifying pending provider credentials.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional

from app.services.kyc_validator import kyc_validator
from app.services.notification_service import send_email_alert

router = APIRouter(prefix="/api/v1/admin", tags=["Super Admin"])

class VerifyProviderRequest(BaseModel):
    provider_id: str
    decision: str  # "verified" or "rejected"
    rejection_reason: Optional[str] = None

@router.post("/verify-provider")
async def verify_provider(data: VerifyProviderRequest, background_tasks: BackgroundTasks):
    """
    Super Admin endpoint to manually verify or reject a provider's credentials.
    In a real DB, this would update the user table where id = data.provider_id.
    """
    if data.decision not in ["verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Decision must be 'verified' or 'rejected'")
        
    # Mocking database update
    print(f"[DB_MOCK] Updated provider {data.provider_id} status to {data.decision}")
    
    # Send notification via background task
    if data.decision == "verified":
        message = "Welcome to LifeLink AI. Your credentials have been verified. You can now access the network."
    else:
        reason = data.rejection_reason or "Documents unclear."
        message = f"Verification failed. Reason: {reason}. Please upload a valid document."
        
    # We don't have the user's email here in the mock, so we use a dummy
    background_tasks.add_task(
        send_email_alert,
        to_email="test@example.com", 
        subject="Provider Verification",
        html_body=message
    )
    
    return {
        "status": "success",
        "message": f"Provider {data.provider_id} {data.decision}",
        "decision": data.decision
    }
