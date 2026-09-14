import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Stethoscope, AlertTriangle, FileText, ChevronRight, Users, Heart } from 'lucide-react';

const AshaPortal: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'डॉक्टर से सलाह',
      subtitle: 'पहली सलाह — टोल-फ्री कॉल',
      icon: Phone,
      color: '#2ED573',
      bgColor: '#2ED573',
      route: '/asha/triage',
    },
    {
      title: 'घर पर जाकर जाँच',
      subtitle: 'आशा दीदी — मरीज़ की जाँच',
      icon: Stethoscope,
      color: '#3B82F6',
      bgColor: '#3B82F6',
      route: '/asha/ghar-jaanch',
    },
    {
      title: 'आपातकालीन मदद',
      subtitle: 'गंभीर स्थिति में — तुरंत मदद',
      icon: AlertTriangle,
      color: '#FF4757',
      bgColor: '#FF4757',
      route: '/asha/emergency',
    },
    {
      title: 'मेरी सूचना',
      subtitle: 'मेरे मरीज़ — जानकारी देखें',
      icon: FileText,
      color: '#8B5CF6',
      bgColor: '#8B5CF6',
      route: '/asha/soochna',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#040814] text-white pb-32">
      {/* Header */}
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-[#040814]/95 backdrop-blur-sm z-30 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-[#0B1221] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">आशा दीदी</h1>
          <p className="text-[10px] text-slate-400">गाँव में सेहत की सेवा</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-[#0D1B2A] to-[#0B1221] border border-[#F97316]/20 rounded-3xl p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F97316]/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="w-20 h-20 mx-auto mb-4 bg-[#F97316] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <Users size={36} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">आशा दीदी पोर्टल</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            आप लोगों की सेहत के लिए हमेशा साथ हैं।
          </p>

          {/* Quick links */}
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/asha/videos')}
              className="flex items-center gap-1.5 bg-[#131F35] border border-slate-700 text-slate-300 text-xs font-medium px-3 py-2 rounded-full hover:border-slate-500 transition-colors"
            >
              <Heart size={12} className="text-[#FF4757]" /> वीडियो
            </button>
            <button
              onClick={() => navigate('/asha/offline')}
              className="flex items-center gap-1.5 bg-[#131F35] border border-slate-700 text-slate-300 text-xs font-medium px-3 py-2 rounded-full hover:border-slate-500 transition-colors"
            >
              📡 ऑफलाइन
            </button>
            <button
              onClick={() => navigate('/asha/profile')}
              className="flex items-center gap-1.5 bg-[#131F35] border border-slate-700 text-slate-300 text-xs font-medium px-3 py-2 rounded-full hover:border-slate-500 transition-colors"
            >
              👩 मेरी जानकारी
            </button>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="flex flex-col gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className="w-full bg-[#0B1221] rounded-2xl p-5 flex items-center gap-4 group border border-slate-800 hover:border-opacity-60 transition-all duration-300 text-left active:scale-[0.98]"
                style={{
                  borderColor: `${item.color}20`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${item.color}60`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${item.color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${item.color}20`;
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.bgColor, boxShadow: `0 0 20px ${item.color}30` }}
                >
                  <Icon size={28} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-0.5" style={{ color: item.color }}>
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{item.subtitle}</p>
                </div>
                <ChevronRight size={22} className="text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AshaPortal;
