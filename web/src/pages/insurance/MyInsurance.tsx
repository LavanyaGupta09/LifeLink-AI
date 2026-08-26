import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Download, Phone, AlertCircle, Clock } from 'lucide-react';
import { useInsuranceStore } from '../../store/insuranceStore';
import { mockInsurancePlans } from '../../data/insurancePlans';

const MyInsurance: React.FC = () => {
  const navigate = useNavigate();
  const { activePolicies, applications } = useInsuranceStore();

  return (
    <div className="w-full min-h-[100dvh] bg-[#060B14] text-white pb-[120px]">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-[#0B1121]/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/insurance')} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">My Insurance</h1>
            <p className="text-[10px] text-slate-400">Manage policies & applications</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Active Policies */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield size={20} className="text-emerald-400" /> Active Policies
          </h2>
          
          {activePolicies.length === 0 ? (
            <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400">No active policies found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePolicies.map(policy => {
                const planDetails = mockInsurancePlans.find(p => p.id === policy.planId);
                return (
                  <div key={policy.id} className="bg-gradient-to-br from-[#131F35] to-[#1E293B] border border-emerald-500/30 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{planDetails?.provider || 'Insurance Provider'}</p>
                        <h3 className="text-xl font-black text-white">{planDetails?.planName || 'Health Plan'}</h3>
                      </div>
                      <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        ACTIVE
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Policy Number</p>
                        <p className="font-mono text-sm font-bold text-slate-200">{policy.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Coverage</p>
                        <p className="text-sm font-bold text-emerald-400">₹{planDetails ? (planDetails.coverage / 100000) : 10} Lakh</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Renewal Date</p>
                        <p className="text-sm font-bold text-slate-200">{policy.renewalDate}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-4 mb-6 relative z-10">
                      <p className="text-[10px] text-slate-500 uppercase mb-2">Members Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {policy.membersCovered.map((m: string, i: number) => (
                          <span key={i} className="bg-[#0B1121] border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">{m}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <FileText size={16} /> View Details
                      </button>
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <Download size={16} /> Get E-Card
                      </button>
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <Phone size={16} /> Contact Support
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Applications */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#3D91FF]" /> Applications
          </h2>
          
          {applications.length === 0 ? (
            <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400">No recent applications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => {
                const planDetails = mockInsurancePlans.find(p => p.id === app.planId);
                return (
                  <div key={app.id} className="bg-[#131F35] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-500">{app.id}</span>
                        <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                          {app.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-200">{planDetails?.planName || 'Insurance Plan'}</h3>
                      <p className="text-xs text-slate-400">Applicant: {app.applicantName}</p>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                      <button className="text-[#3D91FF] text-xs font-bold mt-2">View Status</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Info Box */}
        <div className="bg-[#3D91FF]/10 border border-[#3D91FF]/30 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={20} className="text-[#3D91FF] flex-shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Demo Environment:</strong> All policies and applications shown here are for demonstration purposes as part of the prototype. Real policies would be synced directly from your insurance provider or fetched via secure APIs.
          </p>
        </div>

      </div>
    </div>
  );
};

export default MyInsurance;
