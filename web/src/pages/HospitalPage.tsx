import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, MapPin, Clock, Star, Phone, Navigation,
  Building2, Bed, Users, ShieldCheck, Droplets, ChevronRight,
  CheckCircle2, AlertTriangle, Send, Zap, RefreshCw, ExternalLink,
  Share2, Activity, X, SlidersHorizontal
} from 'lucide-react';
import { MOCK_ER_DASHBOARDS, MOCK_PRE_ARRIVAL_ALERT, MOCK_HOSPITAL_ROUTES, MOCK_HEALTH_PROFILE, MOCK_USER } from '../data/mockData';
import type { HospitalExtended, ERDashboard, HospitalRoute } from '../types/health.types';
import FreeMap from '../components/FreeMap';
import { useGeolocation } from '../hooks/useGeolocation';
import LocationFallback from '../components/LocationFallback';

// ── Types ────────────────────────────────────────────────────────────────────
type TabId = 'discover' | 'er' | 'alert' | 'route';
type SortKey = 'distance' | 'wait' | 'rating';
type AlertStep = 'preparing' | 'sent' | 'acknowledged';

const ALL_SPECIALTIES = ['Cardiac', 'Trauma', 'Pediatric', 'Neuro', 'Oncology', 'Orthopedic', 'Burns', 'Gastro', 'Pulmonology', 'Vascular'];
const ALL_INSURANCE   = ['Star Health', 'CGHS', 'ICICI Lombard', 'HDFC Ergo', 'Ayushman Bharat', 'ESIC', 'Max Bupa', 'Bajaj Allianz'];

// ── Helper: Occupancy Ring ───────────────────────────────────────────────────
const OccupancyRing: React.FC<{
  pct: number; color: string; size?: number; stroke?: number; label: string; sub: string;
}> = ({ pct, color, size = 80, stroke = 8, label, sub }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const cx = size / 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div style={{ textAlign: 'center', marginTop: -size / 2 - 2, position: 'relative', top: -size / 2 + 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color }}>{pct}%</div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{sub}</div>
      </div>
    </div>
  );
};

// ── Helper: Availability Badge ───────────────────────────────────────────────
const AvailBadge: React.FC<{ status: 'high' | 'medium' | 'critical' }> = ({ status }) => {
  const map = {
    high:     { label: '● High',     color: '#2ED573', bg: 'rgba(46,213,115,0.12)' },
    medium:   { label: '● Medium',   color: '#FFA502', bg: 'rgba(255,165,2,0.12)' },
    critical: { label: '● Critical', color: '#FF4757', bg: 'rgba(255,71,87,0.12)' },
  };
  const m = map[status];
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, color: m.color, background: m.bg,
      borderRadius: 'var(--radius-full)', padding: '2px 8px', letterSpacing: '0.03em',
    }}>{m.label}</span>
  );
};

// ── Helper: Traffic Badge ────────────────────────────────────────────────────
const TrafficBadge: React.FC<{ tc: 'clear' | 'moderate' | 'heavy' }> = ({ tc }) => {
  const map = {
    clear:    { label: '🟢 Clear',    color: '#2ED573' },
    moderate: { label: '🟡 Moderate', color: '#FFA502' },
    heavy:    { label: '🔴 Heavy',    color: '#FF4757' },
  };
  const m = map[tc];
  return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: m.color }}>{m.label}</span>;
};

