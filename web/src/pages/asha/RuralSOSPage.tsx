import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOSStore } from '../../store/sosStore';
import { 
  ShieldAlert, Mic, MapPin, Phone, 
  HeartPulse, Heart, X, CheckCircle2,
  Clock, Activity, AlertTriangle, Flame, UserPlus
} from 'lucide-react';

const RuralSOSPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSOSActive, triggerSOS, cancelSOS, sosEvent } = useSOSStore();

  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Tracking states
  const [statusStep, setStatusStep] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isSOSActive) {
      // Simulate progress
      const t1 = setTimeout(() => setStatusStep(1), 1500); // Contacts
      const t2 = setTimeout(() => setStatusStep(2), 3500); // ASHA
      const t3 = setTimeout(() => setStatusStep(3), 5500); // Coming
      const t4 = setTimeout(() => setStatusStep(4), 7000); // Hospital
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    } else {
      setStatusStep(0);
    }
  }, [isSOSActive]);

  const handleTriggerSOS = (type = 'GENERAL') => {
    // Attempt to get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          triggerSOS('CRITICAL', type, pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          triggerSOS('CRITICAL', type, 28.5355, 77.2690); // Fallback
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      triggerSOS('CRITICAL', type, 28.5355, 77.2690);
    }
  };

  const handleCancel = () => {
    cancelSOS();
    navigate('/dashboard');
  };

  // ----------------------------------------------------
  // IDLE STATE (Before SOS is triggered)
  // ----------------------------------------------------
  if (!isSOSActive) {
    return (
      <div className="min-h-screen bg-[#0B1121] text-white flex flex-col items-center pb-24 p-4">
        
        <div className="w-full flex justify-between items-center mb-6 mt-2">
          <button onClick={() => navigate(-1)} className="text-slate-400 p-2 bg-[#131F35] rounded-full">
            <X size={24} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-500" />
            <h1 className="text-lg font-bold">Emergency</h1>
          </div>
          <div className="w-10"></div> {/* spacer */}
        </div>

        {/* 1. TURANT MADAD BUTTON */}
        <button 
          onClick={() => handleTriggerSOS(emergencyType || 'GENERAL')}
          className="w-64 h-64 bg-gradient-to-br from-[#FF4757] to-[#D63031] rounded-full flex flex-col items-center justify-center gap-3 shadow-[0_0_50px_rgba(255,71,87,0.4)] animate-pulse-slow active:scale-95 transition-transform border-[8px] border-[#FF4757]/30 relative z-10"
        >
          <ShieldAlert size={64} className="text-white" />
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight leading-none mb-1">TURANT<br/>MADAD</h2>
            <p className="text-xs font-bold text-white/80">Emergency mein dabayein</p>
          </div>
        </button>

        {/* VOICE SOS */}
        <button 
          onClick={() => handleTriggerSOS('VOICE')}
          className="mt-8 bg-[#131F35] border border-[#8B5CF6]/50 rounded-full px-6 py-3 flex items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-[#8B5CF6] rounded-full flex items-center justify-center">
            <Mic size={20} className="text-white" />
          </div>
          <span className="font-bold text-sm">🎙️ Bolkar SOS karein</span>
        </button>

        <div className="w-full max-w-sm mt-10">
          <p className="text-center text-sm font-bold text-slate-400 mb-4">Kya hua hai? (Optional)</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'CHEST', icon: Heart, label: 'Chest problem', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
              { id: 'BREATHING', icon: Activity, label: 'Saans ki dikkat', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
              { id: 'BLEEDING', icon: HeartPulse, label: 'Khoon behna', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
              { id: 'INJURY', icon: AlertTriangle, label: 'Gambhir chot', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
              { id: 'BURN', icon: Flame, label: 'Jalna', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
              { id: 'OTHER', icon: UserPlus, label: 'Other', color: 'text-slate-300', bg: 'bg-slate-700/30', border: 'border-slate-600' }
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => setEmergencyType(type.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  emergencyType === type.id 
                    ? `bg-[#1A233A] ${type.border} ring-2 ring-offset-2 ring-offset-[#0B1121] ring-${type.color.split('-')[1]}-500` 
                    : `bg-[#131F35] ${type.border}`
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${type.bg} flex items-center justify-center`}>
                  <type.icon size={20} className={type.color} />
                </div>
                <span className="text-[10px] font-bold text-center text-slate-300">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE SOS STATE (Tracking)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-red-950/20 text-white flex flex-col items-center pb-24 p-4 relative overflow-hidden">
      
      {/* Red flashing background effect */}
      <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow pointer-events-none"></div>

      <div className="w-full max-w-sm flex flex-col gap-4 relative z-10">
        
        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-orange-500/20 border border-orange-500 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
              <Phone size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-orange-400">📶 Internet nahi hai</h3>
              <p className="text-xs text-orange-200 mt-1">Koi chinta nahi. SMS bheja gaya hai.</p>
            </div>
          </div>
        )}

        {/* Location Box */}
        <div className="bg-[#131F35] border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#00C9A7]/10 rounded-full flex items-center justify-center shrink-0">
            <MapPin size={24} className="text-[#00C9A7]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-300 text-sm">📍 Aapki Location</h3>
            <p className="text-lg font-bold text-[#00C9A7] mt-0.5">Rampur Village</p>
          </div>
        </div>

        {/* Tracking Flow */}
        <div className="bg-[#0B1121] border border-red-900/50 rounded-2xl p-6 flex flex-col gap-6 shadow-[0_0_30px_rgba(255,0,0,0.1)] mt-2">
          
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 0 ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <ShieldAlert size={16} />
              </div>
              <div className={`w-0.5 h-8 ${statusStep >= 1 ? 'bg-red-500' : 'bg-slate-800'}`}></div>
            </div>
            <div className="pt-1">
              <h3 className={`font-bold ${statusStep >= 0 ? 'text-white' : 'text-slate-500'}`}>🆘 SOS Sent</h3>
              <p className="text-[10px] text-slate-400">Madad maangi gayi hai</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <CheckCircle2 size={16} />
              </div>
              <div className={`w-0.5 h-8 ${statusStep >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
            </div>
            <div className="pt-1">
              <h3 className={`font-bold ${statusStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>Family ko inform kar diya gaya hai</h3>
              <p className="text-[10px] text-slate-400">Ramesh, Sita (Contacts)</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <HeartPulse size={16} />
              </div>
              <div className={`w-0.5 h-8 ${statusStep >= 3 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
            </div>
            <div className="pt-1 w-full">
              <h3 className={`font-bold ${statusStep >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>👩‍⚕️ ASHA Worker ko batayein</h3>
              {statusStep >= 2 && (
                <div className="mt-2 bg-[#131F35] border border-blue-500/30 rounded-xl p-3">
                  <p className="text-xs font-bold">Sunita Devi (ASHA)</p>
                  <p className="text-[10px] text-slate-400">500m door</p>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1">
                      <Phone size={12} /> Call
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1">
                      Help Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 3 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <Clock size={16} />
              </div>
              <div className={`w-0.5 h-8 ${statusStep >= 4 ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
            </div>
            <div className="pt-1">
              <h3 className={`font-bold ${statusStep >= 3 ? 'text-orange-400' : 'text-slate-500'}`}>🚑 Ambulance Assigned</h3>
              <p className="text-[10px] text-slate-400">Help aa rahi hai</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 4 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <Activity size={16} />
              </div>
            </div>
            <div className="pt-1">
              <h3 className={`font-bold ${statusStep >= 4 ? 'text-indigo-400' : 'text-slate-500'}`}>🏥 Hospital ko alert bheja gaya hai</h3>
              <p className="text-[10px] text-slate-400">District Hospital, 15km</p>
            </div>
          </div>

        </div>

        <button 
          onClick={handleCancel}
          className="mt-6 bg-[#131F35] border border-slate-700 hover:border-slate-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-slate-300"
        >
          <X size={20} /> Cancel SOS
        </button>

      </div>
    </div>
  );
};

export default RuralSOSPage;
