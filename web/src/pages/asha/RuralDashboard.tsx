import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, ShieldAlert, Pill, MapPin, CloudOff,
  Mic, UserRound, Building2, FileText, ChevronRight,
  FlaskConical, Send, Stethoscope
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSOSStore } from '../../store/sosStore';

const RuralDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerSOS } = useSOSStore();

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSOS = () => {
    navigate('/sos');
  };

  const handleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'hi-IN';
        recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setAiQuery(text);
          setIsListening(false);
          handleAiSubmit(text);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } else {
        setTimeout(() => setIsListening(false), 2000);
      }
    } else {
      setIsListening(false);
    }
  };

  const handleAiSubmit = async (query = aiQuery) => {
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://lifelink-ai-rwru.onrender.com'}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query + " (Reply in simple Hindi/Hinglish suitable for a rural Indian user. Keep it very short.)" }] })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.message);
      } else {
        setAiResponse("माफ़ करें, अभी इंटरनेट धीमा है।");
      }
    } catch (error) {
      setAiResponse("माफ़ करें, अभी इंटरनेट धीमा है।");
    } finally {
      setIsAiLoading(false);
      if (query === aiQuery) setAiQuery('');
    }
  };

  const formatName = (name: string | undefined) => {
    if (!name) return 'User';
    if (name.includes(' ')) return name.split(' ')[0];
    return name.replace(/\d+/g, '');
  };

  /* ─── Services ─── */
  const services = [
    { id: 'doctor',   label: 'डॉक्टर',        sub: 'वीडियो कॉल करें',   route: '/asha/doctor',      Icon: UserRound },
    { id: 'hospital', label: 'अस्पताल',        sub: 'अस्पताल ढूँढें',     route: '/asha/hospital',    Icon: Building2 },
    { id: 'asha',     label: 'आशा दीदी',       sub: 'आपकी मदद के लिए',  route: '/asha',             Icon: HeartPulse },
    { id: 'pharma',   label: 'दवा की दुकान',    sub: 'दवा खरीदें',        route: '/asha/pharmacy',    Icon: Pill },
    { id: 'lab',      label: 'जाँच',            sub: 'लैब टेस्ट कराएं',    route: '/asha/ghar-jaanch', Icon: FlaskConical },
    { id: 'scheme',   label: 'सरकारी योजनाएँ',  sub: 'योजनाओं की जानकारी', route: '/asha/yojna',      Icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen pb-24">
      <div className="flex flex-col w-full max-w-[600px] mx-auto">

        {/* ═══════════════════════════════════════════
            1. HEADER
        ═══════════════════════════════════════════ */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-2.5">
              <HeartPulse size={26} className="text-[#00C9A7]" />
              <div>
                <h1 className="text-lg font-black text-white tracking-tight leading-none">
                  LifeLink <span className="text-[#00C9A7]">AI</span>
                </h1>
                <p className="text-[9px] text-slate-400 mt-0.5">हर गाँव, हर परिवार का स्वास्थ्य साथी</p>
              </div>
            </div>
            {/* Location */}
            <div className="flex items-center gap-1.5 bg-[#0F1D32] px-3 py-1.5 rounded-full border border-slate-700/50">
              <MapPin size={12} className="text-[#00C9A7]" />
              <span className="text-[11px] font-semibold text-slate-300">रामपुर गाँव</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="mt-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#0F1D32] border border-slate-700/50 flex items-center justify-center shrink-0">
              <UserRound size={22} className="text-[#00C9A7]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                नमस्ते, {formatName(user?.fullName)}! 👋
              </h2>
              <p className="text-[12px] text-slate-400 mt-0.5">आपका स्वास्थ्य, हमारी प्राथमिकता</p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            2. SEHAT SAATHI (Voice AI Assistant)
        ═══════════════════════════════════════════ */}
        <div className="px-4 mb-4">
          <div className="bg-[#0F1D32] border border-slate-700/40 rounded-2xl p-4 relative overflow-hidden">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#00C9A7]/15 flex items-center justify-center shrink-0">
                <Stethoscope size={22} className="text-[#00C9A7]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-white leading-tight">सेहत साथी 🎙️</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">अपनी सेहत के बारे में पूछें</p>
              </div>
            </div>

            {/* Voice + Text Input Row */}
            <div className="flex gap-3 items-center">
              <button
                onClick={handleVoice}
                className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'bg-[#00C9A7] hover:bg-[#00B396] active:scale-90'
                }`}
              >
                {isAiLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic size={24} className="text-white" />
                )}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAiSubmit(); }}
                  disabled={isAiLoading}
                  className="w-full bg-[#0A1628] border border-slate-700/50 rounded-xl py-3 px-4 pr-11 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9A7]/50 transition-colors disabled:opacity-50"
                  placeholder="बोलिए या लिखिए..."
                />
                <button
                  onClick={() => handleAiSubmit()}
                  disabled={isAiLoading || !aiQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#00C9A7] flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Send size={14} className="text-white ml-0.5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
              {['🤒 बुखार', '🤧 खांसी', '🩹 चोट', '🫁 साँस'].map(q => (
                <button
                  key={q}
                  onClick={() => { setAiQuery(q); handleAiSubmit(q); }}
                  className="shrink-0 bg-[#0A1628] border border-slate-700/40 text-slate-300 text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap hover:border-[#00C9A7]/40 hover:text-white transition-colors active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* AI Response */}
            {aiResponse && (
              <div className="mt-3 bg-[#0A1628] border border-slate-700/40 rounded-xl p-3.5 relative">
                <button onClick={() => setAiResponse(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                <div className="flex gap-2 items-start">
                  <HeartPulse size={16} className="text-[#00C9A7] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-200 leading-relaxed pr-5">{aiResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            3. EMERGENCY HELP
        ═══════════════════════════════════════════ */}
        <div className="px-4 mb-4">
          <button
            onClick={handleSOS}
            className="w-full bg-[#2C1215] border border-red-900/60 rounded-2xl px-4 py-4 flex items-center justify-between active:scale-[0.97] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DC2626] flex items-center justify-center shrink-0">
                <ShieldAlert size={24} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-[16px] font-bold text-[#FCA5A5] leading-tight">आपातकालीन मदद</h3>
                <p className="text-[12px] text-red-400/70 mt-0.5">तुरंत सहायता के लिए दबाएँ</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#DC2626] flex items-center justify-center shrink-0">
              <ChevronRight size={20} className="text-white" />
            </div>
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            4. MAIN HEALTH SERVICES (3×2 Grid)
        ═══════════════════════════════════════════ */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-3 gap-3">
            {services.map(s => {
              const SIcon = s.Icon;
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(s.route)}
                  className="bg-[#0F1D32] border border-slate-700/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-2.5 aspect-[4/5] active:scale-[0.94] active:bg-[#142640] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#00C9A7]/12 flex items-center justify-center">
                    <SIcon size={22} className="text-[#00C9A7]" />
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-[13px] font-bold text-white leading-tight">{s.label}</h3>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-tight truncate">{s.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            5. OFFLINE HELP
        ═══════════════════════════════════════════ */}
        <div className="px-4 mb-6">
          <button
            onClick={() => navigate('/asha/offline')}
            className="w-full bg-[#0F1D32] border border-slate-700/40 rounded-2xl px-4 py-4 flex items-center justify-between active:scale-[0.97] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700/40 flex items-center justify-center shrink-0">
                <CloudOff size={18} className="text-slate-400" />
              </div>
              <div className="text-left">
                <h3 className="text-[14px] font-bold text-white leading-tight">📶 बिना इंटरनेट मदद</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ऑफलाइन सेवाएँ और जरूरी जानकारी</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default RuralDashboard;
