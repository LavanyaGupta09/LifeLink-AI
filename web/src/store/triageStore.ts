import { create } from 'zustand';
import type { TriageSession, TriageLevel } from '../types/health.types';
import { TRIAGE_RESPONSES } from '../data/mockData';

interface TriageState {
  currentSession: TriageSession | null;
  isAnalyzing: boolean;
  symptoms: string;
  confidenceScore: number | null;

  setSymptoms: (s: string) => void;
  analyzeSymptoms: (input: string, language?: string) => Promise<void>;
  clearSession: () => void;
}

// Keyword-based fallback triage (used only when backend is unreachable)
function keywordTriageFallback(input: string): { level: TriageLevel; confidence: number } {
  const lower = input.toLowerCase();
  const critical = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'not breathing', 'cardiac', 'seizure', 'anaphylaxis'];
  const high = ['severe pain', 'difficulty breathing', 'vomiting blood', 'high fever', 'head injury', 'fracture', 'deep cut'];
  const medium = ['fever', 'vomiting', 'diarrhea', 'moderate pain', 'rash', 'dizziness', 'headache'];

  if (critical.some(k => lower.includes(k))) return { level: 'critical', confidence: 93 };
  if (high.some(k => lower.includes(k))) return { level: 'high', confidence: 85 };
  if (medium.some(k => lower.includes(k))) return { level: 'medium', confidence: 78 };
  return { level: 'low', confidence: 72 };
}

export const useTriageStore = create<TriageState>((set) => ({
  currentSession: null,
  isAnalyzing: false,
  symptoms: '',
  confidenceScore: null,

  setSymptoms: (s) => set({ symptoms: s }),

  analyzeSymptoms: async (input: string, language: string = 'en') => {
    set({ isAnalyzing: true, symptoms: input, confidenceScore: null });

    let level: TriageLevel = 'low';
    let confidence = 72;
    let aiSummary = '';
    let action = '';
    let specialist = 'General Physician';
    let source = 'keyword_engine';

    try {
      // REAL: Call live AI triage backend (Groq/Gemini powered)
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: input }),
      });

      if (res.ok) {
        const data = await res.json();
        level = data.triage_level || 'low';
        confidence = Math.round((data.confidence || 0.76) * 100);
        aiSummary = data.summary || TRIAGE_RESPONSES[level]?.message || '';
        action = data.recommended_action || TRIAGE_RESPONSES[level]?.action || '';
        specialist = data.recommended_specialist || 'General Physician';
        source = data.source || 'ai_backend';
        console.log(`✅ Live AI Triage (${source}): ${level} @ ${confidence}%`);
      } else {
        throw new Error(`Backend returned ${res.status}`);
      }
    } catch (err) {
      // Fallback to keyword engine if backend is unreachable
      console.warn('AI backend unreachable, using keyword fallback:', err);
      const fallback = keywordTriageFallback(input);
      level = fallback.level;
      confidence = fallback.confidence;
      const response = TRIAGE_RESPONSES[level];
      aiSummary = response.message;
      action = response.action;
      specialist = response.specialist;
      source = 'keyword_engine';
    }

    // Hindi translation for demo
    if (language === 'hi') {
      if (level === 'critical') {
        aiSummary = 'लक्षणों से जानलेवा स्थिति का संकेत मिलता है। तत्काल आपातकालीन देखभाल की आवश्यकता है।';
        action = 'निकटतम एम्बुलेंस भेज रहे हैं।';
      } else if (level === 'high') {
        aiSummary = 'आपके लक्षणों के लिए अगले 2 घंटों के भीतर तत्काल चिकित्सा ध्यान देने की आवश्यकता है।';
        action = 'एम्बुलेंस भेज रहे हैं। परिवार को सूचित किया जा रहा है।';
      } else {
        aiSummary = 'आपके लक्षण हल्के प्रतीत होते हैं। डॉक्टर से परामर्श की सलाह दी जाती है।';
        action = 'वीडियो परामर्श के लिए अपने डॉक्टर से जुड़ें।';
      }
    }

    const session: TriageSession = {
      id: `triage_${Date.now()}`,
      userId: 'usr_001',
      symptomsInput: input,
      triageLevel: level,
      recommendedAction: action,
      recommendedSpecialist: specialist,
      aiSummary: aiSummary,
      confidenceScore: confidence,
      uberEstimate:
        level === 'low' || level === 'medium'
          ? { lowFare: 85, highFare: 140, currency: 'INR', etaMinutes: 6, productName: 'UberGo' }
          : undefined,
      createdAt: new Date().toISOString(),
    };

    set({ currentSession: session, isAnalyzing: false, confidenceScore: confidence });
  },

  clearSession: () => set({ currentSession: null, symptoms: '', isAnalyzing: false }),
}));
