import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Star, Clock, Award, Filter, Search, MicOff, VideoOff, PhoneOff } from 'lucide-react';

const ONLINE_PHYSIOS = [
  { id: 'op1', name: 'Dr. Neha Kapoor', specialization: 'Musculoskeletal Rehab', rating: '4.9', fee: 500, exp: '8 Years', img: 'https://i.pravatar.cc/150?u=op1' },
  { id: 'op2', name: 'Dr. Sameer Reddy', specialization: 'Sports & Athletics', rating: '4.7', fee: 450, exp: '6 Years', img: 'https://i.pravatar.cc/150?u=op2' },
];

export default function PhysioOnline() {
  const navigate = useNavigate();
  const [activeCall, setActiveCall] = useState<any>(null);

  if (activeCall) {
    return (
      <div className="fixed inset-0 bg-[#060B14] z-50 flex flex-col justify-between overflow-hidden">
        {/* Remote Video Placeholder */}
        <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
          <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop" alt="Physiotherapist" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-50 pointer-events-none">
            <div className="w-48 h-48 border-4 border-emerald-500/30 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
            <p className="mt-4 text-emerald-400 font-bold tracking-widest uppercase text-sm">Posture Analysis Active</p>
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-start pt-[env(safe-area-inset-top,24px)]">
          <div>
            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 w-fit mb-4">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-bold tracking-widest">04:12</span>
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">{activeCall.name}</h2>
            <p className="text-[#3D91FF] font-medium text-sm drop-shadow-md">{activeCall.specialization}</p>
          </div>
        </div>

        {/* Self View & Controls */}
        <div className="relative z-10 p-6 flex flex-col gap-6 pb-[env(safe-area-inset-bottom,24px)]">
          <div className="self-end w-32 h-44 bg-slate-800 rounded-2xl border-2 border-emerald-500/50 overflow-hidden shadow-2xl relative">
             <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop" alt="Self" className="w-full h-full object-cover" />
             <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded text-[8px] text-center text-emerald-400 font-bold py-1">ALIGNMENT: GOOD</div>
          </div>

          <div className="flex justify-center items-center gap-6 mt-4">
            <button className="w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform">
              <MicOff size={24} />
            </button>
            <button className="w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform">
              <VideoOff size={24} />
            </button>
            <button onClick={() => setActiveCall(null)} className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(225,29,72,0.5)] active:scale-95 transition-transform">
              <PhoneOff size={28} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-[120px] px-6 py-6">
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 flex items-center gap-4 -mx-6 px-6 mb-6">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/physiotherapy')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Online Physiotherapy</h1>
          <p className="text-xs text-[#3D91FF] font-medium">Remote Assessments</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4">
        {ONLINE_PHYSIOS.map(p => (
          <div key={p.id} className="bg-[#131F35] border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 relative flex-shrink-0 border border-slate-700">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
              </div>
              <div className="flex-1 pt-1">
                <h4 className="font-bold text-white text-lg leading-tight">{p.name}</h4>
                <p className="text-xs font-medium text-[#3D91FF] mb-1">{p.specialization}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Award size={12} className="text-amber-400" /> {p.exp}</span>
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {p.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Consultation Fee</p>
                <p className="font-black text-white text-base">₹{p.fee}</p>
              </div>
              <button 
                onClick={() => setActiveCall(p)}
                className="bg-[#3D91FF]/10 hover:bg-[#3D91FF]/20 text-[#3D91FF] font-bold py-2.5 px-6 rounded-xl border border-[#3D91FF]/30 transition-transform active:scale-95 flex items-center gap-2 text-sm"
              >
                <Video size={16} /> Connect Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
