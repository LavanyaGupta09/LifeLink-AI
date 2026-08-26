import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, Settings, Mic, Send, MapPin, Calendar, Activity, AlertTriangle,
  Ambulance, Building2, UserRound, Pill, FlaskConical, Droplets, ChevronRight, Check,
  Search, Heart, Moon, QrCode, Shield, HeartPulse, BadgeCheck, Stethoscope, Phone
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { api } from '../services/api';
import LifeLinkAIAssistant from '../components/LifeLinkAIAssistant';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerSOS, isSOSActive, isCounting, countdown, decrementCountdown, startCountdown, stopCountdown } = useSOSStore();
  
  const [sosTimeout, setSosTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleAiSubmit = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch(`${api.defaults.baseURL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: aiQuery }] })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.message);
      } else {
        setAiResponse("Sorry, I'm having trouble connecting right now.");
      }
    } catch (error) {
      setAiResponse("Sorry, I'm having trouble connecting right now.");
    } finally {
      setIsAiLoading(false);
      setAiQuery('');
    }
  };

  const handleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setAiQuery(text);
          setIsListening(false);
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCounting) {
      interval = setInterval(() => decrementCountdown(), 1000);
    }
    return () => clearInterval(interval);
  }, [isCounting, decrementCountdown]);

  useEffect(() => {
    if (isCounting && countdown <= 0) {
      if (sosTimeout) clearTimeout(sosTimeout);
      stopCountdown();
      triggerSOS('CRITICAL', 'MANUAL', 12.9716, 77.5946); // mock lat/lng
      navigate('/sos');
    }
  }, [countdown, isCounting, sosTimeout, stopCountdown, triggerSOS, navigate]);

  const handleSOSDown = () => {
    startCountdown();
    const timeout = setTimeout(() => {
      stopCountdown();
      triggerSOS('CRITICAL', 'MANUAL', 12.9716, 77.5946); // mock lat/lng
      navigate('/sos');
    }, 3000);
    setSosTimeout(timeout);
  };

  const handleSOSUp = () => {
    stopCountdown();
    if (sosTimeout) clearTimeout(sosTimeout);
  };

  return (
    <div className="w-full flex justify-center pb-32">
      <div className="flex flex-col gap-4 p-4 w-full max-w-[1400px] text-white">
      
        {/* 1. TOP HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="w-12 h-12 rounded-full bg-[#00C9A7] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(0,201,167,0.4)]">
            {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight flex items-center gap-1">
              {user?.fullName || 'LifeLink User'} <BadgeCheck size={16} className="text-[#3D91FF]" />
            </h2>
            <p className="text-xs text-slate-400">LifeLink Member</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <HeartPulse size={32} className="text-[#00C9A7]" />
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-tight">LifeLink <span className="text-[#00C9A7]">AI</span></h1>
            <p className="text-[10px] text-slate-400 tracking-wider">Your Health. Our Priority.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button 
            className="relative text-slate-300 hover:text-white transition-colors p-2 bg-[#131F35] rounded-full border border-slate-800"
            onClick={() => alert("You have 1 new system alert: Routine system maintenance scheduled for tonight.")}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF4757] rounded-full border-2 border-[#131F35]"></span>
          </button>
          <button 
            className="text-slate-300 hover:text-white transition-colors p-2 bg-[#131F35] rounded-full border border-slate-800"
            onClick={() => navigate('/community')}
          >
            <MessageCircle size={20} />
          </button>
          <button 
            className="text-slate-300 hover:text-white transition-colors p-2 bg-[#131F35] rounded-full border border-slate-800"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* 2. AI ASSISTANT HERO CARD */}
      <div className="bg-gradient-to-br from-[#0D152D] to-[#1B0F2A] border border-[#2D1B4E] rounded-[24px] p-4 relative overflow-hidden flex flex-col lg:flex-row items-center gap-4 shadow-xl">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 flex-1 relative z-10 w-full">
          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
            <img 
              src="/images/robot_assistant.jpg" 
              className="w-full h-full object-cover mix-blend-screen rounded-full drop-shadow-[0_0_20px_rgba(61,145,255,0.2)]" 
              alt="AI Assistant" 
            />
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl font-bold mb-0.5">Hello, {user?.fullName ? user.fullName.split(' ')[0] : 'User'}! 👋</h2>
            <p className="text-xs text-slate-300 mb-3">I'm your AI Health Assistant. How can I help you today?</p>
            
            <div className="relative w-full max-w-md">
              <button 
                onClick={handleVoice}
                className={`absolute inset-y-0 left-0 pl-3 flex items-center ${isListening ? 'text-[#8B5CF6] animate-pulse' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Mic size={16} />
              </button>
              <input 
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiSubmit(); }}
                disabled={isAiLoading} 
                className="w-full bg-[#131B31] border border-slate-700/50 rounded-full py-2 pl-9 pr-10 text-xs text-white focus:outline-none focus:border-[#8B5CF6] transition-colors shadow-inner disabled:opacity-50"
                placeholder="Ask anything..."
              />
              <button 
                onClick={handleAiSubmit}
                disabled={isAiLoading || !aiQuery.trim()}
                className="absolute inset-y-1 right-1 w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-[#8B5CF6]/30 disabled:opacity-50 disabled:hover:scale-100">
                {isAiLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={12} className="text-white ml-0.5" />
                )}
              </button>
            </div>
            
            {aiResponse && (
              <div className="mt-3 w-full max-w-md bg-[#131B31] border border-[#8B5CF6]/30 rounded-xl p-3 relative animate-fade-in">
                <button onClick={() => setAiResponse(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <HeartPulse size={12} className="text-[#8B5CF6]"/>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pr-4">{aiResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
          <div className="flex flex-col gap-2 min-w-[180px]">
            <button onClick={() => navigate('/hospitals')} className="bg-[#131B31]/80 border border-slate-700/50 rounded-full py-2 px-3 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-[#1A2542] transition-colors flex items-center gap-2">
              <MapPin size={12} className="text-slate-400" /> Find nearest hospital
            </button>
            <button onClick={() => navigate('/doctor')} className="bg-[#131B31]/80 border border-slate-700/50 rounded-full py-2 px-3 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-[#1A2542] transition-colors flex items-center gap-2">
              <Calendar size={12} className="text-slate-400" /> Book a doctor
            </button>
            <button onClick={() => navigate('/symptoms')} className="bg-[#131B31]/80 border border-slate-700/50 rounded-full py-2 px-3 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-[#1A2542] transition-colors flex items-center gap-2">
              <Activity size={12} className="text-slate-400" /> Check my symptoms
            </button>
          </div>
          
          <div className="bg-[#190F24]/50 border border-[#FF4757]/20 rounded-[20px] p-3 flex flex-col items-center justify-center h-[120px] w-[140px] backdrop-blur-sm relative overflow-hidden">
            <div className="text-center mb-2 relative z-10">
              <p className="text-[#FF4757] text-[10px] font-bold">Emergency?</p>
            </div>
            
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Ripple Rings */}
              {!isSOSActive && (
                <>
                  <div className={`absolute inset-0 rounded-full border-2 ${isCounting ? 'border-[#FF4757]' : 'border-[#FF4757]/40'} animate-[ping_2s_ease-out_infinite]`} style={{ animationDelay: '0s' }} />
                  <div className={`absolute -inset-2 rounded-full border-2 ${isCounting ? 'border-[#FF4757]' : 'border-[#FF4757]/20'} animate-[ping_2s_ease-out_infinite]`} style={{ animationDelay: '0.6s' }} />
                  <div className={`absolute -inset-4 rounded-full border-2 ${isCounting ? 'border-[#FF4757]' : 'border-[#FF4757]/10'} animate-[ping_2s_ease-out_infinite]`} style={{ animationDelay: '1.2s' }} />
                </>
              )}

              <button 
                onMouseDown={handleSOSDown}
                onMouseUp={handleSOSUp}
                onMouseLeave={handleSOSUp}
                onTouchStart={handleSOSDown}
                onTouchEnd={handleSOSUp}
                className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#FF4757] to-[#D63031] shadow-lg border-2 border-[#FF4757]/30 flex flex-col items-center justify-center relative z-10 transition-all duration-300 ${isCounting ? 'scale-90 animate-pulse' : 'hover:scale-105'} active:scale-95`}
              >
                {isSOSActive ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <span className="text-xs font-black text-white">SOS</span>
                  </div>
                ) : isCounting ? (
                  <span className="text-xl font-black text-white leading-none">{countdown}</span>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-white mb-0.5" />
                    <span className="text-white font-black text-[9px] tracking-widest leading-none">SOS</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-2 h-3 relative z-10">
              {isSOSActive ? (
                <span className="text-[#FF4757] font-bold text-[8px] animate-pulse">ACTIVATED</span>
              ) : isCounting ? (
                <span className="text-white font-bold text-[8px]">Release to cancel...</span>
              ) : (
                <span className="text-slate-400 text-[8px]">Hold <strong className="text-white">3s</strong></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-xs flex items-center gap-1.5 text-slate-200">
            <span className="text-yellow-500">⚡</span> Quick Actions
          </h2>
          <button className="text-[10px] text-[#3D91FF] hover:underline">Edit</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
          
          <button onClick={() => navigate('/ambulance')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 relative hover:border-slate-600 transition-colors group">
            <div className="absolute top-1 left-1 bg-[#FF4757] text-white text-[7px] font-bold px-1 py-0.5 rounded-full">24/7</div>
            <div className="w-8 h-8 rounded-full bg-[#FF4757]/10 flex items-center justify-center text-[#FF4757] group-hover:scale-110 transition-transform">
              <Ambulance size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Ambulance</span>
          </button>

          <button onClick={() => navigate('/hospitals')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7] group-hover:scale-110 transition-transform">
              <Building2 size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Hospitals</span>
          </button>

          <button onClick={() => navigate('/doctor')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF] group-hover:scale-110 transition-transform">
              <UserRound size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Doctors</span>
          </button>

          <button onClick={() => navigate('/pharmacy')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#2ED573]/10 flex items-center justify-center text-[#2ED573] group-hover:scale-110 transition-transform">
              <Pill size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Pharmacy</span>
          </button>

          <button onClick={() => navigate('/lab')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
              <FlaskConical size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Lab Tests</span>
          </button>

          <button onClick={() => navigate('/blood')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#FF6B81]/10 flex items-center justify-center text-[#FF6B81] group-hover:scale-110 transition-transform">
              <Droplets size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Blood Bank</span>
          </button>

          <button onClick={() => navigate('/symptoms')} className="snap-start shrink-0 w-20 h-20 bg-[#131F35] border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-600 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#38ADA9]/10 flex items-center justify-center text-[#38ADA9] group-hover:scale-110 transition-transform">
              <HeartPulse size={16} />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Symptoms</span>
          </button>
          
        </div>
      </div>

      {/* 4. 3-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Appointments */}
        <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs flex items-center gap-1.5"><Calendar size={14} className="text-[#3D91FF]"/> Appointments</h3>
            <button className="text-[9px] font-bold text-[#8B5CF6] hover:underline" onClick={() => navigate('/doctor')}>View all</button>
          </div>
          
          <div className="flex flex-col gap-2 mb-3">
            <div className="bg-[#131F35] rounded-xl p-2.5 flex items-center gap-2 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?u=dr_ananya" alt="Dr. Ananya" className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-slate-200">Dr. Ananya Sharma</h4>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[8px] text-slate-300 flex items-center gap-1"><Calendar size={8}/> 18 May • 11:00 AM</p>
                  <span className="text-[8px] font-bold bg-[#3D91FF]/10 text-[#3D91FF] px-1.5 py-0.5 rounded">Confirmed</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#131F35] rounded-xl p-2.5 flex items-center gap-2 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?u=dr_rahul" alt="Dr. Rahul" className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-slate-200">Dr. Rahul Verma</h4>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[8px] text-slate-300 flex items-center gap-1"><Calendar size={8}/> 21 May • 04:30 PM</p>
                  <span className="text-[8px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] px-1.5 py-0.5 rounded">Scheduled</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="mt-auto w-full py-2 bg-[#131F35] border border-slate-700 hover:border-slate-500 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5" onClick={() => navigate('/doctor')}>
            <Calendar size={12} /> Book New <ChevronRight size={12}/>
          </button>
        </div>

        {/* Health Overview */}
        <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xs flex items-center gap-1.5"><Heart size={14} className="text-[#FF4757]"/> Health Overview</h3>
            <button className="text-[9px] font-bold text-[#8B5CF6] hover:underline" onClick={() => navigate('/audit')}>View all</button>
          </div>
          
          <div className="flex flex-col gap-4 flex-1 justify-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7]"><Activity size={10}/></div>
                <div>
                  <p className="text-[8px] text-slate-400">Steps</p>
                  <p className="text-xs font-bold">7,245 <span className="text-[8px] font-normal text-slate-500">/10k</span></p>
                </div>
              </div>
              <div className="w-full bg-[#131F35] rounded-full h-1 overflow-hidden">
                <div className="bg-[#00C9A7] h-full rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF]"><Droplets size={10}/></div>
                <div>
                  <p className="text-[8px] text-slate-400">Water</p>
                  <p className="text-xs font-bold">6 <span className="text-[8px] font-normal text-slate-500">/ 8</span></p>
                </div>
              </div>
              <div className="w-full bg-[#131F35] rounded-full h-1 overflow-hidden">
                <div className="bg-[#3D91FF] h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]"><Moon size={10}/></div>
                <div>
                  <p className="text-[8px] text-slate-400">Sleep</p>
                  <p className="text-xs font-bold">7h 15m</p>
                </div>
              </div>
              <div className="w-full bg-[#131F35] rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs flex items-center gap-1.5"><Bell size={14} className="text-[#A78BFA]"/> Reminders</h3>
            <button className="text-[9px] font-bold text-[#8B5CF6] hover:underline" onClick={() => navigate('/reminders')}>View all</button>
          </div>
          
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-[#2ED573]/10 flex items-center justify-center text-[#2ED573]"><Pill size={10}/></div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-200">Vitamin D3</h4>
                  <p className="text-[8px] text-slate-400">1 Tab • Breakfast (08:00 AM)</p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#00C9A7] flex items-center justify-center shadow-[0_0_10px_rgba(0,201,167,0.3)]">
                <Check size={8} className="text-white" />
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-slate-800"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF]"><Pill size={10}/></div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-200">Calcium</h4>
                  <p className="text-[8px] text-slate-400">1 Tab • Dinner (08:00 PM)</p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-slate-500"></div>
            </div>
          </div>
          
          <button onClick={() => navigate('/reminders')} className="mt-auto w-full py-2 bg-[#131F35] border border-slate-700 hover:border-slate-500 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5">
            <Bell size={12} /> All Reminders <ChevronRight size={12}/>
          </button>
        </div>

      </div>

      {/* 5. 2-COLUMN INSURANCE & VAULT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Insurance Banner */}
        <div className="bg-[#120F26] border border-[#312E81] rounded-2xl relative overflow-hidden shadow-md flex items-center min-h-[120px] group cursor-pointer" onClick={() => navigate('/insurance')}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img src="/images/health_insurance.jpg" alt="Health Insurance" className="w-full h-full object-cover opacity-50 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120F26] via-[#120F26]/80 to-transparent" />
          </div>
          
          <div className="relative z-10 p-5 w-full md:w-3/4 flex flex-col justify-center text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Active Coverage</p>
            </div>
            <h3 className="text-base font-black text-white mb-1 leading-tight">Health Insurance</h3>
            <p className="text-xs text-slate-300 mb-3 max-w-[200px] leading-snug">Protect your family with comprehensive health plans.</p>
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold py-1.5 px-4 rounded-lg w-max transition-all flex items-center gap-1.5 backdrop-blur-sm">
              Explore Plans <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Health ID Locker */}
        <div className="bg-[#0B141F] border border-[#162B3A] rounded-2xl p-4 shadow-md flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/passport')}>
          <div className="w-16 h-16 shrink-0 bg-[#00C9A7]/10 rounded-xl border border-[#00C9A7]/30 flex items-center justify-center relative overflow-hidden group-hover:bg-[#00C9A7]/20 transition-colors">
            <QrCode size={32} className="text-[#00C9A7]" />
            <div className="absolute top-0 w-full h-[2px] bg-[#00C9A7] shadow-[0_0_10px_#00C9A7] animate-waveform"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold">Health Locker</h3>
              <span className="bg-emerald-900/60 border border-emerald-700 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">B+</span>
            </div>
            <p className="text-[10px] text-[#00C9A7] font-bold mb-1">ID Verified</p>
            <p className="text-[9px] text-slate-400 mb-2">Keep your records safe.</p>
            
            <button className="bg-[#122A3B] hover:bg-[#1A3A52] border border-[#1E435E] text-[#3D91FF] text-[10px] font-bold py-1.5 px-4 rounded-lg w-max transition-colors flex items-center gap-1.5">
              View ID <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. HEALTHCARE SERVICES GRID */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-xs flex items-center gap-1.5 text-slate-200">
            <Heart size={14} className="text-[#3D91FF]" /> Services
          </h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#131F35] border border-slate-800 rounded-xl p-3 flex gap-2 items-center hover:border-slate-600 cursor-pointer transition-colors group" onClick={() => navigate('/physiotherapy')}>
            <div className="w-8 h-8 bg-indigo-900/40 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <UserRound size={14} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-slate-200 mb-0.5">Physiotherapy</h4>
            </div>
          </div>
          
          <div className="bg-[#131F35] border border-slate-800 rounded-xl p-3 flex gap-2 items-center hover:border-slate-600 cursor-pointer transition-colors group" onClick={() => navigate('/homecare')}>
            <div className="w-8 h-8 bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <HeartPulse size={14} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-slate-200 mb-0.5">Home Care</h4>
            </div>
          </div>
          
          <div className="bg-[#131F35] border border-slate-800 rounded-xl p-3 flex gap-2 items-center hover:border-slate-600 cursor-pointer transition-colors group" onClick={() => navigate('/equipment')}>
            <div className="w-8 h-8 bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Stethoscope size={14} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-slate-200 mb-0.5">Equipment</h4>
            </div>
          </div>
          
          <div className="bg-[#131F35] border border-slate-800 rounded-xl p-3 flex gap-2 items-center hover:border-slate-600 cursor-pointer transition-colors group" onClick={() => navigate('/insurance')}>
            <div className="w-8 h-8 bg-indigo-900/40 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Shield size={14} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-slate-200 mb-0.5">Insurance</h4>
            </div>
          </div>
        </div>
      </div>

      {/* 7. COMMUNITY BANNER */}
      <div className="bg-gradient-to-r from-[#21163A] to-[#120B20] border border-[#3D256B] rounded-xl p-3 flex flex-row items-center justify-between gap-2 cursor-pointer hover:border-[#4B2C8B] transition-colors" onClick={() => navigate('/community')}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center shrink-0">
            <HeartPulse size={16} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-200 mb-0.5">LifeLink Community</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5 hidden sm:flex">
            <img src="https://i.pravatar.cc/100?u=1" className="w-6 h-6 rounded-full border border-[#1B0F2A]" alt="User"/>
            <img src="https://i.pravatar.cc/100?u=2" className="w-6 h-6 rounded-full border border-[#1B0F2A]" alt="User"/>
            <div className="w-6 h-6 rounded-full border border-[#1B0F2A] bg-[#8B5CF6] text-white flex items-center justify-center text-[7px] font-bold z-10">
              +1k
            </div>
          </div>
          
          <button className="bg-[#3D256B] hover:bg-[#4B2C8B] px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1">
            Explore <ChevronRight size={12} />
          </button>
        </div>
      </div>

      </div>
      <LifeLinkAIAssistant />
    </div>
  );
};

export default Dashboard;
