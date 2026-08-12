"""
LifeLink AI — AI Triage Service
Gemini API integration with keyword-based fallback
"""
import uuid
import httpx
from datetime import datetime
from typing import Optional

from app.config import settings


# ─────────────────────────────────────────────
# Triage keyword engine (offline fallback)
# ─────────────────────────────────────────────
CRITICAL_KEYWORDS = [
    "chest pain", "heart attack", "stroke", "unconscious", "not breathing",
    "cardiac arrest", "seizure", "anaphylaxis", "cannot breathe", "no pulse",
    "severe bleeding", "unresponsive", "overdose"
]
HIGH_KEYWORDS = [
    "difficulty breathing", "severe pain", "vomiting blood", "high fever",
    "head injury", "fracture", "deep cut", "allergic reaction", "high temperature",
    "can't walk", "heavy bleeding", "dislocated", "intense pain"
]
MEDIUM_KEYWORDS = [
    "fever", "vomiting", "diarrhea", "moderate pain", "rash", "dizziness",
    "headache", "nausea", "stomach pain", "sore throat", "cough", "cold",
    "urinary pain", "ear pain", "back pain", "swollen"
]

TRIAGE_META = {
    "critical": {
        "title": "Critical Emergency",
        "summary": "Your symptoms indicate a potentially life-threatening condition requiring immediate emergency care.",
        "recommended_action": "Dispatching nearest ambulance. Connecting to on-call emergency physician for live guidance.",
        "recommended_specialist": "Emergency Medicine",
        "confidence": 0.94,
    },
    "high": {
        "title": "High Priority — Urgent",
        "summary": "Your symptoms require urgent medical attention within the next 1-2 hours.",
        "recommended_action": "Ambulance dispatched. Your family doctor and emergency contacts are being notified.",
        "recommended_specialist": "Emergency Medicine",
        "confidence": 0.87,
    },
    "medium": {
        "title": "Moderate Concern",
        "summary": "Your symptoms suggest you need to see a doctor today but do not require emergency services.",
        "recommended_action": "Arranging Non-Emergency Medical Transport (NEMT) via Uber to the nearest clinic.",
        "recommended_specialist": "General Physician",
        "confidence": 0.81,
    },
    "low": {
        "title": "Low Urgency — Monitor",
        "summary": "Your symptoms appear mild. A teleconsult or scheduled appointment is recommended.",
        "recommended_action": "Connecting to your pre-registered family doctor for a video consultation.",
        "recommended_specialist": "General Physician",
        "confidence": 0.76,
    },
}


def keyword_triage(symptoms: str) -> str:
    text = symptoms.lower()
    if any(k in text for k in CRITICAL_KEYWORDS):
        return "critical"
    if any(k in text for k in HIGH_KEYWORDS):
        return "high"
    if any(k in text for k in MEDIUM_KEYWORDS):
        return "medium"
    return "low"


# ─────────────────────────────────────────────
# Gemini API triage (when key is configured)
# ─────────────────────────────────────────────
GEMINI_PROMPT_TEMPLATE = """
You are a medical triage AI assistant for LifeLink AI emergency platform.
Analyze the following patient symptoms and provide a structured triage assessment.

SYSTEM DIRECTIVE: You MUST evaluate symptoms and output all clinical summaries, risk assessments, and recommendations STRICTLY in English. Reject non-English inputs and respond in clear, accessible English.

Patient Symptoms: {symptoms}

Respond ONLY with a JSON object in this exact format:
{{
  "triage_level": "low|medium|high|critical",
  "title": "short title",
  "summary": "1-2 sentence clinical assessment",
  "recommended_action": "specific action to take",
  "recommended_specialist": "medical specialty",
  "confidence": 0.0-1.0
}}

Rules:
- critical: life-threatening, immediate emergency (chest pain, stroke, cardiac arrest)
- high: urgent, needs care within 2 hours (severe pain, difficulty breathing)
- medium: needs care today (fever, vomiting, moderate pain)
- low: mild symptoms, can be managed with teleconsult
"""

