import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, ShieldAlert, Activity, Server, 
  ChevronRight, Calendar, ArrowUpRight, ShieldCheck, 
  UserCheck, AlertTriangle
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { providers, users, alerts, activities } = useAdminStore();

  const totalUsers = users.length;
  const activeToday = users.filter(u => u.status === 'active').length + 12840; // Mock large number
  const totalProviders = providers.length + 486; // Mock large number
  const pendingProviders = providers.filter(p => p.status === 'pending' || p.status === 'action_required').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;

  const kpis = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: '+12% vs last month',
      icon: <Users size={24} className="text-indigo-400" />,
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Total Providers',
      value: totalProviders.toLocaleString(),
      change: '+4% vs last month',
      icon: <Building2 size={24} className="text-blue-400" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      onClick: () => navigate('/admin/providers')
    },
    {
      title: 'Pending Verifications',
      value: pendingProviders.toString(),
      change: 'Action Required',
      icon: <ShieldCheck size={24} className="text-orange-400" />,
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      onClick: () => navigate('/admin/providers?status=pending')
    },
    {
      title: 'Security Alerts',
      value: activeAlerts.toString(),
      change: activeAlerts > 0 ? 'Urgent Review' : 'System Secure',
      icon: <ShieldAlert size={24} className={activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400'} />,
      bg: activeAlerts > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      border: activeAlerts > 0 ? 'border-red-500/20' : 'border-emerald-500/20',
      onClick: () => navigate('/admin/security')
    },
    {
      title: 'Active Today',
      value: activeToday.toLocaleString(),
      change: '+22% vs yesterday',
      icon: <Activity size={24} className="text-teal-400" />,
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      onClick: () => navigate('/admin/activity')
    },
    {
      title: 'System Issues',
      value: '2',
      change: '1 API, 1 Database',
      icon: <Server size={24} className="text-yellow-400" />,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      onClick: () => navigate('/admin/system-health')
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 md:pb-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Good morning, Administrator</h1>
          <p className="text-slate-400 mt-1 text-sm">Monitor and manage the LifeLink healthcare network.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#111827] border border-slate-700 rounded-lg p-1">
            <button className="px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-md shadow">Today</button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-md">7 Days</button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-md">30 Days</button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-md flex items-center gap-1">
              Custom <Calendar size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {kpis.map((kpi, index) => (
          <div 
            key={index} 
            onClick={kpi.onClick}
            className={`flex flex-col p-4 rounded-xl border ${kpi.border} ${kpi.bg} cursor-pointer hover:scale-[1.02] transition-transform relative group overflow-hidden`}
          >
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {React.cloneElement(kpi.icon, { size: 80 })}
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="p-2 bg-[#060b14]/50 rounded-lg backdrop-blur-sm">
                {kpi.icon}
              </div>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight">{kpi.value}</h3>
              <p className="text-xs font-medium text-slate-300 mt-0.5">{kpi.title}</p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT PROVIDER VERIFICATIONS */}
        <div className="lg:col-span-2 bg-[#0B1221] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck size={18} className="text-indigo-400" />
              Pending Verifications
            </h2>
            <button 
              onClick={() => navigate('/admin/providers')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#060b14]/50">
                  <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Provider</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {providers.filter(p => p.status === 'pending' || p.status === 'action_required').slice(0, 5).map(provider => (
                  <tr key={provider.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-bold text-white">{provider.name}</p>
                      <p className="text-xs text-slate-400">{provider.registrationId}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md font-medium">
                        {provider.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${
                        provider.status === 'pending' ? 'text-orange-400' : 'text-yellow-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${provider.status === 'pending' ? 'bg-orange-400' : 'bg-yellow-400'}`}></div>
                        {provider.status === 'pending' ? 'Pending Review' : 'Action Required'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={() => navigate(`/admin/providers/${provider.id}`)}
                        className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {providers.filter(p => p.status === 'pending' || p.status === 'action_required').length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">
                      No pending verifications.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-[#0B1221] border border-slate-800 rounded-xl flex flex-col">
          <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-teal-400" />
              Live Activity
            </h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {activities.slice(0, 5).map(act => (
              <div key={act.id} className="flex gap-3">
                <div className="shrink-0 mt-1">
                  {act.status === 'success' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
                  {act.status === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>}
                  {act.status === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>}
                  {act.status === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">{act.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{act.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-[10px] text-slate-400">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 border-t border-slate-800/50">
            <button 
              onClick={() => navigate('/admin/activity')}
              className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-colors"
            >
              View Full Feed
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
