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

// Keyword-based mock AI triage
function mockTriageAI(input: string): { level: TriageLevel; confidence: number } {
  const lower = input.toLowerCase();
  const critical = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'not breathing', 'cardiac', 'seizure', 'anaphylaxis'];
  const high = ['severe pain', 'difficulty breathing', 'vomiting blood', 'high fever', 'head injury', 'fracture', 'deep cut'];
  const medium = ['fever', 'vomiting', 'diarrhea', 'moderate pain', 'rash', 'dizziness', 'headache'];

  // Count matching keywords to simulate confidence
  const critCount = critical.filter(k => lower.includes(k)).length;
  const highCount = high.filter(k => lower.includes(k)).length;
  const medCount  = medium.filter(k => lower.includes(k)).length;

  if (critCount >= 2) return { level: 'critical', confidence: 96 };
  if (critCount === 1) return { level: 'critical', confidence: 91 };
  if (highCount >= 2)  return { level: 'high',     confidence: 88 };
  if (highCount === 1) return { level: 'high',     confidence: 82 };  // triggers handoff
  if (medCount  >= 2)  return { level: 'medium',   confidence: 79 };  // triggers handoff
  if (medCount  === 1) return { level: 'medium',   confidence: 76 };  // triggers handoff
  return { level: 'low', confidence: 72 };                            // triggers handoff
}

export const useTriageStore = create<TriageState>((set) => ({
  currentSession: null,
  isAnalyzing: false,
  symptoms: '',
  confidenceScore: null,

  setSymptoms: (s) => set({ symptoms: s }),

  analyzeSymptoms: async (input: string, language: string = 'en') => {
    set({ isAnalyzing: true, symptoms: input, confidenceScore: null });

    // Simulate AI network delay
    await new Promise((r) => setTimeout(r, 2200));

    const { level, confidence } = mockTriageAI(input);
    const response = TRIAGE_RESPONSES[level];

    // Mock translation for Hindi Demo
    let aiSummary = response.message;
    let action = response.action;
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
      recommendedSpecialist: response.specialist,
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
