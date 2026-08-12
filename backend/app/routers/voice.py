from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import parse_voice_intent_ai

router = APIRouter()

class VoiceRequest(BaseModel):
    text: str

@router.post("/parse-intent")
async def parse_intent(data: VoiceRequest):
    """Parses voice text into a structured intent using AI"""
    if not data.text:
        raise HTTPException(status_code=422, detail="Text is required")
    result = await parse_voice_intent_ai(data.text)
    return result
