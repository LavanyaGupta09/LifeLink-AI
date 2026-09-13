import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Play, HelpCircle, ChevronRight, User } from 'lucide-react';
import { useAshaStore } from '../../store/ashaStore';

const AshaProfile: React.FC = () => {
  const navigate = useNavigate();
  const { ashaProfile } = useAshaStore();

  const menuItems = [
    {
      icon: MapPin,
      label: 'Mera Gaon',
      value: ashaProfile.village,
      color: '#3B82F6',
    },
    {
      icon: Phone,
      label: 'Contact',
      value: ashaProfile.phone,
      color: '#00C9A7',
      action: () => window.location.href = `tel:${ashaProfile.phone}`,
    },
    {
      icon: Play,
      label: 'Training Videos',
      value: 'Dekhein',
      color: '#8B5CF6',
      action: () => navigate('/asha/videos'),
    },
    {
      icon: HelpCircle,
      label: 'Help / Support',
      value: 'Sahayata ke liye',
      color: '#F97316',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#040814] text-white pb-32">
      {/* Header */}
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-[#040814]/95 backdrop-blur-sm z-30 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-[#0B1221] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Mera Profile</h1>
          <p className="text-[10px] text-slate-400">ASHA Worker Profile</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#0D1B2A] to-[#0B1221] border border-[#F97316]/20 rounded-3xl p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F97316]/5 rounded-full blur-[60px] pointer-events-none" />
          
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 bg-[#F97316] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] relative z-10">
            <User size={44} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-1 relative z-10">{ashaProfile.name}</h2>
          <p className="text-sm text-[#F97316] font-bold mb-1 relative z-10">ASHA Worker</p>
          <p className="text-xs text-slate-400 relative z-10">
            {ashaProfile.village}, {ashaProfile.district}
          </p>

          {/* Quick stats */}
          <div className="flex gap-3 mt-5 justify-center relative z-10">
            <div className="bg-[#131F35] border border-slate-700 rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-black text-[#00C9A7]">12</p>
              <p className="text-[9px] text-slate-400">Patients</p>
            </div>
            <div className="bg-[#131F35] border border-slate-700 rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-black text-[#3B82F6]">8</p>
              <p className="text-[9px] text-slate-400">Visits</p>
            </div>
            <div className="bg-[#131F35] border border-slate-700 rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-black text-[#FF4757]">1</p>
              <p className="text-[9px] text-slate-400">SOS</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={item.action}
                className="w-full bg-[#0B1221] border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-600 transition-colors text-left group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={22} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{item.label}</h3>
                  <p className="text-xs text-slate-400">{item.value}</p>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600">
            LifeLink AI — ASHA Worker Module<br />
            Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AshaProfile;
