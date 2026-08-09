"""Hospital ORM model"""
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON
from app.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    lat = Column(Float)
    lng = Column(Float)
    phone = Column(String(20))
    er_beds_total = Column(Integer, default=0)
    er_beds_available = Column(Integer, default=0)
    active_specialists = Column(JSON, default=list)
    rating = Column(Float, default=0.0)
    is_partner = Column(Boolean, default=False)