async def ai_triage(symptoms: str) -> Optional[dict]:
    """Call Groq API for AI triage — falls back to Gemini on error"""
    if settings.USE_MOCK_APIS:
        return None
        
    if settings.GROQ_API_KEY:
        groq_result = await _groq_triage(symptoms)
        if groq_result:
            return groq_result

    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-gemini-api-key-here":
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": GEMINI_PROMPT_TEMPLATE.format(symptoms=symptoms)}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 250},
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, params={"key": settings.GEMINI_API_KEY})
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            import json, re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                res = json.loads(match.group())
                res["source"] = "gemini"
                return res
    except Exception as e:
        print(f"Gemini error in ai_triage: {e}")
        pass
    return None

async def _groq_triage(symptoms: str) -> Optional[dict]:
    if not settings.GROQ_API_KEY:
        return None
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a medical triage AI."},
            {"role": "user", "content": GEMINI_PROMPT_TEMPLATE.format(symptoms=symptoms)}
        ],
        "temperature": 0.1,
        "max_tokens": 250
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            import json, re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                res = json.loads(match.group())
                res["source"] = "groq"
                return res
    except Exception:
        pass
    return None


# ─────────────────────────────────────────────
# Main triage function
# ─────────────────────────────────────────────
async def analyze_symptoms(symptoms: str) -> dict:
    """Run AI triage (Gemini/Groq), fall back to keyword engine"""
    ai_result = await ai_triage(symptoms)

    if ai_result and "triage_level" in ai_result:
        level = ai_result["triage_level"]
        meta = TRIAGE_META.get(level, TRIAGE_META["low"])
        return {
            "session_id": str(uuid.uuid4()),
            "triage_level": level,
            "title": ai_result.get("title", meta["title"]),
            "summary": ai_result.get("summary", meta["summary"]),
            "recommended_action": ai_result.get("recommended_action", meta["recommended_action"]),
            "recommended_specialist": ai_result.get("recommended_specialist", meta["recommended_specialist"]),
            "confidence": ai_result.get("confidence", meta["confidence"]),
            "source": ai_result.get("source", "gemini"),
            "uber_estimate": _uber_estimate() if level in ("low", "medium") else None,
        }
    else:
        # Keyword fallback
        level = keyword_triage(symptoms)
        meta = TRIAGE_META[level]
        return {
            "session_id": str(uuid.uuid4()),
            "triage_level": level,
            **meta,
            "source": "keyword_engine",
            "uber_estimate": _uber_estimate() if level in ("low", "medium") else None,
        }


def _uber_estimate() -> dict:
    return {
        "low_fare": 85,
        "high_fare": 140,
        "currency": "INR",
        "eta_minutes": 6,
        "product_name": "UberGo",
    }


# ─────────────────────────────────────────────
# Voice command parser
# ─────────────────────────────────────────────
VOICE_INTENTS = {
    "sos": ["sos", "emergency", "help me", "call ambulance"],
    "symptom_check": ["check symptoms", "analyze", "i feel", "i have"],
    "find_hospital": ["find hospital", "nearest hospital", "closest hospital"],
    "call_doctor": ["call doctor", "video call", "consult doctor", "talk to doctor"],
    "blood_request": ["need blood", "blood request", "blood donor"],
    "navigate": ["go to", "open", "show me", "navigate"],
}

def parse_voice_command(text: str) -> dict:
    lower = text.lower()
    for intent, keywords in VOICE_INTENTS.items():
        if any(k in lower for k in keywords):
            return {"intent": intent, "confidence": 0.88, "raw_text": text}
    return {"intent": "unknown", "confidence": 0.3, "raw_text": text}

INTENT_PROMPT_TEMPLATE = """
SYSTEM: You are the routing brain for a healthcare app. Analyze the user's text and classify their intent into one of four categories. Return strictly in JSON format: {{ "intent": "EMERGENCY" | "SYMPTOMS" | "NAVIGATION" | "GENERAL", "action_payload": "extracted details" }}

Categories:
* EMERGENCY: E.g., "Help", "Heart attack", "Ambulance". Payload: The emergency type.
* SYMPTOMS: E.g., "I have a fever", "My stomach hurts". Payload: Comma-separated list of symptoms.
* NAVIGATION: E.g., "Show my records", "Find hospitals". Payload: Target route (e.g., "hospitals", "vault").
* GENERAL: Any generic health query.

User text: {text}
"""

