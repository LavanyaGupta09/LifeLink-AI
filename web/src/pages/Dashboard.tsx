import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, Settings, Mic, Send, MapPin, Calendar, Activity, AlertTriangle,
  Ambulance, Building2, UserRound, Pill, FlaskConical, Droplets, ChevronRight, Check,
  Search, Heart, Moon, QrCode, Shield, HeartPulse, BadgeCheck, Stethoscope, Phone,
  MoreVertical, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { useAshaStore } from '../store/ashaStore';
import { api } from '../services/api';
import LifeLinkAIAssistant from '../components/LifeLinkAIAssistant';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerSOS, isSOSActive, isCounting, countdown, decrementCountdown, startCountdown, stopCountdown } = useSOSStore();
  const { areaType } = useAshaStore();
  
  const [sosTimeout, setSosTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const formatName = (name: string | undefined) => {
    if (!name) return 'LifeLink User';
    if (name.toLowerCase().includes('lavanyagupta')) return 'Lavanya Gupta';
    if (!name.includes(' ') && /\d/.test(name)) {
      const clean = name.replace(/\d+/g, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return name;
  };

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
      <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-[1400px] text-textPrimary">
      
        {/* 1. TOP HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="w-12 h-12 rounded-full bg-[#00C9A7] flex items-center justify-center font-bold text-white text-xl shadow-sm">
              {formatName(user?.fullName).split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-1 text-textPrimary">
                {formatName(user?.fullName)} <BadgeCheck size={18} className="text-[#3D91FF]" strokeWidth={2} />
              </h2>
              <p className="text-sm text-textSecondary">LifeLink Member</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <HeartPulse size={36} className="text-[#00C9A7]" strokeWidth={2.5} />
              <h1 className="text-3xl font-black tracking-tight text-textPrimary">LifeLink <span className="text-[#00C9A7]">AI</span></h1>
            </div>
            <p className="text-xs text-textSecondary tracking-wide mt-1">Your Health. Our Priority.</p>
          </div>
          
          <div className="flex items-center self-end md:self-auto relative">
            {/* Desktop (Always visible) & Mobile Expanded Container */}
            <div className={`flex items-center gap-3 transition-all duration-300 ease-out origin-right
              max-[699px]:absolute max-[699px]:right-[48px] max-[699px]:top-0 max-[699px]:bg-background/80 max-[699px]:backdrop-blur-md max-[699px]:p-1 max-[699px]:rounded-full max-[699px]:shadow-lg
              ${isHeaderMenuOpen ? 'max-[699px]:opacity-100 max-[699px]:scale-100 max-[699px]:pointer-events-auto' : 'max-[699px]:opacity-0 max-[699px]:scale-95 max-[699px]:pointer-events-none'}`}>
              <button className="relative w-10 h-10 shrink-0 bg-card rounded-full border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors shadow-sm" onClick={() => alert("You have 1 new system alert: Routine system maintenance scheduled for tonight.")}>
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-[#FF4757] rounded-full border-2 border-card"></span>
              </button>
              <button className="w-10 h-10 shrink-0 bg-card rounded-full border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors shadow-sm" onClick={() => navigate('/profile')}>
                <UserRound size={18} />
              </button>
              <button className="w-10 h-10 shrink-0 bg-card rounded-full border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors shadow-sm" onClick={() => navigate('/settings')}>
                <Settings size={18} />
              </button>
            </div>
            
            {/* Mobile Toggle Button */}
            <button 
              className="w-10 h-10 shrink-0 bg-card rounded-full border border-border flex min-[700px]:hidden items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors shadow-sm z-10 relative"
              onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
            >
              {isHeaderMenuOpen ? <X size={18} /> : <MoreVertical size={18} />}
              {!isHeaderMenuOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-[#FF4757] rounded-full border-2 border-card"></span>}
            </button>
          </div>
        </div>

        {/* 2. AI ASSISTANT HERO CARD */}
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 mt-2">
          <div className="flex items-center gap-4 flex-1 w-full">
            <div className="w-20 h-20 md:w-28 md:h-28 shrink-0 bg-surface rounded-full overflow-hidden flex items-center justify-center">
              <img src="/images/robot_assistant.jpg" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" alt="AI Assistant" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-textPrimary mb-1">Hello, {formatName(user?.fullName).split(' ')[0]}! 👋</h2>
              <p className="text-sm md:text-base text-textSecondary mb-4">I'm your AI Health Assistant. How can I help you today?</p>
              
              <div className="relative w-full max-w-lg">
                <button onClick={handleVoice} className={`absolute inset-y-0 left-0 pl-4 flex items-center ${isListening ? 'text-[#8B5CF6] animate-pulse' : 'text-textTertiary hover:text-textPrimary'} transition-colors`}>
                  <Mic size={18} />
                </button>
                <input 
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAiSubmit(); }}
                  disabled={isAiLoading} 
                  className="w-full bg-surface border border-border rounded-full py-3 md:py-3.5 pl-12 pr-14 text-sm text-textPrimary focus:outline-none focus:border-[#00C9A7] transition-colors placeholder:text-textTertiary"
                  placeholder="Ask anything..."
                />
                <button onClick={handleAiSubmit} disabled={isAiLoading || !aiQuery.trim()} className="absolute inset-y-1.5 right-1.5 w-9 h-9 md:w-10 md:h-10 bg-[#00C9A7]/10 rounded-full flex items-center justify-center text-[#00C9A7] hover:bg-[#00C9A7]/20 transition-colors disabled:opacity-50">
                  {isAiLoading ? <div className="w-4 h-4 border-2 border-[#00C9A7] border-t-transparent rounded-full animate-spin"></div> : <Send size={16} className="ml-0.5" />}
                </button>
              </div>
              
              {aiResponse && (
                <div className="mt-4 w-full max-w-lg bg-surface border border-[#8B5CF6]/30 rounded-xl p-4 relative animate-fade-in">
                  <button onClick={() => setAiResponse(null)} className="absolute top-2 right-2 text-textSecondary hover:text-textPrimary"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center shrink-0"><HeartPulse size={16} className="text-[#8B5CF6]"/></div>
                    <p className="text-sm text-textPrimary leading-relaxed pr-4">{aiResponse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
              <button onClick={() => navigate('/hospitals')} className="flex items-center justify-between px-5 py-3.5 bg-surface border border-border rounded-full w-full text-left hover:border-[#00C9A7]/50 transition-colors group">
                <div className="flex items-center gap-3 text-textPrimary font-medium text-sm"><MapPin size={18} className="text-[#00C9A7]" /> Find nearest hospital</div>
                <ChevronRight size={16} className="text-textSecondary group-hover:text-[#00C9A7]" />
              </button>
              <button onClick={() => navigate('/doctor')} className="flex items-center justify-between px-5 py-3.5 bg-surface border border-border rounded-full w-full text-left hover:border-[#00C9A7]/50 transition-colors group">
                <div className="flex items-center gap-3 text-textPrimary font-medium text-sm"><Calendar size={18} className="text-[#00C9A7]" /> Book a doctor</div>
                <ChevronRight size={16} className="text-textSecondary group-hover:text-[#00C9A7]" />
              </button>
              <button onClick={() => navigate('/symptoms')} className="flex items-center justify-between px-5 py-3.5 bg-surface border border-border rounded-full w-full text-left hover:border-[#00C9A7]/50 transition-colors group">
                <div className="flex items-center gap-3 text-textPrimary font-medium text-sm"><Activity size={18} className="text-[#00C9A7]" /> Check my symptoms</div>
                <ChevronRight size={16} className="text-textSecondary group-hover:text-[#00C9A7]" />
              </button>
            </div>
            
            <div className="w-[150px] bg-[#FF4757]/5 border border-[#FF4757]/20 rounded-3xl p-3 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-[#FF4757] font-bold text-sm mb-1">
                <AlertTriangle size={16} fill="currentColor" /> Emergency?
              </div>
              <p className="text-textSecondary text-[10px] mb-4 leading-tight">Tap for immediate help</p>
              
              <button 
                onMouseDown={handleSOSDown} onMouseUp={handleSOSUp} onMouseLeave={handleSOSUp} onTouchStart={handleSOSDown} onTouchEnd={handleSOSUp}
                className={`relative w-20 h-20 rounded-full bg-gradient-to-b from-[#FF4757] to-[#D63031] flex flex-col items-center justify-center text-white shadow-md transition-transform ${isCounting ? 'scale-95' : 'hover:scale-105'}`}
              >
                {isCounting && <div className="absolute inset-0 rounded-full border-[3px] border-[#FF4757] animate-[ping_1.5s_ease-out_infinite]"></div>}
                {isCounting ? <span className="font-bold text-3xl tracking-wide">{countdown}</span> : <><Phone size={24} fill="currentColor" className="mb-1" /><span className="font-bold text-sm tracking-wide">SOS</span></>}
              </button>
              <p className="text-textTertiary text-[11px] mt-3">Hold 3s</p>
            </div>
          </div>
        </div>

        {/* 3. QUICK ACTIONS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-textPrimary"><span className="text-[#FFA502] text-xl">⚡</span> Quick Actions</h2>
            <button className="text-sm text-[#00C9A7] font-medium hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
            <button onClick={() => navigate('/ambulance')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#FF4757]/30 rounded-2xl p-4 transition-colors shadow-sm relative group active:scale-95">
              <div className="absolute -top-2 left-2 bg-[#FF4757] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">24/7</div>
              <div className="w-14 h-14 rounded-full bg-[#FF4757]/10 flex items-center justify-center text-[#FF4757] mb-2 group-hover:scale-110 transition-transform"><Ambulance size={24} /></div>
              <span className="text-sm font-semibold text-textPrimary">Ambulance</span>
            </button>
            <button onClick={() => navigate('/hospitals')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#00C9A7]/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
              <div className="w-14 h-14 rounded-full bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7] mb-2 group-hover:scale-110 transition-transform"><Building2 size={24} /></div>
              <span className="text-sm font-semibold text-textPrimary">Hospitals</span>
            </button>
            <button onClick={() => navigate('/doctor')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#3D91FF]/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
              <div className="w-14 h-14 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF] mb-2 group-hover:scale-110 transition-transform"><UserRound size={24} /></div>
              <span className="text-sm font-semibold text-textPrimary">Doctors</span>
            </button>
            {areaType !== 'rural' && (
              <>
                <button onClick={() => navigate('/pharmacy')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#2ED573]/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
                  <div className="w-14 h-14 rounded-full bg-[#2ED573]/10 flex items-center justify-center text-[#2ED573] mb-2 group-hover:scale-110 transition-transform"><Pill size={24} /></div>
                  <span className="text-sm font-semibold text-textPrimary">Pharmacy</span>
                </button>
                <button onClick={() => navigate('/lab')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#8B5CF6]/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
                  <div className="w-14 h-14 rounded-full bg-accent-purple flex items-center justify-center text-[#8B5CF6] mb-2 group-hover:scale-110 transition-transform"><FlaskConical size={24} /></div>
                  <span className="text-sm font-semibold text-textPrimary">Lab Tests</span>
                </button>
                <button onClick={() => navigate('/blood')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#FF6B81]/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
                  <div className="w-14 h-14 rounded-full bg-[#FF6B81]/10 flex items-center justify-center text-[#FF6B81] mb-2 group-hover:scale-110 transition-transform"><Droplets size={24} /></div>
                  <span className="text-sm font-semibold text-textPrimary">Blood Bank</span>
                </button>
              </>
            )}
            <button onClick={() => navigate('/symptoms')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-[#38ADA9]/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
              <div className="w-14 h-14 rounded-full bg-[#38ADA9]/10 flex items-center justify-center text-[#38ADA9] mb-2 group-hover:scale-110 transition-transform"><HeartPulse size={24} /></div>
              <span className="text-sm font-semibold text-textPrimary">Symptoms</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex flex-col items-center justify-center bg-card border border-border hover:border-textSecondary/30 rounded-2xl p-4 transition-colors shadow-sm group active:scale-95">
              <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-textSecondary mb-2 group-hover:scale-110 transition-transform"><Settings size={24} /></div>
              <span className="text-sm font-semibold text-textPrimary">Settings</span>
            </button>
          </div>
        </div>

        {/* 4. 3-COLUMN GRID (Appointments, Health Overview, Reminders) */}
        {areaType !== 'rural' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Appointments */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Calendar size={18} className="text-[#3D91FF]"/> Appointments</h3>
                <button className="text-xs font-bold text-[#3D91FF] hover:underline" onClick={() => navigate('/doctor')}>View all</button>
              </div>
              
              <div className="flex flex-col gap-3 mb-4">
                <div className="bg-surface rounded-2xl p-3 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-full bg-background overflow-hidden shrink-0 border border-border">
                    <img src="https://i.pravatar.cc/150?u=dr_ananya" alt="Dr. Ananya" className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-textPrimary mb-1">Dr. Ananya Sharma</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-textSecondary flex items-center gap-1"><Calendar size={12}/> Today • 10:30 AM</p>
                    </div>
                  </div>
                  <div className="bg-[#00C9A7]/10 text-[#00C9A7] px-2.5 py-1 rounded-full text-[10px] font-bold self-start mt-1">Confirmed</div>
                </div>
                
                <div className="bg-surface rounded-2xl p-3 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-full bg-background overflow-hidden shrink-0 border border-border">
                    <img src="https://i.pravatar.cc/150?u=dr_rahul" alt="Dr. Rahul" className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-textPrimary mb-1">Dr. Rahul Verma</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-textSecondary flex items-center gap-1"><Calendar size={12}/> 21 May • 04:30 PM</p>
                    </div>
                  </div>
                  <div className="bg-[#8B5CF6]/10 text-[#8B5CF6] px-2.5 py-1 rounded-full text-[10px] font-bold self-start mt-1">Scheduled</div>
                </div>
              </div>
              
              <button className="mt-auto w-full py-3 bg-surface border border-border hover:border-primary/50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2" onClick={() => navigate('/doctor')}>
                <Calendar size={16} className="text-textSecondary" /> Book New Appointment
              </button>
            </div>

            {/* Health Overview */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base flex items-center gap-2"><Heart size={18} className="text-[#FF4757]"/> Health Overview</h3>
                <button className="text-xs font-bold text-[#FF4757] hover:underline" onClick={() => navigate('/audit')}>View all</button>
              </div>
              
              <div className="flex flex-col gap-5 flex-1 justify-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7]"><Activity size={14}/></div>
                    <div>
                      <p className="text-[10px] text-textSecondary uppercase tracking-wider font-bold mb-0.5">Steps</p>
                      <p className="text-sm font-bold text-textPrimary">7,245 <span className="text-[10px] font-normal text-textTertiary">/ 10k</span></p>
                    </div>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-border">
                    <div className="bg-[#00C9A7] h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF]"><Droplets size={14}/></div>
                    <div>
                      <p className="text-[10px] text-textSecondary uppercase tracking-wider font-bold mb-0.5">Water</p>
                      <p className="text-sm font-bold text-textPrimary">6 <span className="text-[10px] font-normal text-textTertiary">/ 8 glasses</span></p>
                    </div>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-border">
                    <div className="bg-[#3D91FF] h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-[#8B5CF6]"><Moon size={14}/></div>
                    <div>
                      <p className="text-[10px] text-textSecondary uppercase tracking-wider font-bold mb-0.5">Sleep</p>
                      <p className="text-sm font-bold text-textPrimary">7h 15m</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-border">
                    <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base flex items-center gap-2"><Bell size={18} className="text-[#A78BFA]"/> Reminders</h3>
                <button className="text-xs font-bold text-[#8B5CF6] hover:underline" onClick={() => navigate('/reminders')}>View all</button>
              </div>
              
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between bg-surface p-3 rounded-2xl border border-border">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#2ED573]/10 flex items-center justify-center text-[#2ED573]"><Pill size={18}/></div>
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary">Vitamin D3</h4>
                      <p className="text-xs text-textSecondary mt-0.5">1 Tab • Breakfast (08:00 AM)</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#00C9A7] flex items-center justify-center shadow-sm">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-surface p-3 rounded-2xl border border-border">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF]"><Pill size={18}/></div>
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary">Calcium</h4>
                      <p className="text-xs text-textSecondary mt-0.5">1 Tab • Dinner (08:00 PM)</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-textTertiary flex items-center justify-center"></div>
                </div>
              </div>
              
              <button onClick={() => navigate('/reminders')} className="mt-auto w-full py-3 bg-surface border border-border hover:border-primary/50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Bell size={16} className="text-textSecondary" /> All Reminders
              </button>
            </div>

          </div>
        )}

        {/* 5. 2-COLUMN INSURANCE & VAULT */}
        {areaType !== 'rural' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Insurance Banner */}
            <div className="bg-card border border-border rounded-3xl relative overflow-hidden shadow-sm flex items-center min-h-[160px] group cursor-pointer" onClick={() => navigate('/insurance')}>
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img src="/images/health_insurance.jpg" alt="Health Insurance" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {/* Dark mode overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1121]/90 via-[#0B1121]/75 to-[#0B1121]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121]/60 to-transparent" />
              </div>
              {/* Light mode overlay - applied via CSS class */}
              <div className="absolute inset-0 pointer-events-none insurance-light-overlay hidden" />
              
              <div className="relative z-10 p-6 w-full flex flex-col justify-center text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  <p className="text-xs text-emerald-400 font-bold tracking-wider uppercase">Active Coverage</p>
                </div>
                <h3 className="text-lg font-black text-textPrimary mb-1 leading-tight">Health Insurance Hub</h3>
                <p className="text-sm text-textSecondary mb-4 max-w-[280px] leading-snug">Protect your family with comprehensive health plans.</p>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-textPrimary text-xs font-bold py-2 px-5 rounded-xl w-max transition-all flex items-center gap-2 shadow-sm">
                  Explore Plans <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Health ID Locker */}
            <div className="bg-card border border-border rounded-3xl relative overflow-hidden shadow-sm flex items-center gap-5 min-h-[160px] group cursor-pointer" onClick={() => navigate('/passport')}>
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img src="/images/health_locker_bg.jpg" alt="Health Locker" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {/* Dark mode overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1121]/85 via-[#0B1121]/70 to-[#0B1121]/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121]/50 to-transparent" />
              </div>
              {/* Light mode overlay */}
              <div className="absolute inset-0 pointer-events-none locker-light-overlay hidden" />
              
              <div className="relative z-10 p-6 flex items-center gap-5 w-full">
                <div className="w-20 h-20 shrink-0 bg-[#00C9A7]/15 backdrop-blur-sm rounded-2xl border border-[#00C9A7]/40 flex items-center justify-center relative overflow-hidden group-hover:bg-[#00C9A7]/25 transition-colors">
                  <QrCode size={40} className="text-[#00C9A7] drop-shadow-[0_0_8px_rgba(0,201,167,0.4)]" />
                  <div className="absolute top-0 w-full h-[2px] bg-[#00C9A7] shadow-[0_0_10px_#00C9A7] animate-waveform"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-textPrimary">Health Locker</h3>
                    <span className="bg-emerald-900/60 border border-emerald-700 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">B+</span>
                  </div>
                  <p className="text-xs text-[#00C9A7] font-bold mb-1">ID Verified & Protected</p>
                  <p className="text-xs text-textSecondary mb-3">Keep your medical records safe.</p>
                  
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-[#3D91FF] text-xs font-bold py-2 px-5 rounded-xl w-max transition-colors flex items-center gap-2 shadow-sm">
                    View Medical ID <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. HEALTHCARE SERVICES GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-textPrimary">
              <Heart size={20} className="text-[#3D91FF]" /> Other Services
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {areaType !== 'rural' && (
              <>
                <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-center hover:border-primary/50 cursor-pointer transition-colors group shadow-sm" onClick={() => navigate('/physiotherapy')}>
                  <div className="w-10 h-10 bg-accent-blue border border-border rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <UserRound size={20} className="text-[#3D91FF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-textPrimary">Physiotherapy</h4>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-center hover:border-primary/50 cursor-pointer transition-colors group shadow-sm" onClick={() => navigate('/homecare')}>
                  <div className="w-10 h-10 bg-[#FFA502]/10 border border-[#FFA502]/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <HeartPulse size={20} className="text-[#FFA502]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-textPrimary">Home Care</h4>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-center hover:border-primary/50 cursor-pointer transition-colors group shadow-sm" onClick={() => navigate('/equipment')}>
                  <div className="w-10 h-10 bg-accent-blue border border-border rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Stethoscope size={20} className="text-[#3D91FF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-textPrimary">Equipment</h4>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-center hover:border-primary/50 cursor-pointer transition-colors group shadow-sm" onClick={() => navigate('/insurance')}>
                  <div className="w-10 h-10 bg-accent-purple border border-border rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Shield size={20} className="text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-textPrimary">Insurance</h4>
                  </div>
                </div>
              </>
            )}

            {/* ASHA Worker - Only for Rural Users */}
            {areaType === 'rural' && (
              <div className="bg-card border border-[#F97316]/30 rounded-2xl p-4 flex gap-3 items-center hover:border-[#F97316]/60 cursor-pointer transition-colors group shadow-sm" onClick={() => navigate('/asha')}>
                <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-[#F97316]/20">
                  <HeartPulse size={24} className="text-[#F97316]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#F97316] mb-0.5">ASHA Seva</h4>
                  <p className="text-xs text-textSecondary">Gaon mein madad</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 7. COMMUNITY BANNER */}
        <div className="bg-gradient-to-r from-card to-surface border border-border rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-[#8B5CF6]/50 transition-colors shadow-sm" onClick={() => navigate('/community')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-purple border border-[#8B5CF6]/30 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse size={24} className="text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-textPrimary mb-1">LifeLink Community</h3>
              <p className="text-sm text-textSecondary">Join discussions and share experiences.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?u=1" className="w-8 h-8 rounded-full border-2 border-card" alt="User"/>
              <img src="https://i.pravatar.cc/100?u=2" className="w-8 h-8 rounded-full border-2 border-card" alt="User"/>
              <div className="w-8 h-8 rounded-full border-2 border-card bg-accent-purple text-[#8B5CF6] flex items-center justify-center text-[9px] font-bold z-10 shadow-sm">
                +1k
              </div>
            </div>
            
            <button className="bg-accent-purple hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              Explore Forum <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
      <LifeLinkAIAssistant />
    </div>
  );
};

export default Dashboard;
