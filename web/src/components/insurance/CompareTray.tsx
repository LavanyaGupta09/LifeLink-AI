import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { useInsuranceStore } from '../../store/insuranceStore';
import { mockInsurancePlans } from '../../data/insurancePlans';

const CompareTray: React.FC = () => {
  const navigate = useNavigate();
  const { comparePlans, removeFromCompare, clearCompare } = useInsuranceStore();

  if (comparePlans.length === 0) return null;

  const selectedPlans = comparePlans.map(id => mockInsurancePlans.find(p => p.id === id)).filter(Boolean) as typeof mockInsurancePlans;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-[#131F35] border border-[#3D91FF]/50 rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto animate-slide-up">
        
        <div className="flex-1 flex gap-3 overflow-x-auto w-full scrollbar-hide pb-2 sm:pb-0">
          {selectedPlans.map(plan => (
            <div key={plan.id} className="min-w-[120px] max-w-[150px] bg-[#0B1121] border border-slate-700 rounded-xl p-2 relative flex-shrink-0">
              <button 
                onClick={() => removeFromCompare(plan.id)}
                className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-1 border border-slate-600 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
              <p className="text-[10px] text-slate-400 truncate">{plan.provider}</p>
              <p className="text-xs font-bold text-slate-200 truncate">{plan.planName}</p>
            </div>
          ))}
          
          {[...Array(Math.max(0, 4 - selectedPlans.length))].map((_, i) => (
            <div key={`empty-${i}`} className="min-w-[120px] max-w-[150px] border border-dashed border-slate-700 rounded-xl p-2 flex items-center justify-center flex-shrink-0 opacity-50">
              <span className="text-xs text-slate-500">Add plan</span>
            </div>
          ))}
        </div>

        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/insurance/compare')}
            disabled={selectedPlans.length < 2}
            className="flex-1 sm:flex-none bg-[#3D91FF] text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Compare {selectedPlans.length} Plans <ArrowRight size={16} />
          </button>
          <button 
            onClick={clearCompare}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors whitespace-nowrap"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareTray;
