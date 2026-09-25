from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import base64
import json
import httpx
import traceback

from app.config import settings

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


PRESCRIPTION_PARSE_PROMPT = """You are a medical prescription parser AI. Analyze this prescription image carefully and extract ALL medicines mentioned.

For EACH medicine found, extract:
1. **medicine_name**: The exact medicine name
2. **dosage**: The dosage (e.g., "5mg", "500mg", "10ml")
3. **frequency**: How often to take it (e.g., "Once daily", "Twice daily", "Three times daily", "As needed")
4. **time_slots**: An array of time objects. Each object has:
   - "time": in HH:MM 24-hour format (e.g., "08:00", "14:00", "20:00"). Infer reasonable times based on frequency:
     - Once daily morning → "08:00"
     - Once daily night → "22:00"
     - Twice daily → "08:00" and "20:00"
     - Three times daily → "08:00", "14:00", "20:00"
   - "timing": one of "Before Food", "After Food", or "Anytime"
5. **is_critical**: true if the medicine is for a serious/chronic condition (heart, diabetes, blood pressure, seizures, etc.), false otherwise

IMPORTANT: Return ONLY a valid JSON array. No markdown, no code fences, no explanation. Just the raw JSON array.

Example output format:
[
  {
    "medicine_name": "Amlodipine",
    "dosage": "5mg",
    "frequency": "Once daily",
    "time_slots": [{"time": "08:00", "timing": "After Food"}],
    "is_critical": true
  },
  {
    "medicine_name": "Paracetamol",
    "dosage": "500mg",
    "frequency": "Three times daily",
    "time_slots": [{"time": "08:00", "timing": "After Food"}, {"time": "14:00", "timing": "After Food"}, {"time": "20:00", "timing": "After Food"}],
    "is_critical": false
  }
]

If you cannot read the prescription clearly, still try your best to extract whatever is visible. If absolutely nothing is readable, return an empty array: []"""


async def call_groq_vision(image_base64: str, media_type: str) -> dict:
    """Call Groq Vision API to parse prescription image."""
    
    groq_api_key = settings.GROQ_API_KEY
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured in backend .env")
    
    # Try models in order of capability
    models = ["llama-3.2-90b-vision-preview", "llama-3.2-11b-vision-preview"]
    
    for model in models:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": PRESCRIPTION_PARSE_PROMPT,
                                    },
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:{media_type};base64,{image_base64}",
                                        },
                                    },
                                ],
                            }
                        ],
                        "temperature": 0.1,
                        "max_tokens": 2048,
                    },
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"].strip()
                    
                    # Clean up response — remove markdown code fences if present
                    if content.startswith("```"):
                        # Remove ```json or ``` at start and ``` at end
                        lines = content.split("\n")
                        lines = [l for l in lines if not l.strip().startswith("```")]
                        content = "\n".join(lines)
                    
                    # Parse the JSON
                    medicines = json.loads(content)
                    
                    if not isinstance(medicines, list):
                        medicines = [medicines]
                    
                    return {"status": "success", "medicines": medicines, "model_used": model}
                
                elif response.status_code == 429:
                    # Rate limited, try next model
                    print(f"Groq rate limited on {model}, trying next...")
                    continue
                else:
                    error_detail = response.text
                    print(f"Groq API error with {model}: {response.status_code} - {error_detail}")
                    continue
                    
        except json.JSONDecodeError as e:
            print(f"Failed to parse Groq response as JSON with {model}: {e}")
            print(f"Raw content: {content}")
            continue
        except Exception as e:
            print(f"Error calling Groq with {model}: {e}")
            traceback.print_exc()
            continue
    
    # All models failed
    raise HTTPException(
        status_code=502,
        detail="Could not parse prescription. Groq vision API is unavailable or the image could not be processed. Please try again."
    )


@router.post("/parse-prescription")
async def parse_prescription(file: UploadFile = File(...)):
    """Parse a prescription image using Groq Vision AI (LLaMA 3.2 Vision)."""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    content_type = file.content_type or "image/jpeg"
    
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {content_type}. Please upload a JPEG, PNG, or WebP image."
        )
    
    # Read and encode the image
    file_bytes = await file.read()
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    # Limit file size to 20MB
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")
    
    image_base64 = base64.b64encode(file_bytes).decode("utf-8")
    
    # Call Groq Vision API
    result = await call_groq_vision(image_base64, content_type)
    
    return result


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
