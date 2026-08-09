// ============================================
// PRIVACY STORE — Consent Fields + Shared Links
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SharedLink {
  id: string;
  url: string;
  expiresAt: number;   // timestamp ms
  sharedWith: string;
  purpose: string;
}

export interface ConsentFields {
  bloodGroup: boolean;
  allergies: boolean;
  chronicConditions: boolean;
  currentMedications: boolean;
  psychiatricHistory: boolean;
  emergencyContact: boolean;
  organDonor: boolean;
  insuranceInfo: boolean;
}

interface PrivacyState {
  consentFields: ConsentFields;
  activeShareLinks: SharedLink[];

  toggleField: (field: keyof ConsentFields) => void;
  generateShareLink: (sharedWith: string, purpose: string) => SharedLink;
  revokeLink: (id: string) => void;
  revokeAllLinks: () => void;
  pruneExpiredLinks: () => void;
}

const DEFAULT_CONSENT: ConsentFields = {
  bloodGroup: true,           // always recommended on
  allergies: true,
  chronicConditions: true,
  currentMedications: true,
  psychiatricHistory: false,  // sensitive — off by default
  emergencyContact: true,
  organDonor: true,
  insuranceInfo: false,       // private — off by default
};

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      consentFields: DEFAULT_CONSENT,
      activeShareLinks: [
        // Demo: one link already active with ~20h remaining
        {
          id: 'link_demo_001',
          url: 'https://lifelink.ai/share/LLQR-B29FX-PRIYA-2024?token=abc123xyz',
          expiresAt: Date.now() + 20 * 60 * 60 * 1000,
          sharedWith: 'Lavanya (Daughter)',
          purpose: 'SOS Emergency — Family Alert',
        },
      ],

      toggleField: (field) => {
        if (field === 'bloodGroup') return; // non-negotiable
        set(s => ({
          consentFields: { ...s.consentFields, [field]: !s.consentFields[field] },
        }));
      },

      generateShareLink: (sharedWith, purpose) => {
        const link: SharedLink = {
          id: `link_${Date.now()}`,
          url: `https://lifelink.ai/share/LLQR-B29FX-PRIYA-2024?token=${Math.random().toString(36).slice(2, 10)}`,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          sharedWith,
          purpose,
        };
        set(s => ({ activeShareLinks: [...s.activeShareLinks, link] }));
        return link;
      },

      revokeLink: (id) =>
        set(s => ({ activeShareLinks: s.activeShareLinks.filter(l => l.id !== id) })),

      revokeAllLinks: () => set({ activeShareLinks: [] }),

      pruneExpiredLinks: () =>
        set(s => ({ activeShareLinks: s.activeShareLinks.filter(l => l.expiresAt > Date.now()) })),
    }),
    { name: 'lifelink-privacy' }
  )
);
