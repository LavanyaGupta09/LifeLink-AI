"""
LifeLink AI — AI Router
POST /api/ai/triage       - Symptom analysis → triage result
POST /api/ai/voice-command - Parse voice command → intent
GET  /api/ai/triage/{id}  - Get past triage session
"""
from fastapi import APIRouter, HTTPException
from app.schemas.sos import TriageRequest, TriageResponse
from app.services.ai_service import analyze_symptoms, parse_voice_command

router = APIRouter(prefix="/api/ai", tags=["AI & Triage"])

# In-memory session store (use Redis in production)
_sessions: dict = {}


@router.post("/triage", response_model=TriageResponse)
async def triage(data: TriageRequest):
    """
    AI Symptom Analyzer — returns triage level and recommended action.
    Uses Gemini API if configured, falls back to keyword engine.
    """
    if not data.symptoms or len(data.symptoms.strip()) < 5:
        raise HTTPException(status_code=422, detail="Please provide more symptom details")

    result = await analyze_symptoms(data.symptoms)
    _sessions[result["session_id"]] = result  # Cache for retrieval
    return result


@router.post("/voice-command")
async def voice_command(text: str):
    """Parse voice command and return structured intent"""
    if not text:
        raise HTTPException(status_code=422, detail="Voice text is required")
    return parse_voice_command(text)


@router.get("/triage/{session_id}", response_model=TriageResponse)
async def get_triage_session(session_id: str):
    """Retrieve a previous triage session result"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Triage session not found")
    return session
