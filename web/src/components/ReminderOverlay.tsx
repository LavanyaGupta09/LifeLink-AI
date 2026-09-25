import React, { useEffect, useRef, useState } from 'react';
import { useReminderStore } from '../store/reminderStore';
import { Pill, Bell, AlertTriangle, X, Check, Clock, Volume2 } from 'lucide-react';

const SNOOZE_OPTIONS = [5, 10, 15, 30];

const ReminderOverlay: React.FC = () => {
  const { activeAlarm, logAdherence, triggerAlarm, dismissAlarm } = useReminderStore();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  useEffect(() => {
    if (activeAlarm) {
      if (activeAlarm.reminder.ringtone) {
        // Custom ringtone selected
        audioRef.current = new Audio(activeAlarm.reminder.ringtone);
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else if ('speechSynthesis' in window) {
        // Fallback to speech synth
        synthRef.current = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(`Time to take your ${activeAlarm.reminder.medicineName}.`);
        utterance.rate = 0.9;
        synthRef.current.speak(utterance);
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [activeAlarm]);

  if (!activeAlarm) return null;

  const { reminder, time } = activeAlarm;

  const stopAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    if (synthRef.current) synthRef.current.cancel();
  };

  const handleTaken = () => {
    stopAudio();
    logAdherence(reminder.id, 'taken', time);
    dismissAlarm();
  };

  const handleSnooze = (minutes: number) => {
    stopAudio();
    // Schedule a future alarm for this specific snooze duration
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeHours = now.getHours().toString().padStart(2, '0');
    const snoozeMinutes = now.getMinutes().toString().padStart(2, '0');
    const snoozeTimeStr = `${snoozeHours}:${snoozeMinutes}`;
    
    // Instead of logging as snoozed immediately which marks it complete, 
    // we want to just hide the alarm and trigger it again later. 
    // For simplicity, we can log it as snoozed, and trigger a setTimeout
    logAdherence(reminder.id, 'snoozed', time);
    dismissAlarm();
    
    setTimeout(() => {
       triggerAlarm(reminder, snoozeTimeStr);
    }, minutes * 60 * 1000);
  };

  const handleSkip = () => {
    stopAudio();
    logAdherence(reminder.id, 'skipped', time);
    dismissAlarm();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="absolute inset-0 bg-[#3D91FF]/5 animate-pulse pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center mb-6 shadow-xl relative animate-bounce">
          <Bell size={40} className="text-[#3D91FF]" />
          {reminder.ringtone && <Volume2 size={16} className="absolute bottom-2 right-2 text-textSecondary" />}
        </div>

        <h1 className="text-2xl font-bold text-textPrimary mb-1">Medication Reminder</h1>
        <p className="text-sm font-bold tracking-widest uppercase text-[#3D91FF] mb-8">{time}</p>

        <div className="bg-card border border-border rounded-3xl p-8 w-full mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D91FF]/10 rounded-full blur-3xl" />
          <Pill size={48} className="text-[#3D91FF] mx-auto mb-5" />
          <h2 className="text-3xl font-black text-textPrimary mb-2 leading-tight">{reminder.medicineName}</h2>
          <p className="text-lg text-textSecondary font-medium">{reminder.dosage}</p>
          {reminder.isCritical && (
            <div className="mt-6 inline-flex items-center gap-2 text-rose-500 font-bold bg-rose-500/10 px-4 py-2 rounded-xl">
              <AlertTriangle size={18} /> Critical Medicine
            </div>
          )}
        </div>

        {!showSnoozeOptions ? (
          <div className="flex flex-col gap-3 w-full">
            <button 
              className="w-full bg-[#00C9A7] hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-transform active:scale-95 flex items-center justify-center gap-3 text-lg shadow-[0_0_20px_rgba(0,201,167,0.3)]"
              onClick={handleTaken}
            >
              <Check size={24} /> TAKEN
            </button>
            
            <button 
              className="w-full bg-surface border-2 border-border hover:border-[#3D91FF]/50 text-textPrimary font-bold py-5 rounded-2xl transition-transform active:scale-95 flex items-center justify-center gap-3 text-lg"
              onClick={() => setShowSnoozeOptions(true)}
            >
              <Clock size={24} className="text-[#3D91FF]" /> REMIND ME LATER
            </button>
            
            <button 
              className="w-full text-textSecondary hover:text-rose-500 font-bold py-4 rounded-2xl transition-colors mt-2"
              onClick={handleSkip}
            >
              SKIP DOSE
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 animate-fade-in">
            <h3 className="font-bold text-textPrimary mb-2">Remind me again in:</h3>
            <div className="grid grid-cols-2 gap-3">
              {SNOOZE_OPTIONS.map(mins => (
                <button
                  key={mins}
                  className="bg-surface border border-border hover:border-[#3D91FF] text-textPrimary font-bold py-4 rounded-2xl transition-all active:scale-95 text-lg"
                  onClick={() => handleSnooze(mins)}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <button 
              className="w-full text-textSecondary hover:text-textPrimary font-bold py-4 rounded-2xl transition-colors mt-2"
              onClick={() => setShowSnoozeOptions(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderOverlay;
