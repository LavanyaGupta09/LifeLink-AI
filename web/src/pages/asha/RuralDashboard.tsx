import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, ShieldAlert, PhoneCall, Pill, Heart, 
  MapPin, CloudOff, FileText, Mic, Send, Stethoscope, Video
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
        recognition.lang = 'hi-IN'; // Using Hindi for rural mode
        recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setAiQuery(text);
          setIsListening(false);
          // Optional auto-submit: handleAiSubmit(text);
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

  return (
    <div className="w-full flex justify-center pb-32">
      <div className="flex flex-col gap-5 p-4 w-full max-w-[1400px] text-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#00C9A7]">नमस्ते 👋</h1>
            <h2 className="text-lg font-bold mt-1">{user?.fullName || 'LifeLink User'}</h2>
            <div className="flex items-center gap-1 mt-1 bg-white/10 px-2 py-1 rounded-full w-max">
              <MapPin size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400">रामपुर गाँव</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-[#131F35] border border-slate-700 rounded-full flex items-center justify-center shadow-lg">
            <HeartPulse size={28} className="text-[#00C9A7]" />
          </div>
        </div>

        {/* VOICE AI ASSISTANT (SEHAT SAATHI) */}
        <div className="bg-[#131B31] border-2 border-[#8B5CF6]/50 rounded-[24px] p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/20 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">सेहत साथी 🎙️</h3>
              <p className="text-xs text-slate-300">अपनी सेहत के बारे में पूछें</p>
            </div>
          </div>

          <div className="relative z-10 flex gap-2">
            <button 
              onClick={handleVoice}
              className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening 
                  ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' 
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED]'
              }`}
            >
              <Mic size={24} className="text-white" />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiSubmit(); }}
                disabled={isAiLoading} 
                className="w-full h-full bg-[#0B1121] border border-slate-700 rounded-2xl px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors shadow-inner"
                placeholder="बोलिए, हम सुन रहे हैं..."
              />
              <button 
                onClick={() => handleAiSubmit()}
                disabled={isAiLoading || !aiQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#2D1B4E] flex items-center justify-center disabled:opacity-50"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={16} className="text-[#8B5CF6] ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Quick AI Suggestions */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-3 relative z-10 pb-1">
            {['🤒 बुखार', '🤧 खांसी', '🩹 चोट', '🫁 साँस की दिक्कत'].map(q => (
              <button 
                key={q}
                onClick={() => { setAiQuery(q); handleAiSubmit(q); }}
                className="shrink-0 bg-[#2D1B4E] border border-[#8B5CF6]/30 text-white text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {aiResponse && (
            <div className="mt-4 bg-[#0B1121] border border-[#8B5CF6]/40 rounded-xl p-4 relative z-10 animate-fade-in">
              <button onClick={() => setAiResponse(null)} className="absolute top-2 right-2 text-slate-400">
                ✕
              </button>
              <p className="text-sm text-slate-200 pr-4 leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
          
          {/* 1. Emergency Help */}
          <button 
            onClick={handleSOS}
            className="col-span-2 bg-gradient-to-br from-[#FF4757] to-[#D63031] border-2 border-[#FF4757] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(255,71,87,0.3)] flex items-center justify-between group transition-transform active:scale-95"
          >
            <div className="text-left">
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">🚨 आपातकालीन मदद</h2>
              <p className="text-white/90 text-sm font-semibold">इमरजेंसी में दबाएँ</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShieldAlert size={32} className="text-white" />
            </div>
          </button>

          {/* 2. Doctor Se Salah */}
          <button onClick={() => navigate('/asha/doctor')} className="bg-[#131F35] border border-[#3D91FF]/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform hover:border-[#3D91FF]">
            <div className="w-16 h-16 bg-[#3D91FF]/10 rounded-full flex items-center justify-center shadow-inner">
              <Video size={28} className="text-[#3D91FF]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-white">👨‍⚕️ डॉक्टर</h3>
              <p className="text-[10px] text-slate-400 mt-1">वीडियो कॉल करें</p>
            </div>
          </button>

          {/* 3. Najdeek Ka Hospital */}
          <button onClick={() => navigate('/asha/hospital')} className="bg-[#131F35] border border-[#00C9A7]/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform hover:border-[#00C9A7]">
            <div className="w-16 h-16 bg-[#00C9A7]/10 rounded-full flex items-center justify-center shadow-inner">
              <MapPin size={28} className="text-[#00C9A7]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-white">🏥 अस्पताल</h3>
              <p className="text-[10px] text-slate-400 mt-1">अस्पताल ढूँढें</p>
            </div>
          </button>

          {/* 4. ASHA Seva */}
          <button onClick={() => navigate('/asha')} className="col-span-2 bg-[#190F24] border border-[#F97316]/50 rounded-[20px] p-4 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-14 h-14 bg-[#F97316]/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <HeartPulse size={24} className="text-[#F97316]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-black text-lg text-white">👩‍⚕️ आशा दीदी</h3>
              <p className="text-xs text-slate-300 mt-0.5">आशा दीदी से मदद लें</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
              <span className="text-white text-lg font-bold">›</span>
            </div>
          </button>

          {/* 5. Sasti Dawai */}
          <button onClick={() => navigate('/asha/pharmacy')} className="bg-[#131F35] border border-[#2ED573]/30 rounded-xl p-3 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-[#2ED573]/10 rounded-full flex items-center justify-center shrink-0">
              <Pill size={18} className="text-[#2ED573]" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm text-white">💊 दवा की दुकान</h3>
            </div>
          </button>

          {/* 6. Ghar Par Jaanch */}
          <button onClick={() => navigate('/asha/ghar-jaanch')} className="bg-[#131F35] border border-amber-500/30 rounded-xl p-3 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
              <Heart size={18} className="text-amber-500" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm text-white">🧪 जाँच</h3>
            </div>
          </button>

          {/* 7. Sarkari Swasthya Yojna */}
          <button onClick={() => navigate('/asha/yojna')} className="col-span-2 bg-[#131F35] border border-indigo-500/30 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0">
              <FileText size={20} className="text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base text-white">🏛️ सरकारी योजनाएँ</h3>
              <p className="text-[10px] text-slate-400 mt-1">योजनाओं की जानकारी देखें</p>
            </div>
          </button>

          {/* 8. Offline Help */}
          <button onClick={() => navigate('/asha/offline')} className="col-span-2 bg-[#0B1221] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
              <CloudOff size={20} className="text-slate-300" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base text-white">📶 बिना इंटरनेट मदद</h3>
              <p className="text-[10px] text-slate-400 mt-1">बिना इंटरनेट के चलाएं</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default RuralDashboard;
