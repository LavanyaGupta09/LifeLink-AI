import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingDown, CheckCircle2, Circle, Calendar, ChevronRight } from 'lucide-react';

export default function RecoveryTracker() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-[120px] px-6 py-6">
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 flex items-center gap-4 -mx-6 px-6 mb-6">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/physiotherapy')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Recovery Tracker</h1>
          <p className="text-xs text-amber-400 font-medium">Post-Surgery Knee Rehab</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        
        {/* Progress Overview Card */}
        <div className="bg-gradient-to-br from-[#131F35] to-[#1E1B4B] border border-amber-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-black text-white">80%</h2>
              <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Mobility Recovered</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Activity size={24} />
            </div>
          </div>
          
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full w-[80%] relative">
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-right">Target: 100% by Oct 15</p>
        </div>

        {/* Pain Level Metric */}
        <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-emerald-400" /> Pain Level Reduction
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-rose-500/50 flex items-center justify-center text-xl font-black text-white mb-2 bg-rose-500/10">7</div>
              <span className="text-xs text-slate-400 font-medium">Session 1</span>
            </div>
            
            <div className="flex-1 h-[2px] bg-gradient-to-r from-rose-500/50 to-emerald-400/50 mx-4 relative">
              <ChevronRight size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-400 flex items-center justify-center text-xl font-black text-white mb-2 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.3)]">4</div>
              <span className="text-xs text-emerald-400 font-bold">Current</span>
            </div>
          </div>
        </div>

        {/* Next Session Countdown */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-emerald-400" />
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Next Session</p>
            </div>
            <p className="font-bold text-lg text-white">Tomorrow • 6:00 PM</p>
            <p className="text-xs text-slate-400">Dr. Priya Sharma (Home Visit)</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-xl text-sm transition-transform active:scale-95">
            Reschedule
          </button>
        </div>

        {/* Milestone Checklist */}
        <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Treatment Milestones</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm line-through opacity-70">Session 1: Initial Assessment</p>
                <p className="text-xs text-slate-500">Completed on 10 Aug</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm line-through opacity-70">Session 2: Passive Range of Motion</p>
                <p className="text-xs text-slate-500">Completed on 12 Aug</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm line-through opacity-70">Session 3: Strengthening Starts</p>
                <p className="text-xs text-slate-500">Completed on 14 Aug</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Circle size={24} className="text-slate-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Session 4: Balance & Core</p>
                <p className="text-xs text-emerald-400 font-medium mt-1">Scheduled for Tomorrow</p>
              </div>
            </div>
            <div className="flex gap-3 opacity-50">
              <Circle size={24} className="text-slate-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Session 5: Full Weight Bearing</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
