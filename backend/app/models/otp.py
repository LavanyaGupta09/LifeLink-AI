"""OTP ORM model"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer

from app.database import Base


class OTP(Base):
    __tablename__ = "otps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_identifier = Column(String(255), index=True, nullable=False)
    otp_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    attempt_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_invalidated = Column(Boolean, default=False)
