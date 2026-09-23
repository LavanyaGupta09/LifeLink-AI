import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, WifiOff, MapPin, Send, Smartphone } from 'lucide-react';
import { useOfflineSyncStore } from '../../store/offlineSyncStore';
import { useAshaStore } from '../../store/ashaStore';

const AshaOfflineSupport: React.FC = () => {
  const navigate = useNavigate();
  const { isOffline, queueSize } = useOfflineSyncStore();
  const { ashaOfflineQueue, ashaProfile } = useAshaStore();

  const totalQueued = queueSize + ashaOfflineQueue;

  const handleSMSFallback = () => {
    // SMS intent fallback — architecture hook for native SMS gateway
    const message = `SOS EMERGENCY! ASHA Worker: ${ashaProfile.name}, Village: ${ashaProfile.village}. Patient needs immediate help. Please send ambulance.`;
    window.location.href = `sms:108?body=${encodeURIComponent(message)}`;
  };

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
          <h1 className="text-lg font-bold">Network Nahi Hai</h1>
          <p className="text-[10px] text-textSecondary">Offline Support</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Status Card */}
        <div className="bg-gradient-to-br from-[#1A1505] to-[#0B1221] border border-[#F97316]/30 rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F97316]/3 pointer-events-none" />
          
          <div className="w-24 h-24 mx-auto mb-5 relative z-10">
            <div className="w-24 h-24 bg-[#F97316]/15 rounded-full flex items-center justify-center border-2 border-[#F97316]/30">
              <WifiOff size={44} className="text-[#F97316]" />
            </div>
            {/* X badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FF4757] rounded-full flex items-center justify-center border-2 border-[#040814]">
              <span className="text-textPrimary text-xs font-black">✕</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 relative z-10">Koi chinta nahi!</h2>
          <p className="text-textSecondary text-sm leading-relaxed relative z-10">
            Aapka SOS message automatically<br />
            SMS ke through bhi bheja jayega.
          </p>
        </div>

        {/* SMS Fallback */}
        <div className="bg-background border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#2ED573]/10 rounded-full flex items-center justify-center shrink-0">
              <Smartphone size={24} className="text-[#2ED573]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-textPrimary">SMS se SOS Bhejein</h3>
              <p className="text-[10px] text-textSecondary">Internet na ho toh SMS use karein</p>
            </div>
          </div>
          <button
            onClick={handleSMSFallback}
            className="w-full bg-[#2ED573] hover:bg-[#27AE60] text-[#0B1221] font-bold py-3 rounded-xl transition-colors active:scale-[0.98]"
          >
            📱 SMS se SOS Bhejein
          </button>
          <p className="text-[10px] text-textTertiary mt-2 text-center">
            * SMS bhejne ke liye aapke phone mein balance hona chahiye
          </p>
        </div>

        {/* Location Info */}
        <div className="bg-background border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-full flex items-center justify-center shrink-0">
              <MapPin size={24} className="text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-textPrimary">Aapki Location</h3>
              <p className="text-[10px] text-textSecondary">GPS se location bhi bhej diya jayega</p>
            </div>
          </div>
          <p className="text-sm text-textSecondary">
            📍 Gaon: <strong className="text-textPrimary">{ashaProfile.village}</strong>
          </p>
          <p className="text-[10px] text-textTertiary mt-1">
            Location GPS ke through automatically capture hoti hai
          </p>
        </div>

        {/* Queue Status */}
        <div className="bg-background border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center shrink-0">
              <Send size={24} className="text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-textPrimary">Pending Messages</h3>
              <p className="text-[10px] text-textSecondary">Network aane par automatic bhej diye jayenge</p>
            </div>
            <div className="bg-accent-purple border border-[#8B5CF6]/30 rounded-full px-3 py-1">
              <span className="text-sm font-bold text-[#8B5CF6]">{totalQueued}</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`rounded-xl p-4 text-center ${
          isOffline
            ? 'bg-[#FF4757]/10 border border-[#FF4757]/20'
            : 'bg-[#00C9A7]/10 border border-[#00C9A7]/20'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-[#FF4757]' : 'bg-[#00C9A7] animate-pulse'}`} />
            <span className={`text-sm font-bold ${isOffline ? 'text-[#FF4757]' : 'text-[#00C9A7]'}`}>
              {isOffline ? 'Offline — Network Nahi Hai' : 'Online — Network Aa Gaya!'}
            </span>
          </div>
          <p className="text-[10px] text-textTertiary">
            {isOffline ? 'Jaise hi network aayega, data sync ho jayega' : 'Sabhi pending data sync ho raha hai'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AshaOfflineSupport;
