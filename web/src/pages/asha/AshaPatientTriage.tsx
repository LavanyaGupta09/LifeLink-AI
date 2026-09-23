import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ChevronRight } from 'lucide-react';

const AshaPatientTriage: React.FC = () => {
  const navigate = useNavigate();

  const symptoms = [
    { emoji: '🤒', label: 'Bukhar', desc: 'Fever / Temperature' },
    { emoji: '🤧', label: 'Khansi', desc: 'Cough' },
    { emoji: '😮‍💨', label: 'Saans lene mein dikkat', desc: 'Breathing difficulty' },
    { emoji: '🤕', label: 'Chot lagna', desc: 'Injury' },
    { emoji: '❓', label: 'Aur bhi zaruri salah', desc: 'Other advice' },
  ];

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
      {/* Header */}
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Doctor se Salah</h1>
          <p className="text-[10px] text-textSecondary">Toll-free number par call karein</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Phone Call Card */}
        <div className="bg-gradient-to-br from-surface to-background border border-[#2ED573]/30 rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#2ED573]/3 pointer-events-none" />
          
          <div className="w-24 h-24 mx-auto mb-5 bg-[#2ED573] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(46,213,115,0.35)] relative z-10">
            <Phone size={44} className="text-textPrimary" />
          </div>

          <h2 className="text-xl font-bold mb-2 relative z-10">
            Toll-free number par<br />call karein
          </h2>

          {/* 108 Button */}
          <a
            href="tel:108"
            className="inline-flex items-center justify-center bg-[#2ED573] hover:bg-[#27AE60] text-[#0B1221] text-4xl font-black py-4 px-12 rounded-2xl my-4 shadow-[0_0_30px_rgba(46,213,115,0.3)] transition-all active:scale-95 relative z-10"
          >
            108
          </a>

          <p className="text-textSecondary text-sm mt-2 relative z-10">
            Aapko doctor se turant salah milegi.
          </p>
        </div>

        {/* Symptoms Section */}
        <div className="mb-4">
          <h3 className="text-base font-bold mb-3 text-textPrimary">Kis liye call karein?</h3>
          
          <div className="flex flex-col gap-3">
            {symptoms.map((s, i) => (
              <div
                key={i}
                className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 hover:border-border transition-colors"
              >
                <span className="text-2xl shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-textPrimary">{s.label}</h4>
                  <p className="text-xs text-textTertiary">{s.desc}</p>
                </div>
                <ChevronRight size={16} className="text-textTertiary shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-textSecondary leading-relaxed">
            📞 Yeh number bilkul <strong className="text-textPrimary">muft</strong> hai.<br />
            Aapko <strong className="text-[#2ED573]">turant doctor</strong> se baat hogi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AshaPatientTriage;
