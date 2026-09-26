import os
import time
import random
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.config import settings

# Import Agora SDK (Token Builder)
try:
    from agora_token_builder import RtcTokenBuilder
except ImportError:
    RtcTokenBuilder = None

agora_router = APIRouter(prefix="/api/agora", tags=["Agora Video Calls"])


class AgoraTokenRequest(BaseModel):
    channel_name: str = Field(..., description="Unique Agora channel name")
    uid: Optional[int] = Field(0, description="User ID (positive integer). If 0 or omitted, a numeric UID will be generated.")
    role: int = Field(1, description="1 = Publisher (broadcaster), 2 = Subscriber (audience)")
    expire_time: Optional[int] = Field(None, description="Expiration time in seconds")


@agora_router.get("/status")
async def agora_status():
    """
    Check Agora configuration status without exposing sensitive credentials.
    """
    app_id = (settings.AGORA_APP_ID or os.getenv("AGORA_APP_ID", "")).strip()
    app_certificate = (settings.AGORA_APP_CERTIFICATE or os.getenv("AGORA_APP_CERTIFICATE", "")).strip()
    has_valid_cert = bool(app_certificate and app_certificate != "YOUR_AGORA_APP_CERTIFICATE")
    has_app_id = bool(app_id and app_id != "YOUR_AGORA_APP_ID")

    return {
        "status": "ready" if (has_app_id and has_valid_cert and RtcTokenBuilder is not None) else "misconfigured",
        "has_app_id": has_app_id,
        "has_app_certificate": has_valid_cert,
        "package_installed": RtcTokenBuilder is not None,
    }


@agora_router.post("/token")
async def generate_agora_token(request: AgoraTokenRequest):
    """
    Generate a secure Agora RTC Token for a video consultation.
    Requires AGORA_APP_ID and AGORA_APP_CERTIFICATE in environment variables.
    """
    app_id = (settings.AGORA_APP_ID or os.getenv("AGORA_APP_ID", "")).strip()
    app_certificate = (settings.AGORA_APP_CERTIFICATE or os.getenv("AGORA_APP_CERTIFICATE", "")).strip()

    if not app_id or app_id == "YOUR_AGORA_APP_ID":
        raise HTTPException(
            status_code=500, 
            detail="Agora App ID is not configured on the server. Please add AGORA_APP_ID to backend/.env"
        )

    if not app_certificate or app_certificate == "YOUR_AGORA_APP_CERTIFICATE":
        raise HTTPException(
            status_code=500,
            detail="Agora App Certificate is not configured on the server. Please add a valid AGORA_APP_CERTIFICATE to backend/.env"
        )

    if RtcTokenBuilder is None:
        raise HTTPException(
            status_code=500, 
            detail="agora-token-builder package is not installed on the server. Please run: pip install agora-token-builder==1.0.0"
        )

    channel_name = request.channel_name.strip()
    if not channel_name:
        raise HTTPException(status_code=400, detail="channel_name cannot be empty.")

    # Standardize UID: must be a positive 32-bit unsigned integer for Agora RTC
    # If 0 or not provided, generate a non-zero UID and return it to ensure client joins with matching UID
    uid = request.uid
    if not uid or uid <= 0:
        uid = random.randint(100000, 999999)

    # Token expiration (configurable, default from settings or 3600s)
    expiration_seconds = request.expire_time or settings.AGORA_TOKEN_EXPIRATION_SECONDS or 3600
    # Bound expiration between 60 seconds and 86400 seconds (24h)
    expiration_seconds = max(60, min(86400, expiration_seconds))

    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_seconds

    # Role 1 = Publisher, Role 2 = Subscriber
    role = request.role if request.role in (1, 2) else 1

    try:
        token = RtcTokenBuilder.buildTokenWithUid(
            app_id, 
            app_certificate, 
            channel_name, 
            uid, 
            role, 
            privilege_expired_ts
        )
        return {
            "token": token,
            "app_id": app_id,
            "channel_name": channel_name,
            "uid": uid,
            "role": role,
            "expires_in": expiration_seconds
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Agora RTC token: {str(e)}")
