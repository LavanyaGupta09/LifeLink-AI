import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────
export type AreaType = 'urban' | 'rural' | null;

export interface AshaWorkerProfile {
  id: string;
  name: string;
  village: string;
  district: string;
  phone: string;
  photoUrl?: string;
}

export interface PatientAssessment {
  temperature: string;
  bloodPressure: string;
  breathingDifficulty: 'none' | 'mild' | 'severe';
  heartRate: string;
  condition: string;
  notes: string;
}

export interface PatientVisit {
  id: string;
  patientName: string;
  visitType: 'asha_visit' | 'triage' | 'followup';
  date: string;
  findings: string;
  advice: string;
  nextVisit: string;
  assessment?: PatientAssessment;
  isCritical: boolean;
}

export type AlertStage = 'sos_sent' | 'team_notified' | 'ambulance_dispatched' | 'hospital_alerted' | 'help_arriving';

export interface AshaEmergencyAlert {
  id: string;
  patientName: string;
  village: string;
  lat: number;
  lng: number;
  stage: AlertStage;
  createdAt: string;
  distance?: string;
  description: string;
}

// ── Store ──────────────────────────────────────────────
interface AshaState {
  // Area selection
  areaType: AreaType;
  setAreaType: (type: AreaType) => void;

  // ASHA worker profile
  ashaProfile: AshaWorkerProfile;
  updateAshaProfile: (updates: Partial<AshaWorkerProfile>) => void;

  // Patient visits
  patientVisits: PatientVisit[];
  addPatientVisit: (visit: PatientVisit) => void;

  // Emergency alerts
  emergencyAlerts: AshaEmergencyAlert[];
  activeAlert: AshaEmergencyAlert | null;
  createEmergencyAlert: (alert: AshaEmergencyAlert) => void;
  updateAlertStage: (alertId: string, stage: AlertStage) => void;
  clearActiveAlert: () => void;

  // Offline queue count (ASHA-specific)
  ashaOfflineQueue: number;
  incrementOfflineQueue: () => void;
  clearOfflineQueue: () => void;
}

const DEFAULT_PROFILE: AshaWorkerProfile = {
  id: 'asha_001',
  name: 'Sunita Kumari',
  village: 'Rampur',
  district: 'Varanasi',
  phone: '+91 98765 43210',
};

const MOCK_VISITS: PatientVisit[] = [
  {
    id: 'visit_001',
    patientName: 'Ramesh Devi',
    visitType: 'asha_visit',
    date: '2025-05-12',
    findings: 'Bukhar (100°F)',
    advice: 'Dawai + Pani zyada',
    nextVisit: 'Agli din phir se dekhein',
    isCritical: false,
    assessment: {
      temperature: '100',
      bloodPressure: '130/85',
      breathingDifficulty: 'none',
      heartRate: '88',
      condition: 'Bukhar, halka kamzori',
      notes: 'Paracetamol di, zyada pani peene ko kaha',
    },
  },
  {
    id: 'visit_002',
    patientName: 'Kamla Bai',
    visitType: 'followup',
    date: '2025-05-10',
    findings: 'BP zyada (150/95)',
    advice: 'Doctor se milein, dawai jaari rakhein',
    nextVisit: '3 din baad',
    isCritical: false,
  },
  {
    id: 'visit_003',
    patientName: 'Suresh Kumar',
    visitType: 'triage',
    date: '2025-05-08',
    findings: 'Saans lene mein dikkat',
    advice: 'Turant hospital bheja',
    nextVisit: 'Hospital discharge ke baad',
    isCritical: true,
  },
];

export const useAshaStore = create<AshaState>()(
  persist(
    (set) => ({
      // Area selection
      areaType: null,
      setAreaType: (type) => set({ areaType: type }),

      // ASHA profile
      ashaProfile: DEFAULT_PROFILE,
      updateAshaProfile: (updates) =>
        set((state) => ({
          ashaProfile: { ...state.ashaProfile, ...updates },
        })),

      // Patient visits
      patientVisits: MOCK_VISITS,
      addPatientVisit: (visit) =>
        set((state) => ({
          patientVisits: [visit, ...state.patientVisits],
        })),

      // Emergency alerts
      emergencyAlerts: [],
      activeAlert: null,
      createEmergencyAlert: (alert) =>
        set((state) => ({
          activeAlert: alert,
          emergencyAlerts: [alert, ...state.emergencyAlerts],
        })),
      updateAlertStage: (alertId, stage) =>
        set((state) => ({
          activeAlert:
            state.activeAlert?.id === alertId
              ? { ...state.activeAlert, stage }
              : state.activeAlert,
          emergencyAlerts: state.emergencyAlerts.map((a) =>
            a.id === alertId ? { ...a, stage } : a
          ),
        })),
      clearActiveAlert: () => set({ activeAlert: null }),

      // Offline queue
      ashaOfflineQueue: 0,
      incrementOfflineQueue: () =>
        set((state) => ({ ashaOfflineQueue: state.ashaOfflineQueue + 1 })),
      clearOfflineQueue: () => set({ ashaOfflineQueue: 0 }),
    }),
    {
      name: 'lifelink-asha-storage',
    }
  )
);
