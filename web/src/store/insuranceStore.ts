import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockActivePolicies } from '../data/insurancePlans';

export interface Application {
  id: string;
  planId: string;
  status: 'Started' | 'Submitted' | 'Under Review' | 'Approved';
  submittedAt: string;
  applicantName: string;
}

interface InsuranceState {
  savedPlans: string[];
  comparePlans: string[];
  activePolicies: any[]; // using any for now, could type it
  applications: Application[];
  
  toggleSavePlan: (planId: string) => void;
  addToCompare: (planId: string) => void;
  removeFromCompare: (planId: string) => void;
  clearCompare: () => void;
  submitApplication: (application: Omit<Application, 'id' | 'status' | 'submittedAt'>) => void;
}

export const useInsuranceStore = create<InsuranceState>()(
  persist(
    (set, get) => ({
      savedPlans: ['plan-1', 'plan-5', 'plan-10'],
      comparePlans: ['plan-1', 'plan-5'],
      activePolicies: mockActivePolicies,
      applications: [],

      toggleSavePlan: (planId) => set((state) => {
        if (state.savedPlans.includes(planId)) {
          return { savedPlans: state.savedPlans.filter(id => id !== planId) };
        } else {
          return { savedPlans: [...state.savedPlans, planId] };
        }
      }),

      addToCompare: (planId) => set((state) => {
        if (state.comparePlans.includes(planId)) return state;
        if (state.comparePlans.length >= 4) {
          alert('Compare up to 4 plans at a time.');
          return state;
        }
        return { comparePlans: [...state.comparePlans, planId] };
      }),

      removeFromCompare: (planId) => set((state) => ({
        comparePlans: state.comparePlans.filter(id => id !== planId)
      })),

      clearCompare: () => set({ comparePlans: [] }),

      submitApplication: (appData) => set((state) => {
        const newApp: Application = {
          ...appData,
          id: `APP-DEMO-${Math.floor(Math.random() * 10000)}`,
          status: 'Submitted',
          submittedAt: new Date().toISOString()
        };
        return { applications: [...state.applications, newApp] };
      })
    }),
    {
      name: 'insurance-storage-v2', // local storage key (v2 to reset and show dummy data)
    }
  )
);
