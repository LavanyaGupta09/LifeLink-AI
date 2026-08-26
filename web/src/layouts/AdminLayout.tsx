import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Users, Building2, Activity, 
  ShieldAlert, Settings, Bell, Search, 
  Menu, X, Home, FileText, ChevronRight, PieChart,
  Server
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';

const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { alerts, reports } = useAdminStore();

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const newReports = reports.filter(r => r.status === 'New').length;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <Home size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Providers', path: '/admin/providers', icon: <Building2 size={20} /> },
    { name: 'Activity Log', path: '/admin/activity', icon: <Activity size={20} /> },
    { 
      name: 'Security Center', 
      path: '/admin/security', 
      icon: <ShieldAlert size={20} />, 
      badge: activeAlerts > 0 ? activeAlerts : undefined,
      badgeColor: 'bg-red-500'
    },
    { 
      name: 'System Health', 
      path: '/admin/system-health', 
      icon: <Server size={20} /> 
    },
    { 
      name: 'Reports & Complaints', 
      path: '/admin/reports', 
      icon: <FileText size={20} />,
      badge: newReports > 0 ? newReports : undefined,
      badgeColor: 'bg-orange-500'
    },
    { name: 'Analytics', path: '/admin/analytics', icon: <PieChart size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#060b14] text-slate-300 font-sans overflow-hidden">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      {!isSidebarCollapsed && (
        <aside className="hidden md:flex flex-col w-[260px] h-full shrink-0 border-r border-[#1e293b]/50 bg-[#060b14] relative z-30 transition-all duration-300">
          
          {/* Header */}
          <div className="p-6 sticky top-0 bg-[#060b14] z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <ShieldCheck size={22} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">LifeLink <span className="text-indigo-400">AI</span></h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 uppercase">System Admin</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarCollapsed(true)} className="p-1 text-slate-500 hover:text-white transition-colors lg:hidden">
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 flex flex-col gap-1 mt-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Management</div>
            {menuItems.slice(0, 3).map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin/providers' && location.pathname.startsWith('/admin/providers'));
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-6">Monitoring</div>
            {menuItems.slice(3, 8).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-6">System</div>
            {menuItems.slice(8).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer Profile */}
          <div className="p-4 mt-auto border-t border-slate-800/50 bg-[#060b14]">
            <div 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors"
              onClick={() => navigate('/admin/profile')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Administrator</p>
                  <p className="text-[10px] text-slate-400">admin@lifelink.ai</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </div>
            <button 
              onClick={handleLogout}
              className="w-full mt-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Secure Logout
            </button>
          </div>
        </aside>
      )}

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a]">
        
        {/* TOP HEADER */}
        <header className="h-[72px] shrink-0 border-b border-[#1e293b]/50 bg-[#060b14]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-20 gap-4">
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop Sidebar Toggle */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-white"
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>

            {/* Mobile Header Logo */}
            <div className="flex md:hidden items-center gap-2" onClick={() => navigate('/admin/dashboard')}>
              <ShieldCheck size={24} className="text-indigo-400" />
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">LifeLink <span className="text-indigo-400">Admin</span></h1>
            </div>

            {/* Logo on Desktop when sidebar is collapsed */}
            {isSidebarCollapsed && (
              <div className="hidden md:flex items-center gap-2 cursor-pointer ml-2" onClick={() => navigate('/admin/dashboard')}>
                <ShieldCheck size={20} className="text-indigo-400" />
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">LifeLink <span className="text-indigo-400">AI</span></h1>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500" size={18} />
            </div>
            <input 
              type="text" 
              style={{ paddingLeft: '44px' }}
              placeholder="Search users, providers, hospitals, or activities..." 
              className="w-full bg-[#111827] border border-slate-700 focus:border-indigo-500 focus:outline-none rounded-full py-2 pr-4 text-sm text-white placeholder-slate-500 transition-colors shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-[#1e293b] border border-slate-700 rounded-md">⌘</kbd>
              <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-[#1e293b] border border-slate-700 rounded-md">K</kbd>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 md:gap-5">
            <button className="md:hidden p-2 text-slate-400 hover:text-white">
              <Search size={20} />
            </button>
            <button 
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => navigate('/admin/notifications')}
            >
              <Bell size={20} />
              {(activeAlerts + newReports) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#060b14]"></span>
              )}
            </button>
            <div 
              className="hidden md:flex w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 items-center justify-center font-bold text-sm cursor-pointer hover:bg-indigo-500/30 transition-colors"
              onClick={() => navigate('/admin/profile')}
            >
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#060b14]/90 backdrop-blur-lg border-t border-slate-800/50 px-2 pb-safe pt-2 flex items-center justify-between z-40">
        {[
          { name: 'Home', path: '/admin/dashboard', icon: <Home size={22} /> },
          { name: 'Providers', path: '/admin/providers', icon: <Building2 size={22} /> },
          { name: 'Users', path: '/admin/users', icon: <Users size={22} /> },
          { name: 'Activity', path: '/admin/activity', icon: <Activity size={22} /> },
        ].map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/admin/providers' && location.pathname.startsWith('/admin/providers'));
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
        >
          <div className="p-1.5 rounded-xl text-slate-400">
            <Menu size={22} />
          </div>
          <span className="text-[10px] font-medium text-slate-500">More</span>
        </button>
      </nav>

      {/* ─── MOBILE DRAWER (HAMBURGER) ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="w-[280px] bg-[#0B1221] h-full relative flex flex-col animate-slide-left shadow-2xl border-l border-slate-800">
            <div className="p-5 flex items-center justify-between border-b border-slate-800/50 bg-[#060b14]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Admin Menu</h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#131b2f] border border-slate-800 text-slate-300 hover:text-white active:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">{item.icon}</div>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#060b14] border-t border-slate-800/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 font-bold text-sm rounded-xl"
              >
                Secure Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
