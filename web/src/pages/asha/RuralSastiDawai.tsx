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
          <h1 className="text-xl font-bold text-white">सस्ती दवा</h1>
        </div>

        <p className="text-slate-300 text-sm">अपनी दवा का सस्ता विकल्प ढूँढें।</p>

        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="दवा का नाम लिखें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131F35] border border-slate-700 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-[#2ED573] transition-colors"
          />
          <Search size={20} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Results Example */}
        {search.length > 2 ? (
          <div className="flex flex-col gap-4">
            {[
              { name: 'Paracetamol 500mg (पैरासिटामोल)', generic: 'सस्ता विकल्प', price: '₹5', brandPrice: '₹25 (ब्रांड)' },
              { name: 'Amoxicillin 250mg (अमोक्सिसिलिन)', generic: 'सस्ता विकल्प', price: '₹12', brandPrice: '₹45 (ब्रांड)' },
              { name: 'Omeprazole 20mg (ओमेप्राज़ोल)', generic: 'सस्ता विकल्प', price: '₹8', brandPrice: '₹35 (ब्रांड)' },
              { name: 'Cetirizine 10mg (सिट्रीज़ीन)', generic: 'सस्ता विकल्प', price: '₹3', brandPrice: '₹15 (ब्रांड)' },
            ].filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || search === 'all').map((med, idx) => (
              <div key={idx} className="bg-[#131F35] border border-[#2ED573]/30 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-bold text-lg text-[#2ED573]">{med.name}</h2>
                    <p className="text-[10px] text-slate-400">{med.generic}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{med.price}</p>
                    <p className="text-[10px] text-slate-400 line-through">{med.brandPrice}</p>
                  </div>
                </div>
                
                <div className="h-[1px] bg-slate-700 w-full mb-4"></div>
                
                <h3 className="text-xs font-bold mb-2 flex items-center gap-2"><Store size={14} /> कहाँ मिलेगी?</h3>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#0B1121] rounded-lg p-3 text-xs border border-slate-800">
                    <p className="font-bold text-[#3D91FF]">जन औषधि केंद्र, रामपुर</p>
                    <p className="text-[10px] text-slate-400">1.2 किमी दूर</p>
                  </div>
                  <div className="bg-[#0B1121] rounded-lg p-3 text-xs border border-slate-800">
                    <p className="font-bold text-[#3D91FF]">पीएचसी फार्मेसी (PHC)</p>
                    <p className="text-[10px] text-slate-400">2.5 किमी दूर</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-50 py-10">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Pill size={32} className="text-slate-400" />
            </div>
            <p className="text-sm">ऊपर दवा का नाम लिखें</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RuralSastiDawai;
