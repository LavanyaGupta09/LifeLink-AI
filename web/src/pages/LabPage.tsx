import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, MapPin, Activity, 
  UploadCloud, CheckSquare, Square, ShieldCheck,
  ExternalLink, Trophy, AlertCircle, ChevronRight
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

const DIAGNOSTIC_PROVIDERS = [
  { id: 'p_1', name: 'Tata 1mg', url: 'https://1mg.com' },
  { id: 'p_2', name: 'PharmEasy', url: 'https://pharmeasy.in' },
  { id: 'p_3', name: 'Thyrocare', url: 'https://thyrocare.com' },
  { id: 'p_4', name: 'Apollo 24|7', url: 'https://apollo247.com' },
  { id: 'p_5', name: 'Dr Lal PathLabs', url: 'https://lalpathlabs.com' },
  { id: 'p_6', name: 'Metropolis Healthcare', url: 'https://metropolisindia.com' }
];

const AVAILABLE_TESTS = [
  { id: 't_1', name: 'Complete Blood Count (CBC)', category: 'Hematology' },
  { id: 't_2', name: 'HbA1c', category: 'Diabetology' },
  { id: 't_3', name: 'Vitamin B12', category: 'Vitamins' },
  { id: 't_4', name: 'Lipid Profile', category: 'Biochemistry' },
  { id: 't_5', name: 'Thyroid Profile', category: 'Hormones' },
  { id: 't_6', name: 'Liver Function Test', category: 'Biochemistry' },
  { id: 't_7', name: 'Kidney Function Test', category: 'Biochemistry' }
];

