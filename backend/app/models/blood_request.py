import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Enum, DateTime
from datetime import datetime
from app.database import Base
from app.models.blood_donor import BloodGroupEnum

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    request_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    hospital_id = Column(String(36), nullable=True)
    required_blood_group = Column(Enum(BloodGroupEnum), nullable=False)
    units_needed = Column(Integer, default=1)
    urgency_level = Column(String(50), default="High")
    status = Column(String(50), default="open")  # open / fulfilled
    created_at = Column(DateTime, default=datetime.utcnow)
