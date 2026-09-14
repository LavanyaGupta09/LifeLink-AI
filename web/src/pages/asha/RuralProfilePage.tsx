import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Users, HeartPulse, Building2, FileText, QrCode, 
  CloudOff, Globe, Mic, ShieldAlert, History, LogOut 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const RuralProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex flex-col items-center pb-32">
      
      {/* Header */}
      <div className="w-full bg-[#131F35] border-b border-slate-800 p-4 sticky top-0 z-20 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#0B1121] rounded-full text-slate-300">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">मेरी जानकारी</h1>
      </div>

      <div className="w-full max-w-md p-4 flex flex-col gap-4">
        
        <div className="bg-[#131F35] border border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-md">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C9A7] to-[#009E83] flex items-center justify-center font-black text-2xl shadow-[0_0_15px_rgba(0,201,167,0.3)] shrink-0">
            {user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'यू'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.fullName || 'यूज़र'}</h2>
            <p className="text-sm text-slate-300 mt-0.5">गाँव: रामपुर</p>
            <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              क्षेत्र: ग्रामीण
            </span>
          </div>
        </div>

        {/* 2. Meri Jaankari */}
        <button className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#3D91FF]/10 rounded-full flex items-center justify-center shrink-0">
            <User size={24} className="text-[#3D91FF]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">मेरी जानकारी</h3>
            <p className="text-xs text-slate-400 mt-0.5">नाम, उम्र, गाँव</p>
          </div>
        </button>

        {/* 3. Parivaar */}
        <button onClick={() => navigate('/asha/family')} className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center shrink-0">
            <Users size={24} className="text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">परिवार</h3>
            <p className="text-xs text-slate-400 mt-0.5">परिवार की जानकारी</p>
          </div>
        </button>

        {/* 4. Meri ASHA Worker */}
        <button onClick={() => navigate('/asha')} className="bg-[#131F35] border border-[#F97316]/30 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#F97316]/10 rounded-full flex items-center justify-center shrink-0">
            <HeartPulse size={24} className="text-[#F97316]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">आशा दीदी</h3>
            <p className="text-xs text-slate-400 mt-0.5">सुनीता देवी - संपर्क करें</p>
          </div>
        </button>

        {/* 5. Mere Health Centres */}
        <button onClick={() => navigate('/asha/hospital')} className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#00C9A7]/10 rounded-full flex items-center justify-center shrink-0">
            <Building2 size={24} className="text-[#00C9A7]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">अस्पताल</h3>
            <p className="text-xs text-slate-400 mt-0.5">पीएचसी, सीएचसी, दवा की दुकान</p>
          </div>
        </button>

        {/* 6. Sarkari Swasthya Yojna */}
        <button onClick={() => navigate('/asha/yojna')} className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0">
            <FileText size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">सरकारी योजनाएँ</h3>
            <p className="text-xs text-slate-400 mt-0.5">आयुष्मान भारत, आदि।</p>
          </div>
        </button>

        {/* 7. Health QR */}
        <button onClick={() => navigate('/passport')} className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#3D91FF]/10 rounded-full flex items-center justify-center shrink-0">
            <QrCode size={24} className="text-[#3D91FF]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">स्वास्थ्य क्यूआर</h3>
            <p className="text-xs text-slate-400 mt-0.5">इमरजेंसी में जानकारी साझा करें</p>
          </div>
        </button>

        {/* 8. Offline Help */}
        <button onClick={() => navigate('/asha/offline')} className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <CloudOff size={24} className="text-slate-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">बिना इंटरनेट मदद</h3>
            <p className="text-xs text-emerald-400 mt-0.5">बिना इंटरनेट के काम करेगा</p>
          </div>
        </button>

        {/* 9. Bhasha / Language */}
        <button className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center shrink-0">
            <Globe size={24} className="text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">भाषा</h3>
            <p className="text-xs text-slate-400 mt-0.5">हिन्दी (चुनी गई)</p>
          </div>
        </button>

        {/* 10. Voice Help */}
        <button className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
            <Mic size={24} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">आवाज़ से मदद</h3>
            <p className="text-xs text-slate-400 mt-0.5">टाइप करने की ज़रूरत नहीं</p>
          </div>
        </button>

        {/* 11. Emergency Contacts */}
        <button className="bg-[#131F35] border border-red-500/30 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
            <ShieldAlert size={24} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">आपातकालीन नंबर</h3>
            <p className="text-xs text-slate-400 mt-0.5">परिवार और आशा का नंबर</p>
          </div>
        </button>

        {/* 12. Meri Health History */}
        <button className="bg-[#131F35] border border-slate-700 rounded-xl p-4 flex items-center gap-4 active:scale-95 transition-transform text-left">
          <div className="w-12 h-12 bg-[#00C9A7]/10 rounded-full flex items-center justify-center shrink-0">
            <History size={24} className="text-[#00C9A7]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-white">स्वास्थ्य जानकारी</h3>
            <p className="text-xs text-slate-400 mt-0.5">पुरानी जानकारी देखें</p>
          </div>
        </button>

        {/* 13. Log Out */}
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="mt-6 w-full py-4 bg-[#131F35] border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={20} /> 🚪 बाहर निकलें
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#131F35] border border-slate-700 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
              <LogOut size={32} className="text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">बाहर निकलें?</h2>
            <p className="text-sm text-slate-300 mb-6">क्या आप सच में लॉग आउट करना चाहते हैं?</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-slate-800 rounded-xl font-bold text-white hover:bg-slate-700 transition-colors"
              >
                रद्द करें
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 bg-rose-600 rounded-xl font-bold text-white hover:bg-rose-500 transition-colors"
              >
                बाहर निकलें
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default RuralProfilePage;
