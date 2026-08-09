import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star, Phone, ChevronRight, Navigation, Bed } from 'lucide-react';
import FreeMap from '../components/FreeMap';
import { MOCK_HOSPITALS } from '../data/mockData';
import type { Hospital } from '../types/health.types';

const AmbulancePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [dispatched, setDispatched] = useState(false);
  const [eta, setEta] = useState(4);

  const handleDispatch = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setDispatched(true);
    setTimeout(() => navigate('/sos'), 1500);
  };

  const bedPercent = (h: Hospital) => Math.round((h.erBedsAvailable / h.erBedsTotal) * 100);
  const bedColor = (p: number) => p > 50 ? '#2ED573' : p > 25 ? '#FFA502' : '#FF4757';

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Ambulance & Hospitals</h2>
          <p className="text-xs text-secondary">4 units available nearby</p>
        </div>
      </div>

      <div className="page-content">
        {/* Real OpenStreetMap */}
        <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)' }} className="animate-fade-in">
          <FreeMap
            center={[28.5355, 77.2690]}
            zoom={13}
            markers={[
              // Your location
              { id: 'you', lat: 28.5380, lng: 77.2650, label: '📍 You' },
              // Hospitals from data
              ...MOCK_HOSPITALS.map(h => ({
                id: h.id,
                lat: h.lat,
                lng: h.lng,
                label: `🏥 ${h.name}`,
                popup: (
                  <div>
                    <strong>{h.name}</strong><br />
                    <span>ER Beds: {h.erBedsAvailable}/{h.erBedsTotal}</span><br />
                    <span>Wait: ~{h.erWaitMinutes} min</span>
                  </div>
                ),
              })),
              // Ambulance markers
              { id: 'amb_1', lat: 28.5420, lng: 77.2720, label: '🚑 Unit A-12' },
              { id: 'amb_2', lat: 28.5300, lng: 77.2580, label: '🚑 Unit A-07' },
            ]}
          />
        </div>

        {/* ETA strip */}
        <div className="eta-strip animate-fade-in delay-200">
          <div className="eta-card">
            <Clock size={16} color="#00C9A7" />
            <div>
              <span className="font-bold" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#00C9A7' }}>{eta}</span>
              <span className="text-xs text-secondary ml-1">min ETA</span>
            </div>
          </div>
          <div className="eta-card">
            <MapPin size={16} color="#3D91FF" />
            <div>
              <span className="font-bold" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#3D91FF' }}>1.2</span>
              <span className="text-xs text-secondary ml-1">km away</span>
            </div>
          </div>
          <div className="eta-card">
            <div className="status-dot online" />
            <span className="text-sm font-semibold">2 Units<br /><span className="text-xs text-secondary font-normal">nearby</span></span>
          </div>
        </div>

        {/* Hospital list */}
        <p className="section-title mb-3 animate-fade-in delay-300">Nearby Hospitals — ER Status</p>
        {MOCK_HOSPITALS.map((h, i) => {
          const pct = bedPercent(h);
          const col = bedColor(pct);
          return (
            <div
              key={h.id}
              className={`card hospital-card animate-fade-in ${selectedHospital?.id === h.id ? 'selected' : ''}`}
              style={{ animationDelay: `${300 + i * 80}ms` }}
              onClick={() => setSelectedHospital(h)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display">{h.name}</h4>
                    {h.isPartner && <span className="badge badge-primary">Partner</span>}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin size={12} color="var(--text-tertiary)" />
                    <span className="text-xs text-secondary">{h.distanceKm} km · {h.address.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={11} color="#FFA502" fill="#FFA502" />
                    <span className="text-xs font-semibold">{h.rating}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-tertiary)" />
              </div>

              {/* ER beds */}
              <div className="beds-row">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-secondary">ER Beds Available</span>
                  <span className="text-xs font-bold" style={{ color: col }}>{h.erBedsAvailable}/{h.erBedsTotal}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: col }} />
                </div>
              </div>

              {/* Specialists */}
              <div className="specialist-tags">
                {h.activeSpecialists.slice(0, 3).map((s, si) => (
                  <span key={si} className="badge badge-info">{s}</span>
                ))}
              </div>

              {selectedHospital?.id === h.id && (
                <div className="hospital-actions animate-fade-in">
                  <button className="btn btn-danger btn-block" onClick={() => handleDispatch(h)} id={`dispatch-amb-${h.id}`}>
                    🚑 Dispatch Ambulance Here
                  </button>
                  <div className="flex gap-2 mt-2">
                    <button className="btn btn-ghost flex-1 btn-sm">
                      <Phone size={14} /> Call ER
                    </button>
                    <button className="btn btn-ghost flex-1 btn-sm">
                      <Navigation size={14} /> Navigate
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .eta-strip {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .eta-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
        }
        .hospital-card {
          margin-bottom: 12px;
          cursor: pointer;
          transition: all var(--duration-normal);
        }
        .hospital-card:hover { border-color: var(--border-light); }
        .hospital-card.selected { border-color: var(--primary); box-shadow: var(--shadow-primary); }
        .beds-row { margin: 12px 0 10px; }
        .specialist-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .hospital-actions { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
};

export default AmbulancePage;
