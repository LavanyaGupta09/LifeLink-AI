import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Share2, Download, Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '../store/authStore';
import { usePrivacyStore } from '../store/privacyStore';
import { useAuditStore } from '../store/auditStore';

const HealthPassport: React.FC = () => {
  const navigate = useNavigate();
  const { user, healthProfile } = useAuthStore();
  const { consentFields } = usePrivacyStore();
  const { auditStatus, auditDaysSince } = useAuditStore();
  const [showQR, setShowQR] = useState(true);
  const [expanded, setExpanded] = useState<string[]>(['basics']);

  const toggle = (section: string) => {
    setExpanded(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const buildQRData = () => {
    const data: any = { name: user?.fullName, lifelink_token: healthProfile?.qrToken, generated: new Date().toISOString() };
    if (consentFields.bloodGroup) data.blood = healthProfile?.bloodGroup;
    if (consentFields.allergies) data.allergies = healthProfile?.allergies;
    if (consentFields.chronicConditions) data.conditions = healthProfile?.chronicConditions;
    if (consentFields.currentMedications) data.meds = healthProfile?.currentMedications;
    if (consentFields.emergencyContact) data.contact = 'Rahul Sharma: +91 99001 12233';
    if (consentFields.organDonor) data.donor = healthProfile?.organDonor ? 'Yes' : 'No';
    if (consentFields.insuranceInfo) data.insurance = healthProfile?.insuranceNumber;
    return JSON.stringify(data);
  };

  const qrData = buildQRData();

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Health Passport</h2>
          <p className="text-xs text-secondary">QR-based Emergency ID</p>
        </div>
        <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
          <button className="icon-btn"><Share2 size={16} /></button>
          <button className="icon-btn"><Download size={16} /></button>
        </div>
      </div>

      <div className="page-content">
        {/* QR Card */}
        <div className="qr-card animate-scale-in">
          <div className="qr-card-header">
            <div className="flex items-center gap-2">
              <div className="ll-badge">LifeLink AI</div>
              {auditStatus === 'fresh' && <div className="badge badge-success">Verified Fresh</div>}
              {auditStatus === 'aging' && <div className="badge badge-warning" style={{ background: 'rgba(255,165,2,0.1)', color: '#FFA502' }}>Review Due</div>}
              {auditStatus === 'overdue' && <div className="badge badge-danger" style={{ background: 'rgba(255,71,87,0.1)', color: '#FF4757' }}>Data Stale</div>}
            </div>
            <button className="text-xs text-brand font-semibold" onClick={() => setShowQR(!showQR)}>
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {showQR && (
            <div className="qr-display animate-scale-in">
              <div className="qr-wrapper">
                <QRCode
                  value={qrData}
                  size={180}
                  bgColor="transparent"
                  fgColor="#00C9A7"
                  level="M"
                />
                <div className="qr-corners">
                  <div className="corner tl" /><div className="corner tr" />
                  <div className="corner bl" /><div className="corner br" />
                </div>
              </div>
              <p className="text-xs text-tertiary mt-3">Scan to access emergency health data</p>
              <div className="qr-token">{healthProfile?.qrToken}</div>
              <div className="text-[10px] text-secondary mt-1">Last audited {auditDaysSince} days ago</div>
              <div className="flex items-center gap-1 mt-2">
                <Shield size={11} color="#00C9A7" />
                <span className="text-xs text-brand">E2E Encrypted · Rotates every 24h</span>
              </div>
            </div>
          )}

          {/* Identity strip */}
          <div className="id-strip">
            <div className="avatar-initials id-avatar">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-display font-bold" style={{ fontSize: '1rem' }}>{user?.fullName}</p>
              <p className="text-xs text-secondary">{user?.dateOfBirth} · {user?.gender}</p>
            </div>
            <div className="blood-badge">
              🩸 {healthProfile?.bloodGroup}
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="passport-sections">
          <AccordionSection
            id="basics"
            title="Basic Info"
            icon="👤"
            expanded={expanded.includes('basics')}
            onToggle={() => toggle('basics')}
          >
            <div className="info-row"><span>Organ Donor</span><span className="badge badge-success">{healthProfile?.organDonor ? 'Yes' : 'No'}</span></div>
            <div className="info-row"><span>Insurance</span><span className="text-sm font-medium">{healthProfile?.insuranceProvider}</span></div>
            <div className="info-row"><span>Policy No.</span><span className="text-sm">{healthProfile?.insuranceNumber}</span></div>
          </AccordionSection>

          <AccordionSection
            id="allergies"
            title="Allergies"
            icon="⚠️"
            expanded={expanded.includes('allergies')}
            onToggle={() => toggle('allergies')}
            warning
          >
            {healthProfile?.allergies.map((a, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} color="#FFA502" />
                <span className="text-sm">{a}</span>
              </div>
            ))}
          </AccordionSection>

          <AccordionSection
            id="conditions"
            title="Medical Conditions"
            icon="🏥"
            expanded={expanded.includes('conditions')}
            onToggle={() => toggle('conditions')}
          >
            {healthProfile?.chronicConditions.length === 0 ? (
              <p className="text-sm text-secondary">No chronic conditions recorded</p>
            ) : healthProfile?.chronicConditions.map((c, i) => (
              <div key={i} className="info-tag">{c}</div>
            ))}
          </AccordionSection>

          <AccordionSection
            id="medications"
            title="Current Medications"
            icon="💊"
            expanded={expanded.includes('medications')}
            onToggle={() => toggle('medications')}
          >
            {healthProfile?.currentMedications.map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '0.875rem' }}>💊</span>
                <span className="text-sm">{m}</span>
              </div>
            ))}
          </AccordionSection>

          <AccordionSection
            id="contacts"
            title="Emergency Contacts"
            icon="📞"
            expanded={expanded.includes('contacts')}
            onToggle={() => toggle('contacts')}
          >
            <div className="info-row"><span className="text-sm font-semibold">Rahul Sharma</span><span className="text-sm">+91 99001 12233</span></div>
            <p className="text-xs text-tertiary ml-0 mb-2">Husband · Primary</p>
            <div className="info-row"><span className="text-sm font-semibold">Sunita Sharma</span><span className="text-sm">+91 98765 00001</span></div>
            <p className="text-xs text-tertiary">Mother</p>
          </AccordionSection>
        </div>

        {/* Vault shortcut */}
        <button className="vault-shortcut animate-fade-in" onClick={() => navigate('/vault')}>
          <span>🔒</span>
          <div>
            <p className="text-sm font-semibold">Medical Vault</p>
            <p className="text-xs text-secondary">4 documents stored securely</p>
          </div>
          <ChevronDown size={16} color="var(--text-tertiary)" style={{ transform: 'rotate(-90deg)', marginLeft: 'auto' }} />
        </button>
      </div>

      <style>{`
        .qr-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-primary);
        }
        .qr-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .ll-badge {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: var(--text-inverse);
          font-size: 0.6875rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }
        .qr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .qr-wrapper {
          position: relative;
          padding: 16px;
          background: rgba(0,201,167,0.04);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(0,201,167,0.15);
        }
        .qr-corners { position: absolute; inset: 0; pointer-events: none; }
        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: var(--primary);
          border-style: solid;
        }
        .tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
        .tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
        .bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
        .br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }
        .qr-token {
          font-size: 0.6875rem;
          color: var(--text-tertiary);
          font-family: monospace;
          background: var(--bg-elevated);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          margin-top: 8px;
          letter-spacing: 0.08em;
        }
        .id-strip {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .id-avatar {
          width: 48px;
          height: 48px;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .blood-badge {
          margin-left: auto;
          background: rgba(255,71,87,0.1);
          border: 1.5px solid rgba(255,71,87,0.3);
          border-radius: var(--radius-full);
          padding: 6px 14px;
          font-size: 0.9375rem;
          font-weight: 800;
          color: #FF4757;
          font-family: var(--font-display);
          flex-shrink: 0;
        }
        .passport-sections { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .info-row:last-child { border-bottom: none; }
        .info-tag {
          display: inline-block;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 4px 12px;
          font-size: 0.8125rem;
          margin-right: 6px;
          margin-bottom: 6px;
        }
        .vault-shortcut {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          cursor: pointer;
          font-family: var(--font-body);
          color: var(--text-primary);
          transition: all var(--duration-fast);
          font-size: 1.25rem;
        }
        .vault-shortcut:hover { border-color: var(--border-light); background: var(--bg-card-hover); }
        .icon-btn {
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

interface AccordionProps {
  id: string;
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  warning?: boolean;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionProps> = ({ title, icon, expanded, onToggle, warning, children }) => (
  <div className={`accordion ${warning ? 'warning' : ''}`}>
    <button className="accordion-header" onClick={onToggle}>
      <span className="accordion-icon">{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
      {expanded ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
    </button>
    {expanded && (
      <div className="accordion-body animate-fade-in">{children}</div>
    )}
    <style>{`
      .accordion {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .accordion.warning { border-color: rgba(255,165,2,0.2); }
      .accordion-header {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: none;
        border: none;
        cursor: pointer;
        font-family: var(--font-body);
        color: var(--text-primary);
      }
      .accordion-header:hover { background: var(--bg-card-hover); }
      .accordion-header > :last-child { margin-left: auto; }
      .accordion-icon { font-size: 1rem; }
      .accordion-body {
        padding: 4px 16px 16px;
        border-top: 1px solid var(--border);
      }
    `}</style>
  </div>
);

export default HealthPassport;
