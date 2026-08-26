import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Shield, Info } from 'lucide-react';
import { useInsuranceStore } from '../../store/insuranceStore';
import { mockInsurancePlans } from '../../data/insurancePlans';

const InsuranceCompare: React.FC = () => {
  const navigate = useNavigate();
  const { comparePlans, removeFromCompare } = useInsuranceStore();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  // Get full plan objects
  const plans = comparePlans.map(id => mockInsurancePlans.find(p => p.id === id)).filter(Boolean) as typeof mockInsurancePlans;

  if (plans.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#060B14] text-white flex flex-col items-center justify-center p-6">
        <Shield size={64} className="text-slate-800 mb-6" />
        <h2 className="text-2xl font-bold mb-2">No Plans to Compare</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">Select up to 4 plans from the Insurance Hub to compare them side-by-side.</p>
        <button 
          onClick={() => navigate('/insurance')}
          className="bg-[#3D91FF] text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(61,145,255,0.3)]"
        >
          Find Plans
        </button>
      </div>
    );
  }

  // Comparison Rows Definition
  const categories = [
    {
      title: "Cost & Premium",
      rows: [
        { label: "Coverage", key: "coverage", format: (v: any) => `₹${(v / 100000).toString()} Lakh` },
        { label: "Monthly Premium", key: "monthlyPremium", format: (v: any) => `₹${v.toLocaleString()}` },
        { label: "Annual Premium", key: "annualPremium", format: (v: any) => `₹${v.toLocaleString()}` },
        { label: "Co-pay", key: "copay", format: (v: any) => `${v}%` },
      ]
    },
    {
      title: "Hospital Coverage",
      rows: [
        { label: "Network Hospitals", key: "networkHospitals", format: (v: any) => `${v.toLocaleString()}+` },
        { label: "Room Rent", key: "roomRent" },
        { label: "Ambulance", key: "ambulance", type: "boolean" },
        { label: "Day Care Procedures", key: "daycare", type: "boolean" },
      ]
    },
    {
      title: "Medical Coverage",
      rows: [
        { label: "Maternity", key: "maternity", type: "boolean" },
        { label: "OPD", key: "opd", type: "boolean" },
        { label: "Mental Wellness", key: "mentalWellness", type: "boolean" },
      ]
    },
    {
      title: "Waiting Periods",
      rows: [
        { label: "Initial Waiting", key: "waitingPeriod" },
        { label: "Pre-existing Disease", key: "preExistingWaiting" },
      ]
    },
    {
      title: "Terms",
      rows: [
        { label: "Lifetime Renewability", key: "lifetimeRenewability", type: "boolean" },
        { label: "Claim Process", key: "claimProcess" },
      ]
    }
  ];

  const hasDifferences = (rowKey: string) => {
    if (plans.length <= 1) return true;
    const firstVal = plans[0][rowKey as keyof typeof plans[0]];
    return plans.some(p => p[rowKey as keyof typeof p] !== firstVal);
  };

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white pb-[120px]">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full bg-[#0B1121]/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg">Compare Plans</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Show Differences Only</span>
            <button 
              onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${showDifferencesOnly ? 'bg-[#3D91FF]' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showDifferencesOnly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Header Row */}
          <div className="flex mb-6 sticky top-[73px] z-40 bg-[#060B14] pt-4 border-b border-slate-800 pb-4">
            <div className="w-64 flex-shrink-0 pr-4 flex flex-col justify-end">
              <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                <Info size={14} /> Compare up to 4 plans
              </p>
            </div>
            
            <div className="flex-1 grid grid-cols-4 gap-4">
              {plans.map((plan, index) => (
                <div key={plan.id} className="relative bg-[#131F35] border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center group" style={{ gridColumn: index + 1 }}>
                  <button 
                    onClick={() => removeFromCompare(plan.id)}
                    className="absolute -top-3 -right-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 rounded-full p-2 transition-colors z-10"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-[10px] text-slate-400 uppercase mb-1">{plan.provider}</p>
                  <h3 className="font-bold text-sm text-slate-200 mb-3">{plan.planName}</h3>
                  <div className="mt-auto">
                    <p className="text-xl font-black text-white">₹{plan.monthlyPremium}</p>
                    <p className="text-[10px] text-slate-500">/ month</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/insurance/plan/${plan.id}`)}
                    className="w-full mt-4 bg-slate-800 hover:bg-[#3D91FF] text-white text-xs py-2 rounded-lg font-bold transition-colors"
                  >
                    Details
                  </button>
                </div>
              ))}
              {/* Empty Slots */}
              {[...Array(4 - plans.length)].map((_, i) => (
                <div key={`empty-${i}`} className="border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 opacity-50" style={{ gridColumn: plans.length + i + 1 }}>
                  <p className="text-xs font-bold text-slate-500 mb-2">Add Plan</p>
                  <button onClick={() => navigate('/insurance')} className="bg-slate-800 text-slate-300 text-xs px-4 py-1.5 rounded-full hover:bg-slate-700">Browse</button>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Categories */}
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="mb-8">
              <h3 className="bg-[#131F35] text-slate-300 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg mb-2">
                {category.title}
              </h3>
              
              <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-[#0B1121]">
                {category.rows.map((row, rowIndex) => {
                  
                  if (showDifferencesOnly && !hasDifferences(row.key)) return null;

                  return (
                    <div key={rowIndex} className="flex border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors last:border-0">
                      <div className="w-64 flex-shrink-0 p-4 border-r border-slate-800/50 flex items-center">
                        <span className="text-sm font-bold text-slate-400">{row.label}</span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-4">
                        {plans.map((plan, pIndex) => (
                          <div key={pIndex} className="p-4 border-r border-slate-800/50 last:border-0 flex items-center justify-center text-center" style={{ gridColumn: pIndex + 1 }}>
                            {row.type === 'boolean' ? (
                              plan[row.key as keyof typeof plan] ? 
                                <Check size={18} className="text-[#00C9A7]" /> : 
                                <X size={18} className="text-slate-600" />
                            ) : (
                              <span className="text-sm font-bold text-slate-200">
                                {row.format ? row.format(plan[row.key as keyof typeof plan]) : plan[row.key as keyof typeof plan] as string}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default InsuranceCompare;
