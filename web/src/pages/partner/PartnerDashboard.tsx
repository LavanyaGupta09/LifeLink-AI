import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, DollarSign, Package, AlertTriangle, 
  ChevronRight, TrendingUp, TrendingDown, Clock, CheckCircle2, Pill, Activity
} from 'lucide-react';
import { usePartnerStore } from '../../store/partnerStore';

const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { facility, appointments, patients, inventory, notifications } = usePartnerStore();

  const totalAppointments = appointments.length;
  const newPatients = patients.length;
  const pendingOrders = 36; // Mock for now
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const todayRevenue = 124500; // Mock for now

  // Separate appointments
  const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, {facility.name} <span className="text-2xl">👋</span>
          </h2>
          <p className="text-slate-400 mt-1">Here's what's happening at your facility today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-[#131B2F] border border-slate-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-[#3D91FF] cursor-pointer">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS - Horizontal scroll on mobile, Grid on desktop */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-5 gap-4 pb-2 md:pb-0 hide-scrollbar snap-x">
        
        {/* KPI 1 */}
        <div 
          onClick={() => navigate('/partner/appointments')}
          className="snap-start shrink-0 w-[240px] md:w-auto bg-[#0B1221] border border-slate-800 hover:border-[#3D91FF]/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(61,145,255,0.1)] group"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Total Appointments</p>
            <div className="w-8 h-8 rounded-full bg-[#3D91FF]/10 flex items-center justify-center text-[#3D91FF]">
              <Calendar size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">{totalAppointments}</h3>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center text-emerald-400 font-medium"><TrendingUp size={12} className="mr-0.5" /> 18%</span>
            <span className="text-slate-500">vs yesterday</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div 
          onClick={() => navigate('/partner/patients')}
          className="snap-start shrink-0 w-[240px] md:w-auto bg-[#0B1221] border border-slate-800 hover:border-[#00C9A7]/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,201,167,0.1)] group"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">New Patients</p>
            <div className="w-8 h-8 rounded-full bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7]">
              <Users size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">{newPatients}</h3>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center text-emerald-400 font-medium"><TrendingUp size={12} className="mr-0.5" /> 12%</span>
            <span className="text-slate-500">vs yesterday</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div 
          onClick={() => navigate('/partner/payments')}
          className="snap-start shrink-0 w-[240px] md:w-auto bg-[#0B1221] border border-slate-800 hover:border-[#8B5CF6]/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] group"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Today's Revenue</p>
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">₹{(todayRevenue/1000).toFixed(1)}k</h3>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center text-emerald-400 font-medium"><TrendingUp size={12} className="mr-0.5" /> 22%</span>
            <span className="text-slate-500">vs yesterday</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div 
          onClick={() => navigate('/partner/billing')}
          className="snap-start shrink-0 w-[240px] md:w-auto bg-[#0B1221] border border-slate-800 hover:border-[#F59E0B]/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Pending Orders</p>
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
              <Package size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">{pendingOrders}</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
            <span className="font-medium hover:underline flex items-center gap-1">View all orders <ChevronRight size={12}/></span>
          </div>
        </div>

        {/* KPI 5 */}
        <div 
          onClick={() => navigate('/partner/inventory/pharmacy')}
          className="snap-start shrink-0 w-[240px] md:w-auto bg-[#0B1221] border border-red-900/50 hover:border-red-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Low Stock Items</p>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-red-400 mb-2 relative z-10">{lowStockItems}</h3>
          <div className="flex items-center gap-1.5 text-xs text-red-400 relative z-10">
            <span className="font-medium hover:underline flex items-center gap-1">Action required <ChevronRight size={12}/></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Charts & Tables */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* APPOINTMENTS OVERVIEW & TODAY'S LIST */}
          <div className="bg-[#0B1221] border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Chart Area */}
            <div className="p-6 md:w-2/5 border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-br from-[#131b2f]/30 to-transparent flex flex-col">
              <h3 className="text-base font-bold text-white mb-6">Appointments Overview</h3>
              
              <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
                {/* Custom SVG Donut Chart representation */}
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-[#00C9A7]" strokeDasharray="53, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-[#3D91FF]" strokeDasharray="31, 100" strokeDashoffset="-53" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-[#F59E0B]" strokeDasharray="16, 100" strokeDashoffset="-84" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{totalAppointments}</span>
                    <span className="text-[10px] text-slate-400">Total</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00C9A7]"></div><span className="text-slate-300">Completed</span></div>
                  <span className="text-slate-400">53%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3D91FF]"></div><span className="text-slate-300">Upcoming</span></div>
                  <span className="text-slate-400">31%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div><span className="text-slate-300">Cancelled</span></div>
                  <span className="text-slate-400">16%</span>
                </div>
              </div>
            </div>

            {/* List Area */}
            <div className="p-6 md:w-3/5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Today's Appointments</h3>
                <button onClick={() => navigate('/partner/appointments')} className="text-xs font-bold text-[#3D91FF] hover:text-[#60A5FA] flex items-center gap-1 transition-colors">
                  View Calendar <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {appointments.slice(0,4).map((apt, idx) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#131b2f] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center shrink-0">
                        <span className="text-xs font-bold text-slate-300 block">{apt.time.split(' ')[0]}</span>
                        <span className="text-[9px] text-slate-500 font-medium">{apt.time.split(' ')[1]}</span>
                      </div>
                      <div className="w-[2px] h-8 bg-slate-800 group-hover:bg-slate-700"></div>
                      <div>
                        <p className="text-sm font-bold text-white">{apt.patientName}</p>
                        <p className="text-[10px] text-slate-400">{apt.department} • {apt.doctorName}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      apt.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {apt.status}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/partner/appointments')} className="w-full mt-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-xs font-bold text-slate-300 transition-colors">
                View All Appointments
              </button>
            </div>
          </div>

          {/* LOWER SECTION: Revenue Chart & Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Revenue Chart */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Revenue Overview</h3>
                <select className="bg-transparent text-xs text-slate-400 cursor-pointer focus:outline-none">
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-white mb-1">₹ 24,85,000</h4>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="flex items-center text-emerald-400 font-bold"><TrendingUp size={10} className="mr-0.5" /> 18%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>
              
              {/* Custom SVG Line Chart */}
              <div className="flex-1 min-h-[120px] relative w-full flex items-end pt-4">
                 <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full absolute bottom-0">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00C9A7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,40 L0,30 C10,25 20,35 30,20 C40,5 50,25 60,15 C70,5 80,10 90,5 L100,0 L100,40 Z" fill="url(#chartGradient)" />
                    <path d="M0,30 C10,25 20,35 30,20 C40,5 50,25 60,15 C70,5 80,10 90,5 L100,0" fill="none" stroke="#00C9A7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                 </svg>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
                <span>1 May</span>
                <span>8 May</span>
                <span>15 May</span>
                <span>22 May</span>
                <span>30 May</span>
              </div>
            </div>

            {/* Inventory Status */}
            <div className="bg-[#0B1221] border border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Inventory Status</h3>
                <button onClick={() => navigate('/partner/inventory/pharmacy')} className="text-xs font-bold text-[#3D91FF] hover:text-[#60A5FA]">View All</button>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Pill size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-200">Pharmacy Items</span>
                      <span className="text-xs font-medium text-slate-400">120 Low</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[60%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-200">Lab Consumables</span>
                      <span className="text-xs font-medium text-slate-400">36 Low</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full w-[85%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-200">Equipment</span>
                      <span className="text-xs font-medium text-red-400">5 Maint. Due</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-[70%] rounded-l-full"></div>
                      <div className="bg-red-500 h-full w-[10%] rounded-r-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Notifications & Verification */}
        <div className="flex flex-col gap-6">
          
          {/* Notifications Panel */}
          <div className="bg-[#0B1221] border border-slate-800 rounded-2xl flex flex-col flex-1">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Notifications <span className="bg-[#3D91FF] text-white text-[10px] px-1.5 py-0.5 rounded-full">{notifications.filter(n=>!n.read).length}</span>
              </h3>
              <button className="text-[10px] text-slate-400 hover:text-white transition-colors">Mark all read</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto max-h-[400px] lg:max-h-none space-y-2">
              {notifications.map(n => (
                <div key={n.id} onClick={() => n.link && navigate(n.link)} className={`p-4 rounded-xl border ${n.read ? 'bg-transparent border-transparent' : 'bg-[#131b2f] border-slate-800 hover:border-slate-700 cursor-pointer'} transition-colors relative`}>
                  {!n.read && <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${n.type === 'critical' ? 'bg-red-500' : n.type === 'warning' ? 'bg-orange-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-[#3D91FF]'}`}></div>}
                  <h4 className={`text-sm font-bold ${n.type === 'critical' ? 'text-red-400' : 'text-slate-200'} mb-1`}>{n.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2 pr-4">{n.message}</p>
                  <p className="text-[9px] text-slate-500 font-medium flex items-center gap-1"><Clock size={10} /> 10 mins ago</p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-800">
              <button className="w-full text-xs font-bold text-[#3D91FF] hover:text-[#60A5FA] py-2 transition-colors">View All History</button>
            </div>
          </div>

          {/* Verification Banner */}
          <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-[#3D91FF]/10 border border-[#8B5CF6]/30 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-3xl rounded-full"></div>
             <div className="relative z-10 flex items-start gap-4">
               <div className="w-12 h-12 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 rounded-xl flex items-center justify-center text-[#8B5CF6] shrink-0">
                 <CheckCircle2 size={24} />
               </div>
               <div>
                 <h3 className="text-base font-bold text-white mb-1">Your Facility is Verified</h3>
                 <p className="text-xs text-slate-300 leading-relaxed mb-4 opacity-80">Thank you for providing excellent service and helping us build a healthier community.</p>
                 <button onClick={() => navigate('/partner/profile')} className="text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 rounded-lg transition-colors">
                   View Profile
                 </button>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
