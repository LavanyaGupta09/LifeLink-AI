import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, AlertTriangle, Phone, MapPin, Activity, Zap,
  Users, QrCode, Pill, FlaskConical, Droplets, ChevronRight,
  Mic, MicOff, Bell, User, Settings, WifiOff, Building2, Star, ShieldCheck, LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { useAuditStore } from '../store/auditStore';
import { useSOSGuardStore } from '../store/sosGuardStore';

const quickActions = [
  { icon: <Activity size={22} />,   label: 'Symptom Check', route: '/symptoms',  color: '#3D91FF', bg: 'rgba(61,145,255,0.12)' },
  { icon: <Building2 size={22} />,  label: 'Hospitals',     route: '/hospitals', color: '#00C9A7', bg: 'rgba(0,201,167,0.12)' },
  { icon: <MapPin size={22} />,     label: 'Ambulance',     route: '/ambulance', color: '#FF6348', bg: 'rgba(255,99,72,0.12)' },
  { icon: <Phone size={22} />,      label: 'Doctor On-Call',route: '/doctor',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { icon: <Users size={22} />,      label: 'Family',        route: '/family',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { icon: <QrCode size={22} />,     label: 'Health ID',     route: '/passport',  color: '#FFA502', bg: 'rgba(255,165,2,0.12)' },
  { icon: <Droplets size={22} />,   label: 'Blood Network', route: '/blood',     color: '#FF4757', bg: 'rgba(255,71,87,0.12)' },
  { icon: <Pill size={22} />,       label: 'Pharmacy',      route: '/pharmacy',  color: '#2ED573', bg: 'rgba(46,213,115,0.12)' },
  { icon: <Bell size={22} />,       label: 'Pill Reminders',route: '/reminders', color: '#FF4757', bg: 'rgba(255,71,87,0.12)' },
  { icon: <ShieldCheck size={22} />,label: 'Privacy',       route: '/privacy',   color: '#F39C12', bg: 'rgba(243,156,18,0.12)' },
];


const vitalsMock = [
  { label: 'Heart Rate', value: '78', unit: 'BPM', icon: <Heart size={14} />, color: '#FF4757', trend: '+2' },
  { label: 'SpO₂', value: '98', unit: '%', icon: <Activity size={14} />, color: '#3D91FF', trend: 'stable' },
  { label: 'Steps Today', value: '4,231', unit: 'steps', icon: <Zap size={14} />, color: '#00C9A7', trend: '+12%' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, emergencyContacts, healthProfile } = useAuthStore();
  const { triggerSOS, isSOSActive, isCounting, countdown, startCountdown, stopCountdown, decrementCountdown } = useSOSStore();
  const { auditStatus, auditDaysSince } = useAuditStore();
  const { strikeCount } = useSOSGuardStore();
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [greeting, setGreeting] = useState('');
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const age = user?.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 'N/A';
  const primaryContact = emergencyContacts?.[0];

  useEffect(() => {
    if (isCounting) {
      countdownRef.current = setInterval(() => {
        decrementCountdown();
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [isCounting, decrementCountdown]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isCounting && countdown <= 0) {
      handleSOSTrigger();
    }
  }, [countdown, isCounting]);

  const handleSOSPress = () => {
    if (isCounting) {
      stopCountdown();
    } else {
      startCountdown();
    }
  };

  const handleSOSTrigger = () => {
    stopCountdown();
    triggerSOS('critical', 'button', 28.5355, 77.2690);
    navigate('/sos');
  };

  return (
    <div className="app-shell">
      <div className="dash-container">
        {/* 100% Free Banner */}
        <div className="bg-[#2ED573]/10 border border-[#2ED573]/30 p-2 text-center text-xs font-semibold text-[#2ED573] mb-4 rounded-lg">
          100% Free Emergency & Family Healthcare — Powered by LifeLink Health Network
        </div>

        {/* Primary Info Header */}
        <div className="primary-info-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="avatar-initials" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-display text-[1.125rem] font-bold text-white leading-tight">
                  {user?.fullName} <span className="text-secondary text-sm font-normal">({age} yrs)</span>
                </h3>
                <p className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {user?.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--bg-elevated)] min-w-[50px] min-h-[50px]" onClick={() => setIsListening(!isListening)}>
                {isListening ? <Mic size={18} color="#00C9A7" /> : <MicOff size={18} color="var(--text-secondary)" />}
                <span className="text-[9px] uppercase mt-1 text-secondary font-bold">Voice</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--bg-elevated)] min-w-[50px] min-h-[50px]" onClick={() => navigate('/settings')}>
                <Settings size={18} color="var(--text-secondary)" />
                <span className="text-[9px] uppercase mt-1 text-secondary font-bold">Settings</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-500/10 border border-red-500/30 min-w-[50px] min-h-[50px]" onClick={() => navigate('/logout')}>
                <LogOut size={18} className="text-red-500" />
                <span className="text-[9px] uppercase mt-1 text-red-500 font-bold">Log Out</span>
              </button>
            </div>
          </div>
          
          {primaryContact && (
            <div className="emergency-contact-strip">
              <div className="flex items-center gap-2 text-danger font-semibold text-xs uppercase tracking-wide">
                <AlertTriangle size={14} />
                <span>Primary Emergency Contact</span>
              </div>
              <div className="flex items-center justify-between mt-1.5 pl-[22px]">
                <div>
                  <p className="text-white font-medium text-sm">{primaryContact.name} ({primaryContact.relationship})</p>
                  <p className="text-xs text-secondary">{primaryContact.phone}</p>
                </div>
                <button className="btn-call-contact">Call Now</button>
              </div>
            </div>
          )}
        </div>

        {isOffline && (
          <div className="offline-banner mx-[20px] mb-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <WifiOff size={18} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-500 font-semibold text-sm">You are offline</p>
                <p className="text-orange-500/80 text-xs mt-0.5 leading-tight">📱 SMS fallback active — Your SOS will be dispatched via encrypted SMS.</p>
              </div>
            </div>
            <button 
              className="mt-1 flex items-center justify-between bg-orange-500/20 text-orange-500 px-3 py-2 rounded text-xs font-semibold"
              onClick={() => navigate('/offline-guide')}
            >
              📖 View Offline First Aid Guide <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Data Currency Banner */}
        <div className="mx-[20px] mb-4">
          {auditStatus === 'fresh' && (
            <div className="bg-[rgba(46,213,115,0.1)] border border-[rgba(46,213,115,0.3)] rounded-lg p-2.5 flex items-center justify-between" onClick={() => navigate('/audit')}>
              <div className="flex items-center gap-2 text-[#2ED573]">
                <ShieldCheck size={16} />
                <span className="text-xs font-semibold">Verified Fresh</span>
              </div>
              <span className="text-[10px] text-secondary">Updated {auditDaysSince} days ago</span>
            </div>
          )}
          {auditStatus === 'aging' && (
            <div className="bg-[rgba(255,165,2,0.1)] border border-[rgba(255,165,2,0.3)] rounded-lg p-2.5 flex items-center justify-between cursor-pointer" onClick={() => navigate('/audit')}>
              <div className="flex items-center gap-2 text-[#FFA502]">
                <AlertTriangle size={16} />
                <span className="text-xs font-semibold">Profile aging — Review recommended</span>
              </div>
              <span className="text-[10px] text-secondary">{auditDaysSince} days old <ChevronRight size={12} className="inline" /></span>
            </div>
          )}
          {auditStatus === 'overdue' && (
            <div className="bg-[rgba(255,71,87,0.1)] border border-[#FF4757] rounded-lg p-2.5 flex items-center justify-between cursor-pointer animate-pulse" onClick={() => navigate('/audit')}>
              <div className="flex items-center gap-2 text-[#FF4757]">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold">⚠️ 90-Day Audit Overdue</span>
              </div>
              <span className="text-[10px] text-white bg-[#FF4757] px-2 py-0.5 rounded">Update Now</span>
            </div>
          )}
        </div>

        {/* Health badge strip */}
        <div className="vitals-strip">
          {vitalsMock.map((v, i) => (
            <div key={i} className="vital-chip">
              <span style={{ color: v.color }}>{v.icon}</span>
              <div>
                <span className="vital-value">{v.value}</span>
                <span className="vital-unit">{v.unit}</span>
              </div>
              <span className="vital-trend" style={{ color: v.trend.startsWith('+') ? '#2ED573' : '#8B9CC5' }}>
                {v.trend}
              </span>
            </div>
          ))}
        </div>

        {/* SOS Button */}
        <div className="sos-section">
          <div className="sos-bg-glow" />
          <div className={`sos-ring-wrap ${isCounting ? 'counting' : ''}`}>
            <div className="sos-ripple r1" />
            <div className="sos-ripple r2" />
            <div className="sos-ripple r3" />
            <button
              className={`sos-btn ${isCounting ? 'counting' : ''} ${isSOSActive ? 'active' : ''}`}
              onClick={handleSOSPress}
              id="sos-main-btn"
            >
              <AlertTriangle size={32} fill="white" />
              {isCounting ? (
                <span className="sos-countdown">{countdown}</span>
              ) : (
                <span className="sos-label">SOS</span>
              )}
            </button>
            {strikeCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-black border border-[#FF4757] text-[#FF4757] text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full z-10 shadow-[0_0_10px_rgba(255,71,87,0.5)]">
                {strikeCount}
              </div>
            )}
          </div>
          {isCounting ? (
            <div className="sos-status-text">
              <p className="text-danger font-semibold">Sending SOS in {countdown}s...</p>
              <button className="btn btn-ghost btn-sm" onClick={stopCountdown}>Cancel</button>
            </div>
          ) : (
            <p className="sos-hint">Hold for 3 seconds or press 3× power button</p>
          )}
        </div>

        {/* Medical Records Access */}
        <div className="medical-records-section">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display font-semibold text-white flex items-center gap-2">
              <span className="bg-[#3D91FF20] text-[#3D91FF] p-1.5 rounded-lg"><FlaskConical size={16} /></span>
              Medical Records
            </h4>
            <button className="text-xs text-[var(--primary)] font-semibold" onClick={() => navigate('/vault')}>View Vault</button>
          </div>
          <div className="flex gap-3">
            <button className="mr-btn mr-view" onClick={() => navigate('/vault')}>
              View Existing
            </button>
            <button className="mr-btn mr-upload" onClick={() => navigate('/vault')}>
              + Upload New
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-header">
          <span className="section-title">Quick Actions</span>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, i) => (
            <button
              key={i}
              className="quick-action-btn animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => navigate(action.route)}
              id={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="qa-icon" style={{ background: action.bg, color: action.color }}>
                {action.icon}
              </div>
              <span className="qa-label">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Health card */}
        <div className="section-header">
          <span className="section-title">Health Profile</span>
        </div>
        <div className="card card-primary health-card" onClick={() => navigate('/passport')}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="badge badge-primary">
                  <span>🩸</span> {healthProfile?.bloodGroup}
                </div>
                <div className="badge badge-success">Verified</div>
              </div>
              <h4 className="font-display mb-1" style={{ fontSize: '0.9375rem' }}>Health Passport</h4>
              <p className="text-xs text-secondary">
                {healthProfile?.allergies.length} allergies · {healthProfile?.currentMedications.length} medications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <QrCode size={36} color="#00C9A7" />
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </div>
          </div>
        </div>

        {/* Family quick-peek */}
        <div className="section-header">
          <span className="section-title">Family Status</span>
          <button className="see-all-btn" onClick={() => navigate('/family')}>View all</button>
        </div>
        <div className="family-strip">
          {['Rahul', 'Aarav', 'Mom'].map((name, i) => (
            <div key={i} className="family-chip" onClick={() => navigate('/family')}>
              <div className="avatar-initials" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                {name[0]}
              </div>
              <div className="status-dot online" style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--bg-base)' }} />
              <span className="family-name">{name}</span>
            </div>
          ))}
          <div className="family-chip" onClick={() => navigate('/family')}>
            <div className="family-add-btn">
              <span>+</span>
            </div>
            <span className="family-name">Add</span>
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>

      <style>{`
        .dash-container {
          min-height: 100vh;
          padding-bottom: 90px;
          background: var(--bg-base);
        }
        .primary-info-card {
          padding: 40px 20px 20px;
          background: linear-gradient(180deg, rgba(0,201,167,0.05) 0%, transparent 100%);
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 20px;
        }
        .emergency-contact-strip {
          background: rgba(255,71,87,0.08);
          border: 1px solid rgba(255,71,87,0.2);
          border-radius: var(--radius-md);
          padding: 12px;
          margin-top: 16px;
        }
        .btn-call-contact {
          background: rgba(255,71,87,0.15);
          color: var(--danger);
          border: none;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
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
          position: relative;
          transition: all var(--duration-fast);
        }
        .icon-btn:hover { background: var(--bg-card); color: var(--text-primary); }
        .notif-badge {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid var(--bg-elevated);
        }
        .vitals-strip {
          display: flex;
          gap: 10px;
          padding: 0 20px 20px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .vitals-strip::-webkit-scrollbar { display: none; }
        .vital-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          white-space: nowrap;
          flex-shrink: 0;
          cursor: default;
        }
        .vital-value {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-display);
        }
        .vital-unit {
          font-size: 0.625rem;
          color: var(--text-tertiary);
          margin-left: 3px;
        }
        .vital-trend {
          font-size: 0.625rem;
          font-weight: 700;
          margin-left: 4px;
        }

        /* ===== SOS SECTION ===== */
        .sos-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 8px 20px 28px;
          position: relative;
        }
        .sos-bg-glow {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(255,71,87,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .sos-ring-wrap {
          position: relative;
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sos-ripple {
          position: absolute;
          border-radius: 50%;
          border: 2px solid var(--danger);
          opacity: 0;
          animation: sos-ripple 2.5s ease-out infinite;
        }
        .sos-ring-wrap.counting .sos-ripple { border-color: var(--danger); }
        .r1 { width: 100%; height: 100%; animation-delay: 0s; }
        .r2 { width: 130%; height: 130%; top: -15%; left: -15%; animation-delay: 0.7s; }
        .r3 { width: 160%; height: 160%; top: -30%; left: -30%; animation-delay: 1.4s; }
        .sos-btn {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF4757, #D63031);
          border: 4px solid rgba(255,71,87,0.3);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          font-family: var(--font-display);
          box-shadow: 0 8px 40px rgba(255,71,87,0.45), 0 0 0 8px rgba(255,71,87,0.1);
          transition: all 0.2s;
          position: relative;
          z-index: 1;
        }
        .sos-btn:hover { transform: scale(1.04); box-shadow: 0 12px 50px rgba(255,71,87,0.55), 0 0 0 12px rgba(255,71,87,0.12); }
        .sos-btn:active { transform: scale(0.96); }
        .sos-btn.counting {
          animation: heartbeat 0.8s ease-in-out infinite;
          box-shadow: 0 8px 40px rgba(255,71,87,0.6), 0 0 0 8px rgba(255,71,87,0.2);
        }
        .sos-label {
          font-size: 1.375rem;
          font-weight: 900;
          letter-spacing: 0.1em;
        }
        .sos-countdown {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1;
        }
        .sos-hint {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-align: center;
        }
        .sos-status-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: fade-in 0.3s ease;
        }

        /* ===== MEDICAL RECORDS ===== */
        .medical-records-section {
          margin: 0 20px 24px;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
        }
        .mr-btn {
          flex: 1;
          padding: 10px 0;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .mr-view {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-primary);
        }
        .mr-view:hover { background: var(--bg-hover); }
        .mr-upload {
          background: var(--primary);
          border: 1px solid var(--primary);
          color: var(--bg-base);
        }
        .mr-upload:hover { opacity: 0.9; }

        /* ===== QUICK ACTIONS ===== */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px 12px;
        }
        .see-all-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 0 20px 24px;
        }
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
        }
        .qa-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.06);
          transition: all var(--duration-normal) var(--ease-out);
        }
        .quick-action-btn:hover .qa-icon { transform: translateY(-3px); }
        .quick-action-btn:active .qa-icon { transform: scale(0.94); }
        .qa-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.2;
        }

        /* Health card */
        .health-card { margin: 0 20px 24px; cursor: pointer; }
        .health-card:hover { border-color: var(--primary); }

        /* Family strip */
        .family-strip {
          display: flex;
          gap: 16px;
          padding: 0 20px 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .family-strip::-webkit-scrollbar { display: none; }
        .family-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          position: relative;
        }
        .family-name {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .family-add-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-elevated);
          border: 2px dashed var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
