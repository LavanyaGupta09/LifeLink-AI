import { create } from 'zustand';
import type { SOSEvent, TriageLevel, SOSTrigger } from '../types/health.types';
import { supabase } from '../lib/supabase';

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

// Reverse geocode using free Nominatim API
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await resp.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Persist SOS event to Supabase
async function persistSOSToSupabase(event: SOSEvent) {
  try {
    const { error } = await supabase.from('emergency_requests').insert({
      id: event.id,
      patient_id: event.userId,
      status: 'DISPATCHED',
      triage_level: event.triageLevel,
      trigger_method: event.triggerMethod,
      lat: event.lat,
      lng: event.lng,
      address: event.address,
      created_at: event.createdAt,
    });
    if (error) {
      console.error('Supabase SOS insert error:', error);
    } else {
      console.log('✅ SOS event persisted to Supabase:', event.id);
    }
  } catch (err) {
    console.error('Failed to persist SOS to Supabase:', err);
  }
}

export const useSOSStore = create<SOSState>((set, get) => ({
  activeSOSId: null,
  sosEvent: null,
  isSOSActive: false,
  countdown: 10,
  isCounting: false,

  triggerSOS: async (level, method, lat, lng) => {
    if (!navigator.onLine) {
      // Offline fallback: Send SMS intent
      const message = `SOS EMERGENCY! Lat: ${lat}, Lng: ${lng}. Need immediate assistance. Triage Level: ${level}`;
      window.location.href = `sms:112?body=${encodeURIComponent(message)}`;
      
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

    // Get real address from coordinates
    const address = await reverseGeocode(lat, lng);

    const event: SOSEvent = {
      id: `sos_${Date.now()}`,
      userId: 'usr_001',
      status: 'active',
      triageLevel: level,
      triggerMethod: method,
      lat,
      lng,
      address,
      createdAt: new Date().toISOString(),
    };

    set({ activeSOSId: event.id, sosEvent: event, isSOSActive: true, isCounting: false, countdown: 10 });

    // REAL: Persist to Supabase
    persistSOSToSupabase(event);
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
