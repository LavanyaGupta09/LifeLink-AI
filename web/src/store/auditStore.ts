// ============================================
// AUDIT STORE — 90-Day Health Profile Freshness
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuditStatus = 'fresh' | 'aging' | 'overdue';

interface AuditState {
  lastAuditDate: string | null;          // ISO string
  auditDaysSince: number;
  auditStatus: AuditStatus;
  auditStep: number;                     // 0-3 wizard progress
  isAuditComplete: boolean;

  computeStatus: () => void;
  advanceStep: () => void;
  completeAudit: () => void;
  resetAudit: () => void;
}

function getStatus(days: number): AuditStatus {
  if (days <= 30) return 'fresh';
  if (days <= 90) return 'aging';
  return 'overdue';
}

function daysSince(iso: string | null): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

// Demo: last audit was 47 days ago → 'aging'
const DEMO_LAST_AUDIT = new Date(Date.now() - 47 * 24 * 60 * 60 * 1000).toISOString();

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      lastAuditDate: DEMO_LAST_AUDIT,
      auditDaysSince: 47,
      auditStatus: 'aging',
      auditStep: 0,
      isAuditComplete: false,

      computeStatus: () => {
        const days = daysSince(get().lastAuditDate);
        set({ auditDaysSince: days, auditStatus: getStatus(days) });
      },

      advanceStep: () => set(s => ({ auditStep: Math.min(s.auditStep + 1, 3) })),

      completeAudit: () => {
        const now = new Date().toISOString();
        set({ lastAuditDate: now, auditDaysSince: 0, auditStatus: 'fresh', auditStep: 0, isAuditComplete: true });
      },

      resetAudit: () => set({ auditStep: 0, isAuditComplete: false }),
    }),
    { name: 'lifelink-audit' }
  )
);
