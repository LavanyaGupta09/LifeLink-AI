import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Phone, Star, Clock, Award, Filter } from 'lucide-react';
import type { Doctor } from '../types/health.types';

const statusColors: Record<string, string> = {
  available: '#2ED573',
  busy: '#FFA502',
  offline: '#5A6B8A',
};

const DoctorPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [activeCall, setActiveCall] = useState<Doctor | null>(null);
  const [callElapsed, setCallElapsed] = useState(0);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase.from('doctors').select('*, users(full_name)');
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formatted = data.map(d => ({
            id: d.id,
            name: d.users?.full_name || 'Dr. Unknown',
            specialization: d.specialization || 'General',
            hospitalName: 'Apollo Hospitals',
            status: d.status || 'available',
            rating: d.rating || 4.5,
            consultationFee: d.consultation_fee || 500,
            experienceYears: d.experience_years || 5,
            videoCallAvailable: d.video_call_available
          }));
          setDoctors(formatted);
        } else {
          const { MOCK_DOCTORS } = await import('../data/mockData');
          setDoctors(MOCK_DOCTORS);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        const { MOCK_DOCTORS } = await import('../data/mockData');
        setDoctors(MOCK_DOCTORS);
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specializations = ['All', ...Array.from(new Set(doctors.map(d => d.specialization)))];
  const filtered = selectedSpec === 'All' ? doctors : doctors.filter(d => d.specialization === selectedSpec);

  const startCall = (doc: Doctor) => {
    setActiveCall(doc);
    const t = setInterval(() => setCallElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  };

  const endCall = () => {
    setActiveCall(null);
    setCallElapsed(0);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Video call overlay
  if (activeCall) {
    return (
      <div className="app-shell video-call-screen">
        <div className="vc-remote">
          <div className="vc-remote-avatar">{activeCall.name.split(' ').map(n => n[0]).join('')}</div>
          <div className="vc-scan-lines" />
        </div>
        <div className="vc-self">
          <div className="vc-self-avatar">PS</div>
        </div>
        <div className="vc-header pt-[env(safe-area-inset-top)]">
          <div className="vc-status">
            <div className="status-dot online" />
            <span className="text-xs text-success font-semibold">Connected · {fmt(callElapsed)}</span>
          </div>
        </div>
        <div className="vc-info">
          <h3 className="font-display">{activeCall.name}</h3>
          <p className="text-sm text-secondary">{activeCall.specialization} · {activeCall.hospitalName}</p>
        </div>
        <div className="vc-controls">
          <button className="vc-btn"><span>🔇</span></button>
          <button className="vc-btn" style={{ background: 'linear-gradient(135deg, #FF4757, #D63031)' }} onClick={endCall}>
            <Phone size={22} color="white" style={{ transform: 'rotate(135deg)' }} />
          </button>
          <button className="vc-btn"><span>📷</span></button>
        </div>
        <div className="first-aid-overlay">
          <p className="text-xs font-semibold mb-1">💊 First Aid Guidance Active</p>
          <p className="text-xs text-secondary">Follow Dr. {activeCall.name.split(' ')[1]}'s instructions carefully</p>
        </div>
        <style>{`
          .video-call-screen { background: #000; overflow: hidden; min-height: 100dvh; position: relative; }
          .vc-remote {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, #0D1626 0%, #060B14 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vc-remote-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            font-size: 2rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            box-shadow: 0 0 60px rgba(0,201,167,0.3);
          }
          .vc-scan-lines {
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,201,167,0.03) 2px, rgba(0,201,167,0.03) 4px);
            pointer-events: none;
          }
          .vc-self {
            position: absolute;
            top: 60px;
            right: 16px;
            width: 80px;
            height: 108px;
            border-radius: 12px;
            background: var(--bg-surface);
            border: 2px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .vc-self-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #8B5CF6;
            color: white;
            font-weight: 700;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vc-header {
            position: absolute;
            top: 60px;
            left: 16px;
            right: 108px;
          }
          .vc-status {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            padding: 6px 12px;
            border-radius: var(--radius-full);
            border: 1px solid var(--glass-border);
            width: fit-content;
          }
          .vc-info {
            position: absolute;
            bottom: 160px;
            left: 0;
            right: 0;
            text-align: center;
          }
          .vc-controls {
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 24px;
          }
          .vc-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--bg-elevated);
            border: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.25rem;
            transition: all 0.2s;
          }
          .vc-btn:hover { transform: scale(1.1); }
          .first-aid-overlay {
            position: absolute;
            bottom: 20px;
            left: 16px;
            right: 16px;
            background: rgba(255,165,2,0.12);
            border: 1px solid rgba(255,165,2,0.25);
            border-radius: var(--radius-md);
            padding: 10px 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-header pt-[env(safe-area-inset-top)]">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Doctor On-Call</h2>
          <p className="text-xs text-secondary">{doctors.filter(d => d.status === 'available').length} doctors available now</p>
        </div>
        <Filter size={18} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
      </div>

      <div className="page-content">
        {loading ? (
          <div className="animate-pulse">
            <div className="card mb-4" style={{ height: 100, background: 'var(--bg-elevated)', borderRadius: 16 }}></div>
            <div style={{ height: 40, width: '100%', background: 'var(--bg-elevated)', borderRadius: 20, marginBottom: 16 }}></div>
            {[1,2,3].map(i => <div key={i} className="card mb-3" style={{ height: 120, background: 'var(--bg-elevated)', borderRadius: 16 }}></div>)}
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--bg-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '1.5rem' }}>🩺</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Doctors Available</h3>
            <p style={{ fontSize: '0.85rem' }}>There are currently no active doctors on the network. Please check back later.</p>
          </div>
        ) : (
        <>
        {/* Family Doctor highlight */}
        <div className="card card-primary family-doc-card animate-fade-in mb-4">
          <div className="flex items-center gap-3">
            <div className="doc-avatar-sm">MN</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">Dr. Meera Nair</p>
                <span className="badge badge-primary">Your Family Doctor</span>
              </div>
              <p className="text-xs text-secondary">General Physician · Apollo Hospitals</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="status-dot online" />
                <span className="text-xs text-success">Available now</span>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => doctors.length > 0 && startCall(doctors[0])} id="call-family-doctor">
              <Video size={14} />
              Call
            </button>
          </div>
        </div>

        {/* Spec filter */}
        <div className="spec-filter mb-4 animate-fade-in delay-100">
          {specializations.map(s => (
            <button
              key={s}
              className={`spec-pill ${selectedSpec === s ? 'active' : ''}`}
              onClick={() => setSelectedSpec(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Doctor list */}
        {filtered.map((doc, i) => (
          <div
            key={doc.id}
            className="card doctor-card animate-fade-in"
            style={{ animationDelay: `${150 + i * 80}ms`, marginBottom: 12 }}
          >
            <div className="flex gap-3">
              <div className="doc-avatar" style={{ background: ['linear-gradient(135deg,#00C9A7,#009E83)', 'linear-gradient(135deg,#3D91FF,#2575C1)', 'linear-gradient(135deg,#8B5CF6,#7C3AED)', 'linear-gradient(135deg,#FFA502,#E08C00)'][i % 4] }}>
                {doc.name.split(' ').filter(n => n !== 'Dr.').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-display" style={{ fontSize: '0.9375rem' }}>{doc.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star size={11} color="#FFA502" fill="#FFA502" />
                    <span className="text-xs font-semibold">{doc.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-secondary mb-1">{doc.specialization} · {doc.hospitalName}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="status-dot" style={{ background: statusColors[doc.status] }} />
                    <span className="text-xs" style={{ color: statusColors[doc.status], textTransform: 'capitalize' }}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={11} color="var(--text-tertiary)" />
                    <span className="text-xs text-secondary">{doc.experienceYears} yrs</span>
                  </div>
                  <span className="text-xs font-semibold text-brand">₹{doc.consultationFee}</span>
                </div>
              </div>
            </div>

            {doc.status === 'available' && (
              <div className="flex gap-2 mt-3">
                <button
                  className="btn btn-primary flex-1 btn-sm"
                  onClick={() => startCall(doc)}
                  id={`video-call-${doc.id}`}
                  disabled={!doc.videoCallAvailable}
                >
                  <Video size={14} />
                  Video Call
                </button>
                <button className="btn btn-ghost flex-1 btn-sm">
                  <Phone size={14} />
                  Voice Call
                </button>
              </div>
            )}
            {doc.status === 'busy' && (
              <div className="mt-3">
                <button className="btn btn-ghost btn-block btn-sm" disabled>
                  <Clock size={14} />
                  Currently in consultation
                </button>
              </div>
            )}
          </div>
        ))}
        {/* End of real doctors */}
        </>
        )}
      </div>

      <style>{`
        .family-doc-card { cursor: default; }
        .doc-avatar-sm {
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
        .spec-filter {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .spec-filter::-webkit-scrollbar { display: none; }
        .spec-pill {
          white-space: nowrap;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
          transition: all var(--duration-fast);
        }
        .spec-pill.active {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--primary);
        }
        .doctor-card { cursor: default; }
        .doc-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
          font-family: var(--font-display);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default DoctorPage;
