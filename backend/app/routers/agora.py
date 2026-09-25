import os
import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.config import settings

# Import Agora SDK (Token Builder)
try:
    from agora_token_builder import RtcTokenBuilder
except ImportError:
    RtcTokenBuilder = None

agora_router = APIRouter(prefix="/api/agora", tags=["Agora Video Calls"])

class AgoraTokenRequest(BaseModel):
    channel_name: str
    uid: int = 0  # 0 means let Agora assign the uid, or client provides it
    role: int = 1 # 1 = Publisher, 2 = Subscriber (Default to publisher for both doctor and patient)

@agora_router.post("/token")
async def generate_agora_token(request: AgoraTokenRequest):
    """
    Generate a temporary Agora RTC Token for a video consultation.
    """
    app_id = os.getenv("AGORA_APP_ID", "")
    app_certificate = os.getenv("AGORA_APP_CERTIFICATE", "")

    if not app_id:
        # In a real app, you shouldn't expose that credentials are missing in the frontend response,
        # but for this demo/setup we return a clear error
        raise HTTPException(
            status_code=500, 
            detail="Agora APP ID not configured on the server."
        )

    if not app_certificate:
        # Testing mode: no certificate, so we don't need a token
        return {
            "token": None,
            "app_id": app_id,
            "channel_name": request.channel_name,
            "uid": request.uid,
            "expires_in": 3600
        }

    if RtcTokenBuilder is None:
        raise HTTPException(
            status_code=500, 
            detail="agora-token-builder is not installed."
        )

    # Token expiration (e.g., 1 hour)
    expiration_time_in_seconds = 3600
    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_time_in_seconds

    try:
        token = RtcTokenBuilder.buildTokenWithUid(
            app_id, 
            app_certificate, 
            request.channel_name, 
            request.uid, 
            request.role, 
            privilege_expired_ts
        )
        return {
            "token": token,
            "app_id": app_id,
            "channel_name": request.channel_name,
            "uid": request.uid,
            "expires_in": expiration_time_in_seconds
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")
