import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Mic } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ProfileHub from '../components/ProfileHub';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary font-sans flex flex-col relative pb-[120px] pt-16 px-6 py-6 ">
      {/* GLOBAL HEADER */}
      <header className="w-full bg-card border-b border-border px-6 py-4 lg:px-12 lg:py-6 flex items-center justify-between z-10 shadow-lg fixed top-0 left-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C9A7] to-[#009E83] flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(0,201,167,0.3)]">
            {user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'US'}
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{user?.fullName || 'User'}</h1>
            <p className="text-textSecondary text-xs lg:text-sm">{user?.phone} • {user?.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 'N/A'} yrs old</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors hidden sm:flex">
            <Settings size={18} />
          </button>
          <button onClick={() => navigate('/logout')} className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-textPrimary transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 100% Free Banner */}
      <div className="w-full mt-[72px] lg:mt-[88px] bg-emerald-500/10 border-b border-emerald-500/20 py-2 text-center text-xs font-bold text-emerald-400 tracking-wider">
        100% Free Emergency & Family Healthcare — Powered by LifeLink Health Network
      </div>

      <main className="w-full flex-1 p-4 lg:px-12 lg:py-8 flex flex-col gap-6 lg:gap-8 pb-[120px] md:pb-12">
        <ProfileHub />
      </main>
    </div>
  );
};

export default ProfilePage;
