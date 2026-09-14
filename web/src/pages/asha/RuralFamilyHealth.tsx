import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageCircle } from 'lucide-react';

const RuralFamilyHealth: React.FC = () => {
  const navigate = useNavigate();

  const family = [
    { name: 'रमेश (पापा)', age: 58, condition: 'बीपी, शुगर', avatar: '👨' },
    { name: 'सीता (माँ)', age: 54, condition: 'ठीक हैं', avatar: '👩' },
    { name: 'राहुल (बेटा)', age: 12, condition: 'ठीक हैं', avatar: '👦' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex flex-col items-center pb-24">
      <div className="w-full max-w-md p-4 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-[#131F35] rounded-full text-slate-300">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">मेरे परिवार की सेहत</h1>
        </div>

        <p className="text-slate-300 text-sm">अपने परिवार की स्वास्थ्य जानकारी देखें।</p>

        {/* Family List */}
        <div className="flex flex-col gap-4">
          {family.map((f, i) => (
            <div key={i} className="bg-[#131F35] border border-slate-700 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl shrink-0">
                {f.avatar}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-white">{f.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">उम्र: {f.age} साल</p>
                <div className="bg-[#0B1121] rounded p-2 mt-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400">सेहत की स्थिति:</span>
                  <p className="text-xs font-bold text-emerald-400">{f.condition}</p>
                </div>
              </div>
            </div>
          ))}

          <button className="bg-[#131F35] border border-dashed border-[#00C9A7]/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-[#00C9A7] font-bold active:scale-95 transition-transform">
            <Users size={20} /> नया सदस्य जोड़ें
          </button>
        </div>

      </div>
    </div>
  );
};

export default RuralFamilyHealth;
