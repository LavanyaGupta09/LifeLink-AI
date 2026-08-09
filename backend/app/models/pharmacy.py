"""Pharmacy ORM model"""
import uuid
from sqlalchemy import Column, String, Float, Boolean, JSON
from app.database import Base


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    lat = Column(Float)
    lng = Column(Float)
    phone = Column(String(20))
    is_24h = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    medicines = Column(JSON, default=list)  # [{name, available, quantity, price}]
