import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { 
  Activity, ShieldAlert, CheckCircle2, FileText, 
  Settings, User, Server, PieChart, Bell, ChevronDown, Check
} from 'lucide-react';

// ==========================================
// ADMIN ACTIVITY
// ==========================================
export const AdminActivity: React.FC = () => {
  const { activities } = useAdminStore();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? activities : activities.filter(a => a.category === filter);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Activity</h1>
        <p className="text-slate-400 mt-1 text-sm">Real-time feed of all actions across the platform.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['All', 'Provider', 'User', 'Security', 'System'].map(f => (
          <button 
            key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border ${
              filter === f ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-[#111827] border-slate-800 text-slate-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
        {filtered.map(act => (
          <div key={act.id} className="flex gap-4 border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
            <div className="shrink-0 mt-1">
              {act.status === 'success' && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
              {act.status === 'warning' && <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>}
              {act.status === 'error' && <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}
              {act.status === 'info' && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{act.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-indigo-400">{act.user}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{act.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="text-[10px] text-slate-500">{new Date(act.time).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No activities found for this filter.</div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// ADMIN SECURITY
// ==========================================
export const AdminSecurity: React.FC = () => {
  const { alerts, resolveAlert } = useAdminStore();
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Security Center</h1>
        <p className="text-slate-400 mt-1 text-sm">Monitor and resolve system security incidents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">System Status</p>
            <p className={`text-lg font-black mt-1 ${activeAlerts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {activeAlerts.length > 0 ? 'Alerts Active' : 'Secure'}
            </p>
          </div>
          <ShieldAlert size={32} className={activeAlerts.length > 0 ? 'text-red-500/20' : 'text-emerald-500/20'} />
        </div>
      </div>

      <h2 className="text-sm font-bold text-white uppercase mt-4">Active Alerts ({activeAlerts.length})</h2>
      <div className="flex flex-col gap-3">
        {activeAlerts.map(alert => (
          <div key={alert.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded">{alert.severity}</span>
                <span className="text-xs text-slate-400">{new Date(alert.time).toLocaleString()}</span>
              </div>
              <h3 className="text-base font-bold text-white">{alert.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
            </div>
            <button 
              onClick={() => resolveAlert(alert.id)}
              className="px-4 py-2 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 text-sm font-bold rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Mark Resolved
            </button>
          </div>
        ))}
        {activeAlerts.length === 0 && (
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <ShieldCheck size={40} className="text-emerald-500/50 mb-3" />
            <p className="text-white font-bold">No active security alerts</p>
            <p className="text-slate-400 text-sm">The system is currently secure.</p>
          </div>
        )}
      </div>

      {resolvedAlerts.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-white uppercase mt-6">Recent Resolved Alerts</h2>
          <div className="flex flex-col gap-3">
            {resolvedAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="bg-[#0B1221] border border-slate-800 rounded-xl p-4 flex items-center justify-between opacity-70">
                <div>
                  <h3 className="text-sm font-bold text-white line-through">{alert.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.description}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Resolved
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ==========================================
// ADMIN SYSTEM HEALTH
// ==========================================
export const AdminSystemHealth: React.FC = () => {
  const services = [
    { name: 'Core API Server', status: 'Operational', uptime: '99.99%', latency: '42ms' },
    { name: 'Database Cluster', status: 'Operational', uptime: '100%', latency: '12ms' },
    { name: 'Authentication Service', status: 'Operational', uptime: '99.95%', latency: '85ms' },
    { name: 'Notification Service', status: 'Degraded', uptime: '98.20%', latency: '450ms' },
    { name: 'Appointment Engine', status: 'Operational', uptime: '99.99%', latency: '35ms' },
    { name: 'Payment Gateway', status: 'Operational', uptime: '99.90%', latency: '210ms' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Health</h1>
        <p className="text-slate-400 mt-1 text-sm">Real-time status of LifeLink microservices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(srv => (
          <div key={srv.name} className="bg-[#0B1221] border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-white">{srv.name}</h3>
              <div className={`w-2 h-2 rounded-full mt-1.5 ${srv.status === 'Operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'}`}></div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Status</span>
              <span className={`font-bold ${srv.status === 'Operational' ? 'text-emerald-400' : 'text-orange-400'}`}>{srv.status}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-slate-400">Uptime (30d)</span>
              <span className="text-slate-300 font-mono">{srv.uptime}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-slate-400">Avg Latency</span>
              <span className="text-slate-300 font-mono">{srv.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// ADMIN REPORTS
// ==========================================
export const AdminReports: React.FC = () => {
  const { reports, updateReportStatus } = useAdminStore();
  
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Complaints</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage user-submitted reports and network issues.</p>
      </div>

      <div className="bg-[#0B1221] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#060b14]/50 border-b border-slate-800/50">
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">Report Info</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">Entity Reported</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">Priority</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {reports.map(rep => (
                <tr key={rep.id} className="hover:bg-slate-800/20">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-white">{rep.id}</p>
                    <p className="text-xs text-slate-400 mt-0.5">By: {rep.reporter}</p>
                    <p className="text-[10px] text-slate-500">{rep.date}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-300">{rep.entity}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rep.category}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                      rep.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {rep.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center">
                      <select 
                        value={rep.status}
                        onChange={(e) => updateReportStatus(rep.id, e.target.value as any)}
                        className={`bg-[#111827] border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 ${
                          rep.status === 'Resolved' || rep.status === 'Closed' ? 'text-emerald-400' : 'text-orange-400'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ADMIN ANALYTICS
// ==========================================
export const AdminAnalytics = () => {
  const userGrowth = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 55 },
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 70 },
    { month: 'May', value: 65 },
    { month: 'Jun', value: 85 },
    { month: 'Jul', value: 90 },
    { month: 'Aug', value: 100 },
  ];

  const providerDistribution = [
    { type: 'Doctors', count: 1245, color: 'bg-indigo-500' },
    { type: 'Hospitals', count: 432, color: 'bg-emerald-500' },
    { type: 'Pharmacies', count: 890, color: 'bg-blue-500' },
    { type: 'Labs', count: 320, color: 'bg-purple-500' },
    { type: 'Ambulances', count: 150, color: 'bg-orange-500' },
  ];

  const maxGrowth = Math.max(...userGrowth.map(d => d.value));
  const totalProviders = providerDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Visualize user growth and provider distributions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Growth Chart */}
        <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6">User Registration Growth (2026)</h2>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-64 mt-auto">
            {userGrowth.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-slate-800/50 rounded-t-sm h-full flex items-end">
                  <div 
                    className="w-full bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-400 relative"
                    style={{ height: `${(data.value / maxGrowth) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {data.value}k Users
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Distribution */}
        <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Provider Distribution</h2>
          
          <div className="flex flex-col gap-4 mt-auto">
            {providerDistribution.map((item, idx) => {
              const percentage = Math.round((item.count / totalProviders) * 100);
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-300">{item.type}</span>
                    <span className="text-xs font-bold text-white">{percentage}% <span className="text-slate-500 font-normal">({item.count})</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'High CPU Usage', message: 'Core API Server is experiencing high load (94%).', time: '10 mins ago', read: false },
    { id: 2, type: 'info', title: 'New Provider Registration', message: 'CityCare Hospital has submitted documents for verification.', time: '1 hour ago', read: false },
    { id: 3, type: 'success', title: 'System Backup Complete', message: 'Daily database snapshot completed successfully.', time: '5 hours ago', read: true },
    { id: 4, type: 'warning', title: 'Failed Login Attempts', message: 'Multiple failed login attempts detected for Admin account.', time: '1 day ago', read: true },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-20 md:pb-0">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1 text-sm">View system alerts and platform updates.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-[#0B1221] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        {notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Bell size={32} className="text-slate-600 mb-4" />
            <p className="text-white font-bold">You're all caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No new notifications to display.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-800/50">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-4 flex gap-4 transition-colors hover:bg-slate-800/30 ${notif.read ? 'opacity-70' : 'bg-[#131b2f]'}`}>
                <div className="mt-1 shrink-0">
                  {notif.type === 'alert' && <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center"><ShieldAlert size={18} /></div>}
                  {notif.type === 'info' && <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center"><Bell size={18} /></div>}
                  {notif.type === 'success' && <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><CheckCircle2 size={18} /></div>}
                  {notif.type === 'warning' && <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center"><Activity size={18} /></div>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h3>
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">{notif.time}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{notif.message}</p>
                </div>
                <button 
                  onClick={() => deleteNotification(notif.id)}
                  className="shrink-0 p-2 text-slate-600 hover:text-red-400 transition-colors h-fit rounded-lg hover:bg-red-500/10"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminProfile = () => {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Profile</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your account details and active sessions.</p>
      </div>

      <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <span className="text-4xl font-black text-white">A</span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Administrator</h2>
          <p className="text-indigo-400 text-sm font-medium mt-1">Super Admin Role</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
              <p className="text-sm text-slate-300 mt-1">admin@lifelink.ai</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</p>
              <p className="text-sm text-slate-300 mt-1">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</p>
              <p className="text-sm text-slate-300 mt-1">HQ - New Delhi, India</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Member Since</p>
              <p className="text-sm text-slate-300 mt-1">Jan 2026</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-lg transition-colors shadow">
              Edit Profile
            </button>
            <button className="px-4 py-2 bg-[#111827] border border-slate-700 hover:border-slate-600 text-white text-sm font-bold rounded-lg transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-white uppercase tracking-wider mt-4">Active Sessions</h2>
      <div className="bg-[#0B1221] border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/50">
        <div className="p-4 flex justify-between items-center bg-[#131b2f]">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">Windows • Chrome Browser</p>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase">Current Session</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">IP: 192.168.1.100 • Last active: Just now</p>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-slate-300">iOS • Safari</p>
            <p className="text-xs text-slate-400 mt-1">IP: 10.0.0.45 • Last active: 2 hours ago</p>
          </div>
          <button className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">Revoke</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ADMIN SETTINGS
// ==========================================
export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    twoFactorAuth: true,
    autoApproveDocs: false,
    debugLogging: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ checked, onChange, label, description, critical = false }: any) => (
    <div className="flex items-center justify-between p-4 bg-[#111827] rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex-1 pr-4">
        <h3 className="text-sm font-bold text-white">{label}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out shrink-0 focus:outline-none ${
          checked ? (critical ? 'bg-red-500' : 'bg-indigo-500') : 'bg-slate-700'
        }`}
      >
        <span 
          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Configure global platform toggles and feature flags.</p>
      </div>

      <div className="bg-[#0B1221] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <ShieldAlert size={16} /> Security & Access
          </h2>
          <div className="flex flex-col gap-3">
            <ToggleSwitch 
              label="Maintenance Mode" 
              description="Disable platform access for all non-admin users. Use only during major upgrades."
              checked={settings.maintenanceMode}
              onChange={() => toggleSetting('maintenanceMode')}
              critical={true}
            />
            <ToggleSwitch 
              label="Allow New Registrations" 
              description="Allow new users and providers to sign up on the platform."
              checked={settings.newRegistrations}
              onChange={() => toggleSetting('newRegistrations')}
            />
            <ToggleSwitch 
              label="Enforce 2FA for Admins" 
              description="Require two-factor authentication for all system administrator accounts."
              checked={settings.twoFactorAuth}
              onChange={() => toggleSetting('twoFactorAuth')}
            />
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Settings size={16} /> System Operations
          </h2>
          <div className="flex flex-col gap-3">
            <ToggleSwitch 
              label="Auto-Approve Verified Documents" 
              description="Automatically approve providers if external API verification succeeds."
              checked={settings.autoApproveDocs}
              onChange={() => toggleSetting('autoApproveDocs')}
            />
            <ToggleSwitch 
              label="Verbose Debug Logging" 
              description="Increase log detail level for troubleshooting. May impact performance."
              checked={settings.debugLogging}
              onChange={() => toggleSetting('debugLogging')}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
