"""Doctor ORM model"""
import uuid
from sqlalchemy import Column, String, Float, Boolean, Integer, ForeignKey
from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    specialization = Column(String(255))
    license_number = Column(String(100), unique=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=True)
    is_on_call = Column(Boolean, default=False)
    status = Column(String(20), default="offline")   # available | busy | offline
    consultation_fee = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    video_call_available = Column(Boolean, default=True)
    experience_years = Column(Integer, default=0)
