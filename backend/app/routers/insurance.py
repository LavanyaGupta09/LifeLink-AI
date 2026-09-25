from fastapi import APIRouter
from app.services.twilio_service import make_emergency_call, send_emergency_sms
import asyncio

router = APIRouter(prefix="/api/v1/insurance", tags=["Insurance"])

@router.post("/contact")
async def contact_insurance_company():
    """
    Triggers a Twilio phone call and SMS to the insurance company 
    on behalf of the user regarding a claim.
    """
    to_number = "+918700813135"
    
    # Fire and forget the sync Twilio calls in a thread
    await asyncio.to_thread(make_emergency_call, to_number)
    await asyncio.to_thread(
        send_emergency_sms, 
        to_number, 
        "A customer has initiated contact regarding an Insurance Claim (Demo). Please check the LifeLink dashboard."
    )
    
    return {
        "status": "success",
        "message": "Insurance company contacted successfully"
    }
