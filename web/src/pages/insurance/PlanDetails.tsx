import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Heart, Plus, Check, FileText, Bot, AlertTriangle, ExternalLink } from 'lucide-react';
import { useInsuranceStore } from '../../store/insuranceStore';
import { mockInsurancePlans } from '../../data/insurancePlans';

const PlanDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedPlans, toggleSavePlan, comparePlans, addToCompare, removeFromCompare } = useInsuranceStore();
  
  const [showAiHelp, setShowAiHelp] = useState<string | null>(null);

  const plan = mockInsurancePlans.find(p => p.id === id);

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#060B14] flex flex-col items-center justify-center text-white">
        <AlertTriangle size={64} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Plan Not Found</h2>
        <button onClick={() => navigate('/insurance')} className="text-[#3D91FF] font-bold">Return to Hub</button>
      </div>
    );
  }

  const isSaved = savedPlans.includes(plan.id);
  const isCompared = comparePlans.includes(plan.id);

  const aiExplanations: Record<string, string> = {
    'copay': "Co-payment is the fixed percentage of the medical bill you must pay out-of-pocket, while the insurance covers the rest.",
    'waiting': "A waiting period is the time you must wait before certain diseases or conditions are covered by the policy.",
    'roomRent': "Room rent limit is the maximum amount the insurance will pay per day for your hospital room."
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#060B14] text-white pb-[120px] relative">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-[#0B1121]/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleSavePlan(plan.id)}
              className="p-2 bg-[#131F35] rounded-xl border border-slate-800 hover:border-pink-500/50 transition-colors"
            >
              <Heart size={20} className={isSaved ? "fill-pink-500 text-pink-500" : "text-slate-400"} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Shield size={32} className="text-[#3D91FF]" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">{plan.provider}</p>
              <h1 className="text-2xl md:text-3xl font-black mb-2">{plan.planName}</h1>
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md">{plan.planType}</span>
                <span className="text-xs text-slate-500">• Rated {plan.rating}/5</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-5 min-w-[250px] w-full md:w-auto text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Monthly Premium</p>
            <p className="text-3xl font-black text-white mb-1">₹{plan.monthlyPremium}</p>
            <p className="text-[10px] text-slate-500 mb-4">₹{plan.annualPremium.toLocaleString()} / year</p>
            
            <button 
              onClick={() => navigate(`/insurance/apply/${plan.id}`)}
              className="w-full bg-[#00C9A7] text-[#060B14] py-3 rounded-xl font-black text-sm hover:bg-[#00C9A7]/90 transition-colors shadow-[0_0_20px_rgba(0,201,167,0.3)]"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-4">
          <button 
            onClick={() => isCompared ? removeFromCompare(plan.id) : addToCompare(plan.id)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${
              isCompared 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#131F35] border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isCompared ? <Check size={16} /> : <Plus size={16} />} 
            {isCompared ? 'Added to Compare' : 'Add to Compare'}
          </button>
          
          <button className="flex-1 bg-[#131F35] border border-slate-700 text-slate-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
            <ExternalLink size={16} /> Contact Provider
          </button>
        </div>

        {/* Key Features Grid */}
        <div>
          <h2 className="text-lg font-bold mb-4">Key Coverage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Sum Insured</p>
              <p className="font-bold text-lg">₹{(plan.coverage / 100000)} Lakh</p>
            </div>
            <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Network Hospitals</p>
              <p className="font-bold text-lg">{plan.networkHospitals.toLocaleString()}+</p>
            </div>
            
            {/* Items with AI Help */}
            <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4 relative group">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Co-pay</p>
                <button onClick={() => setShowAiHelp('copay')} className="text-[#3D91FF] p-1"><Bot size={14}/></button>
              </div>
              <p className="font-bold text-lg">{plan.copay}%</p>
            </div>
            
            <div className="bg-[#0B1121] border border-slate-800 rounded-2xl p-4 relative">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Room Rent</p>
                <button onClick={() => setShowAiHelp('roomRent')} className="text-[#3D91FF] p-1"><Bot size={14}/></button>
              </div>
              <p className="font-bold text-base mt-1">{plan.roomRent}</p>
            </div>
          </div>
        </div>

        {/* Benefits & Waiting Periods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Check size={18} className="text-[#00C9A7]" /> Included Benefits</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-[#00C9A7] mt-0.5">•</span> <span>{plan.ambulance ? 'Ambulance cover included' : 'No ambulance cover'}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-[#00C9A7] mt-0.5">•</span> <span>{plan.daycare ? 'Day-care procedures covered' : 'No day-care cover'}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className={plan.maternity ? "text-[#00C9A7] mt-0.5" : "text-slate-600 mt-0.5"}>•</span> 
                <span className={!plan.maternity ? "line-through opacity-50" : ""}>Maternity coverage</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className={plan.opd ? "text-[#00C9A7] mt-0.5" : "text-slate-600 mt-0.5"}>•</span> 
                <span className={!plan.opd ? "line-through opacity-50" : ""}>OPD expenses</span>
              </li>
              {plan.benefits?.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-[#00C9A7] mt-0.5">•</span> <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2"><FileText size={18} className="text-amber-500" /> Waiting Periods</h3>
              <button onClick={() => setShowAiHelp('waiting')} className="text-[#3D91FF] text-xs font-bold flex items-center gap-1"><Bot size={14}/> Help</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Initial Waiting Period</p>
                <p className="font-bold text-slate-200">{plan.waitingPeriod}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Pre-existing Diseases (PED)</p>
                <p className="font-bold text-slate-200">{plan.preExistingWaiting}</p>
              </div>
            </div>
            
            {plan.exclusions && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Exclusions</h4>
                <ul className="space-y-2">
                  {plan.exclusions.map((excl, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <X size={14} className="text-red-500 flex-shrink-0 mt-0.5" /> <span>{excl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* AI Help Modal Overlay */}
        {showAiHelp && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#131F35] border border-[#3D91FF]/30 rounded-2xl p-6 max-w-sm w-full animate-fade-in relative">
              <button onClick={() => setShowAiHelp(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#3D91FF]/10 flex items-center justify-center">
                  <Bot size={20} className="text-[#3D91FF]" />
                </div>
                <h3 className="font-bold">AI Explanation</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {aiExplanations[showAiHelp]}
              </p>
              <button onClick={() => setShowAiHelp(null)} className="w-full bg-slate-800 text-white py-2 rounded-xl font-bold">
                Got it
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlanDetails;
