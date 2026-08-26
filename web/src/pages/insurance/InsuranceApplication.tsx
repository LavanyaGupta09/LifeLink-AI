import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useInsuranceStore } from '../../store/insuranceStore';
import { mockInsurancePlans } from '../../data/insurancePlans';

const InsuranceApplication: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submitApplication } = useInsuranceStore();
  
  const plan = mockInsurancePlans.find(p => p.id === id);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    members: '1',
    existingPolicy: 'No'
  });

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#060B14] flex flex-col items-center justify-center text-white p-6">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-4">Plan Not Found</h2>
        <button onClick={() => navigate('/insurance')} className="bg-[#3D91FF] px-6 py-2 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) setStep(2);
  };

  const handleSubmit = () => {
    submitApplication({
      planId: plan.id,
      applicantName: formData.name || 'Demo User'
    });
    setStep(3); // Success step
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#060B14] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-[#0B1121] border-b border-slate-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {step < 3 && (
            <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="font-bold text-lg leading-tight">Apply for Insurance</h1>
            <p className="text-[10px] text-slate-400">Step {step} of 3</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-32">
        
        {/* Selected Plan Summary */}
        {step < 3 && (
          <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={24} className="text-[#3D91FF]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">{plan.provider}</p>
              <h3 className="font-bold">{plan.planName}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-black">₹{plan.monthlyPremium}</p>
              <p className="text-[10px] text-slate-500">/mo</p>
            </div>
          </div>
        )}

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6 animate-fade-in">
            <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg border-b border-slate-800 pb-2">Applicant Details</h2>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] outline-none transition-colors" placeholder="As per official documents" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Age</label>
                  <input required type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] outline-none transition-colors" placeholder="Years" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] outline-none transition-colors appearance-none">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Contact Number</label>
                <input required type="tel" name="contact" value={formData.contact} onChange={handleInputChange} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] outline-none transition-colors" placeholder="10-digit mobile number" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Members to Insure</label>
                  <select name="members" value={formData.members} onChange={handleInputChange} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] outline-none transition-colors appearance-none">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Existing Policy</label>
                  <select name="existingPolicy" value={formData.existingPolicy} onChange={handleInputChange} className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3D91FF] outline-none transition-colors appearance-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#3D91FF] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#3D91FF]/20 flex items-center justify-center gap-2">
              Continue <ArrowRight size={20} />
            </button>
          </form>
        )}

        {/* Step 2: Review & Submit (Demo) */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg border-b border-slate-800 pb-2">Review Application</h2>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Name</p>
                  <p className="font-bold text-slate-200">{formData.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Age</p>
                  <p className="font-bold text-slate-200">{formData.age} years</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Members</p>
                  <p className="font-bold text-slate-200">{formData.members}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Initial Premium</p>
                  <p className="font-bold text-emerald-400">₹{plan.monthlyPremium}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 text-sm text-amber-500/90">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <p>
                <strong>Demo Transaction:</strong> This is a prototype application flow. No real data is transmitted to insurers and no real payment will be processed.
              </p>
            </div>

            <button onClick={handleSubmit} className="w-full bg-[#00C9A7] text-[#060B14] py-4 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(0,201,167,0.3)]">
              Submit Demo Application
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-8 text-center animate-slide-up mt-10">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">Application Submitted!</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              Your mock application for <strong>{plan.planName}</strong> has been saved locally.
            </p>
            
            <button 
              onClick={() => navigate('/insurance/my-insurance')}
              className="w-full bg-[#3D91FF] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#3D91FF]/20"
            >
              Go to My Insurance
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default InsuranceApplication;
