import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageSquare, X, CheckCircle2, Activity, Package, FlaskConical, Ambulance } from 'lucide-react';
import JitsiVideoCall from '../components/telemedicine/JitsiVideoCall';

type ServiceType = 'ambulance' | 'medicine' | 'lab' | 'physio' | 'equipment';

interface TrackingConfig {
  title: string;
  vehicleIcon: React.ReactNode;
  providerName: string;
  providerRole: string;
  providerRating: string;
  steps: string[];
  initialDistance: number;
  initialEta: number;
}

const CONFIG_MAP: Record<ServiceType, TrackingConfig> = {
  ambulance: {
    title: 'Ambulance Tracking',
    vehicleIcon: <Ambulance size={28} className="text-rose-500" />,
    providerName: 'Apollo Rescue Unit',
    providerRole: 'Paramedic Team',
    providerRating: '⭐ 4.9 (Critical Care)',
    steps: ['Request Broadcast', 'Ambulance Dispatched', 'En Route', 'Arrived at Location'],
    initialDistance: 3.2,
    initialEta: 9,
  },
  medicine: {
    title: 'Medicine Delivery',
    vehicleIcon: <Package size={28} className="text-emerald-500" />,
    providerName: 'Rahul Sharma',
    providerRole: 'Delivery Partner',
    providerRating: '⭐ 4.8',
    steps: ['Order Confirmed', 'Pharmacy Preparing', 'Packed', 'Out for Delivery', 'Delivered'],
    initialDistance: 2.5,
    initialEta: 12,
  },
  lab: {
    title: 'Lab Sample Collection',
    vehicleIcon: <FlaskConical size={28} className="text-[#3D91FF]" />,
    providerName: 'Priya Desai',
    providerRole: 'Certified Phlebotomist',
    providerRating: '⭐ 4.9',
    steps: ['Booking Confirmed', 'Technician Assigned', 'On the Way', 'Sample Collected', 'Sent to Lab', 'Report Processing', 'Report Ready'],
    initialDistance: 5.1,
    initialEta: 25,
  },
  physio: {
    title: 'Physiotherapist at Home',
    vehicleIcon: <Activity size={28} className="text-[#8B5CF6]" />,
    providerName: 'Dr. Priya Sharma',
    providerRole: 'Senior Physiotherapist',
    providerRating: '⭐ 4.8',
    steps: ['Booking Confirmed', 'Physiotherapist Dispatched', 'En Route', 'Session Started', 'Recovery Logged'],
    initialDistance: 4.2,
    initialEta: 18,
  },
  equipment: {
    title: 'Equipment Delivery',
    vehicleIcon: <Package size={28} className="text-cyan-500" />,
    providerName: 'MedEquip Logistics',
    providerRole: 'Delivery & Setup Partner',
    providerRating: '⭐ 4.7',
    steps: ['Order Confirmed', 'Packed', 'Picked Up', 'On the Way', 'Delivered', 'Installation Complete'],
    initialDistance: 8.5,
    initialEta: 35,
  }
};

