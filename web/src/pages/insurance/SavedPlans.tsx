import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Shield } from 'lucide-react';
import { useInsuranceStore } from '../../store/insuranceStore';
import { mockInsurancePlans } from '../../data/insurancePlans';
import PlanCard from '../../components/insurance/PlanCard';

const SavedPlans: React.FC = () => {
  const navigate = useNavigate();
  const { savedPlans } = useInsuranceStore();

  const plans = savedPlans.map(id => mockInsurancePlans.find(p => p.id === id)).filter(Boolean) as typeof mockInsurancePlans;

  return (
    <div className="w-full min-h-[100dvh] bg-[#060B14] text-white pb-[120px]">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-[#0B1121]/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/insurance')} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">Saved Plans</h1>
            <p className="text-[10px] text-slate-400">{plans.length} saved</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {plans.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Saved Plans</h2>
            <p className="text-slate-400 max-w-sm mb-6">You haven't saved any plans yet. Explore the hub to find and save plans for later.</p>
            <button 
              onClick={() => navigate('/insurance')}
              className="bg-[#3D91FF] text-white px-8 py-3 rounded-xl font-bold"
            >
              Explore Plans
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPlans;
