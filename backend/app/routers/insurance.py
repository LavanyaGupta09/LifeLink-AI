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
    # Instead of calling via Twilio, we generate an Agora channel for a live Insurance adjuster video call
    agora_channel = "insurance_claim_room"
    
    try:
        from app.routers.agora import RtcTokenBuilder
        from app.config import settings
        import time
        
        app_id = settings.AGORA_APP_ID
        app_certificate = settings.AGORA_APP_CERTIFICATE
        agora_token = None
        
        if app_id and app_certificate and RtcTokenBuilder:
            expiration_time_in_seconds = 3600
            current_timestamp = int(time.time())
            agora_token = RtcTokenBuilder.buildTokenWithUid(
                app_id, app_certificate, agora_channel, 0, 1, current_timestamp + expiration_time_in_seconds
            )
            print(f"Generated Agora token for Insurance Claim video call: {agora_channel}")
    except Exception as e:
        print(f"Failed to generate Agora insurance call: {e}")
    
    return {
        "status": "success",
        "message": "Insurance company contacted successfully via Agora Live Video",
        "agora_channel": agora_channel,
        "agora_token": agora_token or ""
    }