const LiveTrackingPage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  
  const type = (serviceType === 'ambulance' || serviceType === 'medicine' || serviceType === 'lab' || serviceType === 'physio' || serviceType === 'equipment') 
    ? serviceType 
    : 'medicine';
    
  const config = CONFIG_MAP[type];
  
  const [distance, setDistance] = useState(config.initialDistance);
  const [eta, setEta] = useState(config.initialEta);
  const [currentStep, setCurrentStep] = useState(1);
  const [isArrived, setIsArrived] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState(false);

  // Simulation Timer
  useEffect(() => {
    if (isArrived) return;

    const interval = setInterval(() => {
      setDistance(prev => {
        const next = Math.max(0, prev - 0.4);
        if (next === 0) {
          setIsArrived(true);
          setEta(0);
          // Advance stepper to the final few steps rapidly
          setCurrentStep(config.steps.length - 1);
        }
        return Number(next.toFixed(1));
      });
      
      setEta(prev => {
        const next = Math.max(0, prev - 1);
        return next;
      });

    }, 3000); // Update every 3 seconds for demo speed

    return () => clearInterval(interval);
  }, [isArrived, config.steps.length]);

  // Stepper logic progression mapping
  useEffect(() => {
    if (isArrived) return;
    
    // Map distance progress to step index roughly
    const progress = 1 - (distance / config.initialDistance);
    
    // For ambulance: 4 steps (0: Broadcast, 1: Dispatched, 2: En Route, 3: Arrived)
    // For medicine: 5 steps (0: Confirmed, 1: Preparing, 2: Packed, 3: Out, 4: Delivered)
    // For lab: 7 steps
    let targetStep = 1;
    
    if (type === 'ambulance') {
      if (progress > 0.1) targetStep = 1; // Dispatched
      if (progress > 0.3) targetStep = 2; // En Route
      if (progress >= 1.0) targetStep = 3; // Arrived
    } else if (type === 'medicine') {
      if (progress > 0.1) targetStep = 1; // Preparing
      if (progress > 0.3) targetStep = 2; // Packed
      if (progress > 0.5) targetStep = 3; // Out for Delivery
      if (progress >= 1.0) targetStep = 4; // Delivered
    } else if (type === 'lab') {
      if (progress > 0.1) targetStep = 1; // Assigned
      if (progress > 0.3) targetStep = 2; // On the Way
      // other steps will be manually triggered post-arrival
    } else if (type === 'equipment') {
      if (progress > 0.05) targetStep = 1; // Packed
      if (progress > 0.2) targetStep = 2; // Picked Up
      if (progress > 0.4) targetStep = 3; // On the Way
      if (progress > 0.8) targetStep = 4; // Delivered
      if (progress >= 1.0) targetStep = 5; // Installation Complete
    }

    setCurrentStep(Math.max(currentStep, targetStep));
  }, [distance, config.initialDistance, type, currentStep, isArrived]);

  const handleCancel = () => {
    const confirm = window.confirm("Are you sure you want to cancel this request?");
    if (confirm) navigate('/dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-24 px-6 py-6 ">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <Activity size={10} className="animate-pulse" /> Live Tracking Active
          </p>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-6 w-full">
        
        {/* WIDGET 1: DYNAMIC MAP & RADAR */}
        <section className="w-full h-[280px] bg-[#131B2F] border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
          {/* Radar Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-full h-full border border-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-[200%] h-[200%] border border-[#3D91FF]/10 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          </div>
          
          {/* Map Base (Mock grid) */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            {/* The Provider Icon (Moving closer to center) */}
            <div 
              className="absolute bg-slate-900 border-2 border-slate-700 p-3 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-[3000ms] ease-linear z-20"
              style={{
                // Mock coordinate logic: moving from top-left to center
                top: isArrived ? '50%' : `${10 + (1 - distance / config.initialDistance) * 40}%`,
                left: isArrived ? '50%' : `${10 + (1 - distance / config.initialDistance) * 40}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {config.vehicleIcon}
            </div>

            {/* User Pin (Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="bg-[#3D91FF] text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border border-[#3D91FF]/50 shadow-[0_0_15px_rgba(61,145,255,0.5)]">YOU</div>
              <MapPin size={24} className="text-[#3D91FF] drop-shadow-lg" fill="#3D91FF" />
              <div className="w-2 h-1 bg-black/50 rounded-full mt-1 blur-sm"></div>
            </div>
          </div>

          {/* ETA Readout Overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isArrived ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="font-black text-lg text-white">
                  {isArrived ? 'Arrived' : `${distance} km away`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">ETA</p>
              <span className={`font-black text-xl ${isArrived ? 'text-emerald-400' : 'text-[#3D91FF]'}`}>
                {isArrived ? 'Now' : `${eta} min`}
              </span>
            </div>
          </div>
        </section>

        {/* WIDGET 2: DRIVER / TECHNICIAN CONTACT CARD */}
        <section className="bg-[#131B2F] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center shrink-0">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Provider Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg leading-tight">{config.providerName}</h3>
              <p className="text-xs text-slate-400 font-medium mb-1">{config.providerRole}</p>
              <div className="inline-block bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300">
                {config.providerRating}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveCall(`LifeLink_TrackCall_${type}_${Date.now()}`)}
              className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-bold active:scale-95 transition-transform"
            >
              <Phone size={18} /> Call
            </button>
            <button 
              onClick={() => setActiveChat(true)}
              className="flex items-center justify-center gap-2 bg-[#3D91FF]/10 text-[#3D91FF] border border-[#3D91FF]/30 py-3 rounded-xl font-bold active:scale-95 transition-transform"
            >
              <MessageSquare size={18} /> Chat
            </button>
          </div>
        </section>

        {/* WIDGET 3: SERVICE-SPECIFIC STEPPER TIMELINE */}
        <section className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {type === 'ambulance' && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>}
          <h3 className="text-lg font-bold text-white mb-6">Live Status Tracker</h3>
          
          <div className="flex flex-col gap-0 relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-[20px] bottom-[20px] w-0.5 bg-slate-800 z-0"></div>
            
            {config.steps.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              
              return (
                <div key={idx} className="flex items-start gap-4 mb-6 relative z-10 last:mb-0">
                  <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-black' 
                      : isActive
                        ? 'bg-[#131B2F] border-[#3D91FF] text-[#3D91FF]'
                        : 'bg-[#131B2F] border-slate-700 text-slate-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#3D91FF] animate-pulse' : 'bg-slate-700'}`}></div>}
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-bold ${isCompleted ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-500'}`}>{step}</p>
                    {isActive && (
                      <p className="text-xs text-slate-400 mt-1">{isArrived ? 'Service action is being completed.' : 'We are currently on this step.'}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Cancel Button */}
        {!isArrived && (
          <button 
            onClick={handleCancel}
            className="w-full flex items-center justify-center gap-2 text-rose-400 font-bold py-4 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <X size={18} /> Cancel Request
          </button>
        )}

      </div>
      {/* Active Call Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-[#0B1121] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="p-4 pt-[env(safe-area-inset-top,16px)] flex items-center justify-between border-b border-slate-800/80">
            <div>
              <h2 className="font-bold text-white text-lg">Live Call</h2>
              <p className="text-emerald-400 text-xs font-semibold animate-pulse flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> End-to-End Encrypted
              </p>
            </div>
            <button 
              onClick={() => setActiveCall(null)}
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
        <div className="flex-1 w-full bg-black">
            <JitsiVideoCall 
              roomName={activeCall} 
              displayName="LifeLink Member"
              onReadyToClose={() => setActiveCall(null)} 
            />
          </div>
        </div>
      )}

      {/* Active Chat Overlay */}
      {activeChat && (
        <div className="fixed inset-0 z-50 bg-[#0B1121] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="p-4 pt-[env(safe-area-inset-top,16px)] flex items-center justify-between border-b border-slate-800/80 bg-[#131B2F]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveChat(false)}
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="font-bold text-white text-lg">{config.providerName}</h2>
                <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Online
                </p>
              </div>
            </div>
            <button className="text-[#3D91FF] p-2" onClick={() => {setActiveChat(false); setActiveCall(`LifeLink_TrackCall_${type}_${Date.now()}`);}}>
              <Phone size={20} />
            </button>
          </div>
          
          <div className="flex-1 w-full bg-[#060B14] p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="text-center text-xs text-slate-500 mb-2">Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 mt-1">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Provider" className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#131B2F] border border-slate-800 rounded-2xl rounded-tl-none p-3 text-sm text-slate-200">
                Hello! I am on my way to your location. My ETA is {eta} minutes.
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#131B2F] border-t border-slate-800/80 pb-[max(env(safe-area-inset-bottom,16px),16px)]">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full bg-[#0B1121] border border-slate-700 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#3D91FF]"
              />
              <button 
                onClick={() => alert("Message sent! (Simulated)")}
                className="absolute right-2 w-8 h-8 bg-[#3D91FF] rounded-full flex items-center justify-center text-white"
              >
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingPage;