async def parse_voice_intent_ai(text: str) -> dict:
    """Uses LLM to intelligently classify intent from voice transcription"""
    if settings.GROQ_API_KEY:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a routing AI. Respond only in JSON."},
                {"role": "user", "content": INTENT_PROMPT_TEMPLATE.format(text=text)}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    import json
                    return json.loads(resp.json()["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"Groq intent error: {e}")
            pass

    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
        payload = {
            "contents": [{"parts": [{"text": INTENT_PROMPT_TEMPLATE.format(text=text)}]}],
            "generationConfig": {"temperature": 0.1, "response_mime_type": "application/json"}
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, params={"key": settings.GEMINI_API_KEY})
                if resp.status_code == 200:
                    import json, re
                    text_resp = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                    match = re.search(r'\{.*\}', text_resp, re.DOTALL)
                    if match:
                        return json.loads(match.group())
        except Exception as e:
            print(f"Gemini intent error: {e}")
            pass
            
    # Fallback if APIs fail
    return {"intent": "GENERAL", "action_payload": "I'm having trouble connecting to my AI brain. Please try again."}

# ─────────────────────────────────────────────
# Medical Report AI Analysis
# ─────────────────────────────────────────────
REPORT_PROMPT_TEMPLATE = """
You are an expert medical AI analyst for LifeLink AI.
Analyze the following extracted medical report text. Identify lab values, vital signs, or clinical findings, and compare them against standard medical reference ranges.
Specifically flag any "Dangerous Findings" — critical anomalies, severe out-of-range lab values, or high-risk clinical observations (e.g. "Elevated Troponin", "Critical Hypertension").

SYSTEM DIRECTIVE: You MUST evaluate the report and output all clinical summaries, explanations, and parameter statuses STRICTLY in English. Reject non-English inputs and respond in clear, accessible English.

Report Text: {report_text}

Respond ONLY with a valid JSON object in this exact schema:
{{
  "report_id": "auto-generated or use provided",
  "general_summary": "2-3 sentence overview of the report.",
  "total_red_flags": integer (count of findings with High/Low/Critical status),
  "critical_findings": [
    {{
      "parameter_name": "e.g., Fasting Blood Sugar",
      "extracted_value": "e.g., 210 mg/dL",
      "normal_range": "e.g., 70-100 mg/dL",
      "status": "Normal" | "High" | "Low" | "Critical",
      "plain_english_explanation": "1-sentence jargon-free explanation understandable by a non-medical person.",
      "needs_immediate_attention": boolean (true only if the value is life-threateningly abnormal)
    }}
  ]
}}

Rules:
- Include ALL findings (both normal and abnormal) from the report.
- For each value, include the standard medical normal_range.
- "Critical" status means the value is dangerously out of range and poses immediate health risk.
- "High" or "Low" means the value is outside normal range but not immediately life-threatening.
- "Normal" means the value is within the healthy reference range.
- Set needs_immediate_attention to true ONLY for Critical findings that require emergency medical intervention.
"""

async def analyze_medical_report(file_bytes: bytes, filename: str) -> dict:
    """Simulate OCR extraction and pass to LLM for report analysis."""
    
    # MOCK OCR EXTRACTION
    # In a real system, we'd use PyMuPDF for PDFs or Gemini Vision for images.
    # We simulate reading the text based on keywords in the filename to provide rich mock data.
    
    mock_extracted_text = "Patient Report. Normal findings."
    if "blood" in filename.lower() or "cbc" in filename.lower():
        mock_extracted_text = (
            "Complete Blood Count & Metabolic Panel.\n"
            "Hemoglobin: 14.2 g/dL. WBC: 7,800/mcL. Platelets: 245,000/mcL.\n"
            "Fasting Blood Sugar: 215 mg/dL. HbA1c: 8.9%.\n"
            "Total Cholesterol: 262 mg/dL. LDL: 178 mg/dL. HDL: 38 mg/dL.\n"
            "Triglycerides: 210 mg/dL."
        )
    elif "cardiac" in filename.lower() or "ecg" in filename.lower() or "troponin" in filename.lower():
        mock_extracted_text = (
            "Cardiac Panel & Vitals.\n"
            "Troponin I: 2.4 ng/mL. BNP: 890 pg/mL.\n"
            "Blood Pressure: 185/115 mmHg. Heart Rate: 112 bpm.\n"
            "Creatinine: 1.1 mg/dL. Potassium: 3.6 mEq/L.\n"
            "Patient complains of chest tightness and shortness of breath."
        )
    elif "liver" in filename.lower() or "lft" in filename.lower():
        mock_extracted_text = (
            "Liver Function Test.\n"
            "AST (SGOT): 142 U/L. ALT (SGPT): 168 U/L.\n"
            "Total Bilirubin: 2.8 mg/dL. Direct Bilirubin: 1.4 mg/dL.\n"
            "Alkaline Phosphatase: 95 U/L. Albumin: 3.9 g/dL.\n"
            "GGT: 85 U/L."
        )
    else:
        # Generic Comprehensive Metabolic Panel with mixed results
        mock_extracted_text = (
            "Comprehensive Metabolic Panel.\n"
            "Sodium: 140 mEq/L. Potassium: 3.8 mEq/L. Chloride: 102 mEq/L.\n"
            "Creatinine: 1.0 mg/dL. BUN: 18 mg/dL.\n"
            "AST (SGOT): 120 U/L. ALT (SGPT): 145 U/L.\n"
            "Fasting Blood Sugar: 198 mg/dL.\n"
            "Hemoglobin: 11.2 g/dL."
        )

    prompt = REPORT_PROMPT_TEMPLATE.format(report_text=mock_extracted_text)

    # Use Groq if available, else fallback to Gemini
    if settings.GROQ_API_KEY:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a medical AI. Respond only in JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    import json
                    text = resp.json()["choices"][0]["message"]["content"]
                    res = json.loads(text)
                    res["report_id"] = str(uuid.uuid4())
                    return res
        except Exception as e:
            print(f"Groq error in analyze_medical_report: {e}")
            pass

    # Gemini Fallback
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload, params={"key": settings.GEMINI_API_KEY})
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    import json, re
                    match = re.search(r'\{.*\}', text, re.DOTALL)
                    if match:
                        res = json.loads(match.group())
                        res["report_id"] = str(uuid.uuid4())
                        return res
        except Exception as e:
            print(f"Gemini error in analyze_medical_report: {e}")
            pass
            
    # ─────────────────────────────────────────────
    # Rich Hardcoded Fallback (when APIs are unavailable)
    # Provides realistic demo data keyed on filename
    # ─────────────────────────────────────────────
    if "cardiac" in filename.lower() or "ecg" in filename.lower() or "troponin" in filename.lower():
        return {
            "report_id": str(uuid.uuid4()),
            "general_summary": "Cardiac panel reveals critically elevated Troponin I and BNP levels alongside severe hypertension. These findings are consistent with acute cardiac stress and require immediate medical evaluation.",
            "total_red_flags": 3,
            "critical_findings": [
                {
                    "parameter_name": "Troponin I",
                    "extracted_value": "2.4 ng/mL",
                    "normal_range": "0.00 – 0.04 ng/mL",
                    "status": "Critical",
                    "plain_english_explanation": "⚠️ Troponin I is 2.4 ng/mL — this is 60x higher than the normal limit and can indicate heart muscle damage or a heart attack.",
                    "needs_immediate_attention": True
                },
                {
                    "parameter_name": "Blood Pressure",
                    "extracted_value": "185/115 mmHg",
                    "normal_range": "90/60 – 120/80 mmHg",
                    "status": "Critical",
                    "plain_english_explanation": "⚠️ Blood pressure is dangerously high at 185/115, classified as a hypertensive crisis that needs urgent treatment.",
                    "needs_immediate_attention": True
                },
                {
                    "parameter_name": "BNP",
                    "extracted_value": "890 pg/mL",
                    "normal_range": "0 – 100 pg/mL",
                    "status": "High",
                    "plain_english_explanation": "BNP is elevated at 890 pg/mL, suggesting the heart is under significant stress. This needs medical follow-up.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Heart Rate",
                    "extracted_value": "112 bpm",
                    "normal_range": "60 – 100 bpm",
                    "status": "High",
                    "plain_english_explanation": "Heart rate is slightly elevated at 112 bpm, which is consistent with the cardiac stress indicated by other markers.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Creatinine",
                    "extracted_value": "1.1 mg/dL",
                    "normal_range": "0.7 – 1.3 mg/dL",
                    "status": "Normal",
                    "plain_english_explanation": "Kidney function appears normal based on creatinine levels.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Potassium",
                    "extracted_value": "3.6 mEq/L",
                    "normal_range": "3.5 – 5.0 mEq/L",
                    "status": "Normal",
                    "plain_english_explanation": "Potassium level is within the normal range.",
                    "needs_immediate_attention": False
                }
            ]
        }
    elif "liver" in filename.lower() or "lft" in filename.lower():
        return {
            "report_id": str(uuid.uuid4()),
            "general_summary": "Liver function tests show significantly elevated AST, ALT, and Bilirubin levels, suggesting possible liver inflammation or damage. Other markers including Albumin and Alkaline Phosphatase are within normal limits.",
            "total_red_flags": 4,
            "critical_findings": [
                {
                    "parameter_name": "AST (SGOT)",
                    "extracted_value": "142 U/L",
                    "normal_range": "10 – 40 U/L",
                    "status": "High",
                    "plain_english_explanation": "AST is 3.5x the upper normal limit, which can indicate liver cell damage or inflammation.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "ALT (SGPT)",
                    "extracted_value": "168 U/L",
                    "normal_range": "7 – 56 U/L",
                    "status": "High",
                    "plain_english_explanation": "ALT is significantly elevated at 168, strongly suggesting liver cell injury. Further investigation is recommended.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Total Bilirubin",
                    "extracted_value": "2.8 mg/dL",
                    "normal_range": "0.1 – 1.2 mg/dL",
                    "status": "High",
                    "plain_english_explanation": "Bilirubin is elevated, which may cause yellowing of skin or eyes (jaundice) and indicates the liver may not be processing waste efficiently.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "GGT",
                    "extracted_value": "85 U/L",
                    "normal_range": "9 – 48 U/L",
                    "status": "High",
                    "plain_english_explanation": "GGT is moderately elevated, which alongside the other liver markers supports a pattern of liver stress.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Alkaline Phosphatase",
                    "extracted_value": "95 U/L",
                    "normal_range": "44 – 147 U/L",
                    "status": "Normal",
                    "plain_english_explanation": "Alkaline phosphatase is within the normal range.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Albumin",
                    "extracted_value": "3.9 g/dL",
                    "normal_range": "3.5 – 5.5 g/dL",
                    "status": "Normal",
                    "plain_english_explanation": "Albumin levels are normal, indicating adequate protein production by the liver.",
                    "needs_immediate_attention": False
                }
            ]
        }
    elif "blood" in filename.lower() or "cbc" in filename.lower():
        return {
            "report_id": str(uuid.uuid4()),
            "general_summary": "Blood work reveals significantly elevated fasting glucose and HbA1c consistent with uncontrolled diabetes, along with a concerning lipid profile showing high cholesterol and low HDL. Hemoglobin and blood cell counts are within normal ranges.",
            "total_red_flags": 5,
            "critical_findings": [
                {
                    "parameter_name": "Fasting Blood Sugar",
                    "extracted_value": "215 mg/dL",
                    "normal_range": "70 – 100 mg/dL",
                    "status": "Critical",
                    "plain_english_explanation": "⚠️ Fasting blood sugar is 215 mg/dL, which is more than double the normal limit and indicates poorly controlled diabetes.",
                    "needs_immediate_attention": True
                },
                {
                    "parameter_name": "HbA1c",
                    "extracted_value": "8.9%",
                    "normal_range": "4.0 – 5.6%",
                    "status": "High",
                    "plain_english_explanation": "HbA1c of 8.9% shows that blood sugar has been consistently high over the past 3 months. Target for diabetics is below 7%.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Total Cholesterol",
                    "extracted_value": "262 mg/dL",
                    "normal_range": "< 200 mg/dL",
                    "status": "High",
                    "plain_english_explanation": "Total cholesterol is elevated at 262, increasing the risk of heart disease and stroke over time.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "LDL Cholesterol",
                    "extracted_value": "178 mg/dL",
                    "normal_range": "< 100 mg/dL",
                    "status": "High",
                    "plain_english_explanation": "LDL ('bad' cholesterol) is nearly double the ideal level, contributing to plaque buildup in arteries.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "HDL Cholesterol",
                    "extracted_value": "38 mg/dL",
                    "normal_range": "> 40 mg/dL",
                    "status": "Low",
                    "plain_english_explanation": "HDL ('good' cholesterol) is below the protective threshold. Higher HDL helps remove bad cholesterol from arteries.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Hemoglobin",
                    "extracted_value": "14.2 g/dL",
                    "normal_range": "13.5 – 17.5 g/dL",
                    "status": "Normal",
                    "plain_english_explanation": "Hemoglobin is within the normal healthy range, indicating no anemia.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "WBC Count",
                    "extracted_value": "7,800 /mcL",
                    "normal_range": "4,500 – 11,000 /mcL",
                    "status": "Normal",
                    "plain_english_explanation": "White blood cell count is normal, suggesting no active infection.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Platelets",
                    "extracted_value": "245,000 /mcL",
                    "normal_range": "150,000 – 400,000 /mcL",
                    "status": "Normal",
                    "plain_english_explanation": "Platelet count is within the normal range, indicating healthy blood clotting ability.",
                    "needs_immediate_attention": False
                }
            ]
        }
    else:
        # Generic CMP fallback
        return {
            "report_id": str(uuid.uuid4()),
            "general_summary": "Comprehensive metabolic panel shows significantly elevated liver enzymes (AST and ALT) and high fasting blood sugar, suggesting liver inflammation and possible pre-diabetic or diabetic condition. Electrolytes and kidney markers are within normal limits. Hemoglobin is slightly low.",
            "total_red_flags": 3,
            "critical_findings": [
                {
                    "parameter_name": "AST (SGOT)",
                    "extracted_value": "120 U/L",
                    "normal_range": "10 – 40 U/L",
                    "status": "High",
                    "plain_english_explanation": "AST is 3x the normal upper limit, which may indicate liver damage or inflammation.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "ALT (SGPT)",
                    "extracted_value": "145 U/L",
                    "normal_range": "7 – 56 U/L",
                    "status": "High",
                    "plain_english_explanation": "ALT is significantly elevated, strongly suggesting liver cell injury. A follow-up with your doctor is recommended.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Fasting Blood Sugar",
                    "extracted_value": "198 mg/dL",
                    "normal_range": "70 – 100 mg/dL",
                    "status": "High",
                    "plain_english_explanation": "Fasting blood sugar is nearly double the normal limit at 198 mg/dL, indicating possible diabetes.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Hemoglobin",
                    "extracted_value": "11.2 g/dL",
                    "normal_range": "13.5 – 17.5 g/dL",
                    "status": "Low",
                    "plain_english_explanation": "Hemoglobin is below normal, suggesting mild anemia. You may feel tired or short of breath.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Sodium",
                    "extracted_value": "140 mEq/L",
                    "normal_range": "136 – 145 mEq/L",
                    "status": "Normal",
                    "plain_english_explanation": "Sodium level is within the normal range.",
                    "needs_immediate_attention": False
                },
                {
                    "parameter_name": "Creatinine",
                    "extracted_value": "1.0 mg/dL",
                    "normal_range": "0.7 – 1.3 mg/dL",
                    "status": "Normal",
                    "plain_english_explanation": "Kidney function appears normal based on creatinine levels.",
                    "needs_immediate_attention": False
                }
            ]
        }


