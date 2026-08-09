"""Health Profile ORM model"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from app.database import Base


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    blood_group = Column(String(5), nullable=True)
    allergies = Column(JSON, default=list)
    chronic_conditions = Column(JSON, default=list)
    current_medications = Column(JSON, default=list)
    organ_donor = Column(Boolean, default=False)
    insurance_provider = Column(String(255), nullable=True)
    insurance_number = Column(String(100), nullable=True)
    qr_token = Column(String(512), unique=True, nullable=True)
    qr_generated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
