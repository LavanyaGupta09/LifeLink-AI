"""SOS Event ORM model"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum
from app.database import Base


class SOSEvent(Base):
    __tablename__ = "sos_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(SAEnum("active", "resolved", "false_alarm", "cancelled", name="sos_status"), default="active")
    triage_level = Column(SAEnum("low", "medium", "high", "critical", name="triage_level_enum"), nullable=True)
    trigger_method = Column(SAEnum("button", "voice", "hardware", name="trigger_enum"), default="button")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    ambulance_id = Column(String(36), nullable=True)
    doctor_session_id = Column(String(36), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
