"""Blood Donor ORM model"""
import uuid
import enum
from sqlalchemy import Column, String, Float, Boolean, Date, ForeignKey, Enum
from app.database import Base

class BloodGroupEnum(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    O_POS = "O+"
    O_NEG = "O-"
    AB_POS = "AB+"
    AB_NEG = "AB-"

class BloodDonor(Base):
    __tablename__ = "blood_donors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    blood_group = Column(Enum(BloodGroupEnum), nullable=False, index=True)
    last_donated_date = Column(Date, nullable=True)
    is_available = Column(Boolean, default=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    city = Column(String(100), nullable=True)
