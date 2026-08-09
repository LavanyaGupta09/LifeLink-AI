import React, { useEffect, useRef } from 'react';
import { useReminderStore } from '../store/reminderStore';
import { Pill, Bell, AlertTriangle } from 'lucide-react';

const ReminderOverlay: React.FC = () => {
  const { activeAlarm, logAdherence } = useReminderStore();
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (activeAlarm && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(`Time to take your ${activeAlarm.reminder.medicineName}.`);
      utterance.rate = 0.9;
      synthRef.current.speak(utterance);
    }
  }, [activeAlarm]);

  if (!activeAlarm) return null;

  const { reminder, time } = activeAlarm;

  const handleTaken = () => {
    if (synthRef.current) synthRef.current.cancel();
    logAdherence(reminder.id, 'taken', time);
  };

  const handleSnooze = () => {
    if (synthRef.current) synthRef.current.cancel();
    logAdherence(reminder.id, 'snoozed', time);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060B14] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="absolute inset-0 bg-[#FF4757]/10 animate-pulse pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-[#FF4757]/20 flex items-center justify-center mb-8 animate-bounce">
          <Bell size={48} color="#FF4757" />
        </div>

        <h1 className="text-[2rem] font-bold text-white mb-2 leading-tight">Time for your Medicine</h1>
        <p className="text-xl text-[#3D91FF] font-semibold mb-6">{time}</p>

        <div className="bg-[#172236] border-2 border-[#3D91FF] rounded-2xl p-6 w-full mb-10 shadow-[0_0_40px_rgba(61,145,255,0.2)]">
          <Pill size={40} color="#3D91FF" className="mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-white mb-2">{reminder.medicineName}</h2>
          <p className="text-2xl text-[#E4E9F2] font-medium">{reminder.dosage}</p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button 
            className="btn btn-primary btn-block flex items-center justify-center gap-3"
            style={{ minHeight: '80px', fontSize: '1.25rem' }}
            onClick={handleTaken}
          >
            <span className="text-2xl">✅</span> TAKEN
          </button>
          
          <button 
            className="btn btn-ghost btn-block flex items-center justify-center gap-3 border-2"
            style={{ minHeight: '80px', fontSize: '1.25rem', borderColor: 'var(--border)' }}
            onClick={handleSnooze}
          >
            <span className="text-2xl">💤</span> SNOOZE 15 MINS
          </button>
        </div>

        {reminder.isCritical && (
          <div className="mt-8 flex items-center gap-2 text-[#FFA502] font-semibold">
            <AlertTriangle size={20} />
            <p>Critical Medicine</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderOverlay;
