from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1/reminders", tags=["Reminders"])

class TimeSlot(BaseModel):
    time: str # HH:MM format
    timing: str # Before Food, After Food, etc.

class CreateReminderPayload(BaseModel):
    user_id: str
    medicine_name: str
    dosage: str
    time_slots: List[TimeSlot]
    is_critical: bool
    current_stock: int

class LogAdherencePayload(BaseModel):
    reminder_id: str
    status: str # "taken" | "snoozed" | "missed"
    logged_at: str

@router.post("/parse-prescription")
async def parse_prescription(file: UploadFile = File(...)):
    """Mock OCR parsing of a prescription image using Gemini Vision."""
    # Simulate processing delay
    return {
        "status": "success",
        "medicines": [
            {
                "medicine_name": "Amlodipine",
                "dosage": "5mg",
                "frequency": "Once daily",
                "time_slots": [{"time": "08:00", "timing": "After Food"}],
                "is_critical": True
            },
            {
                "medicine_name": "Metformin",
                "dosage": "500mg",
                "frequency": "Twice daily",
                "time_slots": [
                    {"time": "08:00", "timing": "After Food"},
                    {"time": "20:00", "timing": "After Food"}
                ],
                "is_critical": True
            },
            {
                "medicine_name": "Atorvastatin",
                "dosage": "10mg",
                "frequency": "Once daily",
                "time_slots": [{"time": "22:00", "timing": "After Food"}],
                "is_critical": False
            }
        ]
    }

@router.post("/create")
async def create_reminder(payload: CreateReminderPayload):
    return {
        "status": "success",
        "reminder_id": f"rem_{uuid.uuid4().hex[:8]}",
        "message": "Reminder created successfully"
    }

@router.post("/log-adherence")
async def log_adherence(payload: LogAdherencePayload):
    return {
        "status": "success",
        "message": f"Dose {payload.status} successfully logged"
    }

@router.get("/family-adherence-summary/{user_id}")
async def family_adherence_summary(user_id: str):
    return {
        "user_id": user_id,
        "weekly_adherence_percentage": 94,
        "missed_critical_doses": [
            {
                "medicine": "Amlodipine (5mg)",
                "missed_time": "08:00",
                "escalated_at": "08:30"
            }
        ]
    }
