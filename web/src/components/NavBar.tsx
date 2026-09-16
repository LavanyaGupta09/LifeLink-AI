import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Building2, MapPin, Briefcase, User, CloudOff } from 'lucide-react';
import { useOfflineSyncStore } from '../store/offlineSyncStore';
import { useAuthStore } from '../store/authStore';
import { useAshaStore } from '../store/ashaStore';

const urbanNavItems = [
  { icon: Home,      label: 'Home',      route: '/dashboard' },
  { icon: Activity,  label: 'Symptoms',  route: '/symptoms' },
  { icon: Building2, label: 'Hospitals', route: '/hospitals' },
  { icon: MapPin,    label: 'Ambulance', route: '/ambulance' },
  { icon: Briefcase, label: 'Partner',   route: '/vendor' },
  { icon: User,      label: 'Profile',   route: '/profile' },
];

import { HeartPulse, ShieldAlert, Users } from 'lucide-react';
const ruralNavItems = [
  { icon: Home,        label: 'होम',    route: '/dashboard' },
  { icon: ShieldAlert, label: 'मदद',     route: '/sos' },
  { icon: HeartPulse,  label: 'आशा दीदी',    route: '/asha' },
  { icon: Users,       label: 'परिवार',  route: '/asha/family' },
  { icon: User,        label: 'मेरी जानकारी', route: '/profile' },
];

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOffline, queueSize } = useOfflineSyncStore();
  const { user } = useAuthStore();

  const { areaType } = useAshaStore();

  const hiddenRoutes = ['/', '/onboarding', '/sos', '/login', '/role-select', '/b2b/auth', '/b2b/pending-review', '/area-select'];
  // Keep NavBar on /asha if rural, otherwise hide it. 
  // Wait, if we use /asha for rural, maybe we WANT the NavBar on /asha?
  // Yes, because ASHA is a tab. So remove /asha from hidden routes if areaType === 'rural'
  const isAshaHidden = areaType === 'rural' ? false : location.pathname.startsWith('/asha');

  if (hiddenRoutes.some(r => location.pathname === r) || location.pathname.startsWith('/b2b/') || location.pathname.startsWith('/admin/') || isAshaHidden || user?.easyModeEnabled) return null;
  
  const navItems = areaType === 'rural' ? ruralNavItems : urbanNavItems;

  return (
    <>
      {/* Offline Alert (Moved to top right if offline) */}
      {isOffline && (
        <div className="fixed top-4 right-4 bg-orange-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap z-[60]">
          <CloudOff size={12} />
          <span>Offline {queueSize > 0 ? `(${queueSize})` : ''}</span>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 h-[72px] backdrop-blur-md flex items-center justify-around px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${areaType === 'rural' ? 'bg-white border-t border-slate-200' : 'bg-[#0B1121]/90 border-t border-slate-800'}`}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;
          
          const activeColor = areaType === 'rural' ? 'text-[#1E40AF]' : 'text-[#00C9A7]';
          const inactiveColor = areaType === 'rural' ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-500 group-hover:text-slate-400';
          const activeBg = areaType === 'rural' ? 'bg-[#1E40AF]' : 'bg-[#00C9A7]';

          return (
            <button
              key={item.route}
              className="flex flex-col items-center justify-center flex-1 h-full relative group transition-all"
              onClick={() => navigate(item.route)}
              id={`nav-${item.label.toLowerCase()}`}
            >
              {/* Active Accent Indicator */}
              {isActive && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 ${activeBg} rounded-b-full shadow-[0_2px_10px_rgba(0,0,0,0.1)]`} />
              )}
              
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`mb-1 transition-all duration-300 ${isActive ? `${activeColor} scale-110` : inactiveColor}`} 
              />
              <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive ? activeColor : inactiveColor}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default NavBar;
