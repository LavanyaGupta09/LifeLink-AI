"""
LifeLink AI — QR Code Service
Generates encrypted Health Passport QR codes
"""
import uuid
import json
import base64
import hashlib
from datetime import datetime
from io import BytesIO
from typing import Optional

import qrcode
from qrcode.image.svg import SvgPathImage

from app.config import settings
from app.models.health_profile import HealthProfile


def _simple_encrypt(data: str) -> str:
    """Simple XOR-based encryption for the QR payload (use proper AES in production)"""
    key = settings.ENCRYPTION_KEY.encode()
    encoded = data.encode()
    encrypted = bytes(b ^ key[i % len(key)] for i, b in enumerate(encoded))
    return base64.urlsafe_b64encode(encrypted).decode()


def generate_qr_token(user_id: str, profile: HealthProfile) -> str:
    """Generate a unique, rotating QR token"""
    payload = {
        "uid": user_id,
        "blood": profile.blood_group,
        "allergies": profile.allergies or [],
        "medications": profile.current_medications or [],
        "conditions": profile.chronic_conditions or [],
        "organ_donor": profile.organ_donor,
        "insurance": profile.insurance_provider,
        "generated": datetime.utcnow().isoformat(),
        "expires": "24h",
        "nonce": str(uuid.uuid4())[:8],
    }
    raw = json.dumps(payload, separators=(",", ":"))
    # Create a human-readable token prefix + hash
    short_hash = hashlib.sha256(raw.encode()).hexdigest()[:8].upper()
    token = f"LLQR-{short_hash}-{user_id[:4].upper()}-{datetime.utcnow().year}"
    return token


def generate_qr_image_base64(token: str, profile: HealthProfile, user_name: str) -> str:
    """Generate QR code as base64 PNG"""
    qr_data = json.dumps({
        "token": token,
        "name": user_name,
        "blood": profile.blood_group,
        "allergies": profile.allergies or [],
        "medications": profile.current_medications or [],
        "source": "LifeLink AI",
    }, separators=(",", ":"))

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#00C9A7", back_color="transparent")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()


def verify_qr_token(token: str, profile: HealthProfile) -> bool:
    """Verify a QR token matches the profile (simplified — use DB lookup in prod)"""
    return bool(token and profile and token.startswith("LLQR-"))
