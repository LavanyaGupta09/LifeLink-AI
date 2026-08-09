import { create } from 'zustand';
import type { MedicineReminder, AdherenceLog } from '../types/health.types';

interface ReminderState {
  reminders: MedicineReminder[];
  logs: AdherenceLog[];
  activeAlarm: { reminder: MedicineReminder, time: string } | null;

  setReminders: (reminders: MedicineReminder[]) => void;
  addReminder: (reminder: MedicineReminder) => void;
  logAdherence: (reminderId: string, status: 'taken' | 'snoozed' | 'missed', time: string) => void;
  triggerAlarm: (reminder: MedicineReminder, time: string) => void;
  dismissAlarm: () => void;
  getAdherenceRate: () => number;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  logs: [],
  activeAlarm: null,

  setReminders: (reminders) => set({ reminders }),
  addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
  
  logAdherence: (reminderId, status, time) => set((state) => {
    // reduce stock if taken
    const updatedReminders = state.reminders.map(r => {
      if (r.id === reminderId && status === 'taken') {
        return { ...r, currentStock: Math.max(0, r.currentStock - 1) };
      }
      return r;
    });

    const medicineName = state.reminders.find(r => r.id === reminderId)?.medicineName || 'Unknown';
    
    const newLog: AdherenceLog = {
      id: `log_${Date.now()}`,
      reminderId,
      medicineName,
      status,
      loggedAt: new Date().toISOString(),
      scheduledTime: time
    };

    return { 
      reminders: updatedReminders, 
      logs: [...state.logs, newLog],
      activeAlarm: null // Dismiss alarm if active
    };
  }),

  triggerAlarm: (reminder, time) => set({ activeAlarm: { reminder, time } }),
  dismissAlarm: () => set({ activeAlarm: null }),
  
  getAdherenceRate: () => {
    const state = get();
    if (state.logs.length === 0) return 100;
    const taken = state.logs.filter(l => l.status === 'taken').length;
    return Math.round((taken / state.logs.length) * 100);
  }
}));