const LabPage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  
  const [query, setQuery] = useState('');
  
  // OCR & Comparison State
  const [ocrState, setOcrState] = useState<'idle' | 'uploading' | 'detected'>('idle');
  const [detectedTests, setDetectedTests] = useState([
    { ...AVAILABLE_TESTS[0], selected: true },
    { ...AVAILABLE_TESTS[1], selected: true },
    { ...AVAILABLE_TESTS[3], selected: true }
  ]);
  
  const [selectedTests, setSelectedTests] = useState<typeof AVAILABLE_TESTS>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleDetectedTest = (id: string) => {
    setDetectedTests(tests => tests.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const handleUploadPrescription = () => {
    setOcrState('uploading');
    setTimeout(() => {
      setOcrState('detected');
    }, 2000);
  };

  const handleCompareOCR = () => {
    const testsToCompare = detectedTests.filter(t => t.selected).map(t => ({ id: t.id, name: t.name, category: t.category }));
    setSelectedTests(testsToCompare);
    setShowComparison(true);
    setOcrState('idle');
  };

  const handleSelectIndividualTest = (test: typeof AVAILABLE_TESTS[0]) => {
    setSelectedTests([test]);
    setShowComparison(true);
    setQuery('');
  };

  const filteredTests = AVAILABLE_TESTS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  // Generate prototype prices dynamically
  const generateComparisonData = () => {
    if (selectedTests.length === 0) return [];
    
    return DIAGNOSTIC_PROVIDERS.map(provider => {
      let totalPrice = 0;
      selectedTests.forEach(test => {
        // Deterministic price calculation for demo purposes
        const basePrice = test.name.length * 25; 
        const variation = ((provider.name.length * test.id.length * 17) % 40) - 15; // -15% to +25%
        totalPrice += Math.round(basePrice * (1 + variation/100));
      });
      return {
        providerName: provider.name,
        price: totalPrice,
        currency: '₹',
        providerUrl: provider.url,
        lastUpdated: new Date().toISOString()
      };
    }).sort((a, b) => a.price - b.price);
  };

  const comparisonData = generateComparisonData();
  const lowestOption = comparisonData[0];
  const highestPrice = comparisonData.length > 0 ? comparisonData[comparisonData.length - 1].price : 0;
  const savings = lowestOption ? highestPrice - lowestOption.price : 0;

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary font-sans flex flex-col pb-24 relative px-6 py-6 ">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background backdrop-blur-xl border-b border-border px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-textPrimary active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight text-textPrimary">Compare Lab Tests</h1>
          <p className="text-xs text-[#3D91FF] font-medium flex items-center gap-1">
            <MapPin size={10} /> {location ? 'Finding best prices near you' : 'Locating...'}
          </p>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-6">
        
        {/* MAIN SECTION */}
        <section>
          {showComparison && comparisonData.length > 0 ? (
            <div className="animate-fade-in relative">
              <button onClick={() => setShowComparison(false)} className="text-textSecondary hover:text-textPrimary mb-4 flex items-center gap-1 text-sm font-bold bg-surface px-4 py-2 rounded-xl active:scale-95 transition-transform w-fit">
                <ArrowLeft size={16} /> Back to Search
              </button>
              
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle size={14} />
                Prices shown are prototype/demo prices.
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-black text-textPrimary mb-1">Price Comparison</h2>
                <p className="text-sm text-textSecondary">
                  Comparing prices for: <span className="font-bold text-textPrimary">{selectedTests.map(t => t.name).join(', ')}</span>
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* LOWEST PRICE HIGHLIGHT */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-background border border-emerald-500/50 rounded-3xl p-6 relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="absolute -top-4 right-6 bg-emerald-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 uppercase tracking-wider">
                    <Trophy size={12} /> Best Available Price
                  </div>
                  
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-textPrimary">{lowestOption.providerName}</h3>
                      <p className="text-emerald-400 text-sm font-bold flex items-center gap-1 mt-1">
                        <CheckSquare size={14} /> Lowest price found
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-textPrimary">₹{lowestOption.price}</p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-xl mb-6 flex items-center gap-2">
                    <span>💰</span> You can save ₹{savings} compared with the highest listed price.
                  </div>
                  
                  <button 
                    onClick={() => window.open(lowestOption.providerUrl, '_blank')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-500/20"
                  >
                    Visit Provider <ExternalLink size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-xs font-bold text-textTertiary uppercase tracking-widest">Other Options</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                {/* OTHER PROVIDERS */}
                <div className="flex flex-col gap-3">
                  {comparisonData.slice(1).map((provider, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center hover:border-border-light transition-colors">
                      <div>
                        <h3 className="font-bold text-textPrimary text-base">{provider.providerName}</h3>
                        <p className="text-xs text-textSecondary mt-1">Standard Pricing</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="font-black text-textPrimary text-lg">₹{provider.price}</p>
                        <button 
                          onClick={() => window.open(provider.providerUrl, '_blank')}
                          className="text-xs font-bold text-[#3D91FF] bg-[#3D91FF]/10 px-5 py-2 rounded-xl active:scale-95 transition-transform flex items-center gap-1 hover:bg-[#3D91FF]/20"
                        >
                          Visit <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Prescription Upload Button */}
              {ocrState === 'idle' && (
                <button 
                  onClick={handleUploadPrescription}
                  className="w-full bg-card border border-dashed border-[#3D91FF]/50 hover:border-[#3D91FF] hover:bg-[#3D91FF]/5 rounded-2xl p-5 flex items-center justify-center gap-4 mb-6 transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-[#3D91FF]/10 flex items-center justify-center group-hover:bg-[#3D91FF]/20 transition-colors">
                    <UploadCloud size={24} className="text-[#3D91FF]" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-textPrimary text-base">Upload Prescription</h3>
                    <p className="text-xs text-textSecondary mt-1">AI will extract tests and find the lowest prices</p>
                  </div>
                </button>
              )}

              {ocrState === 'uploading' && (
                <div className="w-full bg-card border border-[#3D91FF]/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 mb-6">
                  <Activity size={32} className="text-[#3D91FF] animate-pulse" />
                  <p className="text-sm font-bold text-[#3D91FF]">Scanning prescription with AI...</p>
                </div>
              )}

              {ocrState === 'detected' && (
                <div className="w-full bg-gradient-to-br from-[#131F35] to-background border border-[#3D91FF]/50 rounded-3xl p-6 mb-8 shadow-[0_0_30px_rgba(61,145,255,0.1)]">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-textPrimary flex items-center gap-2 text-lg">
                        <ShieldCheck size={20} className="text-[#3D91FF]" /> 
                        {detectedTests.length} tests detected
                      </h3>
                      <p className="text-sm text-textSecondary mt-1">Please verify the tests before comparing prices.</p>
                    </div>
                    <button onClick={() => setOcrState('idle')} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-textTertiary hover:text-textPrimary">✕</button>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {detectedTests.map(test => (
                      <div key={test.id} onClick={() => toggleDetectedTest(test.id)} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${test.selected ? 'bg-[#3D91FF]/10 border-[#3D91FF]/30' : 'bg-background border-border'}`}>
                        <div className="flex items-center gap-3">
                          {test.selected ? <CheckSquare size={20} className="text-[#3D91FF]" /> : <Square size={20} className="text-textTertiary" />}
                          <span className={`text-base font-bold ${test.selected ? 'text-textPrimary' : 'text-textSecondary'}`}>{test.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleCompareOCR}
                    disabled={detectedTests.filter(t=>t.selected).length === 0}
                    className="w-full bg-[#3D91FF] text-white font-bold py-4 rounded-xl active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(61,145,255,0.3)] disabled:opacity-50"
                  >
                    Compare Prices <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                <input 
                  className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#3D91FF]/60 focus:ring-1 focus:ring-[#3D91FF]/50 transition-all text-base shadow-inner"
                  placeholder="Search for a test (e.g., CBC, Lipid Profile)..."
                  value={query} onChange={e => setQuery(e.target.value)}
                />
              </div>

              {/* TESTS LIST */}
              <div>
                <h3 className="text-lg font-bold text-textPrimary mb-4 px-1">{query ? 'Search Results' : 'Common Diagnostic Tests'}</h3>
                <div className="flex flex-col gap-3">
                  {filteredTests.map(test => (
                    <div key={test.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-[#3D91FF]/30 transition-colors cursor-pointer" onClick={() => handleSelectIndividualTest(test)}>
                      <div>
                        <h4 className="font-bold text-textPrimary text-base mb-1">{test.name}</h4>
                        <p className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">{test.category}</p>
                      </div>
                      <button 
                        className="text-sm font-bold text-[#3D91FF] bg-[#3D91FF]/10 px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        Compare
                      </button>
                    </div>
                  ))}
                  {filteredTests.length === 0 && (
                    <div className="text-center bg-surface border border-border rounded-2xl py-8">
                      <p className="text-textSecondary text-sm font-bold">No tests found matching "{query}"</p>
                      <p className="text-xs text-textTertiary mt-2">Try searching for generic names like "CBC" or "Thyroid"</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default LabPage;
