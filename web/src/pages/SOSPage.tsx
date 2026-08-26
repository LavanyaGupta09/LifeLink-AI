import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, X, Check, Users, Clock, Shield, WifiOff, MessageSquare, Droplets, ArrowLeft } from 'lucide-react';
import { useSOSStore } from '../store/sosStore';
import { useSOSGuardStore } from '../store/sosGuardStore';
import { usePrivacyStore } from '../store/privacyStore';
import { MOCK_EMERGENCY_CONTACTS, MOCK_AMBULANCES } from '../data/mockData';
import { bloodAPI } from '../services/api';
import FreeMap from '../components/FreeMap';
import { fetchRoute, searchAddress, useDebounce } from '../utils/mapUtils';
import JitsiVideoCall from '../components/telemedicine/JitsiVideoCall';

const SOSPage: React.FC = () => {
  const navigate = useNavigate();
  const { sosEvent, isSOSActive, cancelSOS, resolveSOS } = useSOSStore();
  const { addStrike } = useSOSGuardStore();
  const { generateShareLink } = usePrivacyStore();

  const [gatewayCountdown, setGatewayCountdown] = useState(5);
  const [gatewayPassed, setGatewayPassed] = useState(false);
  const [isOffline] = useState(!navigator.onLine);

  const [elapsed, setElapsed] = useState(0);
  const [contactsNotified, setContactsNotified] = useState(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [doctorConnected, setDoctorConnected] = useState(false);
  
  const [activeEmergencyRoom, setActiveEmergencyRoom] = useState<string | null>(null);
  const [chatProvider, setChatProvider] = useState<{name: string, eta: number | string} | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Address Search and Map State
  const [manualAddress, setManualAddress] = useState('');
  const debouncedAddress = useDebounce(manualAddress, 1500);
  const [patientLoc, setPatientLoc] = useState<[number, number]>([28.5355, 77.2690]);
  const [ambLoc] = useState<[number, number]>([28.5520, 77.2510]); // Mock incoming ambulance
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [liveETA, setLiveETA] = useState<number | null>(null);
  const [liveDistance, setLiveDistance] = useState<number | null>(null);

  useEffect(() => {
    if (debouncedAddress) {
      searchAddress(debouncedAddress).then(results => {
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          setPatientLoc([parseFloat(lat), parseFloat(lon)]);
        }
      });
    }
  }, [debouncedAddress]);

  useEffect(() => {
    if (ambulanceDispatched) {
      fetchRoute(ambLoc[1], ambLoc[0], patientLoc[1], patientLoc[0]).then(route => {
        if (route) {
          setRouteCoords(route.coordinates);
          setLiveETA(Math.round(route.durationSeconds / 60));
          setLiveDistance(Math.round((route.distanceMeters / 1000) * 10) / 10);
        }
      });
    }
  }, [ambulanceDispatched, patientLoc, ambLoc]);

  useEffect(() => {
    if (!isSOSActive && !sosEvent) {
      navigate('/dashboard');
    }
  }, [isSOSActive, sosEvent, navigate]);

  useEffect(() => {
    if (!isSOSActive && !sosEvent) return;

    if (gatewayCountdown > 0 && !gatewayPassed) {
      const t = setTimeout(() => setGatewayCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else if (gatewayCountdown === 0 && !gatewayPassed) {
      setGatewayPassed(true);
    }
  }, [gatewayCountdown, gatewayPassed, isSOSActive, sosEvent]);

  useEffect(() => {
    if (!gatewayPassed) return;

    const t = setInterval(() => setElapsed(e => e + 1), 1000);

    // Simulate dispatch sequence
    setTimeout(() => {
      setContactsNotified(true);
      // Generate 24h links for notified contacts
      MOCK_EMERGENCY_CONTACTS.filter(c => c.notifyOnSOS).forEach(c => {
        generateShareLink(c.name, 'SOS Emergency — Live Tracking');
      });
      // Show SMS toast
      setToastMessage('📲 SMS SOS Alert sent to Emergency Contacts');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
    setTimeout(() => setAmbulanceDispatched(true), 3000);
    setTimeout(() => setDoctorConnected(true), 5000);

    return () => clearInterval(t);
  }, [gatewayPassed, generateShareLink]);

  const formatElapsed = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleCancel = () => {
    if (gatewayPassed) {
      // It's a false alarm after the gateway passed -> Strike!
      addStrike(sosEvent?.address || 'Unknown Location');
    }
    cancelSOS();
    navigate('/dashboard');
  };

  const handleResolve = () => {
    resolveSOS();
    navigate('/dashboard');
  };

  const [bloodRequested, setBloodRequested] = useState(false);

  const handleRequestBlood = async () => {
    try {
      // Mock patient data for the request
      const mockPatientId = 'pat_001';
      const requiredBloodGroup = 'A+'; // In real app, fetch from health profile
      const lat = sosEvent?.lat || 28.5355;
      const lng = sosEvent?.lng || 77.2690;
      const units = 2;
      
      await bloodAPI.sendRequest(mockPatientId, requiredBloodGroup, lat, lng, units);
      setBloodRequested(true);
      alert('Emergency blood request broadcasted to nearby compatible donors.');
    } catch (err) {
      console.error('Failed to request blood', err);
      alert('Failed to request blood.');
    }
  };

  const amb = MOCK_AMBULANCES[0];
  const triage = sosEvent?.triageLevel ?? 'critical';
  const isCritical = triage === 'critical' || triage === 'high';

  if (!gatewayPassed) {
    return (
      <div className="app-shell sos-page flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#FF4757] flex items-center justify-center mb-6 animate-pulse">
          <span className="text-4xl font-display font-bold text-white">{gatewayCountdown}</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">SOS Triggered</h2>
        <p className="text-secondary text-sm mb-8">Emergency services will be dispatched in {gatewayCountdown} seconds unless cancelled.</p>
        
        <button className="btn btn-primary btn-block mb-4 btn-lg" onClick={() => setGatewayPassed(true)}>
          Yes, I Need Help Now
        </button>
        <button className="btn btn-danger btn-block btn-lg" style={{ background: 'transparent', border: '2px solid #FF4757', color: '#FF4757' }} onClick={handleCancel}>
          Cancel (Mistake)
        </button>
      </div>
    );
  }

  // LIVE JITSI EMERGENCY CALL OVERLAY
  if (activeEmergencyRoom) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden">
        <JitsiVideoCall 
          roomName={activeEmergencyRoom}
          displayName="Emergency Patient"
          onReadyToClose={() => setActiveEmergencyRoom(null)}
        />
      </div>
    );
  }

  return (
    <div className="app-shell sos-page">
      {/* Pulsing danger header */}
      <div className={`sos-header ${isCritical ? 'sos-critical' : 'sos-moderate'}`}>
        <div className="sos-header-bg" />
        <div className="sos-header-content">
          <div className="sos-badge-row">
            <AlertTriangle size={20} fill="white" />
            <span>SOS ACTIVE</span>
            <div className="live-dot" />
            <span>LIVE</span>
          </div>
          <div className="sos-timer">{formatElapsed(elapsed)}</div>
          <p className="sos-sub">{isOffline ? 'SMS fallback dispatched' : 'Emergency services have been notified'}</p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="page-content">
        <div className="timeline animate-fade-in">
          <TimelineItem
            done={true}
            icon={<AlertTriangle size={14} />}
            label="SOS Triggered"
            sub={sosEvent?.address || 'Location captured'}
            color="#FF4757"
          />
          <TimelineItem
            done={contactsNotified}
            icon={<Users size={14} />}
            label="Emergency Contacts Notified"
            sub={`${MOCK_EMERGENCY_CONTACTS.filter(c => c.notifyOnSOS).length} contacts sent live location link`}
            color="#3D91FF"
          />
          <TimelineItem
            done={ambulanceDispatched}
            icon={<MapPin size={14} />}
            label="Ambulance Dispatched"
            sub={ambulanceDispatched ? `${amb.vehicleNumber} — ETA ${amb.etaMinutes} minutes` : 'Locating nearest unit...'}
            color="#FFA502"
          />
          <TimelineItem
            done={doctorConnected}
            icon={<Phone size={14} />}
            label="Doctor On-Call Connecting"
            sub={doctorConnected ? 'Dr. Arjun Kapoor — Emergency Medicine' : 'Routing to available physician...'}
            color="#00C9A7"
            isLast
          />
        </div>

        {/* Manual Address Input */}
        <div className="card mb-4 mt-4">
          <label className="text-xs font-semibold text-secondary mb-1 block">Update Incident Location (Optional)</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
            placeholder="Type address..."
            value={manualAddress}
            onChange={e => setManualAddress(e.target.value)}
          />
          {debouncedAddress !== manualAddress && <p className="text-xs text-amber-500 mt-1">Typing...</p>}
        </div>

        {/* Offline SMS Fallback */}
        {isOffline && (
          <div className="card mb-4" style={{ background: 'rgba(255,165,2,0.1)', borderColor: 'rgba(255,165,2,0.3)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#FFA502] font-semibold text-sm">
                <WifiOff size={16} /> SMS Fallback Active
              </div>
            </div>
            <p className="text-xs text-secondary mb-3 leading-relaxed">
              No internet connection detected. The following encrypted SMS was sent to emergency dispatch and your contacts:
            </p>
            <div className="bg-black/50 p-3 rounded text-[10px] font-mono text-white break-all mb-3 border border-[rgba(255,255,255,0.1)]">
              [LIFELINK SOS] Lavanya G. | B+ | GPS: 28.5355,77.2690 | Triage: {triage.toUpperCase()} | Medical Data: https://ll.ai/s/1x9f
            </div>
            <button className="w-full py-2 bg-[rgba(255,165,2,0.2)] text-[#FFA502] rounded text-xs font-semibold flex items-center justify-center gap-2">
              <MessageSquare size={14} /> Copy to Manual SMS
            </button>
          </div>
        )}

        {/* Ambulance tracking card */}
        {ambulanceDispatched && (
          <div className="card card-primary amb-card animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1.5rem' }}>🚑</span>
                <div>
                  <p className="font-semibold text-sm">{amb.vehicleNumber}</p>
                  <p className="text-xs text-secondary">Driver: {amb.driverName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => setActiveEmergencyRoom(`LifeLink_SOS_AMB_${amb.id}`)}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#3D91FF] bg-[#3D91FF]/10 px-2 py-1 rounded-full border border-[#3D91FF]/20"
                    >
                      <Phone size={10} /> Call
                    </button>
                    <button 
                      onClick={() => setChatProvider({ name: amb.driverName, eta: liveETA !== null ? liveETA : amb.etaMinutes })}
                      className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20"
                    >
                      <MessageSquare size={10} /> Chat
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={12} color="#00C9A7" />
                    <span className="font-bold text-brand" style={{ fontSize: '1.25rem' }}>{liveETA !== null ? liveETA : amb.etaMinutes}</span>
                    <span className="text-xs text-secondary">min</span>
                  </div>
                  <p className="text-xs text-secondary">Live ETA {liveDistance !== null && `· ${liveDistance}km`}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#131F35] rounded-3xl overflow-hidden border border-slate-800 shadow-xl mb-6 relative" style={{ height: '300px' }}>
              <FreeMap 
                center={patientLoc}
                zoom={14}
                markers={[
                  { id: 'pat_loc', lat: patientLoc[0], lng: patientLoc[1], label: 'You' },
                  { id: 'amb_loc', lat: ambLoc[0], lng: ambLoc[1], label: 'Ambulance' }
                ]}
                routeCoordinates={routeCoords}
              />
            </div>

            <div className="flex gap-2 mt-3">
              {amb.equipment.map((eq, i) => (
                <span key={i} className="badge badge-primary">{eq}</span>
              ))}
            </div>
          </div>
        )}

        {/* Doctor on-call */}
        {doctorConnected && (
          <div className="card doctor-call-card animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="doc-avatar">AK</div>
              <div className="flex-1">
                <p className="font-semibold">Dr. Arjun Kapoor</p>
                <p className="text-xs text-secondary">Emergency Medicine · Max Hospital</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="status-dot online" />
                  <span className="text-xs text-success">Connected</span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveEmergencyRoom(`LifeLink_SOS_DOC_Arjun`)}>
                <Phone size={14} />
                Join Call
              </button>
            </div>
            <div className="first-aid-tip">
              <Shield size={14} color="#FFA502" />
              <p className="text-xs">
                <strong>First Aid Tip:</strong> Keep the patient calm and still. Do not give food or water. Loosen tight clothing.
              </p>
            </div>
          </div>
        )}

        {/* Contacts notified list */}
        {contactsNotified && (
          <div className="card animate-fade-in">
            <p className="text-xs text-tertiary uppercase mb-3">Notified Contacts</p>
            {MOCK_EMERGENCY_CONTACTS.filter(c => c.notifyOnSOS).map((c, i) => (
              <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="avatar-initials" style={{ width: 36, height: 36, fontSize: '0.75rem', flexShrink: 0 }}>
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-secondary">{c.relationship} · {c.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveEmergencyRoom(`LifeLink_SOS_FAM_${c.name.replace(/\\s/g,'_')}`)}
                      className="bg-[#3D91FF]/10 text-[#3D91FF] border border-[#3D91FF]/30 p-1 rounded-full"
                    >
                      <Phone size={12} />
                    </button>
                    <div className="badge badge-success">Notified</div>
                  </div>
                  <span className="text-[9px] text-[#FFA502]">Link active 24h</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="sos-actions">
          <button 
            className="btn btn-block" 
            style={{ 
              background: bloodRequested ? 'transparent' : '#FF4757', 
              color: bloodRequested ? '#FF4757' : 'white',
              border: bloodRequested ? '1.5px solid #FF4757' : 'none' 
            }} 
            onClick={handleRequestBlood} 
            disabled={bloodRequested}
          >
            <Droplets size={18} />
            {bloodRequested ? 'Blood Request Broadcasted' : 'Request Blood (SOS)'}
          </button>
          <button className="btn btn-ghost btn-block" onClick={handleResolve} id="resolve-sos-btn">
            <Check size={18} />
            I'm Safe — Resolve SOS
          </button>
          <button className="btn btn-danger btn-block btn-sm" style={{ background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text-secondary)' }} onClick={handleCancel} id="cancel-sos-btn">
            <X size={16} />
            Cancel SOS (False Alarm)
          </button>
        </div>
      </div>

      <style>{`
        .sos-page { background: var(--bg-base); min-height: 100dvh; }
        .sos-header {
          position: relative;
          padding: 52px 20px 28px;
          overflow: hidden;
        }
        .sos-critical { background: linear-gradient(180deg, rgba(255,71,87,0.25) 0%, transparent 100%); border-bottom: 1px solid rgba(255,71,87,0.25); }
        .sos-moderate { background: linear-gradient(180deg, rgba(255,165,2,0.2) 0%, transparent 100%); border-bottom: 1px solid rgba(255,165,2,0.2); }
        .sos-header-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(255,71,87,0.15) 0%, transparent 70%);
          animation: heartbeat 2s ease-in-out infinite;
        }
        .sos-header-content { position: relative; z-index: 1; text-align: center; }
        .sos-badge-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,71,87,0.15);
          border: 1px solid rgba(255,71,87,0.4);
          border-radius: var(--radius-full);
          padding: 6px 16px;
          color: #FF4757;
          font-size: 0.8125rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: #FF4757;
          border-radius: 50%;
          animation: pulse-danger 1s ease-in-out infinite;
        }
        .sos-timer {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 6px;
          font-variant-numeric: tabular-nums;
        }
        .sos-sub { font-size: 0.875rem; color: var(--text-secondary); }

        /* Timeline */
        .timeline { display: flex; flex-direction: column; gap: 0; margin-bottom: 20px; }
        .amb-card { margin-bottom: 16px; }
        .map-placeholder {
          height: 120px;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
        .map-pin-user { position: absolute; left: 20%; font-size: 1.5rem; }
        .map-pin-amb { position: absolute; right: 20%; font-size: 1.5rem; }
        .map-path {
          position: absolute;
          left: 22%;
          right: 22%;
          height: 2px;
          background: linear-gradient(90deg, #FF4757, #00C9A7);
          border-radius: 1px;
        }
        .map-label {
          position: absolute;
          bottom: 8px;
          right: 8px;
          font-size: 0.625rem;
          color: var(--primary);
          font-weight: 600;
          background: rgba(0,201,167,0.1);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(0,201,167,0.2);
        }
        .doctor-call-card { margin-bottom: 16px; border-color: rgba(0,201,167,0.25); }
        .doc-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .first-aid-tip {
          display: flex;
          gap: 8px;
          background: rgba(255,165,2,0.08);
          border: 1px solid rgba(255,165,2,0.2);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          align-items: flex-start;
        }
        .sos-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)',
          padding: '12px 20px', borderRadius: '30px', boxShadow: 'var(--shadow-lg)',
          zIndex: 9999, fontSize: '0.85rem', fontWeight: 600, animation: 'fadeInUp 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Chat Overlay */}
      {chatProvider && (
        <div className="fixed inset-0 z-50 bg-[#0B1121] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="p-4 pt-[env(safe-area-inset-top,16px)] flex items-center justify-between border-b border-slate-800/80 bg-[#131B2F]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setChatProvider(null)}
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="font-bold text-white text-lg">{chatProvider.name}</h2>
                <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> En Route
                </p>
              </div>
            </div>
            <button className="text-[#3D91FF] p-2" onClick={() => {setChatProvider(null); setActiveEmergencyRoom(`LifeLink_SOS_AMB_${amb.id}`);}}>
              <Phone size={20} />
            </button>
          </div>
          
          <div className="flex-1 w-full bg-[#060B14] p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="text-center text-xs text-slate-500 mb-2">Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 mt-1">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Driver" className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#131B2F] border border-slate-800 rounded-2xl rounded-tl-none p-3 text-sm text-slate-200">
                Hello, this is your ambulance driver. I see your SOS alert and am on my way. Current ETA is {chatProvider.eta} minutes. Stay calm and keep your phone nearby.
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#131B2F] border-t border-slate-800/80 pb-[max(env(safe-area-inset-bottom,16px),16px)]">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full bg-[#0B1121] border border-slate-700 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#3D91FF]"
              />
              <button 
                onClick={() => alert("SOS Chat message sent! (Simulated)")}
                className="absolute right-2 w-8 h-8 bg-[#3D91FF] rounded-full flex items-center justify-center text-white"
              >
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TimelineItemProps {
  done: boolean;
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ done, icon, label, sub, color, isLast }) => (
  <div className={`timeline-item ${done ? 'done' : 'pending'}`}>
    <div className="tl-left">
      <div className="tl-dot" style={{ background: done ? color : 'var(--bg-elevated)', borderColor: done ? color : 'var(--border)', color: done ? 'white' : 'var(--text-tertiary)' }}>
        {done ? icon : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-light)' }} />}
      </div>
      {!isLast && <div className={`tl-line ${done ? 'done' : ''}`} />}
    </div>
    <div className="tl-content">
      <p className="text-sm font-semibold" style={{ color: done ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-xs text-secondary">{sub}</p>
    </div>
    <style>{`
      .timeline-item { display: flex; gap: 12px; }
      .tl-left { display: flex; flex-direction: column; align-items: center; }
      .tl-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.4s;
      }
      .tl-line {
        width: 2px;
        flex: 1;
        min-height: 24px;
        background: var(--border);
        margin: 4px 0;
        transition: background 0.4s;
      }
      .tl-line.done { background: var(--primary); }
      .tl-content { padding: 4px 0 20px; }
    `}</style>
  </div>
);

export default SOSPage;
