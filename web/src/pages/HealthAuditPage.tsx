import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, FileText, Activity, AlertTriangle, ChevronRight, X
} from 'lucide-react';
import { useAuditStore } from '../store/auditStore';

const steps = [
  { id: 'review_meds', title: 'Review Medications', desc: 'Confirm your current prescriptions' },
  { id: 'archive_old', title: 'Archive Old Reports', desc: 'Hide outdated test results' },
  { id: 'upload_new', title: 'Upload Recent Scans', desc: 'Add new labs/diagnostics' },
  { id: 'seal_audit', title: 'Seal & Verify', desc: 'Cryptographically sign audit' }
];

const HealthAuditPage: React.FC = () => {
  const navigate = useNavigate();
  const { auditStep, isAuditComplete, advanceStep, completeAudit, resetAudit, auditStatus } = useAuditStore();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Scroll to top on step change
    window.scrollTo(0, 0);
  }, [auditStep]);

  const handleNext = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (auditStep === 3) {
        completeAudit();
      } else {
        advanceStep();
      }
    }, 600);
  };

  if (isAuditComplete) {
    return (
      <div className="app-shell flex flex-col items-center justify-center p-6 text-center" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(46,213,115,0.2)', color: '#2ED573' }}>
          <ShieldCheck size={36} />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Audit Complete</h2>
        <p className="text-secondary text-sm mb-8">Your health profile is now marked as Verified Fresh. First responders will receive your latest data.</p>
        
        <button className="btn btn-primary btn-block mb-4" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header border-b border-[var(--border)] pb-3">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">90-Day Health Audit</h2>
          <p className="text-xs text-secondary">Ensure accurate emergency data</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Progress Bar */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex justify-between mb-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center" style={{ width: '25%' }}>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-colors`}
                  style={{
                    background: i < auditStep ? 'var(--primary)' : i === auditStep ? 'rgba(0,201,167,0.2)' : 'var(--bg-elevated)',
                    border: `1px solid ${i <= auditStep ? 'var(--primary)' : 'var(--border)'}`,
                    color: i < auditStep ? 'var(--bg-base)' : i === auditStep ? 'var(--primary)' : 'var(--text-tertiary)'
                  }}
                >
                  {i < auditStep ? <CheckCircle2 size={12} /> : i + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="progress-track" style={{ background: 'var(--bg-elevated)' }}>
            <div className="progress-fill" style={{ width: `${(auditStep / 3) * 100}%`, background: 'var(--primary)' }} />
          </div>
        </div>

        <div className="p-5 animate-fade-in">
          <h3 className="font-display font-bold text-lg text-white mb-1">{steps[auditStep].title}</h3>
          <p className="text-sm text-secondary mb-6">{steps[auditStep].desc}</p>

          {/* Step Content */}
          <div className="card mb-6" style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center text-tertiary">
              <FileText size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Interactive form for <br/> {steps[auditStep].title}</p>
              <p className="text-xs mt-2 opacity-50">(Simulated for Demo)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <button 
          className="btn btn-primary btn-block"
          onClick={handleNext}
          disabled={processing}
        >
          {processing ? 'Processing...' : auditStep === 3 ? 'Confirm & Seal Audit' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default HealthAuditPage;
