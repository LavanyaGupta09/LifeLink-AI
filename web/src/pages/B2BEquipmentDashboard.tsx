import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Package, Wrench, Truck, DollarSign, ShieldCheck, BarChart3, Clock,
  Plus, Search, ChevronRight, CheckCircle2, AlertTriangle, Star, Phone,
  ArrowRight, Edit3, Eye, XCircle, RefreshCw, ClipboardCheck, Sparkles,
  TrendingUp, Users, Activity, Settings, MapPin, Filter, FileText, ChevronLeft, Menu, LogOut
} from 'lucide-react';
import {
  EQUIPMENT_CATALOG,
  MOCK_ORDERS,
  MOCK_RENTALS,
  MOCK_MAINTENANCE,
  MOCK_DELIVERY_PERSONNEL,
  MOCK_REVENUE,
  MOCK_REVIEWS,
  MOCK_PROVIDER,
  type EquipmentOrder,
  type ActiveRental,
  type MaintenanceItem,
  type MaintenanceStage,
  type OrderStatus,
} from '../data/equipmentData';

type DashboardTab = 'command' | 'inventory' | 'orders' | 'maintenance' | 'logistics' | 'revenue' | 'verification';

const NAV_ITEMS: { id: DashboardTab; icon: React.ReactNode; label: string }[] = [
  { id: 'command', icon: <BarChart3 size={22} />, label: 'COMMAND' },
  { id: 'inventory', icon: <Package size={22} />, label: 'INVENTORY' },
  { id: 'orders', icon: <RefreshCw size={22} />, label: 'ORDERS' },
  { id: 'maintenance', icon: <Wrench size={22} />, label: 'MAINTAIN' },
  { id: 'logistics', icon: <Truck size={22} />, label: 'LOGISTICS' },
  { id: 'revenue', icon: <DollarSign size={22} />, label: 'REVENUE' },
  { id: 'verification', icon: <ShieldCheck size={22} />, label: 'VERIFY' },
];

const ORDER_PIPELINE: OrderStatus[] = ['new', 'confirmed', 'preparing', 'dispatched', 'delivered'];
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-rose-500', confirmed: 'bg-amber-500', preparing: 'bg-cyan-500', dispatched: 'bg-blue-500', delivered: 'bg-emerald-500',
};
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: '🆕 New', confirmed: '✅ Confirmed', preparing: '📦 Preparing', dispatched: '🚚 Dispatched', delivered: '✓ Delivered',
};

const MAINTENANCE_PIPELINE: MaintenanceStage[] = ['returned', 'inspection', 'sanitization', 'maintenance', 'cleared'];
const MAINTENANCE_LABELS: Record<MaintenanceStage, { emoji: string; label: string; color: string }> = {
  returned: { emoji: '📥', label: 'Returned', color: 'text-slate-400' },
  inspection: { emoji: '🔍', label: 'Inspection', color: 'text-amber-400' },
  sanitization: { emoji: '🧹', label: 'Sanitization', color: 'text-cyan-400' },
  maintenance: { emoji: '🔧', label: 'Maintenance', color: 'text-purple-400' },
  cleared: { emoji: '✅', label: 'Available', color: 'text-emerald-400' },
};

const EQUIP_STATUS_CONFIG: Record<string, { label: string; dotColor: string; textColor: string }> = {
  available: { label: '🟢 Available', dotColor: 'bg-emerald-500', textColor: 'text-emerald-400' },
  rented: { label: '🟡 Rented', dotColor: 'bg-amber-500', textColor: 'text-amber-400' },
  sold: { label: '🔵 Sold', dotColor: 'bg-blue-500', textColor: 'text-blue-400' },
  maintenance: { label: '🔴 Maintenance', dotColor: 'bg-rose-500', textColor: 'text-rose-400' },
};

