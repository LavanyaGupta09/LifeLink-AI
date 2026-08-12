import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Users, QrCode, Heart, Building2, Briefcase, CloudOff } from 'lucide-react';
import { useOfflineSyncStore } from '../store/offlineSyncStore';

const navItems = [
  { icon: Home,      label: 'Home',      route: '/dashboard' },
  { icon: Activity,  label: 'Symptoms',  route: '/symptoms' },
  { icon: Building2, label: 'Hospitals', route: '/hospitals' },
  { icon: Heart,     label: 'Blood',     route: '/blood' },
  { icon: Briefcase, label: 'Partner',   route: '/vendor' },
];

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOffline, queueSize } = useOfflineSyncStore();

  const hiddenRoutes = ['/', '/onboarding', '/sos', '/login', '/role-select', '/b2b/auth', '/b2b/pending-review'];
  if (hiddenRoutes.some(r => location.pathname === r) || location.pathname.startsWith('/b2b/') || location.pathname.startsWith('/admin/')) return null;
  return (
    <div className="nav-bar pb-[env(safe-area-inset-bottom)]">
      {isOffline && (
        <div className="offline-indicator">
          <CloudOff size={14} />
          <span>Offline {queueSize > 0 ? `(${queueSize})` : ''}</span>
        </div>
      )}
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.route;
        return (
          <button
            key={item.route}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.route)}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <div className="nav-icon-wrap">
              <Icon size={20} />
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavBar;
