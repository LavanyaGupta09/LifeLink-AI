import React, { useState, useEffect } from 'react';
import { Building2, FileText, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const ProviderOnboardingOverlay: React.FC = () => {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    facilityName: '',
    facilityType: 'Hospital',
    licenseNumber: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from('provider_profiles')
          .select('is_onboarded')
          .eq('id', session.user.id)
          .single();
          
        if (error || !data?.is_onboarded) {
          setIsOnboarded(false);
        }
      } catch (err) {
        setIsOnboarded(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSubmitting(true);
    
    try {
      await supabase.from('provider_profiles').upsert({
        id: session.user.id,
        facility_name: formData.facilityName,
        facility_type: formData.facilityType,
        license_number: formData.licenseNumber,
        emergency_phone: formData.emergencyPhone,
        is_onboarded: true,
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      });
      setIsOnboarded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isOnboarded) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center min-h-[100dvh] bg-slate-950/70 backdrop-blur-xl p-4">
      <div className="w-full max-w-lg bg-slate-900/80 border border-slate-700/50 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)] rounded-3xl p-8 relative overflow-hidden animate-scale-in">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mb-3 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
              <Building2 className="text-emerald-400" size={28} />
            </div>
            Facility Setup
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">Enter your facility details to activate the LifeLink Command Center and begin receiving emergency alerts.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Facility Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Max Super Speciality"
              value={formData.facilityName}
              onChange={e => setFormData(prev => ({ ...prev, facilityName: e.target.value }))}
              className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all shadow-inner placeholder:text-slate-500"
            />
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Facility Type</label>
            <select 
              value={formData.facilityType}
              onChange={e => setFormData(prev => ({ ...prev, facilityType: e.target.value }))}
              className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all shadow-inner appearance-none"
            >
              <option value="Hospital">Hospital</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Ambulance Fleet">Ambulance Fleet</option>
              <option value="Blood Bank">Blood Bank</option>
            </select>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registration / License</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              <input 
                type="text" 
                required
                placeholder="MED-REG-2024"
                value={formData.licenseNumber}
                onChange={e => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all shadow-inner placeholder:text-slate-500"
              />
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">24/7 Emergency Line</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              <input 
                type="tel" 
                required
                placeholder="+91 "
                value={formData.emergencyPhone}
                onChange={e => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all shadow-inner placeholder:text-slate-500"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg shadow-emerald-900/40 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
            {submitting ? 'Verifying...' : 'Launch Command Center'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ProviderOnboardingOverlay;
