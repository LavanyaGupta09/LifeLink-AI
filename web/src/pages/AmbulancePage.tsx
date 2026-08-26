import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star, Phone, ChevronRight, Navigation, Bed } from 'lucide-react';
import FreeMap from '../components/FreeMap';
import type { Hospital } from '../types/health.types';
import { useGeolocation } from '../hooks/useGeolocation';
import LocationFallback from '../components/LocationFallback';

// Deterministic hash for consistent simulated data per hospital
function simHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const SPECIALTIES_POOL = ['Cardiology', 'Trauma', 'Neuro', 'Ortho', 'Pediatric', 'Burns', 'Pulmonology', 'Oncology'];

function enrichHospital(h: any) {
  const seed = simHash(h.name || h.id);
  const erBedsTotal = 10 + (seed % 15);
  const erBedsAvailable = 1 + (seed % Math.max(erBedsTotal - 2, 1));
  const specialties = SPECIALTIES_POOL.filter((_, i) => (seed >> i) & 1).slice(0, 3);
  return {
    ...h,
    erBedsTotal,
    erBedsAvailable,
    erWaitMinutes: 5 + (seed % 40),
    rating: parseFloat((3.5 + (seed % 15) / 10).toFixed(1)),
    isPartner: (seed % 3) === 0,
    activeSpecialists: specialties.length > 0 ? specialties : ['Emergency', 'General'],
  };
}

const AmbulancePage: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<any[]>([]);
  
  const { location, status, errorMessage, searchCity } = useGeolocation();

  // Ambulance animation state
  const [amb1, setAmb1] = useState<[number, number]>([28.5355 + 0.008, 77.2690 - 0.006]);
  const [amb2, setAmb2] = useState<[number, number]>([28.5355 - 0.005, 77.2690 + 0.009]);
  const [etaMin, setEtaMin] = useState(7);
  const [distKm, setDistKm] = useState(1.8);

  useEffect(() => {
    if (!location) return;

    const fetchHospitals = async () => {
      const { lat, lng } = location;
      setAmb1([lat + 0.008, lng - 0.006]);
      setAmb2([lat - 0.005, lng + 0.009]);

      try {
        const { fetchNearbyFacilities } = await import('../lib/overpass');
        const facilities = await fetchNearbyFacilities(lat, lng, 'hospital', 15000);
        setHospitals(facilities.map(enrichHospital));
      } catch (e) {
        console.error(e);
      }
    };

    fetchHospitals();
  }, [location]);

  // Animate ambulances toward user
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => {
      setAmb1(prev => [
        prev[0] + (location.lat - prev[0]) * 0.02,
        prev[1] + (location.lng - prev[1]) * 0.02,
      ]);
      setAmb2(prev => [
        prev[0] + (location.lat - prev[0]) * 0.015,
        prev[1] + (location.lng - prev[1]) * 0.015,
      ]);

      // Update ETA based on distance to ambulance 1
      setAmb1(prev => {
        const dLat = location.lat - prev[0];
        const dLng = location.lng - prev[1];
        const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // rough km
        setDistKm(parseFloat(dist.toFixed(1)));
        setEtaMin(Math.max(1, Math.round(dist / 0.5)));
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [location]);

  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = (hospital: any) => {
    setSelectedHospital(hospital);
    setDispatched(true);
    setTimeout(() => navigate('/tracking/ambulance'), 1500);
  };

  const bedPercent = (h: any) => Math.round((h.erBedsAvailable / h.erBedsTotal) * 100);
  const bedColor = (p: number) => p > 50 ? '#2ED573' : p > 25 ? '#FFA502' : '#FF4757';

  return (
    <div className="app-shell">
      <div className="page-header pt-[env(safe-area-inset-top)]">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Ambulance & Hospitals</h2>
          <p className="text-xs text-secondary">2 units dispatched nearby</p>
        </div>
      </div>

      <div className="page-content">
        {status === 'denied' || status === 'error' ? (
           <LocationFallback onSearch={searchCity} errorMessage={errorMessage} />
        ) : (
          <>
        {/* Real OpenStreetMap */}
        {location && (
          <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)' }} className="animate-fade-in">
          <FreeMap
            center={[location.lat, location.lng]}
            zoom={14}
            markers={[
              { id: 'you', lat: location.lat, lng: location.lng, label: '📍 You' },
              ...hospitals.map(h => ({
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
              // Animated ambulance markers
              { id: 'amb_1', lat: amb1[0], lng: amb1[1], label: '🚑 Unit A-12 (ALS)' },
              { id: 'amb_2', lat: amb2[0], lng: amb2[1], label: '🚑 Unit A-07 (BLS)' },
            ]}
          />
        </div>
        )}

        {/* Dynamic ETA strip */}
        <div className="eta-strip animate-fade-in delay-200">
          <div className="eta-card">
            <Clock size={16} color="#00C9A7" />
            <div>
              <span className="font-bold" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#00C9A7' }}>{etaMin}</span>
              <span className="text-xs text-secondary ml-1">min ETA</span>
            </div>
          </div>
          <div className="eta-card">
            <MapPin size={16} color="#3D91FF" />
            <div>
              <span className="font-bold" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#3D91FF' }}>{distKm}</span>
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

        {hospitals.length === 0 ? (
          <div className="animate-pulse">
            {[1,2,3].map(i => <div key={i} className="card mb-3" style={{ height: 140, background: 'var(--bg-elevated)', borderRadius: 16 }}></div>)}
          </div>
        ) : hospitals.map((h, i) => {
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
                    <span className="text-xs text-secondary">{h.distanceKm} km · {(h.address || '').split(',')[0]}</span>
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
                {h.activeSpecialists.slice(0, 3).map((s: string, si: number) => (
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
          </>
        )}
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
