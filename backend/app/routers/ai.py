"""
LifeLink AI — AI Router
POST /api/ai/triage       - Symptom analysis → triage result
POST /api/ai/voice-command - Parse voice command → intent
GET  /api/ai/triage/{id}  - Get past triage session
"""
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.schemas.sos import TriageRequest, TriageResponse
from app.services.ai_service import analyze_symptoms, parse_voice_command, generic_chat

from typing import List, Dict, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

router = APIRouter(prefix="/api/ai", tags=["AI & Triage"])

# In-memory session store (use Redis in production)
_sessions: dict = {}


@router.post("/triage", response_model=TriageResponse)
async def triage(data: TriageRequest):
    """
    AI Symptom Analyzer — returns triage level and recommended action.
    Uses Gemini API if configured, falls back to keyword engine.
    """
    if not data.symptoms or len(data.symptoms) == 0:
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

@router.post("/chat")
async def chat_endpoint(data: ChatRequest):
    """Handle generic chat queries for AI Health Assistant via Groq"""
    if not data.messages:
        raise HTTPException(status_code=422, detail="Messages array is required")
    
    # Convert Pydantic models to dicts
    messages_list = [{"role": msg.role, "content": msg.content} for msg in data.messages]
    
    from app.services.groq_service import process_chat
    reply = await process_chat(messages_list)
    return reply

class CommunitySearchRequest(BaseModel):
    query: str

@router.post("/community-search")
async def community_search(data: CommunitySearchRequest):
    """Handle RAG searches for the Community page via Groq"""
    if not data.query:
        raise HTTPException(status_code=422, detail="Query string is required")
    
    from app.services.rag_service import process_community_query
    reply = await process_community_query(data.query)
    return reply


@router.get("/triage/{session_id}", response_model=TriageResponse)
async def get_triage_session(session_id: str):
    """Retrieve a previous triage session result"""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Triage session not found")
    return session
