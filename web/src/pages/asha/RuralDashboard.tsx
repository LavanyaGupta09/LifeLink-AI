import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, ShieldAlert, Pill, MapPin, CloudOff, 
  Mic, UserRound, Video, Building2, FileText, ChevronRight, FlaskConical, Stethoscope
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

  return (
    <div className="w-full flex justify-center pb-32 bg-[#FAFBFF] min-h-screen text-slate-800 font-sans">
      <div className="flex flex-col gap-4 p-4 w-full max-w-[1400px]">
        
        {/* HEADER SECTION (Light Theme with Village bg style) */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#E6F4FB] to-[#F1F9FE] -mx-4 -mt-4 px-4 pt-6 pb-8 mb-2 border-b border-blue-100 rounded-b-3xl">
          {/* Abstract village shapes / background graphic simulation */}
          <div className="absolute bottom-0 right-0 w-[200px] h-[100px] pointer-events-none opacity-40">
            <div className="absolute bottom-0 right-4 w-12 h-10 bg-[#B8E1C2] rounded-t-sm"></div>
            <div className="absolute bottom-10 right-2 w-16 h-8 bg-amber-700 rounded-t-full rotate-[-10deg]"></div>
            <div className="absolute bottom-0 right-20 w-16 h-14 bg-[#B8E1C2] rounded-t-sm"></div>
            <div className="absolute bottom-14 right-16 w-24 h-12 bg-amber-700 rounded-t-full rotate-[5deg]"></div>
            <div className="absolute bottom-0 right-10 w-8 h-16 bg-green-500 rounded-t-full opacity-60"></div>
            <div className="absolute bottom-0 right-32 w-12 h-20 bg-green-400 rounded-t-full opacity-60"></div>
          </div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] rounded-full flex items-center justify-center shadow-md">
                <HeartPulse size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#0D47A1] leading-tight">LifeLink AI</h1>
                <p className="text-[9px] font-medium text-slate-600">हर गाँव, हर परिवार का स्वास्थ्य साथी</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <MapPin size={12} className="text-[#0D47A1]" />
              <span className="text-[11px] font-bold text-[#0D47A1]">रामपुर गाँव</span>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                <UserRound className="text-blue-500" size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">नमस्ते!</h2>
                <p className="text-xs font-medium text-slate-600 mt-0.5">आपका स्वास्थ्य, हमारी प्राथमिकता</p>
             </div>
          </div>
        </div>

        {/* VOICE AI ASSISTANT (SEHAT SAATHI) */}
        <div className="bg-gradient-to-r from-[#EBF4FA] to-[#E3F2FD] border border-blue-100 rounded-2xl p-4 shadow-sm flex items-center justify-between mt-2 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-16 h-16 bg-[#BBDEFB] rounded-full flex items-center justify-center shrink-0 border border-white shadow-inner">
               {/* Simulating the bot icon from the image */}
              <div className="relative w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                 </div>
                 {/* Headphones simulation */}
                 <div className="absolute top-0 w-12 h-6 border-t-2 border-l-2 border-r-2 border-blue-800 rounded-t-full"></div>
                 <div className="absolute -left-1.5 top-5 w-2 h-4 bg-blue-800 rounded-full"></div>
                 <div className="absolute -right-1.5 top-5 w-2 h-4 bg-blue-800 rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#0D47A1] mb-0.5 flex items-center gap-1">
                सेहत साथी <Mic size={16} className="text-blue-500" />
              </h3>
              <p className="text-[11px] text-slate-600 leading-snug">अपनी सेहत की बात करें,<br/>हमसे पूछें</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <button 
              onClick={handleVoice}
              className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md border-2 border-white ${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAiLoading ? (
                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Mic size={24} className="text-white" />
              )}
            </button>
            <span className="text-[11px] font-bold text-blue-700 mt-1">बोलिए...</span>
          </div>

           {aiResponse && (
            <div className="absolute top-0 left-0 w-full h-full bg-white/95 z-20 p-4 flex flex-col justify-center animate-fade-in">
              <button onClick={() => setAiResponse(null)} className="absolute top-2 right-2 text-slate-500">✕</button>
              <p className="text-sm font-semibold text-slate-800 text-center">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* EMERGENCY BANNER */}
        <button 
          onClick={handleSOS}
          className="w-full bg-[#FFEFEF] border border-[#FFCDCD] rounded-xl p-4 shadow-sm flex items-center justify-between mt-1 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="w-10 h-10 bg-red-600 rounded-t-lg rounded-b flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-3 h-1 bg-red-600 absolute"></div>
                        <div className="w-1 h-3 bg-red-600 absolute"></div>
                    </div>
                </div>
                <div className="absolute -top-1 w-4 h-2 bg-red-400 rounded-t-full"></div>
                <div className="absolute -top-2 w-1 h-1 bg-red-500 animate-ping rounded-full"></div>
             </div>
             <div className="text-left">
                <h3 className="font-bold text-lg text-red-600 mb-0.5">आपातकालीन मदद</h3>
                <p className="text-[11px] text-red-700/80 font-medium">तुरंत सहायता के लिए बटन दबाएं</p>
             </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
             <ChevronRight size={20} className="text-white" />
          </div>
        </button>

        {/* MAIN GRID - 3 columns like the app */}
        <div className="grid grid-cols-3 gap-3 mt-1">
          
          {/* 1. Doctor */}
          <button onClick={() => navigate('/asha/doctor')} className="bg-[#EAF6FF] border border-blue-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-[130px] active:scale-95 transition-transform relative">
             <ChevronRight size={14} className="text-slate-400 absolute top-2 right-2" />
             <div className="w-14 h-14 bg-[#D1ECFF] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                    <UserRound size={22} className="text-white mt-1" />
                </div>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-[14px] text-slate-800 leading-tight">डॉक्टर</h3>
               <p className="text-[9px] text-slate-500 font-medium mt-0.5">वीडियो कॉल करें</p>
             </div>
          </button>

          {/* 2. Hospital */}
          <button onClick={() => navigate('/asha/hospital')} className="bg-[#EFFFF6] border border-green-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-[130px] active:scale-95 transition-transform relative">
             <ChevronRight size={14} className="text-slate-400 absolute top-2 right-2" />
             <div className="w-14 h-14 bg-[#D1F6E2] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-[#00C9A7] rounded-md flex items-center justify-center">
                    <Building2 size={20} className="text-white" />
                </div>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-[14px] text-slate-800 leading-tight">अस्पताल</h3>
               <p className="text-[9px] text-slate-500 font-medium mt-0.5">अस्पताल ढूँढें</p>
             </div>
          </button>

          {/* 3. Asha Didi */}
          <button onClick={() => navigate('/asha')} className="bg-[#F4EFFF] border border-purple-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-[130px] active:scale-95 transition-transform relative">
             <ChevronRight size={14} className="text-slate-400 absolute top-2 right-2" />
             <div className="w-14 h-14 bg-[#E6D9FF] rounded-full flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-purple-500 flex items-center justify-center pt-2">
                   <UserRound size={24} className="text-white" />
                </div>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-[14px] text-slate-800 leading-tight">आशा दीदी</h3>
               <p className="text-[9px] text-slate-500 font-medium mt-0.5">आपकी मदद के लिए</p>
             </div>
          </button>

          {/* 4. Pharmacy */}
          <button onClick={() => navigate('/asha/pharmacy')} className="bg-[#FFF8EA] border border-orange-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-[130px] active:scale-95 transition-transform relative">
             <ChevronRight size={14} className="text-slate-400 absolute top-2 right-2" />
             <div className="w-14 h-14 bg-[#FFECCC] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                   <Pill size={18} className="text-white" />
                </div>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-[14px] text-slate-800 leading-tight">दवा की दुकान</h3>
               <p className="text-[9px] text-slate-500 font-medium mt-0.5">दवा खरीदें</p>
             </div>
          </button>

          {/* 5. Lab Test */}
          <button onClick={() => navigate('/asha/ghar-jaanch')} className="bg-[#EAFBFF] border border-cyan-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-[130px] active:scale-95 transition-transform relative">
             <ChevronRight size={14} className="text-slate-400 absolute top-2 right-2" />
             <div className="w-14 h-14 bg-[#CCF4FF] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                   <FlaskConical size={18} className="text-white" />
                </div>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-[14px] text-slate-800 leading-tight">जाँच</h3>
               <p className="text-[9px] text-slate-500 font-medium mt-0.5">लैब टेस्ट कराएं</p>
             </div>
          </button>

          {/* 6. Govt Schemes */}
          <button onClick={() => navigate('/asha/yojna')} className="bg-[#F8EFFF] border border-fuchsia-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-[130px] active:scale-95 transition-transform relative">
             <ChevronRight size={14} className="text-slate-400 absolute top-2 right-2" />
             <div className="w-14 h-14 bg-[#EFD9FF] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-fuchsia-500 rounded-full flex items-center justify-center">
                   <FileText size={18} className="text-white" />
                </div>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-[14px] text-slate-800 leading-tight">सरकारी योजनाएँ</h3>
               <p className="text-[9px] text-slate-500 font-medium mt-0.5">योजनाओं की जानकारी</p>
             </div>
          </button>
        </div>

        {/* OFFLINE BANNER */}
        <button onClick={() => navigate('/asha/offline')} className="w-full bg-[#E8EDF2] border border-slate-200 rounded-xl p-4 flex items-center justify-between mt-2 active:scale-95 transition-transform">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                <CloudOff size={18} className="text-slate-700" />
             </div>
             <div className="text-left">
                <h3 className="font-bold text-base text-slate-800">बिना इंटरनेट मदद</h3>
                <p className="text-[10px] text-slate-500 font-medium">ऑफलाइन सेवाएँ और जरूरी जानकारी</p>
             </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

      </div>
    </div>
  );
};

export default RuralDashboard;
