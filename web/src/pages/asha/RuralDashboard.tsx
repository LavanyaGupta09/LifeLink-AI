import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, ShieldAlert, Pill, MapPin, CloudOff, 
  Mic, UserRound, Building2, FileText, ChevronRight, FlaskConical, Send
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

  /* ─── service card data ─── */
  const services = [
    { id: 'doctor',   label: 'डॉक्टर',        sub: 'वीडियो कॉल करें',    route: '/asha/doctor',      bgCard: '#EAF6FF', bgOuter: '#D1ECFF', bgInner: '#2979FF', Icon: UserRound },
    { id: 'hospital', label: 'अस्पताल',        sub: 'अस्पताल ढूँढें',      route: '/asha/hospital',    bgCard: '#E8FFF3', bgOuter: '#C8F5DC', bgInner: '#00B894', Icon: Building2 },
    { id: 'asha',     label: 'आशा दीदी',       sub: 'आपकी मदद के लिए',   route: '/asha',             bgCard: '#FFF0F3', bgOuter: '#FFDCE4', bgInner: '#E84393', Icon: HeartPulse },
    { id: 'pharma',   label: 'दवा की दुकान',    sub: 'दवा खरीदें',         route: '/asha/pharmacy',    bgCard: '#FFF5EB', bgOuter: '#FFE4C4', bgInner: '#F39C12', Icon: Pill },
    { id: 'lab',      label: 'जाँच',            sub: 'लैब टेस्ट कराएं',     route: '/asha/ghar-jaanch', bgCard: '#EBF8FF', bgOuter: '#C4ECFF', bgInner: '#0984E3', Icon: FlaskConical },
    { id: 'scheme',   label: 'सरकारी योजनाएँ',  sub: 'योजनाओं की जानकारी', route: '/asha/yojna',       bgCard: '#F3EEFF', bgOuter: '#E0D4FF', bgInner: '#6C5CE7', Icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB] pb-28">

      {/* ══════════════ HEADER ══════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#D6EDFF] via-[#E8F4FD] to-[#F5F7FB]">

        {/* village illustration – decorative CSS shapes */}
        <div className="absolute bottom-0 right-0 w-[55%] max-w-[260px] h-[110px] pointer-events-none select-none" aria-hidden="true">
          {/* trees */}
          <div className="absolute bottom-0 right-[10%] w-5 h-12 rounded-t-full bg-[#66BB6A]/60" />
          <div className="absolute bottom-0 right-[22%] w-7 h-16 rounded-t-full bg-[#43A047]/50" />
          <div className="absolute bottom-0 right-[38%] w-6 h-14 rounded-t-full bg-[#66BB6A]/55" />
          <div className="absolute bottom-0 right-[55%] w-5 h-10 rounded-t-full bg-[#81C784]/50" />
          {/* house */}
          <div className="absolute bottom-0 right-[28%] w-10 h-7 bg-[#FFCC80]/70 rounded-t-sm" />
          <div className="absolute bottom-7 right-[26%] w-14 h-5 bg-[#E65100]/40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          {/* ground */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#A5D6A7]/40 rounded-full" />
        </div>

        <div className="relative z-10 px-4 pt-5 pb-6 sm:px-6">
          {/* Top bar: logo + location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#1565C0] to-[#0D47A1] flex items-center justify-center shadow">
                <HeartPulse size={18} className="text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="text-lg sm:text-xl font-black text-[#0D47A1]">LifeLink AI</h1>
                <p className="text-[8px] sm:text-[9px] text-slate-500 font-medium">हर गाँव, हर परिवार का स्वास्थ्य साथी</p>
              </div>
            </div>
            <button className="flex items-center gap-1 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full shadow-sm border border-white/60">
              <MapPin size={11} className="text-[#1565C0]" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1565C0]">रामपुर गाँव</span>
            </button>
          </div>

          {/* Greeting */}
          <div className="mt-5 flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-100 border-2 border-white shadow flex items-center justify-center shrink-0 overflow-hidden">
              <UserRound size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">नमस्ते!</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">आपका स्वास्थ्य, हमारी प्राथमिकता</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ BODY ══════════════ */}
      <div className="px-4 sm:px-6 flex flex-col gap-3.5 -mt-1">

        {/* ── SEHAT SAATHI (Voice AI) ── */}
        <div className="bg-gradient-to-r from-[#E3F0FB] to-[#EBF5FE] border border-blue-100 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left: bot icon + text */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-[#BBDEFB] border-2 border-white shadow-inner flex items-center justify-center">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                  {/* bot face */}
                  <div className="absolute inset-0 bg-[#1565C0] rounded-full flex items-center justify-center">
                    <div className="flex gap-[3px]"><span className="w-[5px] h-[5px] bg-white rounded-full"/><span className="w-[5px] h-[5px] bg-white rounded-full"/></div>
                  </div>
                  {/* headset arc */}
                  <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[115%] h-[55%] border-[2.5px] border-[#0D47A1] border-b-0 rounded-t-full"/>
                  <div className="absolute top-[40%] -left-[4px] w-[6px] h-[8px] bg-[#0D47A1] rounded-full"/>
                  <div className="absolute top-[40%] -right-[4px] w-[6px] h-[8px] bg-[#0D47A1] rounded-full"/>
                  {/* sound waves */}
                  <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-[2px] opacity-60">
                    <div className="w-2.5 h-[2px] bg-[#1565C0] rounded-full"/>
                    <div className="w-3.5 h-[2px] bg-[#1565C0] rounded-full"/>
                    <div className="w-2.5 h-[2px] bg-[#1565C0] rounded-full"/>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-[#0D47A1] flex items-center gap-1 leading-tight">
                  सेहत साथी <Mic size={14} className="text-blue-500 shrink-0"/>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">अपनी सेहत की बात करें,<br className="sm:hidden"/> हमसे पूछें</p>
              </div>
            </div>

            {/* Right: mic button */}
            <div className="flex flex-col items-center shrink-0">
              <button
                onClick={handleVoice}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-[#1565C0] hover:bg-[#0D47A1] active:scale-90'
                }`}
              >
                {isAiLoading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <Mic size={22} className="text-white"/>}
              </button>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1565C0] mt-1">बोलिए...</span>
            </div>
          </div>

          {/* AI response overlay */}
          {aiResponse && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-4 flex flex-col justify-center items-center gap-2 animate-fade-in rounded-2xl">
              <button onClick={() => setAiResponse(null)} className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
              <HeartPulse size={20} className="text-[#1565C0]"/>
              <p className="text-sm font-medium text-slate-700 text-center leading-relaxed max-w-[90%]">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* ── EMERGENCY BANNER ── */}
        <button
          onClick={handleSOS}
          className="w-full bg-[#FFF0F0] border border-[#FFCDD2] rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between active:scale-[0.97] transition-transform"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-[#E53935] flex items-center justify-center shadow">
              <ShieldAlert size={22} className="text-white"/>
            </div>
            <div className="text-left min-w-0">
              <h3 className="font-bold text-[15px] sm:text-base text-[#C62828] leading-tight">आपातकालीन मदद</h3>
              <p className="text-[10px] sm:text-[11px] text-[#E53935]/80 font-medium mt-0.5">तुरंत सहायता के लिए बटन दबाएं</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center shrink-0 shadow">
            <ChevronRight size={18} className="text-white"/>
          </div>
        </button>

        {/* ── SERVICE CARDS GRID (3×2) ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {services.map(s => {
            const SIcon = s.Icon;
            return (
              <button
                key={s.id}
                onClick={() => navigate(s.route)}
                className="rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 sm:gap-2 aspect-square active:scale-[0.94] transition-transform border shadow-sm"
                style={{ backgroundColor: s.bgCard, borderColor: `${s.bgOuter}` }}
              >
                {/* icon circle */}
                <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center" style={{ backgroundColor: s.bgOuter }}>
                  <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center" style={{ backgroundColor: s.bgInner }}>
                    <SIcon size={18} className="text-white sm:w-5 sm:h-5"/>
                  </div>
                </div>
                {/* label */}
                <div className="text-center w-full">
                  <h3 className="font-bold text-[12px] sm:text-[13px] text-slate-800 leading-tight truncate">{s.label}</h3>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 font-medium mt-0.5 leading-tight truncate">{s.sub}</p>
                </div>
                {/* chevron */}
                <ChevronRight size={12} className="text-slate-300 absolute top-1.5 right-1.5 hidden sm:block" />
              </button>
            );
          })}
        </div>

        {/* ── OFFLINE HELP BANNER ── */}
        <button
          onClick={() => navigate('/asha/offline')}
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between active:scale-[0.97] transition-transform"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <CloudOff size={18} className="text-slate-600"/>
            </div>
            <div className="text-left min-w-0">
              <h3 className="font-bold text-[14px] sm:text-[15px] text-slate-800 leading-tight">बिना इंटरनेट मदद</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">ऑफलाइन सेवाएँ और जरूरी जानकारी</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 shrink-0"/>
        </button>

      </div>
    </div>
  );
};

export default RuralDashboard;
