import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Eye, EyeOff, Link as LinkIcon, Trash2, Clock
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { usePrivacyStore } from '../store/privacyStore';
import { useAuthStore } from '../store/authStore';

const fieldLabels: Record<string, { label: string, desc: string, lock?: boolean }> = {
  bloodGroup: { label: 'Blood Group', desc: 'Critical for transfusions', lock: true },
  allergies: { label: 'Allergies', desc: 'Prevents drug reactions' },
  chronicConditions: { label: 'Chronic Conditions', desc: 'Diabetes, Hypertension, etc.' },
  currentMedications: { label: 'Current Medications', desc: 'To prevent drug interactions' },
  psychiatricHistory: { label: 'Psychiatric History', desc: 'Sensitive mental health data' },
  emergencyContact: { label: 'Emergency Contact', desc: 'Primary contact name/number' },
  organDonor: { label: 'Organ Donor Status', desc: 'Life-saving preference' },
  insuranceInfo: { label: 'Insurance Details', desc: 'Policy number and provider' },
};

const PrivacyConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { consentFields, activeShareLinks, toggleField, revokeLink, revokeAllLinks } = usePrivacyStore();
  const { user, healthProfile } = useAuthStore();
  const [tab, setTab] = useState<'qr' | 'links'>('qr');

  // Generate dynamic QR data based on consent
  const buildQRData = () => {
    const data: any = { name: user?.fullName, lifelink_token: healthProfile?.qrToken };
    if (consentFields.bloodGroup) data.blood = healthProfile?.bloodGroup;
    if (consentFields.allergies) data.allergies = healthProfile?.allergies;
    if (consentFields.chronicConditions) data.conditions = healthProfile?.chronicConditions;
    if (consentFields.currentMedications) data.meds = healthProfile?.currentMedications;
    if (consentFields.emergencyContact) data.contact = 'Rahul Sharma: +91 99001 12233';
    if (consentFields.organDonor) data.donor = 'Yes';
    if (consentFields.insuranceInfo) data.insurance = healthProfile?.insuranceNumber;
    // mock psych history omit
    return JSON.stringify(data);
  };

  const qrDataStr = buildQRData();
  const qrByteSize = new Blob([qrDataStr]).size;

  return (
    <div className="app-shell" style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header border-b border-[var(--border)] pb-3 pt-[env(safe-area-inset-top)]">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Privacy & Consent</h2>
          <p className="text-xs text-secondary">Control your medical data</p>
        </div>
      </div>

      <div className="flex px-4 pt-4 gap-2">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${tab === 'qr' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}
          onClick={() => setTab('qr')}
        >
          <Shield size={16} /> QR Visibility
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${tab === 'links' ? 'bg-[#3D91FF] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}
          onClick={() => setTab('links')}
        >
          <LinkIcon size={16} /> Shared Links
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'qr' && (
          <div className="animate-fade-in">
            {/* Live Preview */}
            <div className="card mb-6 bg-[var(--bg-surface)] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Live QR Preview</p>
                <p className="text-xs text-secondary mb-3">Payload size: <span className={qrByteSize > 250 ? 'text-warning' : 'text-success'}>{qrByteSize} bytes</span></p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/passport')}>View Passport</button>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <QRCode value={qrDataStr} size={80} level="M" />
              </div>
            </div>

            <p className="text-xs text-tertiary uppercase font-semibold mb-3">Data Field Toggles</p>
            
            <div className="space-y-3">
              {Object.entries(fieldLabels).map(([key, info]) => {
                const k = key as keyof typeof consentFields;
                const isEnabled = consentFields[k];
                return (
                  <div key={k} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
                    <div className="flex items-center gap-3">
                      <div style={{ color: isEnabled ? 'var(--primary)' : 'var(--text-tertiary)' }}>
                        {isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{info.label}</p>
                        <p className="text-xs text-secondary">{info.desc}</p>
                      </div>
                    </div>
                    {info.lock ? (
                      <span className="text-xs font-semibold text-[var(--primary)] bg-[rgba(0,201,167,0.1)] px-2 py-1 rounded">Required</span>
                    ) : (
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={() => toggleField(k)} />
                        <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)] relative"></div>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'links' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs text-tertiary uppercase font-semibold mb-1">Active Temporary Links</p>
                <p className="text-xs text-secondary">Links auto-expire after 24 hours.</p>
              </div>
              {activeShareLinks.length > 0 && (
                <button className="text-xs text-danger font-semibold flex items-center gap-1" onClick={revokeAllLinks}>
                  <Trash2 size={12} /> Revoke All
                </button>
              )}
            </div>

            {activeShareLinks.length === 0 ? (
              <div className="text-center p-8 border border-[var(--border)] border-dashed rounded-lg mt-4">
                <LinkIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-secondary text-sm">No active share links.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeShareLinks.map(link => {
                  const hoursLeft = Math.max(0, Math.floor((link.expiresAt - Date.now()) / (1000 * 60 * 60)));
                  return (
                    <div key={link.id} className="card bg-[var(--bg-elevated)]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{link.sharedWith}</p>
                          <p className="text-xs text-secondary">{link.purpose}</p>
                        </div>
                        <button className="text-danger p-1" onClick={() => revokeLink(link.id)} title="Revoke Link">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: hoursLeft < 4 ? 'var(--danger)' : '#FFA502' }}>
                        <Clock size={12} /> Expiring in {hoursLeft} hours
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyConsentPage;
