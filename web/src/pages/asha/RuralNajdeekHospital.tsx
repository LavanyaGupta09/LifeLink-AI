import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, ShieldPlus } from 'lucide-react';

const RuralNajdeekHospital: React.FC = () => {
  const navigate = useNavigate();

  const hospitals = [
    { name: 'Rampur Primary Health Center', dist: '2.5 km', emergency: true },
    { name: 'District Hospital', dist: '15 km', emergency: true },
    { name: 'Sanjeevani Clinic', dist: '3 km', emergency: false },
  ];

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col items-center pb-24">
      <div className="w-full max-w-md p-4 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-full text-textSecondary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-textPrimary">Najdeek Hospital</h1>
        </div>

        <p className="text-textSecondary text-sm">Aapke paas ke hospital aur clinic</p>

        {/* List */}
        <div className="flex flex-col gap-4">
          {hospitals.map((h, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#00C9A7]/10 rounded-full flex items-center justify-center shrink-0">
                    <ShieldPlus size={20} className="text-[#00C9A7]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">{h.name}</h2>
                    <p className="text-[10px] text-textSecondary mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {h.dist}
                    </p>
                  </div>
                </div>
                {h.emergency && (
                  <span className="bg-red-500/20 text-red-500 text-[9px] font-bold px-2 py-1 rounded-full border border-red-500/30">
                    Emergency
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 mt-1">
                <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition-colors">
                  <MapPin size={14} /> Rasta Dekhein
                </button>
                <button className="flex-1 bg-[#00C9A7]/20 hover:bg-[#00C9A7]/30 text-[#00C9A7] py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition-colors">
                  <Phone size={14} /> Call Karein
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RuralNajdeekHospital;
