import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Pill, Store } from 'lucide-react';

const RuralSastiDawai: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex flex-col items-center pb-24">
      <div className="w-full max-w-md p-4 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-[#131F35] rounded-full text-slate-300">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Sasti Dawai</h1>
        </div>

        <p className="text-slate-300 text-sm">Apni dawai ka sasta (generic) option dhoondein.</p>

        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Dawai ka naam likhein..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131F35] border border-slate-700 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-[#2ED573] transition-colors"
          />
          <Search size={20} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Results Example */}
        {search.length > 2 ? (
          <div className="bg-[#131F35] border border-[#2ED573]/30 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-lg text-[#2ED573]">Paracetamol 500mg</h2>
                <p className="text-[10px] text-slate-400">Generic Option</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">₹5</p>
                <p className="text-[10px] text-slate-400 line-through">₹25 (Brand)</p>
              </div>
            </div>
            
            <div className="h-[1px] bg-slate-700 w-full mb-4"></div>
            
            <h3 className="text-xs font-bold mb-2 flex items-center gap-2"><Store size={14} /> Kahan Milegi?</h3>
            <div className="flex flex-col gap-2">
              <div className="bg-[#0B1121] rounded-lg p-3 text-xs border border-slate-800">
                <p className="font-bold text-[#3D91FF]">Jan Aushadhi Kendra, Rampur</p>
                <p className="text-[10px] text-slate-400">1.2 km door</p>
              </div>
              <div className="bg-[#0B1121] rounded-lg p-3 text-xs border border-slate-800">
                <p className="font-bold text-[#3D91FF]">PHC Pharmacy</p>
                <p className="text-[10px] text-slate-400">2.5 km door</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-50 py-10">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Pill size={32} className="text-slate-400" />
            </div>
            <p className="text-sm">Upar dawai ka naam likhein</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RuralSastiDawai;
