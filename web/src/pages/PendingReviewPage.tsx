import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, FileSearch } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const PendingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  return (
    <div className="bg-[#0F172A] flex flex-col items-center justify-center p-6 font-sans text-white w-full min-h-screen px-6 py-6 ">
      {/* Elevated Card Container */}
      <div className="max-w-md md:max-w-2xl w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700/50 p-8 text-center relative overflow-hidden">
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-sky-500/10 blur-[60px] pointer-events-none" />

        {/* Polished SVG Illustration */}
        <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
          <FileSearch size={44} className="text-sky-400 animate-pulse" />
        </div>
        
        {/* Main Title */}
        <h1 className="text-3xl font-black mb-8 tracking-tight text-white relative z-10">
          Credentials Under Review
        </h1>
        
        {/* Dynamic Data Blocks */}
        <div className="space-y-6 text-left relative z-10">
          <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
              <ShieldCheck size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Provider Account</p>
              <p className="font-bold text-lg text-white leading-tight mb-0.5">{user?.fullName || 'Enterprise Provider'}</p>
              <p className="text-sky-400 font-medium text-sm">{user?.role?.replace('_', ' ').toUpperCase() || 'HOSPITAL ADMIN'}</p>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Verification Status</p>
            <p className="font-bold text-lg text-sky-400 mb-3">Pending Manual Verification</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our compliance team is verifying your license and credentials with the respective national registry. This usually takes 24-48 hours. You will receive an email once approved.
            </p>
          </div>
        </div>

        {/* Modern Secondary Action Button */}
        <button 
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-2 w-full bg-slate-900/80 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-full border border-sky-500/30 hover:border-sky-500/60 transition-all duration-300 relative z-10 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]"
        >
          <LogOut size={18} className="text-sky-400" /> 
          Return to Login Page
        </button>
      </div>
    </div>
  );
};

export default PendingReviewPage;
