import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, MapPin, Phone, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { MOCK_BLOOD_DONORS } from '../data/mockData';
import type { BloodGroup } from '../types/health.types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const compatibilityMap: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

const BloodNetwork: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [requestSent, setRequestSent] = useState<string[]>([]);

  const filtered = selectedGroup === 'All'
    ? MOCK_BLOOD_DONORS
    : MOCK_BLOOD_DONORS.filter(d => compatibilityMap[selectedGroup]?.includes(d.bloodGroup));

  const handleRequest = (id: string) => {
    setRequestSent(prev => [...prev, id]);
  };

  const bloodColor = (bg: BloodGroup) => {
    const negatives = ['A-', 'B-', 'AB-', 'O-'];
    return negatives.includes(bg) ? '#FF4757' : '#FF6B81';
  };

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Blood Donor Network</h2>
          <p className="text-xs text-secondary">{MOCK_BLOOD_DONORS.filter(d => d.isAvailable).length} donors available nearby</p>
        </div>
        <Filter size={18} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
      </div>

      <div className="page-content">
        {/* Urgency CTA */}
        <div className="urgency-card animate-fade-in">
          <div className="urgency-icon">🆘</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Need Blood Urgently?</p>
            <p className="text-xs text-secondary">Broadcast SOS to all compatible donors in 5km radius</p>
          </div>
          <button className="btn btn-danger btn-sm">SOS Broadcast</button>
        </div>

        {/* Your blood group */}
        <div className="card your-group animate-fade-in delay-100">
          <div className="flex items-center gap-3">
            <Droplets size={20} color="#FF4757" />
            <div>
              <p className="text-xs text-tertiary">Your Blood Group</p>
              <p className="font-bold" style={{ color: '#FF4757', fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>B+</p>
            </div>
            <div className="divider-v" />
            <div>
              <p className="text-xs text-tertiary">Can receive from</p>
              <p className="text-xs font-semibold">B+, B-, O+, O-</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/passport')}>
              Edit
            </button>
          </div>
        </div>

        {/* Blood group filter */}
        <p className="section-title mb-2 animate-fade-in delay-200">Filter by Compatible Group</p>
        <div className="blood-filter animate-fade-in delay-200">
          <button
            className={`blood-pill ${selectedGroup === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedGroup('All')}
          >
            All
          </button>
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              className={`blood-pill ${selectedGroup === bg ? 'active' : ''}`}
              style={{ '--pill-color': bloodColor(bg) } as any}
              onClick={() => setSelectedGroup(bg)}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* Donor list */}
        <p className="section-title mb-3 animate-fade-in delay-300">
          {selectedGroup === 'All' ? 'All Nearby Donors' : `Compatible with ${selectedGroup}`}
        </p>
        {filtered.map((donor, i) => {
          const sent = requestSent.includes(donor.id);
          return (
            <div
              key={donor.id}
              className="card donor-card animate-fade-in"
              style={{ animationDelay: `${300 + i * 80}ms`, marginBottom: 10 }}
            >
              <div className="flex items-center gap-3">
                <div className="donor-blood-badge" style={{ borderColor: bloodColor(donor.bloodGroup) + '50', background: bloodColor(donor.bloodGroup) + '15' }}>
                  <span style={{ color: bloodColor(donor.bloodGroup), fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '0.875rem' }}>
                    {donor.bloodGroup}
                  </span>
                  <Droplets size={10} color={bloodColor(donor.bloodGroup)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{donor.name}</p>
                    {donor.isAvailable
                      ? <CheckCircle size={14} color="#2ED573" />
                      : <XCircle size={14} color="var(--text-tertiary)" />
                    }
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} color="var(--text-tertiary)" />
                      <span className="text-xs text-secondary">{donor.distanceKm} km · {donor.city}</span>
                    </div>
                    <span className="text-xs text-secondary">Last: {donor.lastDonation}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`status-dot ${donor.isAvailable ? 'online' : 'offline'}`} />
                    <span className="text-xs" style={{ color: donor.isAvailable ? '#2ED573' : 'var(--text-tertiary)' }}>
                      {donor.isAvailable ? 'Available to donate' : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
              {donor.isAvailable && (
                <div className="flex gap-2 mt-3">
                  <button
                    className={`btn flex-1 btn-sm ${sent ? 'btn-ghost' : 'btn-danger'}`}
                    onClick={() => handleRequest(donor.id)}
                    disabled={sent}
                    id={`request-donor-${donor.id}`}
                  >
                    {sent ? <><CheckCircle size={14} /> Request Sent</> : <><Droplets size={14} /> Send Request</>}
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Phone size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Become a donor */}
        <div className="card become-donor animate-fade-in delay-600">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2rem' }}>❤️</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Become a Blood Donor</p>
              <p className="text-xs text-secondary">Register to help save lives in your community</p>
            </div>
            <button className="btn btn-primary btn-sm">Join</button>
          </div>
        </div>
      </div>

      <style>{`
        .urgency-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,71,87,0.08);
          border: 1.5px solid rgba(255,71,87,0.25);
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-bottom: 16px;
        }
        .urgency-icon { font-size: 1.5rem; flex-shrink: 0; }
        .your-group { margin-bottom: 20px; cursor: default; }
        .divider-v {
          width: 1px;
          height: 32px;
          background: var(--border);
          flex-shrink: 0;
        }
        .blood-filter {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          margin-bottom: 20px;
        }
        .blood-filter::-webkit-scrollbar { display: none; }
        .blood-pill {
          white-space: nowrap;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-display);
          transition: all var(--duration-fast);
        }
        .blood-pill.active {
          background: rgba(255,71,87,0.15);
          border-color: rgba(255,71,87,0.4);
          color: #FF4757;
        }
        .donor-card { cursor: default; }
        .donor-blood-badge {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          border: 2px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          gap: 1px;
        }
        .become-donor { cursor: default; }
      `}</style>
    </div>
  );
};

export default BloodNetwork;
