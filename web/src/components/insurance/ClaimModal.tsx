import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, CheckCircle, Clock, Upload, PhoneCall, AlertCircle, ChevronRight, Activity } from 'lucide-react';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLAIM_TYPES = [
  'Hospitalization',
  'Emergency Treatment',
  'Accident',
  'Medicine/Pharmacy',
  'Diagnostic/Lab',
  'Other'
];

type Step = 'details' | 'verifying' | 'verified' | 'documents' | 'tracking';

export default function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    company: '',
    policyNo: '',
    holderName: '',
    mobile: '',
    claimType: 'Hospitalization'
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [claimId, setClaimId] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  // Tracking timeline state
  const [trackingStep, setTrackingStep] = useState(1);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (!formData.policyNo || !formData.company) return;
    setStep('verifying');
    // Simulate API verification
    setTimeout(() => {
      setStep('verified');
    }, 2000);
  };

  const handleSubmit = () => {
    setStep('documents');
  };

  const handleFinalSubmit = () => {
    setClaimId(`CLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
    setStep('tracking');
    
    // Simulate timeline progression
    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 4) {
        setTrackingStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 2500);
  };

  const handleContactCompany = async () => {
    setIsCalling(true);
    setCallStatus('Initiating Call...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/insurance/contact`, {
        method: 'POST',
      });
      if (response.ok) {
        setCallStatus('Insurance company contacted.');
      } else {
        setCallStatus('Failed to connect.');
      }
    } catch (e) {
      setCallStatus('Network error.');
    } finally {
      setIsCalling(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => [...prev, e.target.files![0].name]);
    }
  };

  const removeDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card/80 backdrop-blur-md z-20 border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3D91FF]/20 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-[#3D91FF]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-textPrimary">File a Claim</h2>
              <p className="text-xs text-textSecondary font-medium">LifeLink Insurance Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-surface hover:bg-border rounded-full transition-colors text-textSecondary">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 flex-1">
          {/* STEP 1: Details */}
          {step === 'details' && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="bg-surface border border-border rounded-2xl p-4 flex gap-3">
                <AlertCircle size={20} className="text-[#3D91FF] shrink-0" />
                <p className="text-xs text-textSecondary leading-relaxed">
                  Enter your policy details below. We will verify your policy through our integration before proceeding. Please ensure all details match your insurance document.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Insurance Company *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. HDFC ERGO, Star Health..."
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Policy Number *</label>
                  <input 
                    type="text" 
                    placeholder="Enter Policy No."
                    value={formData.policyNo}
                    onChange={e => setFormData({...formData, policyNo: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Policy Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={formData.holderName}
                    onChange={e => setFormData({...formData, holderName: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Registered Mobile</label>
                  <input 
                    type="tel" 
                    placeholder="+91"
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] focus:outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Claim Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CLAIM_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, claimType: type})}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                          formData.claimType === type 
                            ? 'bg-[#3D91FF]/10 border-[#3D91FF] text-[#3D91FF]' 
                            : 'bg-surface border-border text-textSecondary hover:border-[#3D91FF]/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleVerify}
                disabled={!formData.company || !formData.policyNo}
                className="w-full mt-4 bg-gradient-to-r from-[#3D91FF] to-blue-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-[#3D91FF]/20 hover:shadow-[#3D91FF]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Verify Policy
              </button>
            </div>
          )}

          {/* STEP 2: Verifying Loading */}
          {step === 'verifying' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-[#3D91FF]/10 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-[#3D91FF]/30 border-t-[#3D91FF] rounded-full animate-spin"></div>
                <ShieldCheck size={24} className="text-[#3D91FF]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-textPrimary">Verifying your policy...</h3>
                <p className="text-sm text-textSecondary mt-1">Connecting to {formData.company || 'insurance'} systems</p>
                <div className="mt-4 inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Demo/Prototype Verification
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Verified Status */}
          {step === 'verified' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-emerald-500">Policy Verified</h3>
                <p className="text-sm text-textSecondary mt-1">Your policy details have been confirmed.</p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-textSecondary font-medium">Insurance Company</span>
                  <span className="text-sm font-bold text-textPrimary">{formData.company}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-textSecondary font-medium">Policy Number</span>
                  <span className="text-sm font-bold text-textPrimary">
                    {formData.policyNo.slice(0, 2)}••••••{formData.policyNo.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-textSecondary font-medium">Policy Holder</span>
                  <span className="text-sm font-bold text-textPrimary">{formData.holderName || 'John Doe'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-textSecondary font-medium">Status</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-textSecondary font-medium">Claim Eligibility</span>
                  <span className="text-xs font-bold text-[#3D91FF] bg-[#3D91FF]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Eligible</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                Continue to Claim <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 4: Documents Upload */}
          {step === 'documents' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-bold text-textPrimary mb-1">Upload Claim Documents</h3>
                <p className="text-sm text-textSecondary">Provide bills, prescriptions, or discharge summaries (Optional).</p>
              </div>

              <div className="border-2 border-dashed border-border hover:border-[#3D91FF]/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-surface transition-colors cursor-pointer relative">
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                <div className="w-12 h-12 bg-[#3D91FF]/10 text-[#3D91FF] rounded-full flex items-center justify-center mb-4">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-textPrimary">Tap to upload files</p>
                <p className="text-xs text-textSecondary mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-3">Uploaded Documents</p>
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-background border border-border p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-[#3D91FF]" />
                        <span className="text-sm font-medium text-textPrimary truncate max-w-[200px]">{doc}</span>
                      </div>
                      <button onClick={() => removeDoc(idx)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={handleFinalSubmit}
                className="w-full bg-gradient-to-r from-[#3D91FF] to-blue-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-[#3D91FF]/20 hover:shadow-[#3D91FF]/40 transition-all flex items-center justify-center gap-2"
              >
                Submit Claim Request
              </button>
            </div>
          )}

          {/* STEP 5: Tracking & Timeline */}
          {step === 'tracking' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-surface to-background border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D91FF]/10 rounded-full blur-3xl" />
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">Claim ID</p>
                    <h3 className="text-2xl font-black text-[#3D91FF] tracking-tight">{claimId}</h3>
                  </div>
                  <div className="bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} /> Under Review
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">Insurance Company</p>
                    <p className="text-sm font-bold text-textPrimary">{formData.company}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">Policy Number</p>
                    <p className="text-sm font-bold text-textPrimary">***{formData.policyNo.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">Claim Type</p>
                    <p className="text-sm font-bold text-textPrimary">{formData.claimType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">Date Submitted</p>
                    <p className="text-sm font-bold text-textPrimary">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h4 className="text-sm font-bold text-textPrimary">Need help with your claim?</h4>
                  <p className="text-xs text-textSecondary mt-0.5">Contact the insurance company directly.</p>
                </div>
                <div className="flex flex-col w-full md:w-auto items-center gap-2">
                   <button 
                     onClick={handleContactCompany}
                     disabled={isCalling}
                     className="w-full md:w-auto bg-card border border-border hover:border-[#3D91FF]/50 text-textPrimary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                   >
                     {isCalling ? <Activity size={16} className="animate-spin text-[#3D91FF]"/> : <PhoneCall size={16} className="text-[#3D91FF]" />}
                     {isCalling ? 'Initiating...' : 'Call Insurance Company'}
                   </button>
                   {callStatus && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">{callStatus}</span>}
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-textPrimary mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-textSecondary" /> Track Claim Progress
                </h3>
                
                <div className="relative pl-6 space-y-8 border-l-2 border-border ml-2">
                  {[
                    { step: 1, title: 'Policy Details Received', desc: 'Your claim details were successfully submitted.' },
                    { step: 2, title: 'Policy Verified', desc: 'Policy is active and eligible for claims.' },
                    { step: 3, title: 'Claim Request Created', desc: 'Internal request generated.' },
                    { step: 4, title: 'Insurance Company Notified', desc: 'The insurer has received the request.' },
                    { step: 5, title: 'Documents Verification', desc: 'Insurer is reviewing uploaded documents.' },
                    { step: 6, title: 'Approved / Settled', desc: 'Claim decision finalized.' },
                  ].map((t) => (
                    <div key={t.step} className="relative">
                      {/* Node */}
                      <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${
                        trackingStep > t.step 
                          ? 'bg-emerald-500' 
                          : trackingStep === t.step 
                            ? 'bg-[#3D91FF] animate-pulse' 
                            : 'bg-border'
                      }`}>
                        {trackingStep > t.step && <CheckCircle size={12} className="text-white" />}
                      </div>
                      
                      {/* Content */}
                      <div className={trackingStep >= t.step ? 'opacity-100' : 'opacity-40'}>
                        <h4 className={`text-sm font-bold ${trackingStep === t.step ? 'text-[#3D91FF]' : 'text-textPrimary'}`}>
                          {t.title}
                        </h4>
                        <p className="text-xs text-textSecondary mt-1">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-500/90 leading-relaxed font-medium">
                    <strong className="block text-amber-500 mb-1">Important Disclaimer</strong>
                    LifeLink acts as an initiation and tracking layer. Final approval and settlement remain solely with your insurance provider.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
