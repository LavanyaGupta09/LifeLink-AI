import { create } from 'zustand';
import type { SOSEvent, TriageLevel, SOSTrigger } from '../types/health.types';

interface SOSState {
  activeSOSId: string | null;
  sosEvent: SOSEvent | null;
  isSOSActive: boolean;
  countdown: number;
  isCounting: boolean;

  triggerSOS: (level: TriageLevel, method: SOSTrigger, lat: number, lng: number) => void;
  cancelSOS: () => void;
  resolveSOS: () => void;
  startCountdown: () => void;
  stopCountdown: () => void;
  decrementCountdown: () => void;
}

export const useSOSStore = create<SOSState>((set, get) => ({
  activeSOSId: null,
  sosEvent: null,
  isSOSActive: false,
  countdown: 10,
  isCounting: false,

  triggerSOS: (level, method, lat, lng) => {
    if (!navigator.onLine) {
      // Offline fallback: Send SMS intent
      const message = `SOS EMERGENCY! Lat: ${lat}, Lng: ${lng}. Need immediate assistance. Triage Level: ${level}`;
      // In a real device, this opens the SMS app pre-filled
      window.location.href = `sms:112?body=${encodeURIComponent(message)}`;
      
      // Still set the local state so the UI reflects the SOS mode
      const event: SOSEvent = {
        id: `sos_offline_${Date.now()}`,
        userId: 'usr_001',
        status: 'active',
        triageLevel: level,
        triggerMethod: method,
        lat,
        lng,
        address: 'Offline - Location Unknown',
        createdAt: new Date().toISOString(),
      };
      set({ activeSOSId: event.id, sosEvent: event, isSOSActive: true, isCounting: false, countdown: 10 });
      return;
    }

    const event: SOSEvent = {
      id: `sos_${Date.now()}`,
      userId: 'usr_001',
      status: 'active',
      triageLevel: level,
      triggerMethod: method,
      lat,
      lng,
      address: 'Sarita Vihar, New Delhi — 110076',
      createdAt: new Date().toISOString(),
    };
    set({ activeSOSId: event.id, sosEvent: event, isSOSActive: true, isCounting: false, countdown: 10 });
  },

  cancelSOS: () =>
    set({ activeSOSId: null, sosEvent: null, isSOSActive: false, isCounting: false, countdown: 10 }),

  resolveSOS: () =>
    set((state) => ({
      sosEvent: state.sosEvent
        ? { ...state.sosEvent, status: 'resolved', resolvedAt: new Date().toISOString() }
        : null,
      isSOSActive: false,
    })),

  startCountdown: () => set({ isCounting: true, countdown: 10 }),
  stopCountdown: () => set({ isCounting: false, countdown: 10 }),
  decrementCountdown: () => {
    const { countdown } = get();
    if (countdown <= 1) {
      set({ isCounting: false });
    } else {
      set({ countdown: countdown - 1 });
    }
  },
}));
