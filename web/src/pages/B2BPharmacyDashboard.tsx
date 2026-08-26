import React, { useState, useEffect } from 'react';
import '../index.css';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Menu } from 'lucide-react';

export default function B2BPharmacyDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setOrders(data);
    };
    fetchOrders();

    // Subscribe to new prescriptions
    const subscription = supabase
      .channel('public:prescriptions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prescriptions' }, payload => {
        setOrders(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const formatTimeAgo = (isoString: string) => {
    if (!isoString) return 'Just Now';
    const mins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    return mins < 1 ? 'Just Now' : `${mins}m ago`;
  };

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
            AP
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Apollo Pharmacy</h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">Central Fulfillment • Delhi NCR</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-3 bg-[#131B2F] border border-slate-800 rounded-xl hover:bg-slate-800 font-bold transition">Settings</button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full flex-1 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* LEFT PANE: ACTIVE ORDERS (Spans 8 cols on desktop) */}
        <div className="w-full bg-[#131B2F] border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
            <h3 className="text-white font-bold flex items-center gap-2 text-xl">📦 Pending e-Prescriptions</h3>
            <span className="bg-red-500/20 text-red-400 text-sm font-bold px-3 py-1 rounded-lg tracking-wider">{orders.length} NEW</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {orders.length === 0 ? (
               <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-slate-500 py-12">
                 <p className="font-bold tracking-widest uppercase">No pending prescriptions</p>
               </div>
            ) : (
              orders.map((order, idx) => (
                <div key={order.id || idx} className="bg-[#0B1121] rounded-2xl p-6 border border-emerald-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                   <div>
                     <div className="flex justify-between items-start mb-4">
                       <span className="font-black text-emerald-400 text-lg">RX-{String(order.id).padStart(4, '0')}</span>
                       <span className="text-slate-400 text-sm font-bold bg-slate-800/50 px-2 py-1 rounded flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                          {formatTimeAgo(order.created_at)}
                       </span>
                     </div>
                     <h4 className="font-bold text-white text-xl mb-1">{order.medicine}</h4>
                     <p className="text-slate-400 text-sm font-bold mb-3">{order.dosage} • {order.duration}</p>
                     <p className="text-slate-500 text-sm font-medium border-t border-slate-800 pt-3">Patient ID: {order.patient_id}</p>
                   </div>
                   <button 
                     onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                     className="w-full mt-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg font-bold transition-transform active:scale-95 text-base flex items-center justify-center gap-2"
                   >
                     Accept & Fulfill
                   </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE: INVENTORY & REVENUE (Spans 4 cols on desktop) */}
        <div className="w-full lg:col-span-4 flex flex-col gap-6 lg:gap-8">
          
          {/* INVENTORY MANAGER */}
          <div className="w-full bg-[#131B2F] border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-xl">💊 Inventory Alerts</h3>
              <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest cursor-pointer hover:text-emerald-300 transition-colors">Sync CSV</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex bg-[#0B1121] rounded-2xl p-4 items-center justify-between border border-slate-800/50">
                 <span className="text-base font-medium text-slate-200">Paracetamol 500mg</span>
                 <button className="px-4 py-2 text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-xl font-bold">In Stock</button>
              </div>
              <div className="flex bg-[#0B1121] rounded-2xl p-4 items-center justify-between border border-slate-800/50">
                 <span className="text-base font-medium text-slate-200">Insulin Glargine</span>
                 <button className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl font-bold animate-pulse">Low Stock</button>
              </div>
            </div>
          </div>

          {/* REVENUE */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl">
               <span className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider text-center">Today's Earnings</span>
               <div className="text-3xl lg:text-4xl font-black text-emerald-400">₹450</div>
            </div>
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl">
               <span className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider text-center">Pending Payout</span>
               <div className="text-3xl lg:text-4xl font-black text-amber-400">₹1.2K</div>
            </div>
          </div>

        </div>
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

        <button className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl text-emerald-400 md:bg-emerald-500/10 ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'ORDERS' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">📦</span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">ORDERS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">ORDERS</span>}
        </button>
        <button className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50 ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'STOCK' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">💊</span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">STOCK</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">STOCK</span>}
        </button>
        <button className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50 ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'ALERTS' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">⚠️</span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">ALERTS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">ALERTS</span>}
        </button>
        <button className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50 ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'PAYOUTS' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">💸</span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">PAYOUTS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">PAYOUTS</span>}
        </button>
      </div>

    </div>
  );
}
