import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Send, Loader2, AlertTriangle, CheckCircle, Phone, Navigation, Shield } from 'lucide-react';
import { useTriageStore } from '../store/triageStore';
import { useSOSStore } from '../store/sosStore';
import type { TriageLevel } from '../types/health.types';

const triageMeta: Record<TriageLevel, { icon: string; color: string; bgColor: string; label: string }> = {
  critical: { icon: '🚨', color: '#FF4757', bgColor: 'rgba(255,71,87,0.1)', label: 'CRITICAL' },
  high:     { icon: '⚠️', color: '#FF6348', bgColor: 'rgba(255,99,72,0.1)', label: 'HIGH' },
  medium:   { icon: '⚡', color: '#FFA502', bgColor: 'rgba(255,165,2,0.1)', label: 'MODERATE' },
  low:      { icon: '✅', color: '#2ED573', bgColor: 'rgba(46,213,115,0.1)', label: 'LOW' },
};

const symptomSuggestions = [
  'Chest pain and shortness of breath',
  'High fever with severe headache',
  'Vomiting and stomach pain',
  'Dizziness and blurred vision',
  'Rash with itching',
  'Mild cough and sore throat',
];

const SymptomCheckerPage: React.FC = () => {
  const navigate = useNavigate();
  const { symptoms, setSymptoms, isAnalyzing, currentSession, analyzeSymptoms, clearSession } = useTriageStore();
  const { triggerSOS } = useSOSStore();
  const [isListening, setIsListening] = useState(false);
  const [waveActive, setWaveActive] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => { /* keep session on unmount for review */ };
  }, []);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    await analyzeSymptoms(symptoms, language);
  };

  const handleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setWaveActive(true);
      // Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setSymptoms(text);
          setIsListening(false);
          setWaveActive(false);
        };
        recognition.onerror = () => { setIsListening(false); setWaveActive(false); };
        recognition.onend = () => { setIsListening(false); setWaveActive(false); };
        recognition.start();
      } else {
        setTimeout(() => { setIsListening(false); setWaveActive(false); }, 3000);
      }
    } else {
      setIsListening(false);
      setWaveActive(false);
    }
  };

  const handleSOSFromTriage = () => {
    triggerSOS(currentSession!.triageLevel, 'button', 28.5355, 77.2690);
    navigate('/sos');
  };

  const meta = currentSession ? triageMeta[currentSession.triageLevel] : null;

  return (
    <div className="app-shell symptom-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => { clearSession(); navigate('/dashboard'); }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="page-title">AI Symptom Checker</h2>
            <p className="text-xs text-secondary">Powered by LifeLink AI</p>
          </div>
        </div>
        
        {/* Language Toggle */}
        <div className="flex items-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-1">
          <button 
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-[var(--primary)] text-[var(--bg-base)]' : 'text-[var(--text-secondary)]'}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button 
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${language === 'hi' ? 'bg-[var(--primary)] text-[var(--bg-base)]' : 'text-[var(--text-secondary)]'}`}
            onClick={() => setLanguage('hi')}
          >
            HI
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Permanent Legal Disclaimer */}
        <div className="bg-black/90 p-3 mx-4 mt-4 rounded-lg flex items-start gap-3 border-l-4 border-[#FFA502] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <AlertTriangle size={16} className="text-[#FFA502] shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-300 leading-tight uppercase font-semibold tracking-wide">
            <strong className="text-white">Legal Disclaimer:</strong> This AI provides emergency triage recommendations, not medical diagnoses. Always consult a certified physician.
          </p>
        </div>

        {/* Voice Section */}
        <div className="voice-section animate-fade-in">
          <div className={`voice-orb ${waveActive ? 'listening' : ''}`} onClick={handleVoice}>
            <div className="voice-rings">
              {waveActive && [1,2,3].map(i => <div key={i} className={`voice-ring vr${i}`} />)}
            </div>
            {isListening ? <Mic size={28} color="#00C9A7" /> : <MicOff size={28} color="var(--text-tertiary)" />}
          </div>
          <p className="text-sm text-secondary mt-2">
            {isListening 
              ? (language === 'hi' ? 'सुन रहा हूँ... अपने लक्षण बताएं' : 'Listening... speak your symptoms') 
              : (language === 'hi' ? 'आवाज़ से लक्षण बताने के लिए टैप करें' : 'Tap to describe symptoms by voice')}
          </p>

          {/* Waveform bars */}
          {waveActive && (
            <div className="waveform">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          )}
        </div>

        <div className="divider"><span className="divider-text">or type your symptoms</span></div>

        {/* Text input */}
        {!currentSession && (
          <div className="input-section animate-fade-in delay-200">
            <textarea
              ref={textareaRef}
              className="input symptom-input"
              placeholder={language === 'hi' ? "आप कैसा महसूस कर रहे हैं, वर्णन करें..." : "Describe what you're feeling... (e.g., 'sharp chest pain radiating to left arm')"}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              id="symptom-textarea"
            />

            {/* Quick suggestions */}
            <div className="suggestions">
              {symptomSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-pill"
                  onClick={() => setSymptoms(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-block btn-lg mt-4"
              onClick={handleAnalyze}
              disabled={!symptoms.trim() || isAnalyzing}
              id="analyze-btn"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze Symptoms
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Processing Animation */}
        {isAnalyzing && (
          <div className="ai-thinking animate-fade-in">
            <div className="thinking-dots">
              <div className="dot-bounce d1" />
              <div className="dot-bounce d2" />
              <div className="dot-bounce d3" />
            </div>
            <p className="text-sm text-secondary">AI is evaluating your symptoms...</p>
            <div className="thinking-steps">
              {['Parsing symptom data', 'Running NLP analysis', 'Checking severity matrix', 'Generating triage result'].map((step, i) => (
                <div key={i} className="thinking-step" style={{ animationDelay: `${i * 500}ms` }}>
                  <Loader2 size={12} className="animate-spin" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Triage Result */}
        {currentSession && meta && (
          <div className="triage-result animate-scale-in">
            <div className="triage-header" style={{ borderColor: meta.color, background: meta.bgColor }}>
              <div className="triage-icon">{meta.icon}</div>
              <div>
                <div className={`badge triage-${currentSession.triageLevel}`}>{meta.label} PRIORITY</div>
                <h3 className="font-display mt-1" style={{ color: meta.color }}>
                  {currentSession.triageLevel === 'critical' ? 'Emergency Detected' :
                   currentSession.triageLevel === 'high' ? 'Urgent Attention Needed' :
                   currentSession.triageLevel === 'medium' ? 'Medical Attention Today' :
                   'Non-Urgent — Monitor'}
                </h3>
              </div>
            </div>

            <div className="triage-body">
              {currentSession.confidenceScore && (
                <div className="flex justify-between items-center bg-[var(--bg-elevated)] p-2 px-3 rounded-lg border border-[var(--border)] mb-3">
                  <span className="text-xs text-secondary font-semibold uppercase">AI Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${currentSession.confidenceScore}%`, background: currentSession.confidenceScore >= 85 ? '#2ED573' : '#FFA502' }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: currentSession.confidenceScore >= 85 ? '#2ED573' : '#FFA502' }}>{currentSession.confidenceScore}%</span>
                  </div>
                </div>
              )}

              <div className="card mb-3">
                <p className="text-xs text-tertiary uppercase mb-2">AI Assessment</p>
                <p className="text-sm text-secondary">{currentSession.aiSummary}</p>
              </div>

              <div className="card mb-3">
                <p className="text-xs text-tertiary uppercase mb-2">Recommended Action</p>
                <p className="text-sm" style={{ color: meta.color, fontWeight: 600 }}>{currentSession.recommendedAction}</p>
              </div>

              {currentSession.uberEstimate && (
                <div className="card card-glass mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-tertiary mb-1">Non-Emergency Transport</p>
                      <p className="font-semibold">
                        ₹{currentSession.uberEstimate.lowFare}–{currentSession.uberEstimate.highFare}
                        <span className="text-xs text-secondary ml-2">{currentSession.uberEstimate.productName}</span>
                      </p>
                      <p className="text-xs text-secondary">ETA ~{currentSession.uberEstimate.etaMinutes} min</p>
                    </div>
                    <button className="btn btn-primary btn-sm">Book Ride</button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="triage-actions">
                {currentSession.confidenceScore && currentSession.confidenceScore < 85 ? (
                  <div className="bg-[rgba(255,165,2,0.1)] border border-[rgba(255,165,2,0.3)] rounded-lg p-4 text-center animate-pulse">
                    <Shield size={24} className="text-[#FFA502] mx-auto mb-2" />
                    <p className="text-sm text-[#FFA502] font-semibold mb-3">AI confidence below threshold. Routing you to a certified doctor for direct assessment.</p>
                    <button className="btn btn-primary btn-block" onClick={() => navigate('/doctor')}>
                      <Phone size={18} /> Connect to Doctor Now
                    </button>
                  </div>
                ) : (
                  <>
                    {(currentSession.triageLevel === 'high' || currentSession.triageLevel === 'critical') && (
                      <button className="btn btn-danger btn-block btn-lg" onClick={handleSOSFromTriage} id="sos-from-triage">
                        <AlertTriangle size={20} fill="white" />
                        Dispatch Ambulance Now
                      </button>
                    )}

                    <button className="btn btn-primary btn-block" onClick={() => navigate('/doctor')} id="consult-doctor-btn">
                      <Phone size={18} />
                      Book Doctor
                    </button>

                    <button className="btn btn-ghost btn-block" onClick={() => navigate('/hospital')} id="find-hospital-btn">
                      <Navigation size={18} />
                      Find Nearest Hospital
                    </button>
                  </>
                )}

                <button className="btn btn-ghost btn-block btn-sm mt-2" onClick={clearSession}>
                  Re-analyze different symptoms
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .symptom-page { overflow-y: auto; }
        .voice-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 0 8px;
        }
        .voice-orb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--bg-elevated);
          border: 2px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.3s;
        }
        .voice-orb.listening {
          border-color: var(--primary);
          box-shadow: 0 0 0 8px var(--primary-glow);
          background: rgba(0,201,167,0.08);
        }
        .voice-rings { position: absolute; inset: 0; }
        .voice-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid var(--primary);
          opacity: 0;
          animation: sos-ripple 2s ease-out infinite;
        }
        .vr1 { inset: -12px; animation-delay: 0s; }
        .vr2 { inset: -24px; animation-delay: 0.5s; }
        .vr3 { inset: -36px; animation-delay: 1s; }
        .waveform {
          display: flex;
          gap: 3px;
          align-items: center;
          height: 32px;
          margin-top: 8px;
        }
        .wave-bar {
          width: 3px;
          border-radius: 2px;
          background: var(--primary);
          height: 100%;
          animation: waveform 0.8s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .divider-text { font-size: 0.75rem; color: var(--text-tertiary); white-space: nowrap; }
        .symptom-input { min-height: 110px; font-size: 0.9375rem; }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .suggestion-pill {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 6px 12px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-body);
          transition: all var(--duration-fast);
        }
        .suggestion-pill:hover { border-color: var(--primary); color: var(--primary); }

        .ai-thinking {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          margin: 16px 0;
        }
        .thinking-dots { display: flex; gap: 8px; }
        .dot-bounce {
          width: 10px;
          height: 10px;
          background: var(--primary);
          border-radius: 50%;
          animation: heartbeat 1.2s ease-in-out infinite;
        }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.4s; }
        .thinking-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .thinking-step {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          opacity: 0;
          animation: fade-in 0.4s var(--ease-out) both;
        }

        .triage-result { margin-top: 8px; }
        .triage-header {
          display: flex;
          gap: 16px;
          padding: 20px;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          border: 1.5px solid;
          border-bottom: none;
          align-items: flex-start;
        }
        .triage-icon { font-size: 2rem; }
        .triage-body {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-top: none;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          padding: 20px;
        }
        .triage-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
};

export default SymptomCheckerPage;
