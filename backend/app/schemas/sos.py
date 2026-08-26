"""SOS Pydantic schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SOSTriggerRequest(BaseModel):
    lat: float
    lng: float
    triage_level: str = "critical"
    trigger_method: str = "button"
    address: Optional[str] = None


class SOSStatusResponse(BaseModel):
    id: str
    status: str
    triage_level: Optional[str]
    trigger_method: str
    lat: Optional[float]
    lng: Optional[float]
    address: Optional[str]
    ambulance_id: Optional[str]
    doctor_session_id: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class SOSLocationUpdate(BaseModel):
    lat: float
    lng: float


class TriageRequest(BaseModel):
    symptoms: list[str]
    user_id: Optional[str] = None


class TriageResponse(BaseModel):
    session_id: str
    urgency: str
    possible_factors: list[str]
    recommendation: str
