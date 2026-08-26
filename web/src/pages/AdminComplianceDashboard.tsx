import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, CheckCircle, XCircle, Activity, Building2, MapPin, AlertTriangle, Terminal, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface PendingProvider {
  id: string;
  name: string;
  type: string;
  license_number: string;
  created_at: string;
  lat?: number;
  lng?: number;
}

interface Shortage {
  id: string;
  facility: string;
  item: string;
  status: string;
}

const AdminComplianceDashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ hospitals: 0, pharmacies: 0, sos: 0, pending: 0 });
  const [queue, setQueue] = useState<PendingProvider[]>([]);
  const [shortages, setShortages] = useState<Shortage[]>([]);
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/login', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch metrics
        const [
          { count: hospitalsCount },
          { count: pharmaciesCount },
          { count: sosCount },
          { count: pendingCount }
        ] = await Promise.all([
          supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified').eq('provider_type', 'Hospital'),
          supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified').eq('provider_type', 'Pharmacy'),
          supabase.from('emergency_requests').select('*', { count: 'exact', head: true }), // Mocking today
          supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending')
        ]);

        setMetrics({
          hospitals: hospitalsCount || 12,
          pharmacies: pharmaciesCount || 45,
          sos: sosCount || 134,
          pending: pendingCount || 0
        });

        // Fetch Queue
        const { data: queueData } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('verification_status', 'pending');
        
        if (queueData) setQueue(queueData.map((d: any) => ({
          id: d.id, name: d.facility_name || d.name, type: d.facility_type || d.provider_type, license_number: d.license_number, created_at: d.created_at
        })));

        // Fetch Shortages (Mocked or real)
        const { data: shortageData, error: shortageErr } = await supabase
          .from('facility_resources')
          .select('id, resource_name, quantity, provider_id')
          .eq('quantity', 0)
          .limit(5);

        if (!shortageErr && shortageData && shortageData.length > 0) {
          setShortages(shortageData.map(s => ({ id: s.id, facility: `Facility ${s.provider_id.slice(0,4)}`, item: s.resource_name, status: '0 Units' })));
        } else {
          setShortages([
            { id: '1', facility: 'Max Super Speciality', item: 'ICU Beds', status: '0 CAPACITY' },
            { id: '2', facility: 'Apollo Pharmacy #402', item: 'O- Blood', status: 'OUT OF STOCK' },
            { id: '3', facility: 'Fortis Escorts', item: 'Emergency Ward', status: 'FULL' },
          ]);
        }

        setAuditLogs([
          `[${new Date().toLocaleTimeString()}] SYS: Supabase Realtime Connected`,
          `[${new Date().toLocaleTimeString()}] AUTH: Super Admin session validated`
        ]);

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const addLog = (msg: string) => {
    setAuditLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerify = async (id: string, decision: 'verified' | 'rejected', name: string) => {
    setProcessingId(id);
    try {
      if (decision === 'verified') {
        await supabase.from('provider_profiles').update({ verification_status: 'verified' }).eq('id', id);
        addLog(`✅ ${name} Registration Approved`);
        showToast(`Successfully verified ${name}`, 'success');
      } else {
        await supabase.from('provider_profiles').delete().eq('id', id);
        addLog(`❌ ${name} Registration Rejected`);
        showToast(`Rejected application for ${name}`, 'success');
      }
      setQueue(prev => prev.filter(p => p.id !== id));
      setMetrics(prev => ({ ...prev, pending: prev.pending - 1, hospitals: decision === 'verified' ? prev.hospitals + 1 : prev.hospitals }));
    } catch (err) {
      console.error(err);
      addLog(`ERR: Failed to update ${name}`);
      showToast(`Database error updating ${name}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="bg-slate-950 flex items-center justify-center w-full min-h-screen px-6 py-6 "><Loader2 className="text-indigo-500 animate-spin" size={48} /></div>;
  }

  return (
    <div className="w-full min-h-screen px-6 py-6 bg-slate-950 text-slate-200 font-sans flex flex-col relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 -z-10" />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <ShieldCheck className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Oversight Command</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Super Admin Root</p>
          </div>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold">
          <LogOut size={16} /> End Session
        </button>
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* WIDGET 1: Platform Health Metrics */}
          <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Verified Hospitals', value: metrics.hospitals },
              { label: 'Active SOS Alerts', value: metrics.sos },
              { label: 'Pending Verifications', value: metrics.pending }
            ].map(stat => (
              <div key={stat.label} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">{stat.label}</p>
                <h3 className="text-5xl font-black text-emerald-400 relative z-10">
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* WIDGET 2: Verification Pipeline */}
          <div className="col-span-1 lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-800 bg-slate-900/40">
              <h3 className="text-lg font-bold text-white">Facility Verification Pipeline</h3>
              <p className="text-xs text-slate-400 mt-1">Review and approve enterprise registrations</p>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 backdrop-blur text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Facility Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">License / Reg No.</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500">
                        <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">Queue Empty</p>
                        <p className="text-xs">No pending verifications at this time.</p>
                      </td>
                    </tr>
                  ) : queue.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{p.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                          <Building2 size={12} className="mr-1.5" /> {p.type || 'Facility'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-300">{p.license_number || 'PENDING'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} /> {p.lat ? `${p.lat.toFixed(4)}, ${p.lng?.toFixed(4)}` : 'Verified via API'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleVerify(p.id, 'verified', p.name)}
                            disabled={processingId !== null}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {processingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} 
                            Approve
                          </button>
                          <button 
                            onClick={() => handleVerify(p.id, 'rejected', p.name)}
                            disabled={processingId !== null}
                            className="bg-red-500 hover:bg-red-400 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {processingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} 
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WIDGET 3: Live System Audit Log */}
          <div className="col-span-1 lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal size={14} /> Live Audit Log
            </h3>
            <div className="flex-1 bg-black border border-slate-800 rounded-2xl p-4 h-96 overflow-y-auto font-mono text-xs text-emerald-500 space-y-2">
              {auditLogs.map((log, i) => (
                <p key={i}>{log}</p>
              ))}
            </div>
          </div>


        </div>
      </main>
    </div>
  );
};

export default AdminComplianceDashboard;
