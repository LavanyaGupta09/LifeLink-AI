import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, Phone, MapPin, Tag, ShoppingCart, Upload, CheckCircle2, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { GENERIC_MAP } from '../data/mockData';
import { useGeolocation } from '../hooks/useGeolocation';
import LocationFallback from '../components/LocationFallback';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { medicinesAPI } from '../services/api';

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
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  
  // DrugSetu API States
  const [drugSetuResults, setDrugSetuResults] = useState<any[]>([]);
  const [loadingDrugSetu, setLoadingDrugSetu] = useState(false);
  const [drugSetuError, setDrugSetuError] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  
  const [rxUploaded, setRxUploaded] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setRxUploaded(true);
    }
  };

  const { location, status, errorMessage, searchCity } = useGeolocation();

  const [apiError, setApiError] = useState<string | null>(null);
  const isFetching = React.useRef(false);

  const fetchPharms = async (lat: number, lng: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoadingPharmacies(true);
    setApiError(null);
    try {
        const { fetchNearbyFacilities } = await import('../lib/overpass');
        const facilities = await fetchNearbyFacilities(lat, lng, 'pharmacy');
          
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
            { name: 'Metformin 500mg', price: 55, available: true, quantity: 300 },
            { name: 'Ibuprofen 400mg', price: 50, available: true, quantity: 100 },
            { name: 'Omeprazole 20mg', price: 70, available: true, quantity: 150 },
            { name: 'Losartan 50mg', price: 85, available: true, quantity: 90 },
            { name: 'Amlodipine 5mg', price: 40, available: true, quantity: 200 },
            { name: 'Atorvastatin 20mg', price: 110, available: false, quantity: 0 },
            { name: 'Levothyroxine 50mcg', price: 130, available: true, quantity: 60 },
            { name: 'Ciprofloxacin 500mg', price: 90, available: true, quantity: 75 },
            { name: 'Sertraline 50mg', price: 160, available: true, quantity: 40 }
          ];

          const mapped = facilities.map(f => {
            const seed = simHash(f.name || f.id);
            const isJanAushadhi = seed % 4 === 0;
            return {
              id: f.id,
              name: f.name || 'Local Pharmacy',
              lat: f.lat,
              lng: f.lng,
              address: f.address || 'Local Street',
              distanceKm: f.distanceKm,
              rating: parseFloat((3.5 + (seed % 15) / 10).toFixed(1)),
              is24h: seed % 3 === 0,
              isJanAushadhi: isJanAushadhi,
              medicines: MOCK_MEDS.filter((_, i) => ((seed + i) % 2) !== 0).slice(0, 5),
              isDemo: f.isDemo
            };
          });
          
          setPharmacies(mapped);
      } catch (e: any) {
        console.error(e);
      } finally {
        setLoadingPharmacies(false);
        isFetching.current = false;
      }
  };

  useEffect(() => {
    if (!location) return;
    fetchPharms(location.lat, location.lng);
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().length >= 3 ? query : '');
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Query DrugSetu whenever debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery) {
      setDrugSetuResults([]);
      setSelectedMedicine(null);
      return;
    }
    
    const searchMedicines = async () => {
      setLoadingDrugSetu(true);
      setDrugSetuError(null);
      setSelectedMedicine(null);
      try {
        const response = await medicinesAPI.search(debouncedQuery);
        if (response.data && response.data.data) {
          setDrugSetuResults(response.data.data);
        } else {
          setDrugSetuResults([]);
        }
      } catch (e: any) {
        setDrugSetuError(e.response?.data?.detail || "Medicine service is temporarily unavailable. Please try again.");
      } finally {
        setLoadingDrugSetu(false);
      }
    };
    
    searchMedicines();
  }, [debouncedQuery]);

  const genericSuggestion = debouncedQuery ? GENERIC_MAP[debouncedQuery.toLowerCase().trim()] : null;

  const filtered = pharmacies.filter(p => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase().trim();
    const gq = genericSuggestion ? genericSuggestion.toLowerCase() : null;
    return p.name.toLowerCase().includes(q) ||
           p.medicines.some((m: any) => m.name.toLowerCase().includes(q) || (gq && m.name.toLowerCase().includes(gq)));
  });

  const sendOrder = async (pharmacy: any, medicine: any) => {
    const payload = {
      id: `rx_${Date.now()}`,
      pharmacy_id: pharmacy.id,
      patient_id: user?.id || `anon_${Date.now()}`,
      patient_name: user?.fullName || 'Guest Patient',
      medicine_name: medicine.name,
      is_generic_requested: !!genericSuggestion,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Broadcast via Real-time to B2B Pharmacy Workspace
    try {
      await supabase.channel('pharmacy_orders').send({
        type: 'broadcast',
        event: 'incoming_order',
        payload: payload
      });
      setTimeout(() => navigate('/tracking/medicine'), 500);
    } catch (e) {
      console.error(e);
      setTimeout(() => navigate('/tracking/medicine'), 500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary font-sans flex flex-col pb-24 px-6 py-6 ">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background backdrop-blur-xl border-b border-border px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-textPrimary active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Pharmacy</h1>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1"><MapPin size={10} /> {location ? `${pharmacies.length} pharmacies nearby` : 'Locating...'}</p>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-6">
        {status === 'denied' || status === 'error' ? (
           <LocationFallback onSearch={searchCity} errorMessage={errorMessage} />
        ) : (
          <>
            {/* WIDGET 1: SEARCH & SUBSTITUTE ENGINE */}
            <div className="w-full bg-gradient-to-br from-[#131F35] to-background border border-border rounded-3xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <h2 className="text-2xl font-black text-textPrimary mb-2 relative z-10 leading-tight">Find Generic <br/><span className="text-emerald-400">Substitutes</span></h2>
              <p className="text-sm text-textSecondary mb-5 relative z-10">Search for branded medicines and save up to 80% with Jan Aushadhi generic equivalents.</p>
              <div className="relative z-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                <input 
                  className="w-full bg-background border border-emerald-500/30 rounded-2xl py-4 pl-12 pr-4 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50 transition-all text-lg shadow-inner"
                  placeholder="e.g., Augmentin..."
                  value={query} onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* WIDGET 1.5: DRUGSETU MEDICINE SEARCH RESULTS */}
            {debouncedQuery && (
              <div className="animate-fade-in-up mt-2">
                <h3 className="text-lg font-bold text-textPrimary mb-4">Medicine Information</h3>
                
                {loadingDrugSetu ? (
                  <div className="bg-card border border-border rounded-3xl p-5 text-center flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-textSecondary text-sm font-bold">Searching medicines...</p>
                  </div>
                ) : drugSetuError ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 text-center flex flex-col items-center gap-3">
                    <AlertCircle className="text-rose-500" size={24} />
                    <p className="text-rose-500 text-sm font-bold">{drugSetuError}</p>
                  </div>
                ) : drugSetuResults.length > 0 && !selectedMedicine ? (
                  <div className="flex flex-col gap-3">
                    {drugSetuResults.slice(0, 5).map((med, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedMedicine(med)}
                        className="bg-card hover:bg-surface border border-border hover:border-[#3D91FF]/50 rounded-2xl p-4 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-textPrimary capitalize">{med.medicineName || med.name || 'Unknown Medicine'}</h4>
                          <p className="text-xs text-textSecondary mt-1">{med.dosageForm || 'Tablet'} • {med.strength || 'N/A'}</p>
                        </div>
                        <ChevronRight className="text-textTertiary" size={16} />
                      </div>
                    ))}
                  </div>
                ) : drugSetuResults.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-5 text-center">
                    <p className="text-textSecondary text-sm">No medicines found. Try another medicine name.</p>
                  </div>
                ) : null}

                {/* Selected Medicine Details */}
                {selectedMedicine && (
                  <div className="bg-card border border-border rounded-3xl p-5 relative overflow-hidden animate-fade-in mt-4">
                    <button 
                      onClick={() => setSelectedMedicine(null)}
                      className="absolute top-4 right-4 w-8 h-8 bg-surface rounded-full flex items-center justify-center text-textSecondary hover:text-textPrimary"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    
                    <div className="flex items-start gap-4 mb-4">
                      {selectedMedicine.imageUrl ? (
                        <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 border border-border flex items-center justify-center">
                          <img 
                            src={selectedMedicine.imageUrl} 
                            alt={selectedMedicine.medicineName || selectedMedicine.name} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-[#3D91FF]/10 text-[#3D91FF] rounded-xl shrink-0 flex items-center justify-center border border-[#3D91FF]/20">
                          <Tag size={24} />
                        </div>
                      )}
                      
                      <div className="pr-10">
                        <h3 className="text-xl font-bold text-textPrimary capitalize">{selectedMedicine.medicineName || selectedMedicine.name || 'Unknown Medicine'}</h3>
                        <p className="text-sm font-medium text-textSecondary mt-1">{selectedMedicine.manufacturer || 'Information not available'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-surface rounded-xl p-3 border border-border">
                        <span className="text-[10px] uppercase font-bold text-textTertiary block mb-1">Composition</span>
                        <p className="text-sm font-bold text-textPrimary">{selectedMedicine.genericName || selectedMedicine.composition || 'Information not available'}</p>
                      </div>
                      <div className="bg-surface rounded-xl p-3 border border-border">
                        <span className="text-[10px] uppercase font-bold text-textTertiary block mb-1">Price</span>
                        <p className="text-sm font-bold text-emerald-400">{selectedMedicine.price ? `₹${selectedMedicine.price}` : 'Information not available'}</p>
                      </div>
                    </div>
                    
                    {selectedMedicine.uses && selectedMedicine.uses.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-bold text-textTertiary block mb-2">Uses / Indications</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedicine.uses.map((use: string, i: number) => (
                            <span key={i} className="text-xs bg-[#3D91FF]/10 text-[#3D91FF] px-2.5 py-1 rounded-lg font-medium">{use}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedMedicine.alternatives && selectedMedicine.alternatives.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-bold text-textTertiary block mb-2">Generic / Alternative Options</span>
                        <div className="flex flex-col gap-2">
                          {selectedMedicine.alternatives.map((alt: string, i: number) => (
                            <div key={i} className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-lg font-medium border border-emerald-500/20">{alt}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-3 mt-4">
                      <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-yellow-500/90 font-medium leading-relaxed">
                        Medicine information is for reference. Always confirm the appropriate medicine and dosage with a qualified doctor or pharmacist.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WIDGET 2: GENERIC COMPARISON ENGINE (Visible if substitute found) */}
            {genericSuggestion && (
              <div className="animate-fade-in-up">
                <h3 className="text-lg font-bold text-textPrimary mb-4">Substitute Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Branded Card */}
                  <div className="bg-card border border-border rounded-3xl p-4 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
                    <span className="text-[10px] uppercase font-bold text-textSecondary tracking-widest mb-2 mt-1">Branded</span>
                    <h3 className="text-textPrimary font-bold text-sm mb-1 capitalize">{debouncedQuery}</h3>
                    <p className="text-textTertiary text-[10px] leading-tight mb-4 px-2">Standard commercial formulation</p>
                    <p className="text-rose-400 font-bold mt-auto text-xl">₹200</p>
                  </div>
                  
                  {/* Generic Card */}
                  <div className="bg-emerald-900/20 border border-emerald-500/40 rounded-3xl p-4 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] font-bold px-2 py-1 rounded-bl-xl tracking-wider">SAVE 80%</div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-2 mt-1">Generic Salt</span>
                    <h3 className="text-textPrimary font-bold text-sm mb-1 text-emerald-50">{genericSuggestion}</h3>
                    <p className="text-emerald-500/60 text-[10px] leading-tight mb-4 px-2">Jan Aushadhi Certified</p>
                    <p className="text-emerald-400 font-bold mt-auto text-xl">₹40</p>
                  </div>
                </div>
              </div>
            )}

            {debouncedQuery && !genericSuggestion && (
               <div className="bg-card border border-border rounded-2xl p-4 text-center">
                 <p className="text-sm text-textSecondary">No generic alternative found for <strong className="text-textPrimary">{debouncedQuery}</strong>.</p>
               </div>
            )}

            {/* WIDGET 3: PRESCRIPTION UPLOAD & NEARBY PHARMACIES */}
            <section className="mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-textPrimary">Nearby Pharmacies</h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border active:scale-95 transition-all ${
                    rxUploaded 
                      ? 'text-textPrimary bg-emerald-600 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}
                >
                  {rxUploaded ? <CheckCircle2 size={14} /> : <Upload size={14} />} 
                  {rxUploaded ? 'Rx Attached' : 'Upload Rx'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
              </div>

              {loadingPharmacies ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card rounded-3xl p-5 h-32 animate-pulse border border-border"></div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 bg-card border border-border rounded-3xl">
                  <span className="text-4xl block mb-2 opacity-50">🏬</span>
                  <p className="text-textSecondary font-medium">No pharmacies found nearby.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.length > 0 && filtered[0].isDemo && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg self-start flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      Prototype Nearby Data
                    </div>
                  )}
                  {filtered.map((pharmacy, i) => (
                    <div key={pharmacy.id} className="bg-gradient-to-br from-[#131B2F] to-background border border-border rounded-3xl p-5 relative overflow-hidden group hover:border-border transition-colors">
                      {/* Jan Aushadhi Tag */}
                      {pharmacy.isJanAushadhi && (
                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-xl border-l border-b border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-400" /> Jan Aushadhi Partner
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="pr-12">
                          <h4 className="font-bold text-textPrimary text-lg leading-tight mb-1">{pharmacy.name}</h4>
                          <p className="text-xs font-medium text-textSecondary flex items-center gap-1"><MapPin size={10} /> {pharmacy.distanceKm} km away</p>
                        </div>
                        <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-lg">
                          <Star size={10} color="#FFA502" fill="#FFA502" />
                          <span className="text-xs font-bold text-textPrimary">{pharmacy.rating}</span>
                        </div>
                      </div>

                      {/* Stock Preview */}
                      <div className="bg-background rounded-xl p-3 border border-border mb-4">
                        <p className="text-[10px] uppercase font-bold text-textTertiary tracking-wider mb-2">Available Medicines</p>
                        <div className="flex flex-col gap-2">
                          {pharmacy.medicines.slice(0, 2).map((med: any, mi: number) => {
                            const isGeneric = genericSuggestion && med.name.toLowerCase() === genericSuggestion.toLowerCase();
                            return (
                              <div key={mi} className="flex justify-between items-center">
                                <span className="text-xs text-textSecondary font-medium flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${med.available ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                  {med.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isGeneric && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Generic</span>}
                                  <span className="text-xs font-bold text-textPrimary">₹{med.price}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {pharmacy.medicines.length > 2 && (
                          <button 
                            className="text-xs font-bold text-[#3D91FF] mt-2 flex items-center gap-1"
                            onClick={() => setExpandedId(expandedId === pharmacy.id ? null : pharmacy.id)}
                          >
                            {expandedId === pharmacy.id ? 'Hide Inventory' : `View ${pharmacy.medicines.length - 2} more`}
                          </button>
                        )}
                        
                        {/* Expanded stock */}
                        {expandedId === pharmacy.id && (
                           <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                             {pharmacy.medicines.slice(2).map((med: any, mi: number) => (
                              <div key={mi} className="flex justify-between items-center">
                                <span className="text-xs text-textSecondary font-medium flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${med.available ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                  {med.name}
                                </span>
                                <span className="text-xs font-bold text-textPrimary">₹{med.price}</span>
                              </div>
                             ))}
                           </div>
                        )}
                      </div>

                      {/* Action */}
                      <button 
                        onClick={() => sendOrder(pharmacy, pharmacy.medicines[0])}
                        className={`w-full font-bold py-3 rounded-xl transition-transform active:scale-95 flex justify-center items-center gap-2 shadow-lg ${
                          pharmacy.isJanAushadhi 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-textPrimary shadow-emerald-600/20' 
                          : 'bg-[#3D91FF]/10 hover:bg-[#3D91FF]/20 text-[#3D91FF] border border-[#3D91FF]/30'
                        }`}
                      >
                        <ShoppingCart size={16} /> 
                        {pharmacy.isJanAushadhi ? 'Send Order to Jan Aushadhi' : 'Order from Pharmacy'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PharmacyPage;
