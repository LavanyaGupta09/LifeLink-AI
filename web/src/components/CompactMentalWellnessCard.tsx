import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { HeartPulse, Wind, ArrowRight, Brain } from 'lucide-react';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Down', value: 'down' },
  { emoji: '😟', label: 'Anxious', value: 'anxious' }
];

const CompactMentalWellnessCard: React.FC = () => {
  const navigate = useNavigate();
  const { healthProfile, setHealthProfile } = useAuthStore();
  const [activeActivity, setActiveActivity] = useState<'none' | 'breathing' | 'relax'>('none');
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');

  // Simple breathing timer
  useEffect(() => {
    if (activeActivity === 'breathing') {
      let phase = 0;
      const phases = ['in', 'hold', 'out', 'hold'] as const;
      const interval = setInterval(() => {
        phase = (phase + 1) % 4;
        setBreathPhase(phases[phase]);
      }, 4000); // 4 seconds per phase (box breathing)
      
      // Auto-stop after 2 minutes (120000 ms)
      const timeout = setTimeout(() => {
        setActiveActivity('none');
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [activeActivity]);

  const handleMoodSelect = (moodVal: string) => {
    if (healthProfile) {
      setHealthProfile({ ...healthProfile, dailyMood: moodVal });
    }
  };

  const currentMood = healthProfile?.dailyMood;

  return (
    <div className="bg-[#131B2F] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group z-20 pointer-events-auto">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-20">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-200 text-sm tracking-wide">Wellness Check-in</h2>
            <p className="text-xs text-slate-500">Take a moment for yourself</p>
          </div>
        </div>

        {/* Dynamic Activity Area */}
        {activeActivity === 'none' ? (
          <div className="space-y-6">
            {/* Mood Tracker */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-3 text-center">How are you feeling today?</p>
              <div className="flex justify-between px-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    tabIndex={0}
                    aria-label={`Select mood: ${m.label}`}
                    onClick={() => handleMoodSelect(m.value)}
                    className={`text-2xl sm:text-3xl transition-transform hover:scale-125 cursor-pointer ${currentMood === m.value ? 'scale-125 grayscale-0' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Activities */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                tabIndex={0}
                aria-label="Start 2-Minute Breathing Exercise"
                onClick={() => setActiveActivity('breathing')}
                className="bg-[#0B1121] border border-slate-700/50 hover:border-teal-500/50 hover:bg-teal-500/10 transition-colors rounded-2xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer relative z-30"
              >
                <Wind size={20} className="text-teal-400" />
                <span className="text-xs font-bold text-slate-300">2-Min Breathe</span>
              </button>
              <button 
                tabIndex={0}
                aria-label="Start Relax and Focus Session"
                onClick={() => setActiveActivity('relax')}
                className="bg-[#0B1121] border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors rounded-2xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer relative z-30"
              >
                <HeartPulse size={20} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Relax & Focus</span>
              </button>
            </div>
          </div>
        ) : activeActivity === 'breathing' ? (
          <div className="flex flex-col items-center py-4">
            <p className="text-sm font-bold text-teal-400 mb-6 uppercase tracking-widest">
              {breathPhase === 'in' ? 'Breathe In' : breathPhase === 'out' ? 'Breathe Out' : 'Hold'}
            </p>
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              <div className={`absolute inset-0 rounded-full border border-teal-500/30 transition-all duration-[4000ms] ease-in-out ${breathPhase === 'in' ? 'scale-150 bg-teal-500/20' : breathPhase === 'out' ? 'scale-75 bg-transparent' : 'scale-100'}`} />
              <Wind size={32} className="text-teal-500 relative z-10" />
            </div>
            <button onClick={() => setActiveActivity('none')} className="text-xs text-slate-500 hover:text-white underline cursor-pointer relative z-30">End Session</button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <p className="text-sm font-bold text-indigo-400 mb-6 uppercase tracking-widest">Mindful Moment</p>
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 animate-pulse flex items-center justify-center border border-indigo-500/30 mb-6">
              <Brain size={32} className="text-indigo-400 opacity-80" />
            </div>
            <button onClick={() => setActiveActivity('none')} className="text-xs text-slate-500 hover:text-white underline cursor-pointer relative z-30">End Session</button>
          </div>
        )}

        {/* Routing Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-center">
          <button tabIndex={0} aria-label="Find Professional Help" onClick={() => navigate('/doctor')} className="text-xs font-medium text-slate-500 hover:text-slate-300 flex items-center gap-1 group transition-colors cursor-pointer relative z-30">
            Need more support? <span className="text-[#3D91FF] group-hover:underline flex items-center">Find Professional Help <ArrowRight size={12} className="ml-1" /></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactMentalWellnessCard;
