import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, Phone, MapPin, Clock, Tag } from 'lucide-react';
import { GENERIC_MAP } from '../data/mockData';

// Deterministic hash for consistent simulated data per pharmacy
function simHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PharmacyPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { fetchNearbyFacilities } = await import('../lib/overpass');
          const facilities = await fetchNearbyFacilities(pos.coords.latitude, pos.coords.longitude, 'pharmacy');
          
          if (facilities.length === 0) {
            setPharmacies([]);
            setLoadingPharmacies(false);
            return;
          }

          const MOCK_MEDS = [
            { name: 'Paracetamol 500mg', price: 45, available: true, quantity: 120 },
            { name: 'Azithromycin 500mg', price: 120, available: true, quantity: 50 },
            { name: 'Amoxicillin 250mg', price: 80, available: false, quantity: 0 },
            { name: 'Cetirizine 10mg', price: 35, available: true, quantity: 200 },
            { name: 'Salbutamol Inhaler', price: 150, available: true, quantity: 15 },
            { name: 'Vitamin D3 60k', price: 95, available: true, quantity: 80 },
            { name: 'Pantoprazole 40mg', price: 65, available: false, quantity: 0 },
            { name: 'Metformin 500mg', price: 55, available: true, quantity: 300 }
          ];

          const mapped = facilities.map(f => {
            const seed = simHash(f.name || f.id);
            return {
              id: f.id,
              name: f.name,
              lat: f.lat,
              lng: f.lng,
              address: f.address,
              distanceKm: f.distanceKm,
              rating: parseFloat((3.5 + (seed % 15) / 10).toFixed(1)),
              is24h: seed % 3 === 0,
              medicines: MOCK_MEDS.filter((_, i) => ((seed + i) % 2) !== 0).slice(0, 5)
            };
          });
          
          setPharmacies(mapped);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingPharmacies(false);
        }
      },
      () => {
        setLoadingPharmacies(false);
      }
    );
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().length >= 3 ? query : '');
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const genericSuggestion = debouncedQuery ? GENERIC_MAP[debouncedQuery.toLowerCase().trim()] : null;

  const filtered = pharmacies.filter(p => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase().trim();
    const gq = genericSuggestion ? genericSuggestion.toLowerCase() : null;
    return p.name.toLowerCase().includes(q) ||
           p.medicines.some(m => m.name.toLowerCase().includes(q) || (gq && m.name.toLowerCase().includes(gq)));
  });

  const genericPharmacies = genericSuggestion
    ? pharmacies.map(p => {
        const med = p.medicines.find(m => m.name.toLowerCase() === genericSuggestion.toLowerCase());
        return med ? { pharmacy: p, med } : null;
      }).filter((item): item is NonNullable<typeof item> => item !== null && item.med.available)
    : [];

  return (
    <div className="app-shell">
      <div className="page-header pt-[env(safe-area-inset-top)]">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Nearby Pharmacies</h2>
          <p className="text-xs text-secondary">{pharmacies.length} pharmacies found</p>
        </div>
      </div>

      <div className="page-content">
        {/* Search */}
        <div className="search-wrap animate-fade-in">
          <Search size={16} color="var(--text-tertiary)" className="search-icon" />
          <input
            className="input search-input"
            placeholder="Search medicine or pharmacy..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            id="pharmacy-search"
          />
        </div>

        {/* Dedicated Generic Medicines Section */}
        <div className="card mb-4 animate-fade-in" style={{ border: '1px solid #2ED573', background: 'linear-gradient(145deg, rgba(46,213,115,0.08) 0%, rgba(46,213,115,0.02) 100%)' }}>
          <div className="flex items-center justify-between mb-3 border-b border-green-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="badge" style={{ background: '#2ED573', color: '#111', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px' }}>
                <Tag size={10} className="mr-1 inline" /> GENERIC MEDICINES
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: '#2ED573' }}>Save up to 60%</span>
          </div>
          
          {!debouncedQuery && !genericSuggestion && (
             <div className="py-2 text-center animate-fade-in">
               <p className="text-sm text-secondary">Search for a branded drug (like <strong style={{ color: 'var(--text-primary)' }}>Ventolin</strong> or <strong style={{ color: 'var(--text-primary)' }}>Crocin</strong>) to find affordable generic alternatives nearby.</p>
             </div>
          )}

          {debouncedQuery && !genericSuggestion && (
             <div className="py-2 text-center animate-fade-in">
               <p className="text-sm text-secondary">No generic alternative found for <strong style={{ color: 'var(--text-primary)' }}>{debouncedQuery}</strong>.</p>
             </div>
          )}
          
          {genericSuggestion && (
            <div className="animate-fade-in">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-lg mb-1">{genericSuggestion}</h3>
                  <p className="text-xs text-secondary mb-1">Equivalent to <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{debouncedQuery}</strong></p>
                  <p className="text-xs text-tertiary">Contains the same active ingredients and meets identical quality standards.</p>
                </div>
              </div>

              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Available nearby at:</p>
              <div className="flex flex-col gap-2">
                {genericPharmacies.length > 0 ? genericPharmacies.map((gp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--surface-color)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-sm font-semibold">{gp.pharmacy.name}</p>
                      <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {gp.pharmacy.distanceKm} km away
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold text-brand">₹{gp.med.price}</p>
                      <button className="btn btn-primary mt-1" style={{ padding: '4px 12px', fontSize: '0.7rem', minHeight: 'auto', height: 'auto' }}>Order</button>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-secondary italic">Currently out of stock at nearby pharmacies.</p>
                )}
              </div>
            </div>
          )}
        </div>

        
        {/* Your prescription */}
        <div className="card card-glass rx-card animate-fade-in delay-100">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.5rem' }}>💊</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Your Active Prescriptions</p>
              <p className="text-xs text-secondary">Salbutamol Inhaler · Vitamin D3</p>
            </div>
            <button className="btn btn-primary btn-sm">Find All</button>
          </div>
        </div>

        {loadingPharmacies ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse" style={{ height: 180 }}>
                <div style={{ height: 20, background: 'var(--bg-elevated)', borderRadius: 4, width: '60%', marginBottom: 12 }} />
                <div style={{ height: 14, background: 'var(--bg-elevated)', borderRadius: 4, width: '40%', marginBottom: 20 }} />
                <div style={{ height: 40, background: 'var(--bg-elevated)', borderRadius: 4, width: '100%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10, opacity: 0.5 }}>🏬</span>
            <p>No pharmacies found.</p>
          </div>
        ) : filtered.map((pharmacy, i) => (
          <div
            key={pharmacy.id}
            className="card pharmacy-card animate-fade-in"
            style={{ animationDelay: `${150 + i * 80}ms`, marginBottom: 12 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display" style={{ fontSize: '0.9375rem' }}>{pharmacy.name}</h4>
                  {pharmacy.is24h && <span className="badge badge-success">24/7</span>}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={11} color="var(--text-tertiary)" />
                  <span className="text-xs text-secondary">{pharmacy.distanceKm} km · {pharmacy.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star size={11} color="#FFA502" fill="#FFA502" />
                <span className="text-xs font-semibold">{pharmacy.rating}</span>
              </div>
            </div>

            {/* Medicine stock preview */}
            <div className="medicine-list">
              {pharmacy.medicines
                .filter(m => {
                  if (!debouncedQuery) return true;
                  const q = debouncedQuery.toLowerCase().trim();
                  const gq = genericSuggestion ? genericSuggestion.toLowerCase() : null;
                  return m.name.toLowerCase().includes(q) || (gq && m.name.toLowerCase().includes(gq));
                })
                .slice(0, 3)
                .map((med, mi) => {
                  const isGeneric = genericSuggestion && med.name.toLowerCase() === genericSuggestion.toLowerCase();
                  return (
                    <div key={mi} className="medicine-row">
                      <div className="flex items-center gap-2">
                        <div className={`stock-dot ${med.available ? 'in-stock' : 'out-stock'}`} />
                        <div className="flex flex-col">
                           <span className="text-xs flex items-center gap-2">
                             {med.name}
                             {isGeneric && <span className="badge" style={{ backgroundColor: 'rgba(46, 213, 115, 0.15)', color: '#2ED573', padding: '2px 6px', fontSize: '0.6rem' }}><Tag size={8} className="mr-1 inline" />Generic</span>}
                           </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {med.price && <span className="text-xs font-semibold text-brand">₹{med.price}</span>}
                        <span className="text-xs" style={{ color: med.available ? '#2ED573' : 'var(--text-tertiary)' }}>
                          {med.available ? 'In Stock' : 'Out'}
                        </span>
                      </div>
                    </div>
                  );
              })}
            </div>

            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary flex-1 btn-sm" id={`order-pharmacy-${pharmacy.id}`}>
                🛒 Order
              </button>
              <button className="btn btn-ghost btn-sm">
                <Phone size={14} />
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => setExpandedId(expandedId === pharmacy.id ? null : pharmacy.id)}>
                {expandedId === pharmacy.id ? 'Less' : 'More'}
              </button>
            </div>

            {expandedId === pharmacy.id && (
              <div className="expanded-stock animate-fade-in">
                <p className="text-xs text-tertiary uppercase mb-2">Full Inventory</p>
                {pharmacy.medicines.map((med, mi) => {
                  const isGeneric = genericSuggestion && med.name.toLowerCase() === genericSuggestion.toLowerCase();
                  return (
                    <div key={mi} className="medicine-row">
                      <div className="flex items-center gap-2">
                        <div className={`stock-dot ${med.available ? 'in-stock' : 'out-stock'}`} />
                        <span className="text-xs flex items-center gap-2">
                          {med.name}
                          {isGeneric && <span className="badge" style={{ backgroundColor: 'rgba(46, 213, 115, 0.15)', color: '#2ED573', padding: '2px 6px', fontSize: '0.6rem' }}><Tag size={8} className="mr-1 inline" />Generic</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {med.quantity !== undefined && <span className="text-xs text-secondary">Qty: {med.quantity}</span>}
                        {med.price && <span className="text-xs font-semibold text-brand">₹{med.price}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .search-wrap {
          position: relative;
          margin-bottom: 16px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .search-input { padding-left: 40px; }
        .rx-card { margin-bottom: 16px; cursor: default; }
        .pharmacy-card { cursor: default; }
        .medicine-list { display: flex; flex-direction: column; gap: 1px; }
        .medicine-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
        }
        .medicine-row:last-child { border-bottom: none; }
        .stock-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .stock-dot.in-stock { background: #2ED573; }
        .stock-dot.out-stock { background: var(--text-tertiary); }
        .expanded-stock {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
};

export default PharmacyPage;
