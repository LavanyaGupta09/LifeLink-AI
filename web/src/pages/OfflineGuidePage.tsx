import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, WifiOff, HeartPulse, Search, Phone, Shield } from 'lucide-react';

const offlineGuides = [
  { id: 'cpr', title: 'CPR (Adult)', desc: 'Cardiopulmonary Resuscitation', steps: [
    'Check responsiveness: Shake gently and shout "Are you okay?"',
    'If no response and not breathing normally, call emergency services (SOS).',
    'Place heel of one hand on center of chest, other hand on top, interlock fingers.',
    'Push hard and fast: 2 inches deep, 100-120 compressions per minute.',
    'Continue until help arrives or person wakes up.'
  ]},
  { id: 'choking', title: 'Choking', desc: 'Heimlich Maneuver', steps: [
    'Stand behind the person. Place one foot slightly in front of the other.',
    'Make a fist with one hand and grasp it with the other.',
    'Place fist slightly above the navel.',
    'Press hard into the abdomen with a quick, upward thrust.',
    'Repeat until the object is expelled.'
  ]},
  { id: 'bleeding', title: 'Severe Bleeding', desc: 'Stop the bleed', steps: [
    'Find source of bleeding.',
    'Apply direct pressure with a clean cloth or hands.',
    'Maintain pressure constantly until help arrives.',
    'If bleeding soaks through, do not remove cloth. Add more on top.',
    'Do not use a tourniquet unless trained and bleeding is life-threatening on a limb.'
  ]},
  { id: 'burns', title: 'Burns', desc: 'First-degree and second-degree', steps: [
    'Cool the burn immediately with cool (not ice cold) running water for 10-15 minutes.',
    'Remove tight items (rings, watches) from the burned area before swelling occurs.',
    'Do NOT break blisters.',
    'Apply lotion (aloe vera) once cooled. Cover loosely with sterile gauze.',
    'Seek medical help if burn is severe, large, or on face/hands.'
  ]}
];

const OfflineGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const renderGuide = () => {
    const guide = offlineGuides.find(g => g.id === activeGuide);
    if (!guide) return null;

    return (
      <div className="animate-fade-in p-5">
        <button className="flex items-center gap-1 text-[var(--primary)] text-sm font-semibold mb-4" onClick={() => setActiveGuide(null)}>
          <ArrowLeft size={16} /> Back to guides
        </button>
        
        <h3 className="font-display font-bold text-2xl text-white mb-1">{guide.title}</h3>
        <p className="text-secondary text-sm mb-6">{guide.desc}</p>

        <div className="space-y-4">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border)]">
              <div className="w-6 h-6 rounded-full bg-[rgba(0,201,167,0.1)] text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-white leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header border-b border-[var(--border)] pb-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <div>
            <h2 className="page-title flex items-center gap-2">Offline Guide <WifiOff size={14} className="text-orange-500" /></h2>
            <p className="text-xs text-secondary">Cached First Aid Instructions</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeGuide ? renderGuide() : (
          <div className="p-4 animate-fade-in">
            
            <div className="bg-[rgba(255,165,2,0.1)] border border-[rgba(255,165,2,0.2)] p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2 text-[#FFA502] font-semibold text-sm mb-2">
                <Shield size={16} /> No Network Needed
              </div>
              <p className="text-xs text-[#FFA502]/80 leading-relaxed">
                This page is stored locally on your device. You can access these life-saving instructions even during disasters with zero internet connectivity.
              </p>
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 px-1 uppercase tracking-wider text-tertiary">Select Emergency</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {offlineGuides.map(guide => (
                <button 
                  key={guide.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] p-4 rounded-xl text-left hover:border-[var(--primary)] transition-colors group"
                  onClick={() => setActiveGuide(guide.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-3 group-hover:bg-[rgba(0,201,167,0.1)] transition-colors">
                    {guide.id === 'cpr' && <HeartPulse size={20} className="text-[var(--primary)]" />}
                    {guide.id === 'choking' && <Phone size={20} className="text-[#3D91FF]" />}
                    {guide.id === 'bleeding' && <Search size={20} className="text-[#FF4757]" />}
                    {guide.id === 'burns' && <Shield size={20} className="text-[#FFA502]" />}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{guide.title}</h4>
                  <p className="text-[10px] text-secondary leading-tight">{guide.desc}</p>
                </button>
              ))}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineGuidePage;
