import os
import json
from typing import List, Dict, Any, Optional
from groq import Groq
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Groq client
# We use the config setting, but fallback to os.environ if needed
api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """
You are LifeLink AI, an empathetic, action-oriented emergency health and navigation companion.
Your primary job is to understand the user's natural language request, extract key context, and return STRUCTURED JSON mapping to predefined actions within the LifeLink ecosystem.

RULES:
1. DO NOT DIAGNOSE: Never guarantee a diagnosis, prescribe medication, or tell a user to ignore symptoms.
2. EMERGENCY LOGIC: If the user mentions severe chest pain, difficulty breathing, unconsciousness, severe bleeding, stroke-like symptoms, seizure, anaphylaxis, or major trauma, mark urgency as "critical" or "high". ALWAYS include the 'ambulance' action. 'transportation' (Uber) can be included as a secondary option but never replace ambulance for emergencies.
3. CONTEXTUAL ACTIONS: Only return relevant actions from the ALLOWED ACTIONS list below. Do not return all actions.
4. FAMILY RELATIONSHIPS: Extract the person needing care (e.g., mother, father, self). Do not invent medical context.
5. FOLLOW-UP: If the request is too vague, ask ONE relevant follow-up question and set needs_more_information to true.
6. TRANSPORTATION: For non-emergency healthcare transportation requests (e.g. going to a doctor, hospital, lab, or pharmacy), offer the 'transportation' action (label it 'Go with Uber'). Do NOT pretend that a ride is already booked.

ALLOWED ACTIONS:
- symptom_check
- find_doctor
- find_hospital
- pharmacy
- ambulance
- lab_test
- medicine_delivery
- insurance
- physiotherapy
- home_healthcare
- medical_equipment
- family
- community
- mental_wellness
- transportation

RESPONSE FORMAT (JSON ONLY):
{
  "message": "A compassionate, brief response to the user.",
  "intent": "One of: general_health_help, symptom_check, doctor_search, hospital_search, pharmacy_search, lab_test, ambulance, medicine_delivery, insurance, physiotherapy, home_healthcare, medical_equipment, family_health, health_records, appointment, community, mental_wellness, transportation, emergency",
  "urgency": "critical, high, medium, low, or unknown",
  "person": "Extracted person (e.g., mother, father, brother, self)",
  "symptoms": ["list", "of", "extracted", "symptoms"],
  "actions": [
    {
      "id": "must_be_from_ALLOWED_ACTIONS",
      "label": "User friendly label (e.g. 'Go with Uber')",
      "icon": "Lucide icon name (e.g. 'car', 'ambulance')"
    }
  ],
  "needs_more_information": true/false,
  "follow_up_question": "Optional question if needs_more_information is true"
}
"""

async def process_chat(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Process a conversation history using Groq API and return structured JSON.
    messages format: [{"role": "user"|"assistant", "content": "..."}]
    """
    if not client:
        logger.error("GROQ_API_KEY is not configured.")
        return get_fallback_response()

    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Map frontend roles to Groq roles if needed, though they should be user/assistant
    for msg in messages:
        # Ensure role is valid for Groq
        role = msg.get("role", "user")
        if role not in ["user", "assistant", "system"]:
            role = "user"
        formatted_messages.append({"role": role, "content": msg.get("content", "")})

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b", # Fast and capable model
            messages=formatted_messages,
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1024
        )
        
        response_content = response.choices[0].message.content
        return json.loads(response_content)
        
    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        return get_fallback_response()


def get_fallback_response() -> Dict[str, Any]:
    return {
        "message": "LifeLink AI is temporarily unavailable. Please use the manual navigation options below.",
        "intent": "general_health_help",
        "urgency": "unknown",
        "person": "self",
        "symptoms": [],
        "actions": [
            {"id": "symptom_check", "label": "Symptoms", "icon": "activity"},
            {"id": "find_hospital", "label": "Hospitals", "icon": "hospital"},
            {"id": "find_doctor", "label": "Doctor", "icon": "user"},
            {"id": "ambulance", "label": "Ambulance", "icon": "ambulance"}
        ],
        "needs_more_information": False,
        "follow_up_question": None
    }
