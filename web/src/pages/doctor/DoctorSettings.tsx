import React from 'react';
import { Settings, User, Bell, Lock, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function DoctorSettings() {
  const { user } = useAuthStore();

  return (
    <div className="p-4 md:p-8 w-full max-w-5xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-slate-400" /> Settings
        </h2>
        <p className="text-slate-400 mt-1">Manage your account preferences and profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <User size={18} /> Profile
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-[#131F35] transition-colors flex items-center gap-2">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-[#131F35] transition-colors flex items-center gap-2">
            <Lock size={18} /> Security
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-4 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-[#009E83] flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {user?.fullName?.charAt(0) || 'D'}
              </div>
              <div>
                <button className="px-4 py-2 bg-[#0B1121] border border-slate-700 hover:border-emerald-500 text-white rounded-lg text-sm font-bold transition-colors">
                  Change Photo
                </button>
                <p className="text-slate-500 text-xs mt-2">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" defaultValue={user?.fullName || 'Demo User'} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" disabled defaultValue={user?.email || 'doctor@apollo.com'} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400 opacity-70 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Phone Number</label>
                <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Specialization</label>
                <input type="text" defaultValue="Internal Medicine" className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                <CheckCircle size={18} /> Save Changes
              </button>
            </div>
          </div>

          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-4 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Shield className="text-emerald-400" /> Professional Details</h3>
            <p className="text-slate-400 text-sm mb-6">Manage your medical license and practice details.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Medical License Number</label>
                <input type="text" defaultValue="MCI-009911" className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Consultation Fee (₹)</label>
                <input type="number" defaultValue="800" className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
