import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Video, Search, Activity, ChevronRight } from 'lucide-react';

export default function PhysiotherapyHub() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-[120px] px-6 py-6">
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 flex items-center gap-4 -mx-6 px-6 mb-6">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/doctor')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Physiotherapy & Rehab</h1>
          <p className="text-xs text-[#8B5CF6] font-medium">LifeLink Ecosystem</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {/* At Home Card */}
        <div 
          className="bg-gradient-to-br from-[#131F35] to-[#1E1B4B] border border-[#8B5CF6]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer"
          onClick={() => navigate('/physiotherapy/home')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-2xl group-hover:bg-[#8B5CF6]/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-14 h-14 bg-[#8B5CF6]/20 rounded-2xl flex items-center justify-center border border-[#8B5CF6]/30 text-[#8B5CF6]">
              <Home size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-2">Physiotherapy<br/>at <span className="text-[#8B5CF6]">Home</span></h2>
          <p className="text-sm text-slate-300 mb-6 max-w-[250px]">Book a certified physiotherapist for an at-home session and rehab.</p>
          <button className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 shadow-lg shadow-[#8B5CF6]/20 flex justify-center items-center gap-2">
            Book Home Visit <ChevronRight size={18} />
          </button>
        </div>

        {/* Online Video Card */}
        <div 
          className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-slate-700 transition-colors"
          onClick={() => navigate('/physiotherapy/online')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3D91FF]/10 text-[#3D91FF] rounded-2xl flex items-center justify-center">
              <Video size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Online Consultation</h3>
              <p className="text-xs text-slate-400">Virtual assessments & guidance</p>
            </div>
          </div>
        </div>

        {/* Directory Card */}
        <div 
          className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-slate-700 transition-colors"
          onClick={() => navigate('/physiotherapy/directory')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
              <Search size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Find Physiotherapist</h3>
              <p className="text-xs text-slate-400">Search profiles & specializations</p>
            </div>
          </div>
        </div>

        {/* Recovery Tracker Card */}
        <div 
          className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-slate-700 transition-colors"
          onClick={() => navigate('/physiotherapy/recovery')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">My Recovery Tracker</h3>
              <p className="text-xs text-slate-400">Track progress & milestones</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
