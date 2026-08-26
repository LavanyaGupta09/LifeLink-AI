import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { ArrowLeft, Activity, Users, Clock, Truck, TrendingUp, TrendingDown, ChevronLeft, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function B2BHospitalDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // --- INTERACTIVE STATE ---
  const [activeTab, setActiveTab] = useState<'radar' | 'beds' | 'stock' | 'stats' | null>('radar');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Radar State
  const [isScanning, setIsScanning] = useState(true);
  
  // Beds State
  const [icuBeds, setIcuBeds] = useState(8);
  const [o2Beds, setO2Beds] = useState(12);
  const [erBeds, setErBeds] = useState(35);
  
  // Stock State
  const [bloodStock, setBloodStock] = useState(true);
  const [defibStock, setDefibStock] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  const handleRadarClick = () => {
    setIsScanning(!isScanning);
  };

  // Stats mock data
  const statsData = [
    { label: 'Total Patients Today', value: '142', trend: '+12%', icon: <Users size={24} />, isGood: true },
    { label: 'Avg ER Wait Time', value: '18 mins', trend: '-2 mins', icon: <Clock size={24} />, isGood: true },
    { label: 'Ambulances Active', value: '24', trend: 'High Volume', icon: <Truck size={24} />, isGood: true },
    { label: 'Critical Care Avail.', value: '15%', trend: 'Low', icon: <Activity size={24} />, isGood: false },
  ];

  return (
    <div className={`w-full min-h-screen bg-[#0B1121] text-white font-sans flex flex-col relative pb-[120px] md:pb-0 px-6 py-6 transition-all duration-300 ${isSidebarExpanded ? 'md:pl-72' : ''}`}>
      
      {/* HEADER */}
      <header className="w-full flex justify-between items-center p-6 lg:px-10 lg:py-8 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          {!isSidebarExpanded && (
            <button 
              onClick={() => setIsSidebarExpanded(true)}
              className="hidden md:flex w-10 h-10 rounded-lg hover:bg-slate-800 items-center justify-center text-slate-400 transition-colors mr-2"
            >
              <Menu size={24} />
            </button>
          )}
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/20">
            MX
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Max Super Speciality</h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">Verified Facility • Delhi NCR</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button onClick={handleLogout} className="px-5 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white font-bold transition">Logout</button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full flex-1 p-6 lg:p-10 flex flex-col items-center justify-center">

        {/* OVERVIEW / EMPTY STATE */}
        {!activeTab && (
          <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in opacity-80">
            <div className="w-40 h-40 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center font-black text-6xl text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.15)] mb-8">
              MX
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Max Super Speciality</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-md text-center">Select a module from the sidebar to manage your hospital's operations.</p>
          </div>
        )}

        {/* BACK BUTTON FOR TABS */}
        {activeTab && (
          <div className="w-full max-w-4xl flex justify-start mb-6 animate-fade-in">
            <button 
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm bg-[#131B2F] px-4 py-2 rounded-xl border border-slate-800 shadow-lg active:scale-95"
            >
              <ArrowLeft size={16} /> Back to Overview
            </button>
          </div>
        )}

        {/* RADAR TAB */}
        {activeTab === 'radar' && (
          <div className="w-full max-w-2xl bg-[#131B2F] border border-slate-800 rounded-3xl p-12 lg:p-20 flex flex-col items-center justify-center relative overflow-hidden shadow-xl min-h-[500px] animate-fade-in">
             {isScanning && (
               <>
                 <div className="absolute w-96 h-96 border border-red-500/20 rounded-full animate-ping opacity-50"></div>
                 <div className="absolute w-72 h-72 border border-red-500/40 rounded-full animate-pulse opacity-75"></div>
               </>
             )}
             
             <button 
               onClick={handleRadarClick}
               className={`relative z-10 w-40 h-40 lg:w-48 lg:h-48 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${isScanning ? 'bg-red-600 shadow-[0_0_80px_rgba(220,38,38,0.6)]' : 'bg-slate-800 shadow-none'}`}
             >
                <span className="text-white font-extrabold tracking-widest text-xl lg:text-2xl">
                  {isScanning ? 'RADAR' : 'OFFLINE'}
                </span>
             </button>
             <div className="mt-16 text-center z-10">
               <p className="text-slate-300 font-medium text-xl">
                 {isScanning ? 'Monitoring trauma alerts...' : 'Radar is currently offline.'}
               </p>
               <p className={`text-2xl font-black mt-2 ${isScanning ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                 {isScanning ? '1 ACTIVE SOS' : '0 ACTIVE'}
               </p>
             </div>
          </div>
        )}

        {/* BEDS TAB */}
        {activeTab === 'beds' && (
          <div className="w-full max-w-3xl flex flex-col gap-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Live Capacity Tracker</h2>
            
            <div className="flex flex-col gap-5">
              {/* ICU */}
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-lg gap-4">
                 <div>
                   <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-2">ICU Beds</span>
                   <div className="text-5xl font-black text-white"><span className={icuBeds > 0 ? "text-emerald-400" : "text-red-500"}>{icuBeds}</span><span className="text-3xl text-slate-600">/10</span></div>
                 </div>
                 <div className="flex gap-3">
                   <button onClick={() => setIcuBeds(Math.max(0, icuBeds - 1))} className="w-16 h-16 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 text-slate-300 text-3xl font-light transition-transform">-</button>
                   <button onClick={() => setIcuBeds(Math.min(10, icuBeds + 1))} className="w-16 h-16 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 text-slate-300 text-3xl font-light transition-transform">+</button>
                 </div>
              </div>
              
              {/* O2 */}
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-lg gap-4">
                 <div>
                   <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-2">O2 Beds</span>
                   <div className="text-5xl font-black text-white"><span className={o2Beds > 0 ? "text-emerald-400" : "text-red-500"}>{o2Beds}</span><span className="text-3xl text-slate-600">/20</span></div>
                 </div>
                 <div className="flex gap-3">
                   <button onClick={() => setO2Beds(Math.max(0, o2Beds - 1))} className="w-16 h-16 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 text-slate-300 text-3xl font-light transition-transform">-</button>
                   <button onClick={() => setO2Beds(Math.min(20, o2Beds + 1))} className="w-16 h-16 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 text-slate-300 text-3xl font-light transition-transform">+</button>
                 </div>
              </div>

              {/* ER */}
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-lg gap-4">
                 <div>
                   <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-2">ER Ward</span>
                   <div className="text-5xl font-black text-white"><span className={erBeds > 0 ? "text-emerald-400" : "text-red-500"}>{erBeds}</span><span className="text-3xl text-slate-600">/50</span></div>
                 </div>
                 <div className="flex gap-3">
                   <button onClick={() => setErBeds(Math.max(0, erBeds - 1))} className="w-16 h-16 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 text-slate-300 text-3xl font-light transition-transform">-</button>
                   <button onClick={() => setErBeds(Math.min(50, erBeds + 1))} className="w-16 h-16 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-800 active:scale-95 text-slate-300 text-3xl font-light transition-transform">+</button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <div className="w-full max-w-3xl flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-2xl">🩸 Critical Inventory</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#131B2F] rounded-3xl p-8 flex flex-col gap-6 border border-slate-800 shadow-xl">
                 <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                   <span className="text-2xl font-bold text-slate-200">Universal O- Blood</span>
                   <button 
                     onClick={() => setBloodStock(!bloodStock)}
                     className={`px-8 py-4 text-base rounded-2xl font-black tracking-wider transition-all active:scale-95 shadow-lg ${bloodStock ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-emerald-500/10' : 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-red-500/10'}`}
                   >
                     {bloodStock ? 'IN STOCK' : 'EMPTY'}
                   </button>
                 </div>
                 <p className="text-slate-400 text-lg leading-relaxed bg-[#0B1121] p-4 rounded-xl border border-slate-800/50">Required immediately for unknown trauma patient incoming.</p>
              </div>

              <div className="bg-[#131B2F] rounded-3xl p-8 flex flex-col gap-6 border border-slate-800 shadow-xl">
                 <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                   <span className="text-2xl font-bold text-slate-200">AED Defibrillators</span>
                   <button 
                     onClick={() => setDefibStock(!defibStock)}
                     className={`px-8 py-4 text-base rounded-2xl font-black tracking-wider transition-all active:scale-95 shadow-lg ${defibStock ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-emerald-500/10' : 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-red-500/10'}`}
                   >
                     {defibStock ? 'IN STOCK' : 'EMPTY'}
                   </button>
                 </div>
                 <p className="text-slate-400 text-lg leading-relaxed bg-[#0B1121] p-4 rounded-xl border border-slate-800/50">Portable units available for dispatch to helipad.</p>
              </div>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Hospital Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {statsData.map((stat, i) => (
                <div key={i} className="bg-[#131B2F] rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between h-48 transition-transform hover:-translate-y-1">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-[#0B1121] border border-slate-700 rounded-2xl flex items-center justify-center text-slate-300">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-lg ${stat.isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {stat.isGood ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {stat.trend}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white mb-1">{stat.value}</h3>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING BOTTOM NAV / DESKTOP SIDEBAR */}
      <div className={`fixed bottom-6 md:bottom-auto md:top-0 md:left-0 md:h-full w-[90%] left-[5%] md:left-0 bg-[#131B2F]/90 backdrop-blur-xl border border-slate-700/50 md:border-y-0 md:border-l-0 md:border-r md:rounded-none rounded-full px-4 py-3 md:px-0 md:py-6 flex md:flex-col justify-between md:justify-start items-center gap-0 md:gap-4 shadow-2xl z-50 overflow-x-auto md:overflow-visible transition-transform duration-300 ${isSidebarExpanded ? 'md:w-64 md:items-start md:px-4 md:translate-x-0' : 'md:w-64 md:-translate-x-full'}`}>
        
        {/* Toggle Button (Desktop only) */}
        <div className="hidden md:flex w-full justify-end mb-4 pr-1">
          <button 
            onClick={() => setIsSidebarExpanded(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

         <button 
           onClick={() => setActiveTab('radar')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'radar' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'RADAR' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">📡</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">RADAR</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">RADAR</span>}
         </button>
         <button 
           onClick={() => setActiveTab('beds')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'beds' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'BEDS' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">🛏️</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">BEDS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">BEDS</span>}
         </button>
         <button 
           onClick={() => setActiveTab('stock')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'stock' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'STOCK' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">📦</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">STOCK</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">STOCK</span>}
         </button>
         <button 
           onClick={() => setActiveTab('stats')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'stats' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'STATS' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">📊</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">STATS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">STATS</span>}
         </button>
      </div>
    </div>
  );
}
