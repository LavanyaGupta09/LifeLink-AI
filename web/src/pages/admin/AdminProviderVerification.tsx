import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import type { ProviderStatus } from '../../store/adminStore';
import { 
  ArrowLeft, Building2, MapPin, Mail, Phone, Calendar,
  FileCheck, ShieldCheck, XCircle, AlertTriangle, CheckCircle2,
  FileText, Download, ExternalLink, Activity
} from 'lucide-react';

const AdminProviderVerification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers, updateProviderStatus } = useAdminStore();
  const [showConfirmModal, setShowConfirmModal] = useState<ProviderStatus | null>(null);

  const provider = providers.find(p => p.id === id);

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Provider Not Found</h2>
        <button 
          onClick={() => navigate('/admin/providers')}
          className="text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Return to Provider List
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: ProviderStatus) => {
    updateProviderStatus(provider.id, status);
    setShowConfirmModal(null);
  };

  const getStatusBanner = () => {
    switch(provider.status) {
      case 'verified':
        return (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="text-emerald-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-emerald-400">Verified Provider</h3>
              <p className="text-xs text-emerald-500/80 mt-1">This provider has been verified and has full access to the network.</p>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-400">Pending Verification</h3>
              <p className="text-xs text-orange-500/80 mt-1">Review the submitted documents below before approving network access.</p>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-red-400">Application Rejected</h3>
              <p className="text-xs text-red-500/80 mt-1">This provider's application was rejected and access is denied.</p>
            </div>
          </div>
        );
      case 'suspended':
        return (
          <div className="bg-slate-500/20 border border-slate-500/30 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="text-slate-400 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-slate-300">Account Suspended</h3>
              <p className="text-xs text-slate-400 mt-1">This provider has been temporarily suspended from the network.</p>
            </div>
          </div>
        );
      case 'action_required':
        return (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-yellow-400">Information Requested</h3>
              <p className="text-xs text-yellow-500/80 mt-1">Waiting on the provider to submit additional requested documentation.</p>
            </div>
          </div>
        );
    }
  };

  const docs = [
    { name: 'Registration Certificate', status: 'verified', date: 'Aug 18, 2026' },
    { name: 'Medical License', status: 'verified', date: 'Aug 18, 2026' },
    { name: 'Identity Proof (Aadhaar)', status: 'pending', date: 'Aug 18, 2026' },
    { name: 'Facility Address Proof', status: 'verified', date: 'Aug 18, 2026' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 md:pb-0 relative">
      
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/providers')}
          className="w-10 h-10 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {provider.name}
            <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded-md uppercase tracking-wider">{provider.type}</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Provider Registration ID: <span className="font-mono text-slate-300">{provider.registrationId}</span></p>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      {getStatusBanner()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Information</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Location</p>
                  <p className="text-sm text-slate-200 mt-0.5">{provider.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Email Address</p>
                  <p className="text-sm text-slate-200 mt-0.5">{provider.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Phone Number</p>
                  <p className="text-sm text-slate-200 mt-0.5">{provider.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Activity Summary</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Application Submitted</p>
                  <p className="text-sm text-slate-200 mt-0.5">{new Date(provider.submittedDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity size={16} className="text-slate-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Last System Activity</p>
                  <p className="text-sm text-slate-200 mt-0.5">{new Date(provider.lastActive).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documents & Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck size={18} className="text-indigo-400" />
                Submitted Documents
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {docs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#060b14]/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{doc.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Uploaded: {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'verified' ? (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded-md">
                        <AlertTriangle size={12} /> Pending Review
                      </span>
                    )}
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Download size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-[#0B1221] border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row gap-3">
            {provider.status !== 'verified' && (
              <button 
                onClick={() => setShowConfirmModal('verified')}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} /> Approve Provider
              </button>
            )}
            
            {(provider.status === 'pending' || provider.status === 'action_required') && (
              <button 
                onClick={() => setShowConfirmModal('action_required')}
                className="flex-1 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle size={18} /> Request Info
              </button>
            )}

            {provider.status !== 'rejected' && provider.status !== 'suspended' && (
              <button 
                onClick={() => setShowConfirmModal(provider.status === 'verified' ? 'suspended' : 'rejected')}
                className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> {provider.status === 'verified' ? 'Suspend Provider' : 'Reject Application'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirmModal(null)} />
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-md w-full relative z-10 animate-scale-up shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Confirm Action</h2>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to mark this provider as 
              <span className="font-bold text-white mx-1">
                {showConfirmModal === 'verified' ? 'Approved/Verified' : showConfirmModal === 'action_required' ? 'Needs More Info' : showConfirmModal}
              </span>?
              This action will notify the provider and update their access rights immediately.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusChange(showConfirmModal)}
                className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-colors ${
                  showConfirmModal === 'verified' ? 'bg-emerald-500 hover:bg-emerald-600' :
                  showConfirmModal === 'action_required' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                  'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProviderVerification;
