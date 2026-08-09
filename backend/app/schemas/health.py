"""Health profile Pydantic schemas"""
from pydantic import BaseModel, field_validator
from typing import List, Optional, Literal
from datetime import datetime


BloodGroup = Literal["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

class HealthProfileUpdate(BaseModel):
    blood_group: Optional[BloodGroup] = None
    blood_pressure: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    organ_donor: Optional[bool] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None

    @field_validator('blood_pressure')
    def validate_blood_pressure(cls, v):
        if v is None:
            return v
        if '/' not in v:
            raise ValueError("Blood pressure must be in SYS/DIA format")
        try:
            sys, dia = map(int, v.split('/'))
        except ValueError:
            raise ValueError("Systolic and Diastolic values must be integers")
        if not (50 <= sys <= 250):
            raise ValueError("Systolic value must be between 50 and 250")
        if not (30 <= dia <= 150):
            raise ValueError("Diastolic value must be between 30 and 150")
        return v


class HealthProfileOut(BaseModel):
    id: str
    user_id: str
    blood_group: Optional[str]
    blood_pressure: Optional[str] = None
    allergies: List[str]
    chronic_conditions: List[str]
    current_medications: List[str]
    organ_donor: bool
    insurance_provider: Optional[str]
    insurance_number: Optional[str]
    qr_token: Optional[str]
    qr_generated_at: Optional[datetime]

    class Config:
        from_attributes = True


class QRVerifyRequest(BaseModel):
    token: str


class HospitalOut(BaseModel):
    id: str
    name: str
    address: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    phone: Optional[str]
    er_beds_total: int
    er_beds_available: int
    active_specialists: List[str]
    rating: float
    is_partner: bool
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class BloodDonorOut(BaseModel):
    id: str
    blood_group: str
    is_available: bool
    city: Optional[str]
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class PharmacyOut(BaseModel):
    id: str
    name: str
    address: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    phone: Optional[str]
    is_24h: bool
    rating: float
    medicines: list
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True
