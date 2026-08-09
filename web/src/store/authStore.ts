import { create } from 'zustand';
import type { User, HealthProfile, EmergencyContact } from '../types/health.types';
import { MOCK_USER, MOCK_HEALTH_PROFILE, MOCK_EMERGENCY_CONTACTS } from '../data/mockData';

interface AuthState {
  user: User | null;
  healthProfile: HealthProfile | null;
  emergencyContacts: EmergencyContact[];
  isAuthenticated: boolean;
  isOnboarded: boolean;

  login: (user: User) => void;
  logout: () => Promise<void>;
  setHealthProfile: (profile: HealthProfile) => void;
  setOnboarded: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePrimaryContact: (updates: Partial<EmergencyContact>) => void;
  // For demo: auto-login
  demoLogin: () => void;
  providerLogin: (role: string, verificationStatus?: 'pending_approval' | 'verified' | 'rejected') => void;
  superAdminLogin: () => void;
  toggleEasyMode: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  healthProfile: null,
  emergencyContacts: [],
  isAuthenticated: false,
  isOnboarded: false,

  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    try {
      // 1. Invalidate session on the backend
      await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // 2. Wipe frontend storage completely
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Clear Zustand state completely
    set({ user: null, healthProfile: null, emergencyContacts: [], isAuthenticated: false, isOnboarded: false });
  },
  setHealthProfile: (profile) => set({ healthProfile: profile }),
  setOnboarded: () => set({ isOnboarded: true }),
  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  updatePrimaryContact: (updates) => set((state) => {
    const contacts = [...state.emergencyContacts];
    if (contacts.length > 0) {
      contacts[0] = { ...contacts[0], ...updates };
    } else {
      contacts.push({ id: 'ec_new', name: '', relationship: '', phone: '', isFamilyMember: false, notifyOnSOS: true, ...updates });
    }
    return { emergencyContacts: contacts };
  }),
  demoLogin: () =>
    set({
      user: MOCK_USER,
      healthProfile: MOCK_HEALTH_PROFILE,
      emergencyContacts: MOCK_EMERGENCY_CONTACTS,
      isAuthenticated: true,
      isOnboarded: true,
    }),
  providerLogin: (role, verificationStatus = 'verified') =>
    set({
      user: { 
        ...MOCK_USER, 
        id: `usr_${role}`, 
        fullName: `${role.replace('_', ' ')} Demo User`, 
        role: role as any,
        verificationStatus 
      },
      isAuthenticated: true,
      isOnboarded: true,
    }),
  superAdminLogin: () =>
    set({
      user: {
        ...MOCK_USER,
        id: 'usr_super_admin',
        fullName: 'System Administrator',
        role: 'super_admin' as any,
        verificationStatus: 'verified'
      },
      isAuthenticated: true,
      isOnboarded: true,
    }),
  toggleEasyMode: (enabled) => set((state) => ({ 
    user: state.user ? { ...state.user, easyModeEnabled: enabled } : null 
  })),
}));
