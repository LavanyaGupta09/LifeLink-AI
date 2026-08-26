import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Plus, Minus, Star, Heart } from 'lucide-react';
import type { InsurancePlan } from '../../data/insurancePlans';
import { useInsuranceStore } from '../../store/insuranceStore';

interface PlanCardProps {
  plan: InsurancePlan;
  matchPercentage?: number;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, matchPercentage }) => {
  const navigate = useNavigate();
  const { savedPlans, toggleSavePlan, comparePlans, addToCompare, removeFromCompare } = useInsuranceStore();

  const isSaved = savedPlans.includes(plan.id);
  const isCompared = comparePlans.includes(plan.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(plan.id);
    } else {
      addToCompare(plan.id);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavePlan(plan.id);
  };

  return (
    <div className="bg-[#131F35] rounded-3xl p-5 border border-slate-800 hover:border-[#3D91FF]/50 transition-all flex flex-col relative overflow-hidden group">
      
      {/* Demo Badge */}
      <div className="absolute -right-8 top-4 bg-amber-500/20 text-amber-500 text-[10px] font-bold px-8 py-1 rotate-45 border border-amber-500/30">
        DEMO PLAN
      </div>

      <div className="flex justify-between items-start mb-4 pr-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Shield size={20} className="text-[#3D91FF]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 leading-tight">{plan.planName}</h3>
            <p className="text-xs text-slate-400">{plan.provider}</p>
          </div>
        </div>
        {matchPercentage && (
          <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/20">
            {matchPercentage}% Match
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Coverage</p>
          <p className="font-bold text-lg text-white">₹{(plan.coverage / 100000).toString()} Lakh</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase">Premium</p>
          <p className="font-bold text-lg text-white">₹{plan.monthlyPremium}<span className="text-xs text-slate-400">/mo</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Check size={14} className="text-[#00C9A7]" />
          <span>{plan.networkHospitals.toLocaleString()}+ network hospitals</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Check size={14} className="text-[#00C9A7]" />
          <span>PED waiting: {plan.preExistingWaiting}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Check size={14} className="text-[#00C9A7]" />
          <span>Co-pay: {plan.copay}%</span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/insurance/plan/${plan.id}`)}
            className="flex-1 bg-[#3D91FF] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#3D91FF]/90 transition-colors"
          >
            View Details
          </button>
          <button 
            onClick={handleCompareClick}
            className={`flex-1 border py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
              isCompared 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#0B1121] border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isCompared ? <Check size={14} /> : <Plus size={14} />} 
            {isCompared ? 'Compared' : 'Compare'}
          </button>
        </div>
        
        <button 
          onClick={handleSaveClick}
          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            isSaved 
              ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30' 
              : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700'
          }`}
        >
          <Heart size={14} className={isSaved ? "fill-current" : ""} /> 
          {isSaved ? 'Saved Plan' : 'Save Plan'}
        </button>
      </div>

    </div>
  );
};

export default PlanCard;
