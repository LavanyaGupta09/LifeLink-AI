"""Ambulance ORM model"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum, JSON
from app.database import Base


class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_number = Column(String(50), unique=True, nullable=False)
    driver_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=True)
    status = Column(SAEnum("available", "dispatched", "en_route", "at_scene", "returning", name="amb_status"), default="available")
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    last_location_update = Column(DateTime, default=datetime.utcnow)
    equipment = Column(JSON, default=list)
