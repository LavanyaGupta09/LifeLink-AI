import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building2, TreePine, ArrowLeft } from 'lucide-react';
import { useAshaStore } from '../store/ashaStore';

const AreaSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAreaType } = useAshaStore();

  const handleSelect = (type: 'urban' | 'rural') => {
    setAreaType(type);
    if (type === 'rural') {
      navigate('/rural-onboarding');
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    setAreaType(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#040814] text-slate-200 font-sans flex flex-col items-center">
      {/* Header */}
      <header className="w-full px-4 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/role-select')}
          className="w-10 h-10 rounded-full bg-[#0B1221] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00C9A7]">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="text-lg font-bold text-white">LifeLink <span className="text-[#00C9A7]">AI</span></span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg mx-auto px-5 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Apna Area Chunein</h1>
          <p className="text-slate-400 text-sm md:text-base">Choose your area to get the right healthcare support.</p>
        </div>

        {/* Cards */}
        <div className="w-full flex flex-col gap-4 mb-8">
          {/* Urban Card */}
          <button
            onClick={() => handleSelect('urban')}
            className="w-full bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex items-center gap-5 group border border-[#3B82F6]/20 hover:border-[#3B82F6]/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#3B82F6] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
              <Building2 size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-bold text-[#3B82F6] mb-1">🏙️ शहर / City</h3>
              <p className="text-slate-400 text-sm">Urban Area — City / Town</p>
            </div>
            <ChevronRight size={24} className="text-slate-500 group-hover:text-[#3B82F6] transition-colors shrink-0" />
          </button>

          {/* Rural Card */}
          <button
            onClick={() => handleSelect('rural')}
            className="w-full bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex items-center gap-5 group border border-[#00C9A7]/20 hover:border-[#00C9A7]/60 hover:shadow-[0_0_30px_rgba(0,201,167,0.15)] transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#00C9A7] rounded-2xl flex items-center justify-center text-[#0B1221] shrink-0 shadow-[0_0_20px_rgba(0,201,167,0.3)] group-hover:scale-110 transition-transform">
              <TreePine size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-bold text-[#00C9A7] mb-1">🌾 गाँव / Rural</h3>
              <p className="text-slate-400 text-sm">Village / Rural Area — Gramin kshetra</p>
            </div>
            <ChevronRight size={24} className="text-slate-500 group-hover:text-[#00C9A7] transition-colors shrink-0" />
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors py-2 px-6 rounded-full border border-slate-800 hover:border-slate-600"
        >
          Baad mein choose karein — Skip for now
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center shrink-0">
        <p className="text-[10px] text-slate-600">This helps us personalize your healthcare experience</p>
      </footer>
    </div>
  );
};

export default AreaSelectionPage;
