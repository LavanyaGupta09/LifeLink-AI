import React, { useState } from 'react';
import { ShieldCheck, LogOut, CheckCircle, XCircle, FileSearch, Filter, ExternalLink, Activity, Search, AlertTriangle, Building2, Stethoscope, Truck, Microscope, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface PendingProvider {
  id: string;
  name: string;
  type: string;
  dateApplied: string;
  licenseId: string;
  status: 'pending_approval' | 'verified' | 'rejected';
  contact: string;
  documentType: string;
}

const MOCK_QUEUE: PendingProvider[] = [
  { id: 'prov_101', name: 'Dr. Anil Kapoor', type: 'Doctor', dateApplied: 'Aug 9, 2024', licenseId: 'MCI-983421', status: 'pending_approval', contact: '+91 9876543210', documentType: 'Medical Council ID' },
  { id: 'prov_102', name: 'Max Super Speciality', type: 'Hospital', dateApplied: 'Aug 8, 2024', licenseId: 'NABH-2024-88', status: 'pending_approval', contact: 'admin@maxhealthcare.com', documentType: 'NABH Accreditation' },
  { id: 'prov_103', name: 'Ravi Sharma', type: 'Driver', dateApplied: 'Aug 8, 2024', licenseId: 'DL-01-AB-1234', status: 'pending_approval', contact: '+91 9123456780', documentType: 'Commercial Driving License' },
  { id: 'prov_104', name: 'Apollo Diagnostics', type: 'Lab', dateApplied: 'Aug 7, 2024', licenseId: 'NABL-5421', status: 'verified', contact: 'lab@apollo.com', documentType: 'NABL Certificate' },
  { id: 'prov_105', name: 'Dr. Sunita Devi', type: 'Doctor', dateApplied: 'Aug 7, 2024', licenseId: 'MCI-334122', status: 'rejected', contact: 'sunita.devi@email.com', documentType: 'Medical Council ID' },
];

const AdminComplianceDashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  

  const [queue, setQueue] = useState<PendingProvider[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            name: d.name || 'Unknown Provider',
            type: d.provider_type || 'Doctor',
            dateApplied: new Date(d.created_at).toLocaleDateString(),
            licenseId: d.license_number || 'N/A',
            status: d.verification_status || 'pending_approval',
            contact: d.contact_email || d.contact_phone || 'N/A',
            documentType: d.document_type || 'License Document'
          }));
          setQueue(mapped);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
      } finally {
        setLoadingQueue(false);
      }
    };
    
    fetchProviders();
  }, []);

  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('pending_approval');
  
  const [selectedProvider, setSelectedProvider] = useState<PendingProvider | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/role-select');
  };

  const filteredQueue = queue.filter(p => {
    if (filterType !== 'All' && p.type !== filterType) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    return true;
  });

  const handleVerify = async (decision: 'verified' | 'rejected') => {
    if (!selectedProvider) return;
    setIsProcessing(true);
    
    try {
      // API call to our new FastAPI route
      const response = await fetch('/api/v1/admin/verify-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: selectedProvider.id,
          decision,
          rejection_reason: decision === 'rejected' ? rejectionReason : undefined
        })
      });
      
      if (!response.ok) throw new Error('Verification failed');
      
      // Update local state
      setQueue(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, status: decision } : p));
      setSelectedProvider(null);
      setRejectionReason('');
    } catch (error) {
      console.error(error);
      alert("Verification failed. Check backend connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch(type) {
      case 'Doctor': return <Stethoscope size={16} />;
      case 'Hospital': return <Building2 size={16} />;
      case 'Driver': return <Truck size={16} />;
      case 'Lab': return <Microscope size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} className="text-sky-400" />
          <h1 className="text-lg font-black tracking-tight leading-tight">Master<br/><span className="text-sky-400 text-xs tracking-normal">Compliance</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          {isSidebarOpen ? <XCircle size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white p-6 flex flex-col shrink-0 fixed md:relative z-40 h-[calc(100dvh-76px)] md:h-auto top-[76px] md:top-0 left-0 transition-transform duration-300 shadow-2xl md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:flex items-center gap-2 mb-10">
          <ShieldCheck size={28} className="text-sky-400" />
          <h1 className="text-xl font-black tracking-tight leading-tight">Master<br/><span className="text-sky-400 text-sm tracking-normal">Compliance Admin</span></h1>
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Dashboards</p>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-slate-300 hover:bg-slate-800 w-full mb-2">
            <FileSearch size={18} /> Credentials Queue
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-slate-300 hover:bg-slate-800 w-full mb-2">
            <Activity size={18} /> System Audit Logs
          </button>
        </div>

        <div className="mt-auto bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <p className="text-xs font-bold text-slate-400 mb-1">Current User</p>
          <p className="font-bold text-sm text-white">{user?.fullName}</p>
          <p className="text-xs text-sky-400 mt-1 uppercase tracking-wider font-black">{user?.role.replace('_', ' ')}</p>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 px-4 py-3 rounded-lg font-bold transition-colors w-full justify-start border border-rose-500/20">
          <LogOut size={18} /> End Secure Session
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 relative w-full h-[calc(100dvh-76px)] md:h-[100dvh]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Provider Verification Queue</h2>
            <p className="text-slate-500 font-medium mt-1">Review and approve enterprise credentials before granting network access.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2 shadow-sm">
              <Filter size={16} className="text-slate-400" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none">
                <option value="All">All Providers</option>
                <option value="Hospital">Hospitals</option>
                <option value="Doctor">Doctors</option>
                <option value="Driver">Drivers</option>
                <option value="Lab">Labs</option>
              </select>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2 shadow-sm">
              <Activity size={16} className="text-slate-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none">
                <option value="All">All Statuses</option>
                <option value="pending_approval">Pending Review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </header>

        {/* Master Queue Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">License / ID</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {loadingQueue ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4 mb-2"/><div className="h-3 bg-slate-200 rounded w-1/2"/></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-16"/></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 mb-2"/><div className="h-3 bg-slate-200 rounded w-20"/></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"/></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-24"/></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"/></td>
                    </tr>
                  ))
                ) : filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Search size={40} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-lg font-bold text-slate-900">No providers found</p>
                      <p className="text-slate-500">The verification queue is empty or filters returned no results.</p>
                    </td>
                  </tr>
                ) : filteredQueue.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.contact}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                        {getProviderIcon(p.type)} {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-semibold text-slate-700">{p.licenseId}</p>
                      <p className="text-xs text-slate-400">{p.documentType}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{p.dateApplied}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                        p.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'pending_approval' ? (
                        <button onClick={() => setSelectedProvider(p)} className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap">
                          Review
                        </button>
                      ) : (
                        <button className="text-slate-400 hover:text-slate-600 text-sm font-bold px-4 py-2 whitespace-nowrap">
                          View Record
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Review Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Left Panel: Data & Actions */}
              <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-2xl font-black text-slate-900 mb-1">Credential Review</h3>
                  <p className="text-sm text-slate-500">Verify submitted documents against national registries.</p>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Provider Details</p>
                    <p className="text-xl font-bold text-slate-900">{selectedProvider.name}</p>
                    <p className="text-sm text-slate-600 mb-1">{selectedProvider.contact}</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs font-bold mt-2">
                      {getProviderIcon(selectedProvider.type)} {selectedProvider.type}
                    </span>
                  </div>

                  <div className="mb-8">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Submitted License</p>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">{selectedProvider.documentType}</p>
                      <p className="font-mono text-lg font-bold text-slate-900">{selectedProvider.licenseId}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">Automated KYC Check</p>
                        <p className="text-xs text-amber-700">The automated check via the national registry API failed to return a conclusive result. Manual verification is required.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rejection Reason (If applicable)</label>
                    <textarea 
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="E.g. Document blurry, License expired..."
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-white border-t border-slate-200 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedProvider(null)}
                    disabled={isProcessing}
                    className="col-span-2 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm mb-2"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleVerify('rejected')}
                    disabled={isProcessing}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={20} /> REJECT
                  </button>
                  <button 
                    onClick={() => handleVerify('verified')}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={20} /> APPROVE
                  </button>
                </div>
              </div>

              {/* Right Panel: Evidence Viewer */}
              <div className="w-2/3 bg-slate-900 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <ExternalLink size={18} className="text-slate-400" /> Evidence Document Viewer
                  </h4>
                  <span className="text-slate-400 text-xs font-mono">Vault ID: doc_774921X</span>
                </div>
                
                {/* Mock PDF Viewer */}
                <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-12 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-600" />
                      <div className="w-3 h-3 rounded-full bg-slate-600" />
                      <div className="w-3 h-3 rounded-full bg-slate-600" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">document_scan.pdf</span>
                    <div className="w-16" />
                  </div>
                  
                  {/* Mock Document Visual */}
                  <div className="w-3/4 max-w-lg aspect-[1/1.4] bg-white rounded shadow-2xl mt-12 p-8 flex flex-col relative overflow-hidden">
                    <div className="w-1/3 h-4 bg-slate-200 mb-8 rounded" />
                    <div className="w-1/4 h-24 bg-slate-100 border-2 border-slate-200 rounded-lg mb-8 absolute top-8 right-8 flex items-center justify-center text-slate-300">PHOTO</div>
                    <div className="space-y-4">
                      <div className="w-1/2 h-3 bg-slate-100 rounded" />
                      <div className="w-2/3 h-3 bg-slate-100 rounded" />
                      <div className="w-full h-3 bg-slate-100 rounded" />
                      <div className="w-4/5 h-3 bg-slate-100 rounded" />
                    </div>
                    <div className="mt-12 space-y-4">
                      <div className="w-full h-3 bg-slate-100 rounded" />
                      <div className="w-full h-3 bg-slate-100 rounded" />
                      <div className="w-full h-3 bg-slate-100 rounded" />
                    </div>
                    <div className="mt-auto border-t-2 border-slate-200 pt-4 flex justify-between">
                      <div className="w-1/4 h-8 bg-slate-100 rounded" />
                      <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 flex items-center justify-center transform -rotate-12"><span className="text-blue-500 font-black text-[8px] uppercase">Official<br/>Seal</span></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminComplianceDashboard;
