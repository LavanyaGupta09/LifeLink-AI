import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Stethoscope, LayoutDashboard, Video, Calendar, Users,
  FileText, Activity, DollarSign, Star, Settings,
  HelpCircle, ChevronLeft, Menu, VideoOff,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DoctorLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Doctor On-Call', path: '/doctor/on-call', icon: <Video size={18} /> },
    { name: 'Live Consultations', path: '/doctor/consultations', icon: <Activity size={18} /> },
    { name: 'Scheduled', path: '/doctor/scheduled', icon: <Calendar size={18} /> },
    { name: 'Patients', path: '/doctor/patients', icon: <Users size={18} /> },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: <FileText size={18} /> },
    { name: 'Medical Records', path: '/doctor/medical-records', icon: <Stethoscope size={18} /> },
    { name: 'Earnings', path: '/doctor/earnings', icon: <DollarSign size={18} /> },
    { name: 'Reviews & Ratings', path: '/doctor/reviews', icon: <Star size={18} /> },
    { name: 'Settings', path: '/doctor/settings', icon: <Settings size={18} /> },
    { name: 'Help & Support', path: '/doctor/support', icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="w-full h-screen flex bg-[#060B14] text-white font-sans overflow-hidden">
      {/* LEFT SIDEBAR (Desktop Only) */}
      <aside className={`bg-[#0B1121] border-slate-800/80 flex flex-col flex-shrink-0 relative z-20 transition-all duration-300 hidden md:flex ${isSidebarExpanded ? 'w-64 border-r' : 'w-0 opacity-0 overflow-hidden border-r-0'}`}>
        <div className={`h-16 flex items-center px-4 justify-between border-b border-slate-800/80 w-64`}>
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#009E83] flex items-center justify-center font-bold text-white shadow-lg shadow-[#00C9A7]/20 mr-3">
              <Stethoscope size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">LifeLink<span className="text-emerald-400">AI</span></h1>
          </div>
          {isSidebarExpanded && (
            <button
              onClick={() => setIsSidebarExpanded(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors overflow-hidden ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="whitespace-nowrap">{item.name}</span>
            </NavLink>
          ))}
        </div>
        
        {isSidebarExpanded && (
           <div className="p-4 border-t border-slate-800/80 bg-gradient-to-br from-[#0f172a] to-[#020617]">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-4 rounded-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 blur-xl rounded-full"></div>
                 <h4 className="text-white font-bold text-sm mb-1 relative z-10">Upgrade Your Practice</h4>
                 <p className="text-slate-400 text-xs mb-3 relative z-10">Unlock more patients and advanced features.</p>
                 <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xs font-bold text-white relative z-10 hover:shadow-lg hover:shadow-purple-500/30 transition-all">Upgrade Now</button>
              </div>
           </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#060B14] relative">
        {/* TOP HEADER */}
        <header className="h-16 bg-[#0B1121] border-b border-slate-800/80 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* Mobile Branding */}
            <div className="flex items-center md:hidden gap-2">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-[#00C9A7] to-[#009E83] flex items-center justify-center text-white shadow-lg shadow-[#00C9A7]/20">
                <Stethoscope size={14} />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white whitespace-nowrap">LifeLink</h1>
            </div>

            {/* Desktop Toggle & Title */}
            {!isSidebarExpanded && (
              <button
                onClick={() => setIsSidebarExpanded(true)}
                className="hidden md:flex w-8 h-8 rounded-lg hover:bg-slate-800 items-center justify-center text-slate-400 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold text-white hidden md:block ml-2">Doctor Portal</h2>
          </div>
          
          <div className="flex-1"></div>

          <div className="flex items-center gap-4 pl-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">Dr. {user?.fullName || 'Demo User'}</p>
                <p className="text-xs text-slate-400">Internal Medicine</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
                {user?.fullName?.charAt(0) || 'D'}
              </div>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`hidden sm:flex px-5 py-2 rounded-lg border transition-all font-bold text-sm items-center gap-2 ${
                isOnline
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                  : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
              }`}
            >
              {isOnline ? <><VideoOff size={16} /> Go Offline</> : <><Video size={16} /> Go Online</>}
            </button>
          </div>
        </header>

        {/* MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 bottom-0 w-64 bg-[#0B1121] border-r border-slate-800 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#060B14]">
                <span className="font-bold text-lg text-white">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="shrink-0">{item.icon}</div>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`w-full py-3 rounded-lg border transition-all font-bold text-sm flex justify-center items-center gap-2 ${
                    isOnline
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      : 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {isOnline ? <><VideoOff size={16} /> Go Offline</> : <><Video size={16} /> Go Online</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-20 md:pb-0">
          <Outlet />
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-[#0B1121]/95 backdrop-blur-md border-t border-slate-800/80 z-30 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {[
            { name: 'Home', path: '/doctor/dashboard', icon: <LayoutDashboard size={22} /> },
            { name: 'Patients', path: '/doctor/patients', icon: <Users size={22} /> },
            { name: 'Schedule', path: '/doctor/scheduled', icon: <Calendar size={22} /> },
            { name: 'Chat', path: '/doctor/consultations', icon: <Activity size={22} /> },
            { name: 'Profile', path: '/doctor/settings', icon: <Settings size={22} /> },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors relative ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon}
                  <span className="text-[10px] font-semibold">{item.name}</span>
                  {isActive && <div className="absolute top-0 w-8 h-1 bg-emerald-500 rounded-b-full"></div>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
