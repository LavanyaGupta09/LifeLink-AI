import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, UserCheck, Baby, Activity, ChevronRight } from 'lucide-react';

export default function HomeCareHub() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-[120px] px-6 py-6">
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 flex items-center gap-4 -mx-6 px-6 mb-6">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Home Care Services</h1>
          <p className="text-xs text-amber-500 font-medium">LifeLink Nursing</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {/* Main Booking Card */}
        <div 
          className="bg-gradient-to-br from-[#131F35] to-[#451A03] border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer"
          onClick={() => alert('Booking flow initiated (Mock)')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 text-amber-400">
              <HeartPulse size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-2">Professional<br/>Nursing at <span className="text-amber-500">Home</span></h2>
          <p className="text-sm text-slate-300 mb-6 max-w-[250px]">Book trained nurses and attendants for 12/24 hour shifts.</p>
          <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 shadow-lg shadow-amber-600/20 flex justify-center items-center gap-2">
            Book Nursing Care <ChevronRight size={18} />
          </button>
        </div>

        {/* Elderly Care Card */}
        <div 
          className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-slate-700 transition-colors"
          onClick={() => alert('Elderly Care details (Mock)')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Elderly Care</h3>
              <p className="text-xs text-slate-400">Companionship & daily assistance</p>
            </div>
          </div>
        </div>

        {/* Post Surgical Card */}
        <div 
          className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-slate-700 transition-colors"
          onClick={() => alert('Post-Surgical details (Mock)')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Post-Surgical Care</h3>
              <p className="text-xs text-slate-400">Wound dressing & pain management</p>
            </div>
          </div>
        </div>

        {/* Baby Care Card */}
        <div 
          className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-slate-700 transition-colors"
          onClick={() => alert('Mother & Baby care details (Mock)')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center">
              <Baby size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Mother & Baby Care</h3>
              <p className="text-xs text-slate-400">Newborn care & lactation support</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
