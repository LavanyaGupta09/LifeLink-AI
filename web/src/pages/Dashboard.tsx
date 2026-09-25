import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, Settings, Mic, Send, MapPin, Calendar, Activity, AlertTriangle,
  Ambulance, Building2, UserRound, Pill, ChevronRight, Phone, Home, Briefcase, BadgeCheck, HeartPulse
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import LifeLinkAIAssistant from '../components/LifeLinkAIAssistant';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerSOS, isCounting, countdown, startCountdown, stopCountdown, decrementCountdown } = useSOSStore();

  const [aiQuery, setAiQuery] = useState('');
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCounting) {
      interval = setInterval(() => decrementCountdown(), 1000);
    }
    return () => clearInterval(interval);
  }, [isCounting, decrementCountdown]);

  const handleSOSDown = () => {
    startCountdown();
    // Simulate long press for 3s
    setTimeout(() => {
       if(useSOSStore.getState().isCounting) {
           stopCountdown();
           triggerSOS('CRITICAL', 'MANUAL', 12.9716, 77.5946);
           navigate('/sos');
       }
    }, 3000);
  };

  const handleSOSUp = () => {
    stopCountdown();
  };

  const formatName = (name: string | undefined) => {
    if (!name) return 'LifeLink User';
    if (name.toLowerCase().includes('lavanyagupta')) return 'Lavanya Gupta';
    if (!name.includes(' ') && /\d/.test(name)) {
      const clean = name.replace(/\d+/g, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return name;
  };

  return (
    <div className="min-h-screen bg-[#F4F9F9] font-sans pb-24 relative overflow-hidden">
      {/* Top Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-72 bg-[url('/images/hospital.jpg')] bg-cover bg-center opacity-[0.05] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-[#E8F5F3]/60 to-transparent pointer-events-none"></div>

      <div className="relative z-10 px-4 pt-6 pb-4 max-w-[600px] mx-auto">
        
        {/* 1. Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#00C9A7] flex items-center justify-center font-bold text-white text-xl shadow-sm">
              {formatName(user?.fullName).split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-[#1E293B] text-lg leading-tight flex items-center gap-1">
                {formatName(user?.fullName)}
                <BadgeCheck size={18} className="text-[#3B82F6]" strokeWidth={2} />
              </h2>
              <p className="text-sm text-[#64748B]">LifeLink Member</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 bg-white rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shadow-sm">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-[#FF4757] rounded-full border-2 border-white"></span>
            </button>
            <button className="w-10 h-10 bg-white rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shadow-sm">
              <MessageCircle size={18} />
            </button>
            <button className="w-10 h-10 bg-white rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shadow-sm">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* 2. Logo Area */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="text-[#00C9A7]">
              <HeartPulse size={36} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">
              LifeLink <span className="text-[#00C9A7]">AI</span>
            </h1>
          </div>
          <p className="text-[#64748B] text-sm mt-1">Your Health. Our Priority.</p>
        </div>

        {/* 3. AI Assistant Hero Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F1F5F9] mb-6">
          <div className="flex gap-4 mb-4 items-center">
            <div className="w-24 h-24 bg-[#E8F5F3] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src="/images/robot_assistant.jpg" alt="AI Robot" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1E293B] mb-1">Hello, {formatName(user?.fullName).split(' ')[0]}! 👋</h3>
              <p className="text-[#64748B] text-sm leading-snug mb-3">
                I'm your AI Health Assistant. How can I help you today?
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mic size={18} />
                </div>
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask anything..." 
                  className="w-full pl-12 pr-12 py-3 bg-white border border-[#BDE0D8] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 placeholder:text-[#94A3B8] text-[#1E293B]"
                />
                <button className="absolute inset-y-1.5 right-1.5 w-9 h-9 bg-[#E8F5F3] rounded-full flex items-center justify-center text-[#00C9A7] hover:bg-[#D1ECE7] transition-colors">
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Action List */}
            <div className="flex-1 flex flex-col gap-2">
              <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-[#BDE0D8] rounded-full w-full text-left active:bg-[#F8FAFC]" onClick={() => navigate('/hospitals')}>
                <div className="flex items-center gap-3 text-[#1E293B] font-medium text-[13px]">
                  <MapPin size={18} className="text-[#00C9A7]" />
                  Find nearest hospital
                </div>
                <ChevronRight size={16} className="text-[#00C9A7]" />
              </button>
              <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-[#BDE0D8] rounded-full w-full text-left active:bg-[#F8FAFC]" onClick={() => navigate('/doctor')}>
                <div className="flex items-center gap-3 text-[#1E293B] font-medium text-[13px]">
                  <Calendar size={18} className="text-[#00C9A7]" />
                  Book a doctor
                </div>
                <ChevronRight size={16} className="text-[#00C9A7]" />
              </button>
              <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-[#BDE0D8] rounded-full w-full text-left active:bg-[#F8FAFC]" onClick={() => navigate('/symptoms')}>
                <div className="flex items-center gap-3 text-[#1E293B] font-medium text-[13px]">
                  <Activity size={18} className="text-[#00C9A7]" />
                  Check my symptoms
                </div>
                <ChevronRight size={16} className="text-[#00C9A7]" />
              </button>
            </div>
            
            {/* SOS Card */}
            <div className="w-[145px] bg-[#FFF5F5] border border-[#FEE2E2] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-[#DC2626] font-bold text-sm mb-1">
                <AlertTriangle size={16} fill="currentColor" className="text-[#DC2626]" /> Emergency?
              </div>
              <p className="text-[#64748B] text-[10px] mb-4 leading-tight">Tap for immediate help</p>
              
              <button 
                onMouseDown={handleSOSDown}
                onMouseUp={handleSOSUp}
                onMouseLeave={handleSOSUp}
                onTouchStart={handleSOSDown}
                onTouchEnd={handleSOSUp}
                className={`relative w-20 h-20 rounded-full bg-gradient-to-b from-[#EF4444] to-[#DC2626] flex flex-col items-center justify-center text-white shadow-[0_8px_16px_rgba(220,38,38,0.3)] transition-transform ${isCounting ? 'scale-95' : 'hover:scale-105'} select-none touch-none`}
              >
                {/* Red pulse effect behind button when pressing */}
                {isCounting && (
                   <div className="absolute inset-0 rounded-full border-[3px] border-[#DC2626] animate-[ping_1.5s_ease-out_infinite]"></div>
                )}
                {isCounting ? (
                  <span className="font-bold text-2xl tracking-wide">{countdown}</span>
                ) : (
                  <>
                    <Phone size={24} fill="currentColor" className="mb-1" />
                    <span className="font-bold text-sm tracking-wide">SOS</span>
                  </>
                )}
              </button>
              <p className="text-[#94A3B8] text-[10px] mt-3">Hold 3s</p>
            </div>
          </div>
        </div>

        {/* 4. Quick Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#1E293B] text-lg flex items-center gap-2">
              <span className="text-[#00C9A7] text-xl">⚡</span> Quick Actions
            </h3>
            <button className="text-[#00C9A7] font-medium text-sm hover:underline">Edit</button>
          </div>
          
          <div className="flex justify-between gap-3 overflow-x-auto pb-2 hide-scrollbar">
            <button className="flex flex-col items-center justify-center bg-white border border-[#FEE2E2] rounded-2xl p-4 w-full min-w-[80px] relative shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 transition-transform" onClick={() => navigate('/ambulance')}>
              <div className="absolute -top-2 left-2 bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">24/7</div>
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4444] mb-2">
                <Ambulance size={22} />
              </div>
              <span className="text-[#1E293B] text-sm font-semibold">Ambulance</span>
            </button>
            
            <button className="flex flex-col items-center justify-center bg-white border border-[#E0F2F1] rounded-2xl p-4 w-full min-w-[80px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 transition-transform" onClick={() => navigate('/hospitals')}>
              <div className="w-12 h-12 bg-[#E6F8F5] rounded-full flex items-center justify-center text-[#00C9A7] mb-2">
                <Building2 size={22} />
              </div>
              <span className="text-[#1E293B] text-sm font-semibold">Hospitals</span>
            </button>
            
            <button className="flex flex-col items-center justify-center bg-white border border-[#E0E7FF] rounded-2xl p-4 w-full min-w-[80px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 transition-transform" onClick={() => navigate('/doctor')}>
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#3B82F6] mb-2">
                <UserRound size={22} />
              </div>
              <span className="text-[#1E293B] text-sm font-semibold">Doctors</span>
            </button>
            
            <button className="flex flex-col items-center justify-center bg-white border border-[#E0E7FF] rounded-2xl p-4 w-full min-w-[80px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 transition-transform" onClick={() => navigate('/pharmacy')}>
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#3B82F6] mb-2">
                <Pill size={22} />
              </div>
              <span className="text-[#1E293B] text-sm font-semibold">Pharmacy</span>
            </button>
          </div>
        </div>

        {/* 5. Appointments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#1E293B] text-lg flex items-center gap-2">
              <Calendar size={20} className="text-[#00C9A7]" /> Appointments
            </h3>
            <button className="text-[#00C9A7] font-medium text-sm flex items-center gap-1 hover:underline">
              View all <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=dr_ananya" alt="Dr. Ananya Sharma" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E293B] text-base mb-0.5">Dr. Ananya Sharma</h4>
                <div className="flex flex-col gap-1">
                  <span className="text-[#64748B] text-xs flex items-center gap-1.5"><UserRound size={12}/> General Physician</span>
                  <span className="text-[#64748B] text-xs flex items-center gap-1.5"><Calendar size={12}/> Today, 10:30 AM</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-[#E6F8F5] text-[#00C9A7] px-3 py-1.5 rounded-full text-xs font-bold self-start mt-1 cursor-pointer hover:bg-[#D1ECE7] transition-colors">
              Confirmed <ChevronRight size={14} />
            </div>
          </div>
        </div>
        
      </div>
      
      {/* 6. Bottom Navigation (Fixed) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#F1F5F9] pb-safe pt-2 px-6 flex justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-50">
        <button className="flex flex-col items-center gap-1 relative w-12" onClick={() => navigate('/dashboard')}>
          <div className="absolute -top-2 w-8 h-1 bg-[#00C9A7] rounded-b-md"></div>
          <Home size={24} className="text-[#00C9A7]" fill="currentColor" />
          <span className="text-[#00C9A7] text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 opacity-60 hover:opacity-100 transition-opacity" onClick={() => navigate('/symptoms')}>
          <Activity size={24} className="text-[#64748B]" />
          <span className="text-[#64748B] text-[10px] font-medium">Symptoms</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 opacity-60 hover:opacity-100 transition-opacity" onClick={() => navigate('/hospitals')}>
          <Building2 size={24} className="text-[#64748B]" />
          <span className="text-[#64748B] text-[10px] font-medium">Hospitals</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 opacity-60 hover:opacity-100 transition-opacity" onClick={() => navigate('/ambulance')}>
          <Ambulance size={24} className="text-[#64748B]" />
          <span className="text-[#64748B] text-[10px] font-medium">Ambulance</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 opacity-60 hover:opacity-100 transition-opacity" onClick={() => navigate('/partner')}>
          <UserRound size={24} className="text-[#64748B]" />
          <span className="text-[#64748B] text-[10px] font-medium">Partner</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 opacity-60 hover:opacity-100 transition-opacity" onClick={() => navigate('/profile')}>
          <UserRound size={24} className="text-[#64748B]" />
          <span className="text-[#64748B] text-[10px] font-medium">Profile</span>
        </button>
      </div>
      
      <LifeLinkAIAssistant />
    </div>
  );
};

export default Dashboard;
