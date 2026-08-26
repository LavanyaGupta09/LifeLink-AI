import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, HeartPulse, Stethoscope, 
  Package, Pill, Activity, Settings, Bell, MessageSquare, 
  Menu, X, Home, Building2, Search, Plus, UserCircle, LogOut, Phone, ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { usePartnerStore } from '../store/partnerStore';
import { useAuthStore } from '../store/authStore';

const PartnerLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { facility, notifications } = usePartnerStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/role-select');
  };

  const navGroups = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/partner/dashboard' },
        { label: 'Appointments', icon: Calendar, path: '/partner/appointments' },
        { label: 'Patients', icon: Users, path: '/partner/patients' },
        { label: 'Services & Departments', icon: HeartPulse, path: '/partner/services' },
        { label: 'Staff Management', icon: Stethoscope, path: '/partner/staff' },
      ]
    },
    {
      title: 'INVENTORY & STOCK',
      items: [
        { label: 'Pharmacy Inventory', icon: Pill, path: '/partner/inventory/pharmacy' },
        { label: 'Lab Inventory', icon: Activity, path: '/partner/inventory/lab' },
        { label: 'Medical Equipment', icon: Package, path: '/partner/inventory/equipment' },
        { label: 'Stock Alerts', icon: Bell, path: '/partner/inventory/alerts' },
      ]
    },
    {
      title: 'FINANCE & BILLING',
      items: [
        { label: 'Billing & Invoices', icon: Package, path: '/partner/billing' },
        { label: 'Payments', icon: Package, path: '/partner/payments' },
        { label: 'Insurance Claims', icon: Package, path: '/partner/insurance-claims' },
        { label: 'Reports & Analytics', icon: Activity, path: '/partner/reports' },
      ]
    },
    {
      title: 'FACILITY MANAGEMENT',
      items: [
        { label: 'Facility Profile', icon: Building2, path: '/partner/profile' },
        { label: 'Settings', icon: Settings, path: '/partner/settings' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#040814] text-slate-200 font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      {!isSidebarCollapsed && (
        <aside className="hidden md:flex flex-col w-[260px] h-full border-r border-[#1e293b]/50 bg-[#060b14]/80 backdrop-blur-xl shrink-0 overflow-y-auto custom-scrollbar">
          {/* Sidebar Header */}
        <div className="p-6 sticky top-0 bg-[#060b14] z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00C9A7]">
                 <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
               </svg>
             </div>
             <div>
               <h1 className="text-xl font-bold text-white tracking-tight leading-none">LifeLink <span className="text-[#00C9A7]">AI</span></h1>
               <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">Facility Partner</p>
             </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 px-4 pb-6 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{group.title}</h3>
                {group.title === 'OPERATIONS' && (
                  <button 
                    onClick={() => setIsSidebarCollapsed(true)} 
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
                    title="Hide Sidebar"
                  >
                    <ChevronLeft size={12} /> Collapse
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#00C9A7]/20 to-transparent text-[#00C9A7] border-l-2 border-[#00C9A7]' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#00C9A7]' : 'text-slate-500'} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Support */}
        <div className="p-4 mt-auto sticky bottom-0 bg-[#060b14]">
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone size={16} className="text-[#3D91FF]" />
              <div className="text-xs">
                <p className="font-bold">Need Help?</p>
                <p className="text-[10px] text-slate-400">24/7 Partner Support</p>
              </div>
            </div>
            <button className="w-full bg-[#3D91FF]/10 hover:bg-[#3D91FF]/20 text-[#3D91FF] py-2 rounded-lg text-xs font-bold transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="h-[72px] shrink-0 border-b border-[#1e293b]/50 bg-[#060b14]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-20 gap-4">
          
          {/* Unified Left Section (Logo, Menu, Back) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Drawer Toggle (visible < md) */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>

            {/* Desktop Sidebar Toggle (visible >= md, only when collapsed) */}
            <button 
              onClick={() => setIsSidebarCollapsed(false)} 
              className={`hidden ${isSidebarCollapsed ? 'md:flex' : 'md:hidden'} p-2 -ml-2 text-slate-400 hover:text-white`}
              title="Expand Sidebar"
            >
              <Menu size={24} />
            </button>

            {/* Logo (visible < md OR when sidebar collapsed >= md) */}
            <div className={`flex items-center gap-2 cursor-pointer ${!isSidebarCollapsed ? 'md:hidden' : ''}`} onClick={() => navigate('/partner/dashboard')}>
              <HeartPulse size={20} className="text-[#00C9A7]" />
              <h1 className="text-lg font-bold text-white tracking-tight leading-none hidden sm:block">LifeLink <span className="text-[#00C9A7]">AI</span></h1>
            </div>

            {/* Back Button */}
            {location.pathname !== '/partner/dashboard' && (
              <button 
                onClick={() => navigate('/partner/dashboard')} 
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-[#131b2f] border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} />
              </button>
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
              placeholder="Search patients, appointments, orders..." 
              className="w-full bg-[#0B1221] border border-slate-800 focus:border-[#3D91FF] focus:outline-none rounded-full py-2.5 pr-4 text-sm text-white placeholder-slate-500 transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-[#131b2f] border border-slate-700 rounded-md">⌘</kbd>
              <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-[#131b2f] border border-slate-700 rounded-md">K</kbd>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 md:gap-5">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors hidden md:block">
              <MessageSquare size={20} />
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#060b14]"></span>
              )}
            </button>
            
            <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-white/5 p-1 pr-3 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                  <Building2 size={16} />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-bold text-white leading-tight">{facility.name}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${facility.verified ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <span className="text-[10px] font-medium text-slate-400">{facility.verified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#0B1221] border border-slate-800 rounded-xl shadow-xl shadow-black/50 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-800 md:hidden">
                    <p className="text-sm font-bold text-white">{facility.name}</p>
                    <p className="text-xs text-slate-400">{facility.type}</p>
                  </div>
                  <NavLink to="/partner/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    <UserCircle size={16} /> View Profile
                  </NavLink>
                  <NavLink to="/partner/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    <Settings size={16} /> Settings
                  </NavLink>
                  <div className="h-[1px] bg-slate-800 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#040814] pb-24 md:pb-8">
          <Outlet />
        </main>

      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#060B14] border-r border-slate-800 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HeartPulse size={24} className="text-[#00C9A7]" />
                <span className="font-bold text-white text-lg">LifeLink <span className="text-[#00C9A7]">AI</span></span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {navGroups.map((group, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between px-3 mb-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{group.title}</h3>
                    {group.title === 'OPERATIONS' && (
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
                        title="Close Sidebar"
                      >
                        <ChevronLeft size={12} /> Collapse
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? 'bg-[#00C9A7]/10 text-[#00C9A7]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#060b14]/90 backdrop-blur-xl border-t border-slate-800 z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink to="/partner/dashboard" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#00C9A7]' : 'text-slate-500'}`}>
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink to="/partner/appointments" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#00C9A7]' : 'text-slate-500'}`}>
          <Calendar size={20} />
          <span className="text-[10px] font-medium">Bookings</span>
        </NavLink>
        <div className="relative -top-5">
          <button className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border-4 border-[#040814]">
            <Plus size={24} />
          </button>
        </div>
        <NavLink to="/partner/inventory/pharmacy" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#00C9A7]' : 'text-slate-500'}`}>
          <Package size={20} />
          <span className="text-[10px] font-medium">Inventory</span>
        </NavLink>
        <NavLink to="/partner/patients" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#00C9A7]' : 'text-slate-500'}`}>
          <Users size={20} />
          <span className="text-[10px] font-medium">Patients</span>
        </NavLink>
      </div>

    </div>
  );
};

export default PartnerLayout;
