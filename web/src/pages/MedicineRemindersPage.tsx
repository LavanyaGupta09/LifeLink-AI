import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminderStore } from '../store/reminderStore';
import { Pill, Camera, Plus, CheckCircle, AlertTriangle, ChevronLeft, Loader2, Info, BellRing, Activity, Droplets, GlassWater } from 'lucide-react';
import type { MedicineReminder } from '../types/health.types';

interface TimelineItem {
  id: string;
  type: 'pill' | 'water';
  time: string;
  title: string;
  subtitle: string;
  completed: boolean;
  data?: any;
}

const MedicineRemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const { reminders, addReminder, getAdherenceRate, triggerAlarm } = useReminderStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration State
  const [waterIntake, setWaterIntake] = useState(1250); // Initial mock state
  const waterGoal = 2500;
  const waterPercentage = Math.round(Math.min((waterIntake / waterGoal) * 100, 100));
  
  // Animation state for satisfying micro-interaction
  const [isAddingWater, setIsAddingWater] = useState(false);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    
    setTimeout(() => {
      setIsUploading(false);
      const mockParsed: MedicineReminder = {
        id: `rem_${Date.now()}`,
        userId: 'u1',
        medicineName: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily',
        timeSlots: [{ time: '08:00', timing: 'After Food' }],
        isCritical: true,
        currentStock: 30,
        active: true,
      };
      addReminder(mockParsed);
      alert('Prescription parsed via AI successfully!');
    }, 2000);
  };

  const handleAddWater = (amount: number) => {
    setIsAddingWater(true);
    setWaterIntake(prev => Math.min(prev + amount, waterGoal));
    setTimeout(() => setIsAddingWater(false), 500);
  };

  const adherence = getAdherenceRate();

  // Combine Pills and Water into a single timeline stream
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];
    
    // Add Pills
    reminders.forEach(rem => {
      rem.timeSlots.forEach((slot, index) => {
        items.push({
          id: `${rem.id}_${index}`,
          type: 'pill',
          time: slot.time,
          title: rem.medicineName,
          subtitle: `${rem.dosage} • ${slot.timing}`,
          completed: false, // In a real app, track completion
          data: rem
        });
      });
    });

    // Add Water Checkpoints (every 2 hours from 8 AM to 8 PM)
    const waterTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    waterTimes.forEach((time, index) => {
      items.push({
        id: `water_${index}`,
        type: 'water',
        time,
        title: 'Hydration Checkpoint',
        subtitle: 'Drink 250ml to stay on track',
        completed: waterIntake >= (index + 1) * 250, 
      });
    });

    // Sort chronologically
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [reminders, waterIntake]);

  return (
    <div className="w-full bg-[#0B1121] text-white font-sans flex flex-col pb-[120px] md:pb-12 md:pl-28 relative min-h-screen px-6 py-6 ">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#3D91FF]/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#3D91FF]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="w-full flex items-center gap-4 p-6 lg:px-10 lg:py-8 relative z-10">
        <button 
          className="w-12 h-12 flex items-center justify-center bg-[#131B2F] border border-slate-800 rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-lg" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} className="text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
            <Activity size={32} className="text-[#00C9A7]" />
            Daily Wellness Tracker
          </h1>
          <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Smart Pills & Hydration Schedule</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full px-6 flex-1 relative z-10 flex flex-col gap-8">
        
        {/* WIDGET 1: UNIFIED DAILY ADHERENCE & WATER GOAL HEADER */}
        <div className="bg-gradient-to-br from-[#131B2F] to-[#0B1121] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00C9A7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="grid grid-cols-2 gap-8 relative z-10">
            {/* Pill Adherence */}
            <div className="flex flex-col items-center text-center border-r border-slate-800/80 pr-4">
              <div className="flex items-center gap-2 mb-4">
                <Pill size={16} className="text-[#3D91FF]" />
                <p className="text-xs font-bold text-[#3D91FF] uppercase tracking-widest">Pill Adherence</p>
              </div>
              <div className="relative flex items-center justify-center w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={`${adherence > 80 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${adherence}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{adherence}%</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs font-medium">{adherence > 80 ? 'Excellent! Keep it up.' : 'You missed a few doses.'}</p>
            </div>

            {/* Hydration Goal */}
            <div className="flex flex-col items-center text-center pl-4">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={16} className="text-[#00C9A7]" />
                <p className="text-xs font-bold text-[#00C9A7] uppercase tracking-widest">Hydration</p>
              </div>
              <div className="relative flex items-center justify-center w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#00C9A7] transition-all duration-1000 ease-out" strokeDasharray={`${waterPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{waterIntake}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/ {waterGoal} ml</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs font-medium">{waterPercentage >= 100 ? 'Goal reached!' : 'Keep drinking water.'}</p>
            </div>
          </div>
        </div>

        {/* Action Controls: Rx and Water Logging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Action Buttons (Scan Rx & Manual) */}
          <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl flex gap-4">
            <button 
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3D91FF] to-blue-600 rounded-2xl p-4 shadow-[0_0_30px_rgba(61,145,255,0.3)] hover:shadow-[0_0_40px_rgba(61,145,255,0.5)] transition-all active:scale-95 text-white" 
              onClick={handleUpload}
            >
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
              <span className="text-xs font-bold uppercase tracking-wider">Scan Rx</span>
            </button>
            <button className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0B1121] border-2 border-dashed border-slate-700 hover:border-[#3D91FF] rounded-2xl p-4 transition-all active:scale-95 text-slate-300 hover:text-white">
              <Plus size={24} className="text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Manual</span>
            </button>
          </div>

          {/* WIDGET 2: INTERACTIVE WATER INTAKE LOGGING */}
          <div className={`bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-center transition-all duration-300 ${isAddingWater ? 'scale-[1.02] border-[#00C9A7]/50 shadow-[0_0_30px_rgba(0,201,167,0.2)]' : ''}`}>
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-white flex items-center gap-2 text-sm"><Droplets size={16} className="text-[#00C9A7]"/> Log Water</h3>
               <span className="bg-[#00C9A7]/10 text-[#00C9A7] text-[10px] font-bold px-2 py-1 rounded-md uppercase">1-2 hr intervals</span>
             </div>
             <div className="flex gap-4">
               <button 
                 className="flex-1 flex items-center justify-center gap-2 bg-[#00C9A7]/10 border border-[#00C9A7]/30 hover:bg-[#00C9A7]/20 rounded-2xl py-3 text-[#00C9A7] transition-all active:scale-95"
                 onClick={() => handleAddWater(250)}
               >
                 <GlassWater size={18} />
                 <span className="text-xs font-bold uppercase">+ 250 ml</span>
               </button>
               <button 
                 className="flex-1 flex items-center justify-center gap-2 bg-[#00C9A7]/10 border border-[#00C9A7]/30 hover:bg-[#00C9A7]/20 rounded-2xl py-3 text-[#00C9A7] transition-all active:scale-95"
                 onClick={() => handleAddWater(500)}
               >
                 <Droplets size={18} />
                 <span className="text-xs font-bold uppercase">+ 500 ml</span>
               </button>
             </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        {/* WIDGET 3: COMBINED NOTIFICATION & TIMELINE STREAM */}
        <div className="pb-10">
          <div className="flex justify-between items-end mb-6 border-b border-slate-800/50 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-slate-400" /> Daily Schedule
            </h3>
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{timelineItems.length} Events</span>
          </div>
          
          {timelineItems.length === 0 ? (
            <div className="w-full bg-[#131B2F] border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-inner">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <Activity size={48} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">Your schedule is clear</h3>
              <p className="text-slate-500 max-w-sm">No pills or water checkpoints scheduled yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800/50 ml-4 pl-8 flex flex-col gap-6">
              {timelineItems.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-[#0B1121] flex items-center justify-center shadow-lg ${item.type === 'pill' ? (item.completed ? 'bg-emerald-500' : 'bg-[#3D91FF]') : (item.completed ? 'bg-emerald-500' : 'bg-[#00C9A7]')}`} />
                  
                  {/* Item Card */}
                  <div className={`bg-[#131B2F] border border-slate-800 rounded-3xl p-5 transition-all hover:shadow-xl group-hover:border-slate-600 relative overflow-hidden ${item.completed ? 'opacity-75' : ''}`}>
                    
                    {/* Subtle Background Glow for Critical Pills */}
                    {item.type === 'pill' && item.data?.isCritical && !item.completed && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${item.type === 'pill' ? (item.data?.isCritical ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-[#3D91FF]/20 text-[#3D91FF] border border-[#3D91FF]/30') : 'bg-[#00C9A7]/20 text-[#00C9A7] border border-[#00C9A7]/30'}`}>
                          {item.type === 'pill' ? <Pill size={24} /> : <Droplets size={24} />}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
                            {item.title}
                            {item.type === 'pill' && item.data?.isCritical && !item.completed && <AlertTriangle size={16} className="text-rose-500 animate-pulse" />}
                          </h4>
                          <p className="text-xs font-medium text-slate-400 mt-1">{item.subtitle}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-slate-800/50 border border-slate-700 px-3 py-1 rounded-lg flex items-center gap-2">
                          <BellRing size={12} className="text-slate-400" />
                          <span className="text-xs font-black tracking-widest text-white">{item.time}</span>
                        </div>
                        {item.type === 'pill' && !item.completed && (
                          <button 
                            className="text-[10px] font-bold text-[#3D91FF] hover:text-white uppercase tracking-widest transition-colors mt-1 bg-[#3D91FF]/10 px-2 py-1 rounded"
                            onClick={() => triggerAlarm(item.data!, item.time)}
                          >
                            Test Alarm
                          </button>
                        )}
                        {item.type === 'water' && item.completed && (
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle size={12}/> Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicineRemindersPage;
