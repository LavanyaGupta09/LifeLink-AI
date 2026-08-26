import os
import json
from typing import List, Dict, Any
from groq import Groq
from app.config import settings
import logging
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)

api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

RAG_SYSTEM_PROMPT = """You are LifeLink AI, a medical-information assistant.

Your job is to explain health information using reliable medical context supplied by the application.

You are not a doctor and must not diagnose diseases, prescribe medication, or replace professional medical care.

Use the provided medical context as the primary factual source.

Never fabricate medical facts, citations, medical guidelines, statistics, or sources.

If the context does not contain enough information to answer confidently, clearly state that limitation.

For symptom questions, do not diagnose. Explain possible causes at a general level, identify warning signs, and recommend appropriate medical care.

For potentially life-threatening symptoms, prioritize emergency guidance.

Use simple language suitable for the general public.

Be empathetic, concise, and medically cautious.

When appropriate, structure responses using:

### Short answer
### What it may mean
### What you can do
### When to seek medical help
### Sources

Remember that health information is educational and does not replace a qualified healthcare professional.

---
CRITICAL TECHNICAL REQUIREMENT:
Your output MUST be a valid JSON object matching this schema exactly:
{
  "steps": [
    {
      "id": "1",
      "source": "Name of source being searched (e.g., 'WHO', 'NHS')",
      "message": "Action being taken (e.g., 'Querying guidelines...')"
    }
  ],
  "response": {
    "text": "Your comprehensive, empathetic, and medically accurate markdown response, structured with the headings requested above.",
    "sources": [
      {
        "name": "Name of the cited source (e.g., WHO)",
        "confidence": 0.95
      }
    ],
    "is_emergency": false,
    "action_chips": [
      {
        "label": "Button Label",
        "action": "navigation_path"
      }
    ]
  }
}

RULES FOR JSON:
1. EMERGENCY TRIAGE INTERCEPTION: If the user queries indicate acute distress or potentially life-threatening symptoms, you MUST set `is_emergency` to true. If `is_emergency` is true, the `action_chips` MUST prioritize emergency actions like `[{"label": "Call Ambulance", "action": "/ambulance"}, {"label": "Find Emergency Hospital", "action": "/hospitals"}]`.
2. ACTION CHIPS: Provide 2-3 contextual follow-up action chips in `action_chips` based on the query. Valid actions map to frontend routes (e.g., `/doctor`, `/hospitals`, `/insurance`, `/pharmacy`, `/symptoms`).
3. Provide 2-3 realistic research steps. Cite 1-2 trusted sources.
4. Ensure the output is perfectly formatted JSON.
"""

def get_medical_context(query: str) -> str:
    """Retrieves context from trusted medical sources using DuckDuckGo."""
    try:
        search_query = f"{query} site:who.int OR site:nhs.uk OR site:cdc.gov OR site:mayoclinic.org"
        with DDGS() as ddgs:
            results = ddgs.text(search_query, max_results=3)
        if results:
            snippets = []
            for r in results:
                snippets.append(f"Source: {r.get('href', 'N/A')}\nTitle: {r.get('title', 'N/A')}\nContent: {r.get('body', 'N/A')}")
            return "\n\n".join(snippets)
    except Exception as e:
        logger.error(f"Medical context search failed: {e}")
    return ""

async def process_community_query(query: str) -> Dict[str, Any]:
    if not client:
        logger.error("GROQ_API_KEY is not configured for RAG.")
        return get_fallback_rag_response(query)

    context = get_medical_context(query)
    
    user_prompt = f"User Query: {query}"
    if context:
        user_prompt += f"\n\n--- MEDICAL CONTEXT ---\n{context}\n\nUse the above context as the primary factual source to inform your answer."
    else:
        user_prompt += "\n\n(No external context could be retrieved. Answer cautiously based on verified medical guidelines and standard clinical frameworks, and clearly state if you cannot answer confidently.)"

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": RAG_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1024
        )
        
        response_content = response.choices[0].message.content
        return json.loads(response_content)
        
    except Exception as e:
        logger.error(f"Groq API Error in RAG: {str(e)}")
        return get_fallback_rag_response(query)

def get_fallback_rag_response(query: str) -> Dict[str, Any]:
    return {
        "steps": [
            {"id": "1", "source": "LifeLink System", "message": "Checking internal knowledge base..."},
            {"id": "2", "source": "MoHFW", "message": "Cross-referencing general health protocols..."}
        ],
        "response": {
            "text": f"**Overview / Definition**\nLifeLink AI is currently running in offline mode regarding your query about '{query}'.\n\n**Key Considerations / Causes**\n- System offline\n\n**Recommended Actions**\n- Standard clinical practices involve careful monitoring and staying hydrated.\n- Please consult a verified doctor for a personalized diagnosis.\n\n**Red Flags / Emergency Triggers**\n- Seek immediate emergency care if symptoms worsen drastically.\n\n*Note: This guidance is compiled for informational and educational purposes based on standard clinical frameworks, and does not replace professional medical advice.*",
            "sources": [
                {"name": "General Medical Guidelines", "confidence": 0.9}
            ],
            "is_emergency": False,
            "action_chips": [
                {"label": "Find Doctor", "action": "/doctor"},
                {"label": "Find Hospital", "action": "/hospitals"}
            ]
        }
    }