// Deterministic hash for consistent simulated data per hospital
function simHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Main Page ────────────────────────────────────────────────────────────────
const HospitalPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('discover');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Dynamic Hospitals
  const [hospitals, setHospitals] = useState<HospitalExtended[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  
  const { location, status, errorMessage, searchCity } = useGeolocation();

  useEffect(() => {
    if (!location) return;
    const handleGeoSuccess = async (lat: number, lng: number) => {
      setUserLoc([lat, lng]);
      try {
        const { fetchNearbyFacilities } = await import('../lib/overpass');
        const facilities = await fetchNearbyFacilities(lat, lng, 'hospital');
        if (facilities.length === 0) {
          setHospitals([]);
          setLoadingHospitals(false);
          return;
        }
        const mapped: HospitalExtended[] = facilities.map((f) => {
          const seed = simHash(f.name || f.id);
          const isGovt = seed % 2 === 0;
          const trauma = (seed % 3) + 1;
          return {
            id: f.id,
            name: f.name,
            lat: f.lat,
            lng: f.lng,
            address: f.address,
            type: isGovt ? 'government' : 'private',
            specialties: ALL_SPECIALTIES.filter((_, i) => (seed >> i) & 1).slice(0, 3),
            rating: parseFloat((3.5 + (seed % 15) / 10).toFixed(1)),
            distanceKm: f.distanceKm,
            acceptedInsurance: ALL_INSURANCE.slice(0, 2),
            hasHelipad: seed % 5 === 0,
            hasBloodBank: seed % 2 === 0,
            traumaLevel: 'Level ' + trauma,
            isPartner: seed % 4 === 0,
          };
        });
        setHospitals(mapped);
        
        const erMapped: ERDashboard[] = mapped.map(h => {
          const seed = simHash(h.id);
          const erBedsTotal = 10 + (seed % 20);
          const avail = 1 + (seed % Math.max(erBedsTotal - 2, 1));
          return {
            hospitalId: h.id,
            hospitalName: h.name,
            erBedsTotal,
            erBedsAvailable: avail,
            icuBedsTotal: 10 + (seed % 10),
            icuBedsAvailable: (seed % 8),
            erWaitMinutes: 5 + (seed % 50),
            erOccupancyPercent: Math.round(((erBedsTotal - avail) / erBedsTotal) * 100),
            icuOccupancyPercent: Math.round(((10 - (seed % 8)) / 10) * 100),
            availabilityStatus: avail > (erBedsTotal * 0.5) ? 'high' : avail > (erBedsTotal * 0.2) ? 'medium' : 'critical',
            onCallSpecialists: [],
            hasHelipad: h.hasHelipad,
            hasBloodBank: h.hasBloodBank,
            traumaLevel: h.traumaLevel,
            lastUpdated: new Date().toISOString()
          };
        });
        setErData(erMapped);
        if (erMapped.length > 0) setSelectedER(erMapped[0]);
        if (mapped.length > 0) setAlertHosp(mapped[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHospitals(false);
      }
    };

    handleGeoSuccess(location.lat, location.lng);
  }, [location]);


  // Discovery filters
  const [search, setSearch]             = useState('');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [selSpecialties, setSelSpec]    = useState<string[]>([]);
  const [selTypes, setSelTypes]         = useState<('private' | 'government')[]>([]);
  const [selInsurance, setSelInsurance] = useState<string[]>([]);
  const [sortKey, setSortKey]           = useState<SortKey>('distance');

  // ER Dashboard
  const [erData, setErData]             = useState<ERDashboard[]>([]);
  const [selectedER, setSelectedER]     = useState<ERDashboard>({} as ERDashboard);
  const [lastRefresh, setLastRefresh]   = useState(new Date());
  const [refreshing, setRefreshing]     = useState(false);

  // Pre-Arrival Alert
  const [alertStep, setAlertStep]       = useState<AlertStep>('preparing');
  const [alertHospital, setAlertHosp]   = useState<HospitalExtended>({} as HospitalExtended);
  const [alertSending, setAlertSending] = useState(false);
  const [etaSeconds, setEtaSeconds]     = useState(4 * 60);

  // Routing
  const [selectedRoute, setSelectedRoute] = useState<HospitalRoute>(MOCK_HOSPITAL_ROUTES[0]);
  const [animRoute, setAnimRoute]          = useState(false);

  // ── Live ER refresh simulation ───────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setErData(prev => prev.map(er => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const newAvail = Math.max(0, Math.min(er.erBedsTotal, er.erBedsAvailable + delta));
        const icuDelta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newIcuAvail = Math.max(0, Math.min(er.icuBedsTotal, er.icuBedsAvailable + icuDelta));
        const waitDelta = Math.random() > 0.5 ? 1 : -1;
        const newWait = Math.max(1, er.erWaitMinutes + waitDelta);
        const occ = Math.round(((er.erBedsTotal - newAvail) / er.erBedsTotal) * 100);
        return {
          ...er,
          erBedsAvailable: newAvail,
          icuBedsAvailable: newIcuAvail,
          erWaitMinutes: newWait,
          erOccupancyPercent: occ,
          availabilityStatus: (newAvail / er.erBedsTotal) >= 0.5 ? 'high' : (newAvail / er.erBedsTotal) >= 0.25 ? 'medium' : 'critical',
          lastUpdated: new Date().toISOString(),
        };
      }));
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Keep selectedER in sync with erData
  useEffect(() => {
    setSelectedER(prev => erData.find(e => e.hospitalId === prev.hospitalId) ?? erData[0]);
  }, [erData]);

  // ── ETA countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (alertStep !== 'sent' && alertStep !== 'acknowledged') return;
    const t = setInterval(() => setEtaSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [alertStep]);

  const fmtEta = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Manual refresh ───────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setErData(prev => prev.map(er => ({ ...er, lastUpdated: new Date().toISOString() })));
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 800);
  }, []);

  // ── Send Pre-Arrival Alert ───────────────────────────────────────────────
  const handleSendAlert = () => {
    if (alertSending || alertStep !== 'preparing') return;
    setAlertSending(true);
    setTimeout(() => { setAlertStep('sent'); setAlertSending(false); }, 1500);
    setTimeout(() => setAlertStep('acknowledged'), 4500);
  };

  // ── Filtered + sorted hospitals ──────────────────────────────────────────
  const filtered = hospitals
    .filter(h => {
      if (search && !h.name.toLowerCase().includes(search.toLowerCase()) &&
          !h.address.toLowerCase().includes(search.toLowerCase())) return false;
      if (selSpecialties.length && !selSpecialties.some(s => h.specialties.includes(s))) return false;
      if (selTypes.length && !selTypes.includes(h.type)) return false;
      if (selInsurance.length && !selInsurance.some(i => h.acceptedInsurance.includes(i))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'distance') return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
      if (sortKey === 'wait')     return a.erWaitMinutes - b.erWaitMinutes;
      if (sortKey === 'rating')   return b.rating - a.rating;
      return 0;
    });

  const toggleFilter = <T,>(arr: T[], set: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  // ── Tabs definition ──────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'discover', label: 'Discover', icon: <Search size={14} /> },
    { id: 'er',       label: 'ER Live',  icon: <Activity size={14} /> },
    { id: 'alert',    label: 'Alert',    icon: <Send size={14} /> },
    { id: 'route',    label: 'Navigate', icon: <Navigation size={14} /> },
  ];

  // ── Route animation trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'route') { setAnimRoute(false); setTimeout(() => setAnimRoute(true), 100); }
  }, [activeTab, selectedRoute]);

  const erForHosp = (id: string) => erData.find(e => e.hospitalId === id);
  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div id="hospital-top" className="app-shell">
      {/* Header */}
      <div className="page-header pt-[env(safe-area-inset-top)]" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button className="back-btn" onClick={() => navigate('/dashboard')} id="hosp-back-btn">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 className="page-title" style={{ marginBottom: 2 }}>Hospitals & ER</h2>
          <p className="text-xs text-secondary">Live status · {hospitals.length} hospitals nearby</p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
          id="hosp-refresh-btn"
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
        </button>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            id={`hosp-tab-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600,
              color: activeTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all var(--duration-normal)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {status === 'denied' || status === 'error' ? (
           <LocationFallback onSearch={searchCity} errorMessage={errorMessage} />
        ) : (
          <>
        {/* ══════════════════════════════════════════════════════════════
            TAB 1 · SMART HOSPITAL DISCOVERY
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'discover' && (
          <div className="animate-fade-in">
            {/* Search + Filter row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '10px 12px',
              }}>
                <Search size={15} color="var(--text-tertiary)" />
                <input
                  id="hosp-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search hospital, specialty…"
                  style={{
                    background: 'none', border: 'none', outline: 'none', flex: 1,
                    color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-body)',
                  }}
                />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={14} /></button>}
              </div>
              <button
                id="hosp-filter-btn"
                onClick={() => setFilterOpen(!filterOpen)}
                style={{
                  background: filterOpen ? 'var(--primary)' : 'var(--bg-card)',
                  border: `1px solid ${filterOpen ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '10px 12px', cursor: 'pointer',
                  color: filterOpen ? 'var(--bg-base)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                  transition: 'all var(--duration-normal)',
                }}
              >
                <SlidersHorizontal size={15} />
                Filter {(selSpecialties.length + selTypes.length + selInsurance.length) > 0 && `(${selSpecialties.length + selTypes.length + selInsurance.length})`}
              </button>
            </div>

            {/* Filter panel */}
            {filterOpen && (
              <div className="animate-fade-in" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 14,
              }}>
                {/* Specialty */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Specialty</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {ALL_SPECIALTIES.map(s => (
                    <button key={s} id={`filter-spec-${s}`} onClick={() => toggleFilter(selSpecialties, setSelSpec, s)}
                      className={`filter-chip ${selSpecialties.includes(s) ? 'active' : ''}`}>{s}</button>
                  ))}
                </div>
                {/* Type */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hospital Type</p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {(['private', 'government'] as const).map(t => (
                    <button key={t} id={`filter-type-${t}`} onClick={() => toggleFilter(selTypes, setSelTypes, t)}
                      className={`filter-chip ${selTypes.includes(t) ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>{t}</button>
                  ))}
                </div>
                {/* Insurance */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insurance Accepted</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {ALL_INSURANCE.map(i => (
                    <button key={i} id={`filter-ins-${i.replace(/\s/g, '-')}`} onClick={() => toggleFilter(selInsurance, setSelInsurance, i)}
                      className={`filter-chip ${selInsurance.includes(i) ? 'active' : ''}`}>{i}</button>
                  ))}
                </div>
                {/* Reset */}
                <button onClick={() => { setSelSpec([]); setSelTypes([]); setSelInsurance([]); }}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  Clear all filters
                </button>
              </div>
            )}

            {/* Sort chips */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {(['distance', 'wait', 'rating'] as SortKey[]).map(k => (
                <button key={k} id={`sort-${k}`} onClick={() => setSortKey(k)}
                  className={`filter-chip ${sortKey === k ? 'active' : ''}`}
                  style={{ fontSize: '0.72rem' }}>
                  {k === 'distance' ? '📍 Distance' : k === 'wait' ? '⏱ ER Wait' : '⭐ Rating'}
                </button>
              ))}
            </div>

            {/* Results count */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {hospitals.length} hospitals
            </p>

            {/* Interactive Map */}
            {filtered.length > 0 && !loadingHospitals && userLoc && (
              <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)' }} className="animate-fade-in">
                <FreeMap
                  center={[userLoc[0], userLoc[1]]}
                  zoom={12}
                  markers={[
                    { id: 'you', lat: userLoc[0], lng: userLoc[1], label: '📍 You' },
                    ...filtered.map(h => ({
                      id: h.id,
                      lat: h.lat,
                      lng: h.lng,
                      label: `🏥 ${h.name.substring(0, 12)}`,
                      popup: (
                        <div>
                          <strong>{h.name}</strong><br />
                          <span>{h.distanceKm} km away</span>
                        </div>
                      ),
                    })),
                  ]}
                />
              </div>
            )}

            {/* Hospital cards */}
            
            {loadingHospitals ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="card animate-pulse" style={{ height: 140 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 20, background: 'var(--bg-elevated)', borderRadius: 4, width: '60%', marginBottom: 8 }} />
                        <div style={{ height: 14, background: 'var(--bg-elevated)', borderRadius: 4, width: '40%', marginBottom: 12 }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ height: 24, width: 60, background: 'var(--bg-elevated)', borderRadius: 12 }} />
                          <div style={{ height: 24, width: 60, background: 'var(--bg-elevated)', borderRadius: 12 }} />
                        </div>
                      </div>
                      <div style={{ width: 60, height: 60, background: 'var(--bg-elevated)', borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <Building2 size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
                <p>No hospitals match your filters.</p>
                <button onClick={() => { setSelSpec([]); setSelTypes([]); setSelInsurance([]); setSearch(''); }}
                  style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Clear filters
                </button>
              </div>
            ) : filtered.map((h, i) => {
              const erStatus = erForHosp(h.id);
              const avail = erStatus?.availabilityStatus ?? 'medium';
              return (
                <div key={h.id} id={`hosp-card-${h.id}`}
                  className="card animate-fade-in"
                  style={{ marginBottom: 12, animationDelay: `${i * 60}ms`, cursor: 'pointer' }}
                  onClick={() => { setSelectedER(erData.find(e => e.hospitalId === h.id) ?? erData[0]); setActiveTab('er'); }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{h.name}</h4>
                        {h.isPartner && <span className="badge badge-primary">Partner</span>}
                        {h.acceptedInsurance.includes('Star Health') && (
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px',
                            borderRadius: 'var(--radius-full)', background: 'rgba(0,201,167,0.12)', color: '#00C9A7',
                            display: 'flex', alignItems: 'center', gap: 3
                          }}>
                            <ShieldCheck size={10} /> Cashless Available
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: h.type === 'private' ? 'rgba(61,145,255,0.12)' : 'rgba(139,92,246,0.12)',
                          color: h.type === 'private' ? '#3D91FF' : '#8B5CF6',
                        }}>{h.type === 'private' ? 'Private' : 'Govt'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <MapPin size={11} color="var(--text-tertiary)" />
                        <span className="text-xs text-secondary">{h.distanceKm} km · {h.address.split(',')[0]}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} color="#FFA502" fill="#FFA502" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{h.rating}</span>
                        </div>
                        <AvailBadge status={avail} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {erStatus?.erWaitMinutes}m wait
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)', lineHeight: 1 }}>
                        {erStatus?.erBedsAvailable}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>ER beds<br />free</div>
                    </div>
                  </div>

                  {/* Specialty tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                    {h.specialties.slice(0, 4).map((s, si) => (
                      <span key={si} className="badge badge-info"
                        style={{ background: selSpecialties.includes(s) ? 'rgba(0,201,167,0.2)' : undefined, borderColor: selSpecialties.includes(s) ? 'var(--primary)' : undefined }}>
                        {s}
                      </span>
                    ))}
                    {h.specialties.length > 4 && <span className="badge" style={{ color: 'var(--text-secondary)' }}>+{h.specialties.length - 4}</span>}
                  </div>

                  {/* ER bed progress */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="text-xs text-secondary">ER Occupancy</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: avail === 'high' ? '#2ED573' : avail === 'medium' ? '#FFA502' : '#FF4757' }}>
                        {erStatus?.erOccupancyPercent}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: `${erStatus?.erOccupancyPercent ?? 0}%`,
                        background: avail === 'high' ? '#2ED573' : avail === 'medium' ? '#FFA502' : '#FF4757',
                      }} />
                    </div>
                  </div>

                  {/* Footer icons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {h.hasHelipad && <span title="Helipad" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>🚁 Helipad</span>}
                      {h.hasBloodBank && <span title="Blood Bank" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>🩸 Blood Bank</span>}
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Trauma Lvl {h.traumaLevel}</span>
                    </div>
                    <ChevronRight size={16} color="var(--text-tertiary)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2 · LIVE ER & BED CAPACITY DASHBOARD
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'er' && (

          <div className="animate-fade-in">
            {loadingHospitals ? (
              <div className="card animate-pulse" style={{ height: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 30, background: 'var(--bg-elevated)', borderRadius: 4, width: '50%' }} />
                <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 8 }} />
                <div style={{ height: 60, background: 'var(--bg-elevated)', borderRadius: 8 }} />
              </div>
            ) : hospitals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <AlertTriangle size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
                <p>No hospitals nearby to show ER status.</p>
              </div>
            ) : (
              <>

            {/* Hospital selector */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
              {erData.map(er => (
                <button
                  key={er.hospitalId}
                  id={`er-select-${er.hospitalId}`}
                  onClick={() => setSelectedER(er)}
                  style={{
                    flexShrink: 0, padding: '6px 12px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                    background: selectedER.hospitalId === er.hospitalId ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedER.hospitalId === er.hospitalId ? 'var(--bg-base)' : 'var(--text-secondary)',
                    border: `1px solid ${selectedER.hospitalId === er.hospitalId ? 'var(--primary)' : 'var(--border)'}`,
                    fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                    transition: 'all var(--duration-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {er.hospitalName.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Hospital name + last updated */}
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>
                {selectedER.hospitalName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AvailBadge status={selectedER.availabilityStatus} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                  Updated {Math.round((Date.now() - new Date(selectedER.lastUpdated).getTime()) / 1000)}s ago
                </span>
              </div>
            </div>

            {/* Occupancy Rings */}
            <div className="card" style={{ marginBottom: 14 }}>
              <p className="section-title" style={{ marginBottom: 14 }}>Bed Occupancy</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', paddingBottom: 8 }}>
                <OccupancyRing
                  pct={selectedER.erOccupancyPercent}
                  color={selectedER.erOccupancyPercent >= 75 ? '#FF4757' : selectedER.erOccupancyPercent >= 50 ? '#FFA502' : '#2ED573'}
                  label="ER Beds"
                  sub={`${selectedER.erBedsAvailable}/${selectedER.erBedsTotal} free`}
                />
                <OccupancyRing
                  pct={selectedER.icuOccupancyPercent}
                  color={selectedER.icuOccupancyPercent >= 75 ? '#FF4757' : selectedER.icuOccupancyPercent >= 50 ? '#FFA502' : '#2ED573'}
                  label="ICU Beds"
                  sub={`${selectedER.icuBedsAvailable}/${selectedER.icuBedsTotal} free`}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 8 }}>
                  <div style={{
                    background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)',
                    borderRadius: 'var(--radius-md)', padding: '10px 14px', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#FF4757', lineHeight: 1 }}>
                      {selectedER.erWaitMinutes}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>min wait</div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>ER Wait<br />Time</span>
                </div>
              </div>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{selectedER.hasHelipad ? '🚁' : '—'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Helipad</div>
              </div>
              <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{selectedER.hasBloodBank ? '🩸' : '—'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Blood Bank</div>
              </div>
              <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--info)', marginBottom: 2 }}>
                  {selectedER.traumaLevel}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Trauma Lvl</div>
              </div>
              <div
                className="card"
                onClick={() => { setAlertHosp(hospitals.find(h => h.id === selectedER.hospitalId) ?? hospitals[0]); setActiveTab('alert'); }}
                style={{ flex: 1, textAlign: 'center', padding: '10px 8px', cursor: 'pointer', background: 'rgba(0,201,167,0.08)', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>🚨</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 700 }}>Alert ER</div>
              </div>

            </div>

            {/* On-Call Specialists */}
            <div className="card" style={{ marginBottom: 14 }}>
              <p className="section-title" style={{ marginBottom: 12 }}>On-Call Specialists</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedER.onCallSpecialists.map((sp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `hsl(${(i * 60) % 360},60%,25%)`,
                      border: `2px solid hsl(${(i * 60) % 360},60%,45%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.75rem', color: `hsl(${(i * 60) % 360},60%,75%)`,
                    }}>
                      {sp.name.split(' ').filter(w => w.startsWith('Dr') ? false : true)[0]?.[0] ?? 'D'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{sp.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{sp.specialization}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ED573' }} />
                        <span style={{ fontSize: '0.65rem', color: '#2ED573', fontWeight: 600 }}>On Duty</span>
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>since {sp.availableSince}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost flex-1 btn-sm" id="er-call-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Phone size={14} /> Call ER
              </button>
              <button className="btn btn-primary flex-1 btn-sm" id="er-alert-btn"
                onClick={() => { setAlertHosp(hospitals.find(h => h.id === selectedER.hospitalId) ?? hospitals[0]); setActiveTab('alert'); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Send size={14} /> Send Pre-Arrival Alert
              </button>
            </div>
          </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3 · PRE-ARRIVAL ER ALERT SYSTEM
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'alert' && (
          <div className="animate-fade-in">
            {/* Destination hospital */}
            <div className="card" style={{ marginBottom: 14, borderColor: 'var(--border-primary)', background: 'rgba(0,201,167,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '1.6rem' }}>🏥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Destination Hospital</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{alertHospital.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{alertHospital.address}</div>
                </div>
                <div style={{ background: '#FF4757', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: 700, color: '#fff' }}>
                  CRITICAL
                </div>
              </div>
            </div>

            {/* Alert Status Stepper */}
            <div className="card" style={{ marginBottom: 14 }}>
              <p className="section-title" style={{ marginBottom: 14 }}>Alert Status</p>
              <div className="alert-stepper">
                {([
                  { id: 'preparing',    label: 'Preparing',    desc: 'Building health profile packet' },
                  { id: 'sent',         label: 'Transmitted',  desc: 'Profile & ETA sent to ER desk' },
                  { id: 'acknowledged', label: 'Acknowledged', desc: 'Hospital team is ready & waiting' },
                ] as { id: AlertStep; label: string; desc: string }[]).map((step, i, arr) => {
                  const stepIdx = ['preparing', 'sent', 'acknowledged'].indexOf(alertStep);
                  const thisIdx = i;
                  const done = stepIdx > thisIdx;
                  const active = stepIdx === thisIdx;
                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: done ? 'var(--primary)' : active ? 'rgba(0,201,167,0.2)' : 'var(--bg-elevated)',
                          border: `2px solid ${done || active ? 'var(--primary)' : 'var(--border)'}`,
                          transition: 'all 0.5s ease',
                          boxShadow: active ? '0 0 12px rgba(0,201,167,0.4)' : 'none',
                        }}>
                          {done ? <CheckCircle2 size={14} color="var(--bg-base)" /> :
                           active ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-ring 1.5s ease-out infinite' }} /> :
                           <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />}
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{
                            width: 2, height: 28, marginTop: 2,
                            background: done ? 'var(--primary)' : 'var(--border)',
                            transition: 'background 0.5s ease',
                          }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: done || active ? 'var(--text-primary)' : 'var(--text-tertiary)', marginBottom: 2 }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: done || active ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Digital Health Profile packet */}
            <div className="card" style={{ marginBottom: 14 }}>
              <p className="section-title" style={{ marginBottom: 12 }}>📋 Digital Health Profile (Transmitted)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Patient', value: MOCK_USER.fullName },
                  { label: 'Blood Group', value: MOCK_HEALTH_PROFILE.bloodGroup },
                  { label: 'Allergies', value: MOCK_HEALTH_PROFILE.allergies.join(', ') },
                  { label: 'Conditions', value: MOCK_HEALTH_PROFILE.chronicConditions.join(', ') },
                  { label: 'Medications', value: MOCK_HEALTH_PROFILE.currentMedications.slice(0, 2).join(', ') },
                  { label: 'Insurance', value: MOCK_HEALTH_PROFILE.insuranceProvider ?? 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Transport</span>
                  <span style={{ fontWeight: 600 }}>🚑 Ambulance</span>
                </div>
              </div>
            </div>

            {/* ETA countdown */}
            {alertStep !== 'preparing' && (
              <div className="card animate-fade-in" style={{ marginBottom: 14, textAlign: 'center', background: 'rgba(255,71,87,0.06)', borderColor: 'rgba(255,71,87,0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Live ETA to Hospital</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.6rem', color: '#FF4757', letterSpacing: '-0.02em' }}>
                  {fmtEta(etaSeconds)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>minutes : seconds</div>
              </div>
            )}

            {/* Acknowledged card */}
            {alertStep === 'acknowledged' && (
              <div className="card animate-fade-in" style={{ marginBottom: 14, borderColor: 'var(--border-primary)', background: 'rgba(0,201,167,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CheckCircle2 size={20} color="var(--primary)" />
                  <p className="section-title" style={{ marginBottom: 0 }}>Hospital Ready — Team Prepped</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ER Bay Assigned</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{MOCK_PRE_ARRIVAL_ALERT.erBayAssigned}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Prep Team:</div>
                  {MOCK_PRE_ARRIVAL_ALERT.prepTeam.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              id="send-alert-btn"
              className="btn btn-danger btn-block"
              onClick={handleSendAlert}
              disabled={alertStep !== 'preparing'}
              style={{
                opacity: alertStep !== 'preparing' ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {alertSending ? (
                <><RefreshCw size={16} className="spin" /> Transmitting to ER…</>
              ) : alertStep === 'preparing' ? (
                <><Send size={16} /> Send Pre-Arrival Alert to ER</>
              ) : alertStep === 'sent' ? (
                <><CheckCircle2 size={16} /> Alert Sent — Awaiting Acknowledgement</>
              ) : (
                <><CheckCircle2 size={16} /> ER Team Acknowledged & Ready</>
              )}
            </button>

            {alertStep !== 'preparing' && (
              <button onClick={() => { setAlertStep('preparing'); setEtaSeconds(4 * 60); }}
                style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', width: '100%', fontFamily: 'var(--font-body)' }}>
                Reset demo
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4 · LIVE ROUTING & NAVIGATION
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'route' && (
          <div className="animate-fade-in">
            {/* Hospital route selector */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
              {MOCK_HOSPITAL_ROUTES.map(r => (
                <button
                  key={r.hospitalId}
                  id={`route-select-${r.hospitalId}`}
                  onClick={() => setSelectedRoute(r)}
                  style={{
                    flexShrink: 0, padding: '6px 12px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                    background: selectedRoute.hospitalId === r.hospitalId ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedRoute.hospitalId === r.hospitalId ? 'var(--bg-base)' : 'var(--text-secondary)',
                    border: `1px solid ${selectedRoute.hospitalId === r.hospitalId ? 'var(--primary)' : 'var(--border)'}`,
                    fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                    transition: 'all var(--duration-fast)', whiteSpace: 'nowrap',
                  }}
                >
                  {r.hospitalName.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Map panel */}
            <div style={{
              height: 220, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
              overflow: 'hidden', marginBottom: 14, position: 'relative',
              background: 'var(--bg-surface)',
            }}>
              {/* Grid background */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(0,201,167,0.04) 1px, transparent 1px), linear-gradient(90deg,rgba(0,201,167,0.04) 1px,transparent 1px)',
                backgroundSize: '20px 20px',
              }} />

              {/* Animated route line */}
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3D91FF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#00C9A7" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {/* Road segments */}
                <path d="M 55,165 L 55,110 L 200,110 L 200,55 L 300,55" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />
                {/* Animated route */}
                {animRoute && (
                  <path
                    d="M 55,165 L 55,110 L 200,110 L 200,55 L 300,55"
                    stroke="url(#routeGrad)" strokeWidth="4" fill="none" strokeLinecap="round"
                    filter="url(#glow)"
                    style={{
                      strokeDasharray: 600,
                      strokeDashoffset: 600,
                      animation: 'routeDraw 1.4s cubic-bezier(0.22,1,0.36,1) forwards',
                    }}
                  />
                )}
                {/* Moving car dot */}
                {animRoute && (
                  <circle r="5" fill="#3D91FF" filter="url(#glow)"
                    style={{ animation: 'routeDraw 1.4s cubic-bezier(0.22,1,0.36,1) forwards', offsetPath: "path('M 55,165 L 55,110 L 200,110 L 200,55 L 300,55')" }}>
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 55,165 L 55,110 L 200,110 L 200,55 L 300,55" />
                  </circle>
                )}
              </svg>

              {/* You pin */}
              <div style={{ position: 'absolute', left: 48, top: 158, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3D91FF', border: '2px solid #fff', position: 'relative', zIndex: 2 }} />
                <div style={{ position: 'absolute', width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(61,145,255,0.35)', animation: 'sos-ripple 2s ease-out infinite' }} />
                <span style={{ marginTop: 6, fontSize: '0.55rem', color: '#3D91FF', fontWeight: 700, background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(61,145,255,0.3)' }}>YOU</span>
              </div>

              {/* Hospital pin */}
              <div style={{ position: 'absolute', left: 293, top: 48, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>🏥</span>
                <span style={{ fontSize: '0.5rem', color: 'var(--primary)', fontWeight: 700, background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-primary)', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedRoute.hospitalName.split(' ')[0]}
                </span>
              </div>

              {/* Traffic badge */}
              <div style={{
                position: 'absolute', top: 8, right: 8, background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600,
              }}>
                <TrafficBadge tc={selectedRoute.trafficCondition} />
              </div>

              {/* Route label */}
              <div style={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)',
                padding: '4px 10px', display: 'flex', gap: 12, fontSize: '0.68rem', color: 'var(--text-secondary)',
              }}>
                <span>📍 {selectedRoute.distanceKm} km</span>
                <span>⏱ ~{selectedRoute.durationMinutes} min</span>
              </div>
            </div>

            {/* Route summary card */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{selectedRoute.hospitalName}</h4>
                <TrafficBadge tc={selectedRoute.trafficCondition} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{selectedRoute.distanceKm}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>km away</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#FFA502' }}>{selectedRoute.durationMinutes}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>min ETA</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#8B5CF6' }}>{erForHosp(selectedRoute.hospitalId)?.erWaitMinutes ?? '—'}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>min ER wait</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <a
                href={selectedRoute.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="open-maps-btn"
                className="btn btn-primary flex-1"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', color: 'inherit' }}
              >
                <ExternalLink size={16} /> Open in Google Maps
              </a>
              <button
                id="share-eta-btn"
                className="btn btn-ghost"
                onClick={() => alert('ETA shared with family members!')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Other hospitals route list */}
            <p className="section-title" style={{ marginBottom: 10 }}>All Hospital Routes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_HOSPITAL_ROUTES.map((r, i) => {
                const er = erForHosp(r.hospitalId);
                return (
                  <div
                    key={r.hospitalId}
                    id={`route-card-${r.hospitalId}`}
                    className="card animate-fade-in"
                    style={{
                      animationDelay: `${i * 50}ms`, cursor: 'pointer', padding: '12px 14px',
                      borderColor: selectedRoute.hospitalId === r.hospitalId ? 'var(--primary)' : 'var(--border)',
                    }}
                    onClick={() => setSelectedRoute(r)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 2 }}>{r.hospitalName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TrafficBadge tc={r.trafficCondition} />
                          {er && <AvailBadge status={er.availabilityStatus} />}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{r.durationMinutes}m</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{r.distanceKm} km</div>
                      </div>
                      <ChevronRight size={14} color="var(--text-tertiary)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <style>{`
        .filter-chip {
          padding: 5px 12px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
          transition: all var(--duration-fast);
        }
        .filter-chip:hover { border-color: var(--border-light); color: var(--text-primary); }
        .filter-chip.active {
          background: rgba(0,201,167,0.15);
          border-color: var(--primary);
          color: var(--primary);
        }
        .flex-1 { flex: 1; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes routeDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-ring {
          0%   { opacity: 1; transform: scale(1); }
          70%  { opacity: 0; transform: scale(2); }
          100% { opacity: 0; transform: scale(2); }
        }
        .alert-stepper { display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
};

export default HospitalPage;