export default function B2BEquipmentDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>('command');
  const [ordersSubTab, setOrdersSubTab] = useState<'pipeline' | 'rentals'>('pipeline');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [rentals, setRentals] = useState(MOCK_RENTALS);
  const [maintenanceItems, setMaintenanceItems] = useState(MOCK_MAINTENANCE);
  const [inventorySearch, setInventorySearch] = useState('');
  const [showAddEquipment, setShowAddEquipment] = useState(false);

  // Stats
  const activeOrders = orders.filter(o => o.status !== 'delivered').length;
  const activeRentals = rentals.filter(r => r.status === 'active').length;
  const pendingOrders = orders.filter(o => o.status === 'new').length;
  const overdueRentals = rentals.filter(r => r.status === 'overdue').length;

  const advanceOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const idx = ORDER_PIPELINE.indexOf(o.status);
      if (idx < ORDER_PIPELINE.length - 1) return { ...o, status: ORDER_PIPELINE[idx + 1] };
      return o;
    }));
  };

  const advanceMaintenance = (itemId: string) => {
    setMaintenanceItems(prev => prev.map(m => {
      if (m.id !== itemId) return m;
      const idx = MAINTENANCE_PIPELINE.indexOf(m.stage);
      if (idx < MAINTENANCE_PIPELINE.length - 1) {
        return {
          ...m,
          stage: MAINTENANCE_PIPELINE[idx + 1],
          sanitizationCert: MAINTENANCE_PIPELINE[idx + 1] === 'sanitization' || m.sanitizationCert,
        };
      }
      return m;
    }));
  };

  const markRentalReturned = (rentalId: string) => {
    setRentals(prev => prev.map(r => r.id === rentalId ? { ...r, status: 'returned' as const } : r));
  };

  const filteredInventory = EQUIPMENT_CATALOG.filter(eq =>
    !inventorySearch || eq.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    eq.brand.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const revenueMax = Math.max(...MOCK_REVENUE.monthlyBreakdown.map(m => m.rental + m.sales));

  return (
    <div className={`w-full min-h-screen bg-[#0B1121] text-white font-sans flex flex-col relative pb-[120px] md:pb-0 px-0 py-0 transition-all duration-300 ${isSidebarExpanded ? 'md:pl-64' : ''}`}>

      {/* ═══════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════ */}
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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center font-bold text-2xl shadow-lg shadow-cyan-500/20">
            ME
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              {MOCK_PROVIDER.businessName}
              {MOCK_PROVIDER.verificationStatus === 'verified' && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">Equipment Provider • {MOCK_PROVIDER.serviceAreas.slice(0, 2).join(', ')} +{MOCK_PROVIDER.serviceAreas.length - 2}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/settings')} className="px-5 py-3 bg-[#131B2F] border border-slate-800 rounded-xl hover:bg-slate-800 font-bold transition text-sm">
            <Settings size={16} className="inline mr-2" />Settings
          </button>
          <button onClick={handleLogout} className="px-5 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white font-bold transition text-sm flex items-center gap-2">
            <LogOut size={16} />Logout
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════ */}
      <main className="w-full flex-1 p-4 lg:p-8 overflow-y-auto">

        {/* MODULE TAB BAR (Mobile) */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide mb-4">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#131B2F] text-slate-500 border-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            MODULE 0: COMMAND CENTER
            ═══════════════════════════════════════════ */}
        {activeTab === 'command' && (
          <div className="space-y-6 lg:space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Active Orders', value: activeOrders, icon: <Package size={20} />, color: 'cyan', glow: 'shadow-cyan-500/10' },
                { label: 'Active Rentals', value: activeRentals, icon: <Clock size={20} />, color: 'emerald', glow: 'shadow-emerald-500/10' },
                { label: 'Pending Requests', value: pendingOrders, icon: <AlertTriangle size={20} />, color: 'amber', glow: 'shadow-amber-500/10' },
                { label: "Today's Revenue", value: `₹${(MOCK_REVENUE.todayRevenue / 1000).toFixed(1)}K`, icon: <TrendingUp size={20} />, color: 'purple', glow: 'shadow-purple-500/10' },
              ].map((metric, i) => (
                <div key={i} className={`bg-[#131B2F] border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl ${metric.glow} relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-${metric.color}-500/5 rounded-full blur-2xl`} />
                  <div className={`w-10 h-10 bg-${metric.color}-500/10 rounded-xl flex items-center justify-center mb-3 text-${metric.color}-400`}>
                    {metric.icon}
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{metric.label}</p>
                  <p className="text-2xl lg:text-3xl font-black text-white">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Overdue Alert */}
            {overdueRentals > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-rose-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-rose-300">{overdueRentals} Overdue Rental{overdueRentals > 1 ? 's' : ''}</p>
                  <p className="text-xs text-slate-400">Equipment not returned past rental end date</p>
                </div>
                <button
                  onClick={() => { setActiveTab('orders'); setOrdersSubTab('rentals'); }}
                  className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition-colors"
                >
                  View
                </button>
              </div>
            )}

            {/* Delivery Schedule Timeline */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Truck size={18} className="text-cyan-400" /> Upcoming Deliveries & Pickups
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {orders.filter(o => o.status !== 'delivered').slice(0, 6).map((order, i) => (
                  <div key={order.id} className="min-w-[200px] bg-[#0B1121] border border-slate-800/50 rounded-2xl p-4 flex-shrink-0 relative">
                    <div className={`absolute top-0 left-0 w-full h-0.5 ${ORDER_STATUS_COLORS[order.status]}`} />
                    <p className="text-xs font-bold text-slate-500 mb-1">{order.deliveryDate}</p>
                    <h4 className="text-sm font-bold text-white mb-1">{order.equipmentName}</h4>
                    <p className="text-xs text-slate-400 mb-2">{order.customerName}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${ORDER_STATUS_COLORS[order.status]}/20 ${
                      order.status === 'new' ? 'text-rose-400 bg-rose-500/10' :
                      order.status === 'confirmed' ? 'text-amber-400 bg-amber-500/10' :
                      order.status === 'preparing' ? 'text-cyan-400 bg-cyan-500/10' :
                      'text-blue-400 bg-blue-500/10'
                    }`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <BarChart3 size={18} className="text-cyan-400" /> Monthly Revenue
              </h3>
              <div className="flex items-end gap-4 h-40">
                {MOCK_REVENUE.monthlyBreakdown.map((m, i) => {
                  const totalHeight = ((m.rental + m.sales) / revenueMax) * 100;
                  const rentalHeight = (m.rental / (m.rental + m.sales)) * totalHeight;
                  const salesHeight = totalHeight - rentalHeight;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '120px' }}>
                        <div className="w-8 lg:w-10 flex flex-col rounded-t-lg overflow-hidden">
                          <div className="bg-cyan-500/80 transition-all duration-500" style={{ height: `${rentalHeight}px` }} />
                          <div className="bg-purple-500/60 transition-all duration-500" style={{ height: `${salesHeight}px` }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{m.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-6 mt-4 justify-center">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><span className="w-3 h-3 bg-cyan-500/80 rounded" /> Rentals</span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-500/60 rounded" /> Sales</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MODULE 1: INVENTORY MANAGEMENT
            ═══════════════════════════════════════════ */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package size={20} className="text-cyan-400" /> Equipment Inventory
                <span className="text-sm bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-lg font-bold ml-2">{EQUIPMENT_CATALOG.length} items</span>
              </h2>
              <div className="flex gap-3">
                <div className="relative flex-1 lg:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className="w-full bg-[#131B2F] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Search equipment..."
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowAddEquipment(!showAddEquipment)}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <Plus size={16} /> Add Equipment
                </button>
              </div>
            </div>

            {/* Add Equipment Form (toggle) */}
            {showAddEquipment && (
              <div className="bg-[#131B2F] border border-cyan-500/30 rounded-3xl p-6 shadow-xl animate-fade-in">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-cyan-400" /> Add New Equipment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Equipment Name', 'Brand', 'Serial Number', 'Category', 'Condition', 'Rent Price/mo'].map(field => (
                    <div key={field}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{field}</label>
                      <input className="w-full bg-[#0B1121] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50" placeholder={field} />
                    </div>
                  ))}
                  {['Buy Price', 'Security Deposit'].map(field => (
                    <div key={field}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{field}</label>
                      <input className="w-full bg-[#0B1121] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50" placeholder={`₹ ${field}`} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-colors">Save Equipment</button>
                  <button onClick={() => setShowAddEquipment(false)} className="px-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Inventory Table */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Equipment', 'Category', 'Brand', 'Serial #', 'Condition', 'Rent/mo', 'Buy', 'Deposit', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(eq => {
                      const statusCfg = EQUIP_STATUS_CONFIG[eq.status];
                      return (
                        <tr key={eq.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{eq.emoji}</span>
                              <span className="font-bold text-white text-sm whitespace-nowrap">{eq.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{eq.category}</td>
                          <td className="px-4 py-3 text-slate-400">{eq.brand}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{eq.serialNumber}</td>
                          <td className="px-4 py-3 text-slate-400">{eq.condition}</td>
                          <td className="px-4 py-3 text-white font-bold">₹{eq.rentPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-white font-bold">₹{eq.buyPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-amber-400 font-bold">₹{eq.securityDeposit.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold ${statusCfg.textColor}`}>{statusCfg.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 transition-colors">
                                <Edit3 size={14} />
                              </button>
                              <button className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 transition-colors">
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MODULE 2: ORDERS & RENTAL CYCLE
            ═══════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrdersSubTab('pipeline')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  ordersSubTab === 'pipeline'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#131B2F] text-slate-500 border-slate-800'
                }`}
              >
                📦 Order Pipeline
              </button>
              <button
                onClick={() => setOrdersSubTab('rentals')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  ordersSubTab === 'rentals'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#131B2F] text-slate-500 border-slate-800'
                }`}
              >
                🔄 Active Rentals
              </button>
            </div>

            {/* ORDER PIPELINE */}
            {ordersSubTab === 'pipeline' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {ORDER_PIPELINE.map(stage => {
                  const stageOrders = orders.filter(o => o.status === stage);
                  return (
                    <div key={stage} className="bg-[#131B2F] border border-slate-800 rounded-3xl p-4 shadow-xl">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/50">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ORDER_STATUS_COLORS[stage]}`} />
                          {ORDER_STATUS_LABELS[stage]}
                        </h4>
                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{stageOrders.length}</span>
                      </div>
                      <div className="space-y-3">
                        {stageOrders.map(order => (
                          <div key={order.id} className="bg-[#0B1121] rounded-2xl p-4 border border-slate-800/50 relative">
                            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${ORDER_STATUS_COLORS[stage]}`} />
                            <p className="text-xs font-bold text-cyan-400 mb-1">{order.id}</p>
                            <h5 className="text-sm font-bold text-white mb-1">{order.equipmentName}</h5>
                            <p className="text-xs text-slate-400 mb-1">{order.customerName}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs font-bold text-slate-500">
                                {order.orderType === 'rent' ? `🔄 ${order.rentalDuration}` : '🛒 Purchase'}
                              </span>
                              <span className="text-xs font-bold text-white">₹{order.amount.toLocaleString()}</span>
                            </div>
                            {stage !== 'delivered' && (
                              <button
                                onClick={() => advanceOrder(order.id)}
                                className="w-full mt-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1"
                              >
                                Advance <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        {stageOrders.length === 0 && (
                          <p className="text-xs text-slate-600 text-center py-4 font-bold">No orders</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ACTIVE RENTALS */}
            {ordersSubTab === 'rentals' && (
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800/50">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" /> Active Rental Tracker
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Equipment', 'Customer', 'Start Date', 'End Date', 'Days Left', 'Rate/mo', 'Deposit', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map(r => (
                        <tr key={r.id} className={`border-b border-slate-800/50 transition-colors ${r.status === 'overdue' ? 'bg-rose-500/5' : 'hover:bg-slate-800/20'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{r.equipmentEmoji}</span>
                              <span className="font-bold text-white text-sm whitespace-nowrap">{r.equipmentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.customerName}</td>
                          <td className="px-4 py-3 text-slate-400">{r.startDate}</td>
                          <td className="px-4 py-3 text-slate-400">{r.endDate}</td>
                          <td className="px-4 py-3">
                            {r.daysRemaining < 0 ? (
                              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg">{Math.abs(r.daysRemaining)}d overdue</span>
                            ) : r.daysRemaining <= 3 ? (
                              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">{r.daysRemaining}d left</span>
                            ) : (
                              <span className="text-xs font-bold text-emerald-400">{r.daysRemaining}d left</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white font-bold">₹{r.monthlyRate.toLocaleString()}</td>
                          <td className="px-4 py-3 text-amber-400 font-bold">₹{r.deposit.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              r.status === 'overdue' ? 'text-rose-400 bg-rose-500/10' :
                              r.status === 'returned' ? 'text-slate-400 bg-slate-800' :
                              'text-emerald-400 bg-emerald-500/10'
                            }`}>
                              {r.status === 'overdue' ? '⚠️ Overdue' : r.status === 'returned' ? '✓ Returned' : '🟢 Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {r.status !== 'returned' && (
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors whitespace-nowrap">
                                  Extend
                                </button>
                                <button className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                                  Schedule Pickup
                                </button>
                                <button
                                  onClick={() => markRentalReturned(r.id)}
                                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                                >
                                  Mark Returned
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MODULE 3: MAINTENANCE PIPELINE
            ═══════════════════════════════════════════ */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench size={20} className="text-cyan-400" /> Post-Rental Maintenance Pipeline
              </h2>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-lg uppercase tracking-wider">
                Critical Safety
              </span>
            </div>

            {/* Pipeline visualization */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {MAINTENANCE_PIPELINE.map((stage, i) => {
                  const cfg = MAINTENANCE_LABELS[stage];
                  const count = maintenanceItems.filter(m => m.stage === stage).length;
                  return (
                    <React.Fragment key={stage}>
                      <div className="flex flex-col items-center min-w-[80px]">
                        <div className={`w-12 h-12 bg-[#0B1121] border border-slate-800 rounded-xl flex items-center justify-center text-xl mb-2`}>
                          {cfg.emoji}
                        </div>
                        <span className={`text-[10px] font-bold ${cfg.color} uppercase tracking-wider`}>{cfg.label}</span>
                        <span className="text-[10px] text-slate-600 font-bold mt-0.5">{count} item{count !== 1 ? 's' : ''}</span>
                      </div>
                      {i < MAINTENANCE_PIPELINE.length - 1 && (
                        <ArrowRight size={16} className="text-slate-700 shrink-0 mx-2" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Maintenance cards by stage */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {MAINTENANCE_PIPELINE.map(stage => {
                const items = maintenanceItems.filter(m => m.stage === stage);
                const cfg = MAINTENANCE_LABELS[stage];
                return (
                  <div key={stage} className="bg-[#131B2F] border border-slate-800 rounded-3xl p-4 shadow-xl">
                    <h4 className={`text-sm font-bold mb-4 pb-3 border-b border-slate-800/50 flex items-center gap-2 ${cfg.color}`}>
                      {cfg.emoji} {cfg.label}
                    </h4>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="bg-[#0B1121] rounded-2xl p-4 border border-slate-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{item.equipmentEmoji}</span>
                            <h5 className="text-sm font-bold text-white">{item.equipmentName}</h5>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">Returned: {item.returnedDate}</p>
                          <p className="text-xs text-slate-500 mb-1">Assigned: {item.assignedTo}</p>
                          {item.damageReport && item.damageReport !== 'None' && (
                            <p className="text-xs text-amber-400/80 bg-amber-500/5 px-2 py-1 rounded-lg mt-2 mb-2">
                              ⚠️ {item.damageReport}
                            </p>
                          )}
                          {item.sanitizationCert && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg mb-2">
                              <CheckCircle2 size={10} /> Sanitized
                            </span>
                          )}
                          {stage !== 'cleared' && (
                            <button
                              onClick={() => advanceMaintenance(item.id)}
                              className="w-full mt-2 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1"
                            >
                              Advance <ArrowRight size={12} />
                            </button>
                          )}
                          {stage === 'cleared' && (
                            <div className="w-full mt-2 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 text-center">
                              ✅ Ready for Rental
                            </div>
                          )}
                        </div>
                      ))}
                      {items.length === 0 && (
                        <p className="text-xs text-slate-600 text-center py-6 font-bold">Empty</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MODULE 4: DELIVERY & LOGISTICS
            ═══════════════════════════════════════════ */}
        {activeTab === 'logistics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck size={20} className="text-cyan-400" /> Delivery & Logistics
            </h2>

            {/* Delivery Personnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOCK_DELIVERY_PERSONNEL.map(person => (
                <div key={person.id} className="bg-[#131B2F] border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  {person.status === 'on_delivery' && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500" />
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-white">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{person.name}</h4>
                      <p className="text-xs text-slate-400">{person.vehicleType} • {person.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      person.status === 'available' ? 'text-emerald-400 bg-emerald-500/10' :
                      person.status === 'on_delivery' ? 'text-cyan-400 bg-cyan-500/10' :
                      'text-slate-400 bg-slate-800'
                    }`}>
                      {person.status === 'available' ? '🟢 Available' : person.status === 'on_delivery' ? '🚚 On Delivery' : '⚫ Off Duty'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#FFA502" color="#FFA502" />
                      <span className="text-xs font-bold text-white">{person.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1">
                      <Phone size={12} /> Call
                    </button>
                    {person.status === 'available' && (
                      <button className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                        Assign Order
                      </button>
                    )}
                  </div>
                  {person.currentDeliveryId && (
                    <div className="mt-3 bg-[#0B1121] rounded-xl p-3 border border-slate-800/50">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Current Assignment</p>
                      <p className="text-xs text-white font-bold">{person.currentDeliveryId}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active Deliveries */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-cyan-400" /> Active Deliveries
              </h3>
              <div className="space-y-3">
                {orders.filter(o => o.status === 'dispatched').map(order => (
                  <div key={order.id} className="bg-[#0B1121] rounded-2xl p-4 border border-slate-800/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Truck size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-white">{order.equipmentName}</h5>
                      <p className="text-xs text-slate-400">{order.customerName} • {order.address}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition-colors flex items-center gap-1">
                      <MapPin size={12} /> Update Location
                    </button>
                  </div>
                ))}
                {orders.filter(o => o.status === 'dispatched').length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-6 font-bold">No active deliveries</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MODULE 5: REVENUE & ANALYTICS
            ═══════════════════════════════════════════ */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" /> Revenue & Analytics
            </h2>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Rental Revenue', value: `₹${(MOCK_REVENUE.totalRentalRevenue / 1000).toFixed(0)}K`, color: 'cyan', icon: <RefreshCw size={18} /> },
                { label: 'Total Sales Revenue', value: `₹${(MOCK_REVENUE.totalSalesRevenue / 1000).toFixed(0)}K`, color: 'purple', icon: <Package size={18} /> },
                { label: 'Active Deposits', value: `₹${(MOCK_REVENUE.activeDeposits / 1000).toFixed(0)}K`, color: 'amber', icon: <DollarSign size={18} /> },
                { label: 'Pending Refunds', value: `₹${(MOCK_REVENUE.pendingRefunds / 1000).toFixed(1)}K`, color: 'rose', icon: <AlertTriangle size={18} /> },
              ].map((card, i) => (
                <div key={i} className="bg-[#131B2F] border border-slate-800 rounded-3xl p-5 shadow-xl">
                  <div className={`w-10 h-10 bg-${card.color}-500/10 rounded-xl flex items-center justify-center mb-3 text-${card.color}-400`}>
                    {card.icon}
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl font-black text-white">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Top Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Rented */}
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <RefreshCw size={16} className="text-cyan-400" /> Most Rented Equipment
                </h3>
                <div className="space-y-3">
                  {MOCK_REVENUE.topRentedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-white">{item.name}</span>
                          <span className="text-xs font-bold text-cyan-400">{item.count} rentals</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(item.count / MOCK_REVENUE.topRentedItems[0].count) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Purchased */}
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Package size={16} className="text-purple-400" /> Most Purchased Equipment
                </h3>
                <div className="space-y-3">
                  {MOCK_REVENUE.topPurchasedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-white">{item.name}</span>
                          <span className="text-xs font-bold text-purple-400">{item.count} sold</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(item.count / MOCK_REVENUE.topPurchasedItems[0].count) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supplier Rating & Reviews */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star size={16} className="text-amber-400" /> Customer Reviews
                </h3>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <Star size={14} fill="#FFA502" color="#FFA502" />
                  <span className="text-sm font-black text-amber-400">{MOCK_PROVIDER.rating}</span>
                  <span className="text-xs text-slate-400">({MOCK_PROVIDER.totalOrders} orders)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="bg-[#0B1121] rounded-2xl p-4 border border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{review.customerName}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={10} fill="#FFA502" color="#FFA502" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{review.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">{review.equipmentName}</span>
                      <span className="text-[10px] text-slate-600">{review.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MODULE 6: PROVIDER VERIFICATION
            ═══════════════════════════════════════════ */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-cyan-400" /> Provider Verification
            </h2>

            {/* Verification Status Banner */}
            <div className={`rounded-3xl p-6 border shadow-xl flex items-center gap-4 ${
              MOCK_PROVIDER.verificationStatus === 'verified'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : MOCK_PROVIDER.verificationStatus === 'pending'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                MOCK_PROVIDER.verificationStatus === 'verified'
                  ? 'bg-emerald-500/20'
                  : 'bg-amber-500/20'
              }`}>
                {MOCK_PROVIDER.verificationStatus === 'verified'
                  ? <CheckCircle2 size={32} className="text-emerald-400" />
                  : <Clock size={32} className="text-amber-400" />
                }
              </div>
              <div>
                <h3 className={`text-lg font-black ${
                  MOCK_PROVIDER.verificationStatus === 'verified' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {MOCK_PROVIDER.verificationStatus === 'verified'
                    ? '🟢 Verified LifeLink Provider'
                    : '🟡 Verification Pending'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {MOCK_PROVIDER.verificationStatus === 'verified'
                    ? `Active since ${MOCK_PROVIDER.joinedDate} • ${MOCK_PROVIDER.totalOrders} orders fulfilled`
                    : 'Your application is being reviewed by the LifeLink compliance team.'}
                </p>
              </div>
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <FileText size={16} className="text-cyan-400" /> Business Details
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Business Name', value: MOCK_PROVIDER.businessName },
                    { label: 'Owner / Contact', value: MOCK_PROVIDER.ownerName },
                    { label: 'GST Number', value: MOCK_PROVIDER.gstNumber },
                    { label: 'License Number', value: MOCK_PROVIDER.licenseNumber },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{field.label}</label>
                      <div className="bg-[#0B1121] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white font-medium">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Service Areas */}
                <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-cyan-400" /> Service Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_PROVIDER.serviceAreas.map(area => (
                      <span key={area} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-300">
                        📍 {area}
                      </span>
                    ))}
                    <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:border-slate-600 transition-colors flex items-center gap-1">
                      <Plus size={12} /> Add Area
                    </button>
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-cyan-400" /> Compliance Checklist
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'GST Registration', done: true },
                      { label: 'Business License', done: true },
                      { label: 'Equipment Quality Certification', done: true },
                      { label: 'Sanitization Protocol SOP', done: true },
                      { label: 'Insurance Coverage Verification', done: MOCK_PROVIDER.verificationStatus === 'verified' },
                      { label: 'Background Verification', done: MOCK_PROVIDER.verificationStatus === 'verified' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                        }`}>
                          {item.done ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 border-2 border-slate-700 rounded" />}
                        </div>
                        <span className={`text-sm ${item.done ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-cyan-400" /> Uploaded Documents
                  </h3>
                  <div className="space-y-2">
                    {['GST Certificate.pdf', 'Trade License.pdf', 'Equipment Quality Report.pdf', 'Insurance Policy.pdf'].map(doc => (
                      <div key={doc} className="flex items-center gap-3 bg-[#0B1121] rounded-xl p-3 border border-slate-800/50">
                        <FileText size={16} className="text-slate-500" />
                        <span className="text-sm text-white font-medium flex-1">{doc}</span>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════
          SIDEBAR NAV (Desktop)
          ═══════════════════════════════════════════ */}
      <div className={`fixed bottom-6 md:bottom-auto md:top-0 md:left-0 md:h-full w-[90%] left-[5%] md:left-0 bg-[#131B2F]/90 backdrop-blur-xl border border-slate-700/50 md:border-y-0 md:border-l-0 md:border-r md:rounded-none rounded-full px-4 py-3 md:px-0 md:py-6 flex md:flex-col justify-between md:justify-start items-center gap-0 md:gap-4 shadow-2xl z-50 overflow-x-auto md:overflow-visible scrollbar-hide transition-transform duration-300 ${isSidebarExpanded ? 'md:w-64 md:items-start md:px-4 md:translate-x-0' : 'md:w-64 md:-translate-x-full'}`}>
        
        {/* Toggle Button (Desktop only) */}
        <div className="hidden md:flex w-full justify-end mb-2 pr-1">
          <button 
            onClick={() => setIsSidebarExpanded(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${
              activeTab === item.id ? 'text-cyan-400 md:bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'
            } ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
            title={!isSidebarExpanded ? item.label : undefined}
          >
            <span className="text-lg md:text-xl shrink-0 flex items-center justify-center">{item.icon}</span>
            {isSidebarExpanded ? (
              <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">{item.label}</span>
            ) : (
              <span className="text-[8px] md:text-[9px] mt-1 font-bold tracking-widest hidden md:block text-center">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* Utility styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
