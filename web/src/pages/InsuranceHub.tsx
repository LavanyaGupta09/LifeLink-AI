import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Search, Filter, 
  Heart, Wallet, FileText, ArrowRight
} from 'lucide-react';
import { mockInsurancePlans } from '../data/insurancePlans';
import PlanCard from '../components/insurance/PlanCard';
import CompareTray from '../components/insurance/CompareTray';
import { useInsuranceStore } from '../store/insuranceStore';

const InsuranceHub: React.FC = () => {
  const navigate = useNavigate();
  const { savedPlans, activePolicies, comparePlans } = useInsuranceStore();
  const selectedComparePlans = comparePlans.map(id => mockInsurancePlans.find(p => p.id === id)).filter(Boolean) as typeof mockInsurancePlans;

  // Discovery Form State
  const [who, setWho] = useState('Family');
  const [coveragePref, setCoveragePref] = useState('1500000'); // 15 Lakh
  const [hasSearched, setHasSearched] = useState(false);

  // Filters State
  const [filterCoverage, setFilterCoverage] = useState('Any');
  const [filterPremium, setFilterPremium] = useState('Any');
  const [filterType, setFilterType] = useState('Any');
  const [sortBy, setSortBy] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);

  // Derived filtered plans
  const filteredPlans = useMemo(() => {
    let plans = [...mockInsurancePlans];

    if (filterCoverage !== 'Any') {
      const cov = parseInt(filterCoverage);
      if (cov === 5000000) {
        plans = plans.filter(p => p.coverage >= 5000000);
      } else {
        plans = plans.filter(p => p.coverage === cov);
      }
    }

    if (filterPremium !== 'Any') {
      if (filterPremium === 'under1k') plans = plans.filter(p => p.monthlyPremium < 1000);
      if (filterPremium === '1k-2k') plans = plans.filter(p => p.monthlyPremium >= 1000 && p.monthlyPremium <= 2000);
      if (filterPremium === '2k-5k') plans = plans.filter(p => p.monthlyPremium > 2000 && p.monthlyPremium <= 5000);
      if (filterPremium === 'above5k') plans = plans.filter(p => p.monthlyPremium > 5000);
    }

    if (filterType !== 'Any') {
      plans = plans.filter(p => p.planType === filterType);
    }

    // Sorting
    if (sortBy === 'Lowest Premium') {
      plans.sort((a, b) => a.monthlyPremium - b.monthlyPremium);
    } else if (sortBy === 'Highest Coverage') {
      plans.sort((a, b) => b.coverage - a.coverage);
    } else if (sortBy === 'Most Network Hospitals') {
      plans.sort((a, b) => b.networkHospitals - a.networkHospitals);
    } else if (sortBy === 'Lowest Co-pay') {
      plans.sort((a, b) => a.copay - b.copay);
    } else {
      // Recommended: rough approximation based on discovery form
      plans.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (hasSearched) {
          if (a.coverage >= parseInt(coveragePref)) scoreA += 10;
          if (b.coverage >= parseInt(coveragePref)) scoreB += 10;
          if (who === 'Family' && a.planType === 'Family Floater') scoreA += 10;
          if (who === 'Family' && b.planType === 'Family Floater') scoreB += 10;
        }
        return scoreB - scoreA;
      });
    }

    return plans;
  }, [filterCoverage, filterPremium, filterType, sortBy, who, coveragePref, hasSearched]);

  // Calculate Match Percentage
  const calculateMatch = (plan: typeof mockInsurancePlans[0]) => {
    if (!hasSearched) return undefined;
    let match = 70; // Base
    if (plan.coverage >= parseInt(coveragePref)) match += 15;
    if (
      (who === 'Family' && plan.planType === 'Family Floater') ||
      (who === 'Myself' && plan.planType === 'Individual') ||
      (who === 'Parents' && plan.planType === 'Senior Citizen')
    ) {
      match += 10;
    }
    if (plan.copay === 0) match += 5;
    return Math.min(match, 98);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#060B14] text-white pb-[120px] relative">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-[#0B1121]/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/family')} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck size={24} className="text-[#3D91FF]" />
              <div>
                <h1 className="font-bold text-lg leading-tight">Insurance Hub</h1>
                <p className="text-[10px] text-slate-400">Compare & Find Plans</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/insurance/saved')}
              className="relative p-2 bg-[#131F35] rounded-xl border border-slate-800 hover:border-[#3D91FF]/50 transition-colors"
            >
              <Heart size={18} className={savedPlans.length > 0 ? "text-pink-400" : "text-slate-400"} />
              {savedPlans.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedPlans.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/insurance/my-insurance')}
              className="p-2 bg-[#131F35] rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors relative"
            >
              <Wallet size={18} className="text-emerald-400" />
              {activePolicies.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activePolicies.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Quick Nav Links */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          <button onClick={() => navigate('/insurance')} className="bg-[#3D91FF] text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-[0_0_15px_rgba(61,145,255,0.3)]">Find Insurance</button>
          <button onClick={() => navigate('/insurance/compare')} className="bg-[#131F35] border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">Compare Plans</button>
          <button onClick={() => navigate('/insurance/saved')} className="bg-[#131F35] border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">Saved Plans</button>
          <button onClick={() => navigate('/insurance/my-insurance')} className="bg-[#131F35] border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">My Insurance</button>
        </div>

        {/* Discovery Form */}
        <div className="bg-gradient-to-br from-[#131F35] to-[#0B1121] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3D91FF]/5 rounded-full blur-3xl" />
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
            <Search size={20} className="text-[#3D91FF]" /> Find the perfect coverage
          </h2>

          <form onSubmit={handleSearch} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Who are you looking to insure?</label>
              <div className="flex flex-wrap gap-2">
                {['Myself', 'Family', 'Parents', 'Spouse', 'Children'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWho(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      who === opt 
                        ? 'bg-[#3D91FF]/10 border-[#3D91FF] text-[#3D91FF]' 
                        : 'bg-[#060B14] border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Age of eldest member</label>
                <input type="number" placeholder="e.g. 45" className="w-full bg-[#060B14] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3D91FF]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">City</label>
                <input type="text" placeholder="e.g. Mumbai" className="w-full bg-[#060B14] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3D91FF]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preferred Coverage</label>
                <select 
                  value={coveragePref}
                  onChange={(e) => setCoveragePref(e.target.value)}
                  className="w-full bg-[#060B14] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3D91FF] appearance-none"
                >
                  <option value="500000">₹5 Lakh</option>
                  <option value="1000000">₹10 Lakh</option>
                  <option value="1500000">₹15 Lakh</option>
                  <option value="2500000">₹25 Lakh</option>
                  <option value="5000000">₹50 Lakh+</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-[#3D91FF] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#3D91FF]/20 hover:bg-[#3D91FF]/90 transition-colors flex items-center justify-center gap-2">
              Find Plans <ArrowRight size={20} />
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div id="results-section" className="pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold">
              {hasSearched ? `Plans matching your needs (${filteredPlans.length})` : 'Popular Plans'}
            </h2>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                  showFilters || filterCoverage !== 'Any' || filterPremium !== 'Any' || filterType !== 'Any'
                    ? 'bg-[#3D91FF]/10 border-[#3D91FF] text-[#3D91FF]'
                    : 'bg-[#131F35] border-slate-800 text-slate-300'
                }`}
              >
                <Filter size={16} /> Filters
              </button>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 md:flex-none bg-[#131F35] border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-[#3D91FF] appearance-none"
              >
                <option>Recommended</option>
                <option>Lowest Premium</option>
                <option>Highest Coverage</option>
                <option>Most Network Hospitals</option>
                <option>Lowest Co-pay</option>
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Coverage Amount</label>
                <select value={filterCoverage} onChange={(e) => setFilterCoverage(e.target.value)} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200">
                  <option value="Any">Any</option>
                  <option value="500000">₹5 Lakh</option>
                  <option value="1000000">₹10 Lakh</option>
                  <option value="1500000">₹15 Lakh</option>
                  <option value="2500000">₹25 Lakh</option>
                  <option value="5000000">₹50 Lakh+</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Monthly Premium</label>
                <select value={filterPremium} onChange={(e) => setFilterPremium(e.target.value)} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200">
                  <option value="Any">Any</option>
                  <option value="under1k">Under ₹1,000</option>
                  <option value="1k-2k">₹1,000 - ₹2,000</option>
                  <option value="2k-5k">₹2,000 - ₹5,000</option>
                  <option value="above5k">₹5,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Insurance Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200">
                  <option value="Any">Any</option>
                  <option value="Individual">Individual</option>
                  <option value="Family Floater">Family Floater</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Parents">Parents</option>
                  <option value="Maternity">Maternity</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => { setFilterCoverage('Any'); setFilterPremium('Any'); setFilterType('Any'); }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="bg-[#3D91FF]/20 text-[#3D91FF] px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Inline Comparison Summary */}
          {selectedComparePlans.length >= 2 && (
            <div className="bg-[#131F35] border border-[#3D91FF]/30 rounded-3xl p-6 md:p-8 mb-8 shadow-[0_0_40px_rgba(61,145,255,0.05)] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3D91FF]/20 to-[#3D91FF]/5 flex items-center justify-center border border-[#3D91FF]/20">
                    <ShieldCheck size={20} className="text-[#3D91FF]" />
                  </div>
                  Quick Comparison
                </h3>
                <button 
                  onClick={() => navigate('/insurance/compare')}
                  className="bg-[#3D91FF]/10 hover:bg-[#3D91FF]/20 text-[#3D91FF] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-[#3D91FF]/30 w-full sm:w-auto"
                >
                  Full Analysis <ArrowRight size={16} />
                </button>
              </div>

              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                  {/* Feature Labels Column */}
                  <div className="flex flex-col gap-5 w-36 shrink-0 justify-end pt-[104px] pb-4 hidden md:flex">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider h-10 flex items-center border-b border-slate-800/50">Premium</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider h-10 flex items-center border-b border-slate-800/50">Coverage</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider h-10 flex items-center border-b border-slate-800/50">Hospitals</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider h-10 flex items-center">Co-pay</div>
                  </div>
                  
                  {/* Plan Columns */}
                  {selectedComparePlans.map(plan => (
                    <div key={plan.id} className="w-[280px] bg-gradient-to-b from-[#0B1121] to-[#131F35] rounded-2xl border border-slate-700/50 p-5 shrink-0 flex flex-col relative overflow-hidden group hover:border-[#3D91FF]/50 transition-colors">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#3D91FF] to-emerald-400 opacity-50"></div>
                      <div className="mb-6 h-[80px]">
                        <span className="text-[10px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md mb-3 inline-block font-medium border border-slate-700">{plan.provider}</span>
                        <h4 className="font-bold text-white text-base leading-tight line-clamp-2">{plan.planName}</h4>
                      </div>
                      
                      <div className="flex flex-col gap-5">
                        <div className="h-10 flex flex-col justify-center border-b border-slate-800/50 pb-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase md:hidden mb-1">Premium</span>
                          <span className="font-black text-emerald-400 text-lg">₹{plan.monthlyPremium.toLocaleString()}<span className="text-xs text-slate-500 font-medium">/mo</span></span>
                        </div>
                        <div className="h-10 flex flex-col justify-center border-b border-slate-800/50 pb-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase md:hidden mb-1">Coverage</span>
                          <span className="font-bold text-white">₹{(plan.coverage / 100000).toLocaleString()} Lakhs</span>
                        </div>
                        <div className="h-10 flex flex-col justify-center border-b border-slate-800/50 pb-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase md:hidden mb-1">Hospitals</span>
                          <span className="font-bold text-white flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             {plan.networkHospitals.toLocaleString()}+ Network
                          </span>
                        </div>
                        <div className="h-10 flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase md:hidden mb-1">Co-pay</span>
                          <span className="font-bold text-white">
                            {plan.copay === 0 ? <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck size={14}/> 0% (Cashless)</span> : `${plan.copay}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.length > 0 ? (
              filteredPlans.map(plan => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  matchPercentage={calculateMatch(plan)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No plans found matching your filters.</p>
                <button 
                  onClick={() => { setFilterCoverage('Any'); setFilterPremium('Any'); setFilterType('Any'); }}
                  className="text-[#3D91FF] mt-2 font-bold text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <CompareTray />
    </div>
  );
};

export default InsuranceHub;
