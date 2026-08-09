// ============================================
// SOS GUARD STORE — Strike / Cooldown / Lock
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GuardStatus = 'clear' | 'warned' | 'cooldown' | 'locked';

interface SOSGuardState {
  strikeCount: number;           // 0–3
  cooldownUntil: number | null;  // timestamp ms
  lastSOSLocation: string | null;
  isLocked: boolean;
  pendingVerificationCode: string | null;
  guardStatus: GuardStatus;

  addStrike: (location: string) => void;
  isCooldownActive: () => boolean;
  generateVerificationCode: () => string;
  verifyCode: (code: string) => boolean;
  unlock: () => void;
  reset: () => void;
}

export const useSOSGuardStore = create<SOSGuardState>()(
  persist(
    (set, get) => ({
      strikeCount: 0,
      cooldownUntil: null,
      lastSOSLocation: null,
      isLocked: false,
      pendingVerificationCode: null,
      guardStatus: 'clear',

      addStrike: (location: string) => {
        const current = get().strikeCount + 1;
        let cooldownUntil: number | null = null;
        let isLocked = false;
        let code: string | null = null;
        let status: GuardStatus = 'warned';

        if (current === 1) {
          // Strike 1: 30-min cooldown
          cooldownUntil = Date.now() + 30 * 60 * 1000;
          status = 'cooldown';
        } else if (current === 2) {
          // Strike 2: verification code required
          code = String(Math.floor(1000 + Math.random() * 9000));
          status = 'cooldown';
          cooldownUntil = Date.now() + 30 * 60 * 1000;
        } else {
          // Strike 3: locked for 24h
          cooldownUntil = Date.now() + 24 * 60 * 60 * 1000;
          isLocked = true;
          status = 'locked';
        }

        set({
          strikeCount: current,
          cooldownUntil,
          lastSOSLocation: location,
          isLocked,
          pendingVerificationCode: code,
          guardStatus: status,
        });
      },

      isCooldownActive: () => {
        const until = get().cooldownUntil;
        return until !== null && Date.now() < until;
      },

      generateVerificationCode: () => {
        const code = String(Math.floor(1000 + Math.random() * 9000));
        set({ pendingVerificationCode: code });
        return code;
      },

      verifyCode: (inputCode: string) => {
        const correct = get().pendingVerificationCode === inputCode;
        if (correct) {
          set({ pendingVerificationCode: null, cooldownUntil: null, guardStatus: 'warned' });
        }
        return correct;
      },

      unlock: () => set({ isLocked: false, cooldownUntil: null, guardStatus: 'warned' }),

      reset: () => set({
        strikeCount: 0, cooldownUntil: null, lastSOSLocation: null,
        isLocked: false, pendingVerificationCode: null, guardStatus: 'clear',
      }),
    }),
    { name: 'lifelink-sos-guard' }
  )
);
