from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_type = Column(String, index=True) # hospital, pharmacy, lab, transport
    name = Column(String, nullable=False)
    address = Column(String)
    contact_email = Column(String)
    license_id = Column(String) # E.g., NABL, DL Number, Hospital Reg
    verification_status = Column(String, default="pending_approval") # pending_approval, verified, rejected
    status = Column(String, default="active")
    
    users = relationship("ProviderUser", back_populates="organization")


class ProviderUser(Base):
    __tablename__ = "provider_users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    auth_id = Column(String, unique=True)
    org_id = Column(String, ForeignKey("organizations.id"))
    role = Column(String, nullable=False) # admin, doctor, tech, driver
    full_name = Column(String)
    license_id = Column(String) # Medical Council, Commercial DL
    verification_status = Column(String, default="pending_approval")
    
    organization = relationship("Organization", back_populates="users")


class ERResource(Base):
    __tablename__ = "er_resources"
    
    hospital_id = Column(String, ForeignKey("organizations.id"), primary_key=True)
    er_wait_minutes = Column(Integer, default=0)
    icu_beds_available = Column(Integer, default=0)
    ventilators_available = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TelehealthSession(Base):
    __tablename__ = "telehealth_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id"))
    doctor_id = Column(String, ForeignKey("provider_users.id"))
    jitsi_room = Column(String)
    status = Column(String, default="scheduled") # scheduled, active, completed
    clinical_notes = Column(String)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class FulfillmentOrder(Base):
    __tablename__ = "fulfillment_orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id"))
    pharmacy_id = Column(String, ForeignKey("organizations.id"))
    prescription_details = Column(String)
    status = Column(String, default="pending")
    referral_fee = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class LabReport(Base):
    __tablename__ = "lab_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id"))
    lab_id = Column(String, ForeignKey("organizations.id"))
    file_url = Column(String)
    test_type = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
