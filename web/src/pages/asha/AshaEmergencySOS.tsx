import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useAshaStore } from '../../store/ashaStore';
import { useSOSStore } from '../../store/sosStore';

const AshaEmergencySOS: React.FC = () => {
  const navigate = useNavigate();
  const { createEmergencyAlert, ashaProfile, activeAlert } = useAshaStore();
  const { triggerSOS } = useSOSStore();
  const [stage, setStage] = useState<'ready' | 'loading' | 'sent'>('ready');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Try to get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 26.8467, lng: 80.9462 }), // Fallback: Lucknow area
        { timeout: 5000 }
      );
    } else {
      setLocation({ lat: 26.8467, lng: 80.9462 });
    }
  }, []);

  const handleSOS = () => {
    setStage('loading');

    const lat = location?.lat || 26.8467;
    const lng = location?.lng || 80.9462;

    // Create ASHA-specific emergency alert
    const alert = {
      id: `asha_sos_${Date.now()}`,
      patientName: 'Patient',
      village: ashaProfile.village,
      lat,
      lng,
      stage: 'sos_sent' as const,
      createdAt: new Date().toISOString(),
      distance: '2 km',
      description: 'ASHA Worker ne emergency SOS bheja hai',
    };

    createEmergencyAlert(alert);

    // Also trigger the existing LifeLink SOS system
    triggerSOS('CRITICAL', 'MANUAL', lat, lng);

    // Simulate alert progression
    setTimeout(() => {
      setStage('sent');
    }, 2000);
  };

  // ── Ready State ──
  if (stage === 'ready') {
    return (
      <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
        <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
          <button
            onClick={() => navigate('/asha')}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#FF4757]">Emergency SOS</h1>
            <p className="text-[10px] text-textSecondary">Gambhir sthiti mein</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          {/* Warning Card */}
          <div className="bg-gradient-to-br from-[#1A0B0B] to-[#0B1221] border border-[#FF4757]/30 rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#FF4757]/3 pointer-events-none" />

            <div className="w-24 h-24 mx-auto mb-5 bg-[#FF4757] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,71,87,0.4)] relative z-10 animate-pulse">
              <AlertTriangle size={48} className="text-textPrimary" />
            </div>

            <h2 className="text-xl font-bold mb-3 relative z-10 leading-relaxed">
              Agar halat bahut gambhir ho<br />
              to turant yeh button dabayein
            </h2>

            <p className="text-textSecondary text-sm mb-6 relative z-10">
              Hospital bed aur ambulance ka turant intezam hoga.
            </p>

            {/* Big SOS Button */}
            <button
              onClick={handleSOS}
              className="w-full bg-gradient-to-r from-[#FF4757] to-[#D63031] hover:from-[#FF6B81] hover:to-[#FF4757] text-textPrimary text-xl font-black py-5 rounded-2xl transition-all active:scale-95 shadow-[0_0_40px_rgba(255,71,87,0.4)] relative z-10"
            >
              🚨 State Emergency SOS
            </button>

            <p className="text-textTertiary text-xs mt-3 relative z-10">(Central / State Agency)</p>
          </div>

          {/* Location Info */}
          <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-full flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[#3B82F6]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-textSecondary">Aapki Location</p>
              {location ? (
                <p className="text-sm font-bold text-textPrimary">
                  Gaon: {ashaProfile.village} ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                </p>
              ) : (
                <p className="text-sm text-textTertiary">Location dhundh rahe hain...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading State ──
  if (stage === 'loading') {
    return (
      <div className="w-full min-h-screen bg-background text-textPrimary flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 mb-6 bg-[#FF4757] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,71,87,0.4)] animate-pulse">
          <Loader2 size={36} className="text-textPrimary animate-spin" />
        </div>
        <h2 className="text-xl font-bold mb-2">SOS bhej rahe hain...</h2>
        <p className="text-textSecondary text-sm">Kripya intezaar karein</p>
      </div>
    );
  }

  // ── Sent State ──
  return (
    <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[#FF4757]">Emergency Alert</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Alert Card */}
        <div className="bg-gradient-to-br from-[#1A0B0B] to-[#0B1221] border border-[#FF4757]/30 rounded-3xl p-6 mb-6 text-center relative overflow-hidden">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#FF4757]/15 border-2 border-[#FF4757]/40 rounded-full flex items-center justify-center">
            <AlertTriangle size={36} className="text-[#FF4757]" />
          </div>

          <h2 className="text-xl font-bold text-[#FF4757] mb-2">Gambhir Sthiti!</h2>
          <p className="text-textSecondary text-sm mb-4 leading-relaxed">
            Aapke gaon mein ek patient ko<br />turant madad ki zarurat hai.
          </p>

          {/* Location */}
          <div className="bg-background border border-border rounded-xl p-4 mb-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-[#3B82F6]" />
              <span className="text-xs text-textSecondary">Location</span>
            </div>
            <p className="text-sm font-bold text-textPrimary">Gaon: {ashaProfile.village}</p>
            <p className="text-xs text-textTertiary">
              Distance: ~2 km • {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ''}
            </p>
          </div>

          {/* Map placeholder */}
          <div className="bg-card border border-border rounded-xl h-32 mb-4 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-background" />
            <div className="relative z-10 text-center">
              <MapPin size={24} className="text-[#FF4757] mx-auto mb-1" />
              <p className="text-[10px] text-textSecondary">{ashaProfile.village}</p>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/30 rounded-2xl p-5 text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={24} className="text-[#00C9A7]" />
            <span className="text-lg font-bold text-[#00C9A7]">SOS bheja ja chuka hai</span>
          </div>
          <p className="text-textSecondary text-xs">Emergency team ko soochna bhej di gayi hai</p>
        </div>

        {/* Status Pipeline */}
        <div className="bg-background border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold mb-3 text-textSecondary">Status</h3>
          {[
            { label: 'SOS Bheja Gaya', done: true },
            { label: 'Emergency Team ko Bataya', done: true },
            { label: 'Ambulance Bheji Ja Rahi Hai', done: false, active: true },
            { label: 'Hospital ko Alert Kiya', done: false },
            { label: 'Madad Aa Rahi Hai', done: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                s.done ? 'bg-[#00C9A7]' : s.active ? 'bg-[#F97316] animate-pulse' : 'bg-surface'
              }`}>
                {s.done ? (
                  <CheckCircle size={14} className="text-textPrimary" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-white' : 'bg-slate-500'}`} />
                )}
              </div>
              <span className={`text-sm ${s.done ? 'text-[#00C9A7] font-bold' : s.active ? 'text-[#F97316] font-bold' : 'text-textTertiary'}`}>
                {s.label}
              </span>
              {i < 4 && <div className="flex-1" />}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/asha/alert')}
            className="w-full bg-card border border-border hover:border-slate-500 text-textPrimary font-bold py-3 rounded-xl transition-colors"
          >
            📋 Alert History Dekhein
          </button>
          <button
            onClick={() => navigate('/asha')}
            className="w-full bg-background border border-border hover:border-border text-textSecondary font-medium py-3 rounded-xl transition-colors"
          >
            ← ASHA Portal par Jaayein
          </button>
        </div>
      </div>
    </div>
  );
};

export default AshaEmergencySOS;
