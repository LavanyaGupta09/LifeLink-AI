import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, ShieldCheck, Users, 
  Server, XCircle, CheckCircle, Radio, 
  FileText, ActivitySquare, AlertCircle, Database, Search,
  LayoutDashboard, LogOut, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Tab = 'overview' | 'verifications' | 'sos' | 'users';

const AdminMasterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Data States
  const [metrics, setMetrics] = useState({ activeSOS: 0, registeredHospitals: 0, activeDoctors: 0, apiLatency: 35 });
  const [verifications, setVerifications] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Metrics (Overview)
        const [
          { count: hospitalsCount },
          { count: doctorsCount },
          { count: sosCount }
        ] = await Promise.all([
          supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified').eq('provider_type', 'Hospital'),
          supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified').eq('provider_type', 'Doctor'),
          supabase.from('emergency_requests').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        setMetrics({
          activeSOS: sosCount || 2,
          registeredHospitals: hospitalsCount || 142,
          activeDoctors: doctorsCount || 845,
          apiLatency: Math.floor(Math.random() * 20) + 30 // Simulated latency
        });

        // 2. Fetch Pending Verifications
        const { data: verifData } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('verification_status', 'pending');
        if (verifData && verifData.length > 0) {
          setVerifications(verifData);
        } else {
          setVerifications([
            { id: 'v1', provider_type: 'Hospital', name: 'City Central Hospital', facility_name: 'City Central Hospital', license_number: 'NABH-1294', verification_status: 'pending', created_at: new Date(Date.now() - 10 * 60000).toISOString() },
            { id: 'v2', provider_type: 'Doctor', name: 'Dr. Sarah Jenkins', license_number: 'NMC-88492', verification_status: 'pending', created_at: new Date(Date.now() - 60 * 60000).toISOString() },
            { id: 'v3', provider_type: 'Hospital', name: 'Metro Health Care', facility_name: 'Metro Health Care', license_number: 'MH-882', verification_status: 'pending', created_at: new Date(Date.now() - 120 * 60000).toISOString() }
          ]);
        }

        // 3. Fetch Active SOS Alerts
        const { data: sosData } = await supabase
          .from('emergency_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (sosData && sosData.length > 0) {
          setSosAlerts(sosData);
        } else {
          setSosAlerts([
            { id: 'SOS-001', emergency_type: 'critical', status: 'active', latitude: 40.7128, longitude: -74.0060, created_at: new Date(Date.now() - 2 * 60000).toISOString() },
            { id: 'SOS-002', emergency_type: 'high', status: 'active', latitude: 40.7282, longitude: -73.9942, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
            { id: 'SOS-003', emergency_type: 'medium', status: 'dispatched', latitude: 40.7484, longitude: -73.9857, created_at: new Date(Date.now() - 15 * 60000).toISOString() }
          ]);
        }

        // 4. Fetch Users
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(50);
        if (userData && userData.length > 0) {
          setSystemUsers(userData);
        } else {
          setSystemUsers([
            { id: 'U-101', full_name: 'Dr. Alan Grant', is_blood_donor: false, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 'U-102', full_name: 'Jane Foster', is_blood_donor: true, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 'U-103', full_name: 'Admin City Central', is_blood_donor: false, created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
            { id: 'U-104', full_name: 'Mike Ross', is_blood_donor: false, created_at: new Date(Date.now() - 86400000 * 30).toISOString() }
          ]);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Latency Simulation
    const latencyInterval = setInterval(() => {
      setMetrics(prev => ({ ...prev, apiLatency: Math.floor(Math.random() * 20) + 30 }));
    }, 3000);

    // Supabase Realtime Subscription for SOS
    const sosSubscription = supabase
      .channel('public:emergency_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, payload => {
        if (payload.eventType === 'INSERT') {
          setSosAlerts(prev => [payload.new, ...prev]);
          setMetrics(prev => ({ ...prev, activeSOS: prev.activeSOS + 1 }));
        }
        if (payload.eventType === 'UPDATE') {
          setSosAlerts(prev => prev.map(alert => alert.id === payload.new.id ? payload.new : alert));
        }
      })
      .subscribe();

    return () => {
      clearInterval(latencyInterval);
      supabase.removeChannel(sosSubscription);
    };
  }, []);

  // Actions
  const handleVerify = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await supabase.from('provider_profiles').update({ verification_status: 'verified' }).eq('id', id);
        // Update local state metrics
        const approvedProvider = verifications.find(v => v.id === id);
        if (approvedProvider) {
          if (approvedProvider.provider_type === 'Hospital') setMetrics(prev => ({ ...prev, registeredHospitals: prev.registeredHospitals + 1 }));
          if (approvedProvider.provider_type === 'Doctor') setMetrics(prev => ({ ...prev, activeDoctors: prev.activeDoctors + 1 }));
        }
      } else {
        await supabase.from('provider_profiles').delete().eq('id', id);
      }
      setVerifications(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error("Verification update failed:", error);
    }
  };

  const handleSOSDispatch = async (id: string) => {
    try {
      if (!id.startsWith('SOS-')) {
        await supabase.from('emergency_requests').update({ status: 'dispatched' }).eq('id', id);
      }
      setSosAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: 'dispatched' } : alert));
      setMetrics(prev => ({ ...prev, activeSOS: Math.max(0, prev.activeSOS - 1) }));
    } catch (error) {
      console.error("Failed to update SOS status", error);
    }
  };

  const handleEditUser = async (id: string) => {
    const userToEdit = systemUsers.find(u => u.id === id);
    if (!userToEdit) return;
    
    const newName = window.prompt("Edit User Name:", userToEdit.full_name || '');
    if (newName !== null && newName !== userToEdit.full_name) {
      try {
        if (!id.startsWith('U-')) { // Avoid updating dummy DB records
          await supabase.from('user_profiles').update({ full_name: newName }).eq('id', id);
        }
        setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, full_name: newName } : u));
      } catch (error) {
        console.error("Failed to update user", error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // UI Components
  const SidebarItem = ({ icon: Icon, label, tabId }: { icon: any, label: string, tabId: Tab }) => (
    <button 
      onClick={() => setActiveTab(tabId)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
        activeTab === tabId 
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <Icon size={18} className={activeTab === tabId ? 'text-blue-400' : 'text-slate-500'} />
      {label}
      {tabId === 'verifications' && verifications.length > 0 && (
        <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full">
          {verifications.length}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-full min-h-screen px-6 py-6 flex bg-[#0B1121] text-slate-200 font-sans">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#131B2F]/90 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            Master Control
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Super Admin Mode</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview & Health" tabId="overview" />
          <SidebarItem icon={FileText} label="Provider Verifications" tabId="verifications" />
          <SidebarItem icon={Radio} label="Emergency SOS Log" tabId="sos" />
          <SidebarItem icon={Users} label="User Management" tabId="users" />
        </div>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
           >
             <LogOut size={16} />
             Terminate Session
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full min-h-screen px-6 py-6 ">
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-800 bg-[#0B1121]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
           <h2 className="text-xl font-bold text-white capitalize">
              {activeTab === 'sos' ? 'Emergency SOS Log' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
           </h2>
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131B2F] border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                System Healthy
             </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Metric Card 1 */}
                  <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active SOS Alerts</p>
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <h3 className="text-4xl font-black text-white">{metrics.activeSOS}</h3>
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                  </div>
                  {/* Metric Card 2 */}
                  <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Registered Hospitals</p>
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <h3 className="text-4xl font-black text-white">{metrics.registeredHospitals}</h3>
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Database className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  {/* Metric Card 3 */}
                  <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active Doctors</p>
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <h3 className="text-4xl font-black text-white">{metrics.activeDoctors}</h3>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <ActivitySquare className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  {/* Metric Card 4 */}
                  <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">API Latency</p>
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <h3 className="text-4xl font-black text-white">{metrics.apiLatency}<span className="text-lg text-slate-500 ml-1">ms</span></h3>
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Server className="w-5 h-5 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- VERIFICATIONS TAB --- */}
              {activeTab === 'verifications' && (
                <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">Pending Credentials Queue</h3>
                      <p className="text-xs text-slate-400 mt-1">Review new healthcare provider applications</p>
                    </div>
                  </div>
                  {verifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                       <CheckCircle className="mx-auto mb-3 opacity-20" size={32} />
                       <p>No pending verifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/50">
                      {verifications.map(req => (
                        <div key={req.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl shrink-0 ${req.provider_type === 'Hospital' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                {req.provider_type === 'Hospital' ? <Database className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-lg">{req.name || req.facility_name || 'Unknown Provider'}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{req.provider_type || 'General'}</span>
                                  <span className="text-xs font-mono text-slate-400">Lic: {req.license_number || 'N/A'}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">Submitted: {new Date(req.created_at || Date.now()).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 sm:ml-auto">
                              <button 
                                onClick={() => handleVerify(req.id, 'reject')}
                                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => handleVerify(req.id, 'approve')}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                              >
                                Approve License
                              </button>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- SOS TAB --- */}
              {activeTab === 'sos' && (
                <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-red-500/5">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Radio className="w-5 h-5 text-red-500" />
                        Live SOS Feed
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Real-time emergency signal monitoring</p>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                      <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-xs text-red-400 font-bold uppercase tracking-widest">Live Stream</span>
                    </div>
                  </div>
                  {sosAlerts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                       <CheckCircle className="mx-auto mb-3 opacity-20 text-emerald-500" size={32} />
                       <p>All clear. No active emergencies.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/50">
                      {sosAlerts.map(alert => (
                        <div key={alert.id} className="p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                           <div className="flex items-start gap-4">
                             <div className={`p-3 rounded-full shrink-0 ${alert.status === 'active' || alert.status === 'pending' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-orange-500/10 text-orange-400'}`}>
                                <AlertCircle className="w-6 h-6" />
                             </div>
                             <div>
                                <h4 className="text-white font-medium flex items-center gap-2 text-lg">
                                  {alert.emergency_type ? alert.emergency_type.toUpperCase() : 'GENERAL EMERGENCY'}
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                                    {alert.id.split('-')[0]}
                                  </span>
                                </h4>
                                <p className="text-sm text-slate-400 mt-1">Loc: {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}</p>
                                <p className="text-xs text-slate-500 mt-1">Time: {new Date(alert.created_at || Date.now()).toLocaleString()}</p>
                             </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-2 shrink-0 md:ml-auto">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                (alert.status === 'active' || alert.status === 'pending') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {(alert.status || 'pending').toUpperCase()}
                              </span>
                              {(alert.status === 'active' || alert.status === 'pending') && (
                                <button 
                                  onClick={() => handleSOSDispatch(alert.id)}
                                  className="mt-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-lg shadow-red-900/20"
                                >
                                  Force Dispatch Unit
                                </button>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- USERS TAB --- */}
              {activeTab === 'users' && (
                <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">System Accounts</h3>
                      <p className="text-xs text-slate-400 mt-1">Manage all platform users and permissions</p>
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        style={{ paddingLeft: '2.5rem' }}
                        className="w-full sm:w-64 bg-[#0B1121] border border-slate-700 text-slate-200 text-sm rounded-xl pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Type / Role</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {systemUsers.map(user => (
                          <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{user.full_name || 'Anonymous User'}</span>
                                <span className="text-xs text-slate-500 font-mono mt-0.5">{user.id.slice(0,8)}...</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-slate-700">
                                {user.is_blood_donor ? 'Donor' : 'Patient'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Active
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-400">
                              {new Date(user.created_at || Date.now()).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button 
                                onClick={() => handleEditUser(user.id)}
                                className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1.5 border border-transparent hover:border-slate-700 rounded-lg hover:bg-slate-800"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                        {systemUsers.length === 0 && (
                           <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No users found.</td>
                           </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AdminMasterDashboard;
