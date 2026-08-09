import uuid
from typing import Dict, Any
from app.config import settings

def generate_telehealth_session(patient_id: str, doctor_id: str) -> Dict[str, Any]:
    """
    Generates a free WebRTC session utilizing Jitsi and Google STUN.
    """
    room_id = f"LifeLink_Consult_{uuid.uuid4().hex[:12]}"
    
    # We can always construct a Jitsi Meet link freely, even without a key
    jitsi_url = f"https://{settings.JITSI_DOMAIN}/{room_id}"

    # Return signaling metadata
    return {
        "room_id": room_id,
        "join_url": jitsi_url,
        "webrtc_config": {
            "iceServers": [
                {"urls": settings.STUN_SERVER_1}
            ]
        },
        "provider": "jitsi-webrtc-free"
    }
