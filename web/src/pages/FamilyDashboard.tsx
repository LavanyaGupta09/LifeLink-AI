import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Phone, ChevronRight, Plus, Heart } from 'lucide-react';
import { MOCK_FAMILY_MEMBERS } from '../data/mockData';
import type { FamilyMember } from '../types/health.types';

const statusConfig = {
  safe: { color: '#2ED573', label: 'Safe', dot: 'online', bg: 'rgba(46,213,115,0.1)' },
  sos: { color: '#FF4757', label: 'SOS Active!', dot: 'sos', bg: 'rgba(255,71,87,0.12)' },
  unknown: { color: '#5A6B8A', label: 'Location Off', dot: 'offline', bg: 'transparent' },
};

const FamilyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<FamilyMember | null>(null);

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Family Dashboard</h2>
          <p className="text-xs text-secondary">Sharma Family Group · 3 members</p>
        </div>
        <button className="icon-btn" style={{ marginLeft: 'auto' }}>
          <Plus size={18} />
        </button>
      </div>

      <div className="page-content">
        {/* SOS Feed banner */}
        <div className="card card-primary sos-feed-banner animate-fade-in mb-4">
          <div className="flex items-center gap-3">
            <div className="feed-icon">❤️</div>
            <div>
              <p className="font-semibold text-sm">All Family Members Safe</p>
              <p className="text-xs text-secondary">No active SOS events · Last updated just now</p>
            </div>
            <div className="status-dot online" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        </div>

        {/* Family members */}
        <p className="section-title mb-3 animate-fade-in delay-100">Members</p>
        {MOCK_FAMILY_MEMBERS.map((member, i) => {
          const sc = statusConfig[member.status];
          return (
            <div
              key={member.id}
              className={`card family-member-card animate-fade-in ${selected?.id === member.id ? 'selected' : ''}`}
              style={{ animationDelay: `${100 + i * 80}ms`, marginBottom: 12, background: selected?.id === member.id ? sc.bg : '', borderColor: selected?.id === member.id ? sc.color + '40' : '' }}
              onClick={() => setSelected(selected?.id === member.id ? null : member)}
              id={`family-member-${member.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="member-avatar-wrap">
                  <div className="avatar-initials member-avatar">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className={`status-dot ${sc.dot}`} style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--bg-card)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 style={{ fontSize: '0.9375rem' }}>{member.name}</h4>
                      <p className="text-xs text-secondary">{member.relationship}{member.age ? ` · ${member.age} yrs` : ''}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <div className="status-dot" style={{ background: sc.color }} />
                        <span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.label}</span>
                      </div>
                      <p className="text-xs text-tertiary mt-1">{member.lastSeen || '—'}</p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
              </div>

              {/* Expanded detail */}
              {selected?.id === member.id && (
                <div className="member-detail animate-fade-in">
                  <div className="detail-grid">
                    {member.bloodGroup && (
                      <div className="detail-chip">
                        <span className="text-xs text-tertiary">Blood</span>
                        <span className="font-bold text-sm" style={{ color: '#FF4757' }}>🩸 {member.bloodGroup}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="detail-chip">
                        <span className="text-xs text-tertiary">Phone</span>
                        <span className="text-sm font-medium">{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Mini map */}
                  {member.lat && (
                    <div className="mini-map">
                      <div className="mini-map-pin animate-float">📍</div>
                      <span className="text-xs text-secondary">Near Sarita Vihar, New Delhi</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {member.phone && (
                      <button className="btn btn-primary flex-1 btn-sm">
                        <Phone size={14} />
                        Call
                      </button>
                    )}
                    <button className="btn btn-ghost flex-1 btn-sm" onClick={() => navigate('/passport')}>
                      Health Records
                    </button>
                    <button className="btn btn-danger btn-sm" id={`sos-family-${member.id}`}>
                      <AlertTriangle size={14} fill="white" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {member.id === 'f1' && (
                      <div className="bg-[#FF4757]/10 border border-[#FF4757]/30 rounded-lg p-3 flex items-start gap-3">
                        <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-danger">Missed Critical Medication</p>
                          <p className="text-xs text-danger/80">Dad missed Cardiac Meds (Amlodipine) at 08:00 AM (30 mins ago).</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">Weekly Adherence</span>
                        <span className="text-[10px] text-secondary">Pill compliance</span>
                      </div>
                      <span className={`text-sm font-bold ${member.id === 'f1' ? 'text-warning' : 'text-success'}`}>
                        {member.id === 'f1' ? '78%' : '98%'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">Enable Easy Mode</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={member.easyModeEnabled || false} 
                          onChange={(e) => {
                            e.stopPropagation();
                            alert(`Easy Mode for ${member.name} has been remotely ${e.target.checked ? 'enabled' : 'disabled'}.`);
                          }} 
                        />
                        <div className="w-8 h-4 bg-[var(--bg-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add member CTA */}
        <button className="add-member-btn animate-fade-in delay-500" id="add-family-member-btn">
          <Plus size={20} color="var(--primary)" />
          <span className="text-sm font-semibold text-brand">Invite Family Member</span>
        </button>

        {/* Family Doctor */}
        <p className="section-title mb-3 mt-4 animate-fade-in delay-400">Family Doctor</p>
        <div className="card card-glass animate-fade-in delay-500" onClick={() => navigate('/doctor')}>
          <div className="flex items-center gap-3">
            <div className="fam-doc-icon">👨‍⚕️</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Dr. Meera Nair</p>
              <p className="text-xs text-secondary">General Physician · Apollo Hospitals</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="status-dot online" />
                <span className="text-xs text-success">Available · Pre-registered</span>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </div>
        </div>
      </div>

      <style>{`
        .sos-feed-banner { cursor: default; }
        .feed-icon { font-size: 1.5rem; flex-shrink: 0; }
        .family-member-card { cursor: pointer; transition: all 0.25s; }
        .member-avatar-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }
        .member-avatar {
          width: 44px;
          height: 44px;
          font-size: 0.875rem;
        }
        .family-member-card.selected { box-shadow: var(--shadow-md); }
        .member-detail {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        .detail-chip {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 8px 10px;
        }
        .mini-map {
          height: 60px;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 1.25rem;
        }
        .add-member-btn {
          width: 100%;
          padding: 16px;
          border: 2px dashed var(--border-primary);
          border-radius: var(--radius-lg);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .add-member-btn:hover { background: var(--primary-glow); }
        .fam-doc-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,201,167,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .icon-btn {
          width: 38px;
          height: 38px;
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

export default FamilyDashboard;
