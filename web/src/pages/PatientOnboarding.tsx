import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { 
  User, Calendar, Phone, Activity, Droplets, MapPin, 
  Building2, ChevronRight, ChevronLeft, Check, AlertCircle, Heart, Lock
} from 'lucide-react';

export default function PatientOnboarding() {
  const navigate = useNavigate();
  const { setOnboarded } = useAuthStore();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    bloodGroup: '',
    conditions: [] as string[],
    allergies: '',
    address: '',
    preferredHospital: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConditionToggle = (condition: string) => {
    if (condition === 'None') {
      setFormData({ ...formData, conditions: ['None'] });
      return;
    }
    
    let newConditions = [...formData.conditions].filter(c => c !== 'None');
    if (newConditions.includes(condition)) {
      newConditions = newConditions.filter(c => c !== condition);
    } else {
      newConditions.push(condition);
    }
    setFormData({ ...formData, conditions: newConditions });
  };

  const completeSection = (currentStep: number) => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setStep(Math.min(currentStep + 1, 3));
  };

  const submitForm = () => {
    setOnboarded();
    navigate('/dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-background px-4 md:px-6 py-12 flex flex-col items-center justify-start overflow-y-auto text-white font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
          >
            <Heart size={32} className="text-textPrimary" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            Welcome to LifeLink
          </h1>
          <p className="text-textSecondary">Let's set up your health profile for personalized emergency care.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border">
            <span className="font-bold text-sm text-textPrimary">Step {step} of 3</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* STEP 1: Basic Details */}
          <div className={`bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${step < 1 ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="text-blue-400" size={20} /> 1. Basic Details
              </h2>
              {step < 1 ? <Lock className="text-textSecondary" size={20} /> : (completedSteps.includes(1) && step !== 1 && <Check className="text-emerald-400" size={20} />)}
            </div>
            
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                <p className="text-sm text-textSecondary mb-4">Your core identification information.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-textTertiary" 
                      placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Primary Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-textTertiary" 
                      placeholder="+91 98765 43210" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} 
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} 
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-blue-500 transition-all appearance-none">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-red-400">
                    <AlertCircle size={18} /> Emergency Contact
                  </h3>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Contact Name</label>
                        <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} 
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-red-500/50 transition-all placeholder:text-textTertiary" placeholder="Jane Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Relation</label>
                        <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleInputChange} 
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-red-500/50 transition-all placeholder:text-textTertiary" placeholder="Spouse, Parent..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                      <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} 
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-red-500/50 transition-all placeholder:text-textTertiary" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => completeSection(1)}
                    disabled={!formData.fullName}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-surface text-white shadow-lg transition-all"
                  >
                    Save & Continue <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-textSecondary">{formData.fullName ? formData.fullName : 'Not provided'}</span>
                <button onClick={() => setStep(1)} className="text-sm text-blue-400 hover:underline">Edit</button>
              </div>
            )}
          </div>

          {/* STEP 2: Clinical Baseline */}
          <div className={`bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${step < 2 ? 'opacity-50 bg-surface pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="text-emerald-400" size={20} /> 2. Clinical Baseline
              </h2>
              {step < 2 ? <Lock className="text-textSecondary" size={20} /> : (completedSteps.includes(2) && step !== 2 && <Check className="text-emerald-400" size={20} />)}
            </div>
            
            {step === 2 ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                <p className="text-sm text-textSecondary mb-4">Vital health information for paramedics.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Blood Group</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <button
                          key={bg}
                          onClick={() => setFormData({...formData, bloodGroup: bg})}
                          className={`py-2 rounded-xl border font-semibold transition-all ${
                            formData.bloodGroup === bg 
                              ? 'bg-red-500/20 border-red-500 text-red-400' 
                              : 'bg-background border-border text-textSecondary hover:border-slate-500'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Pre-existing Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {['Diabetes', 'Hypertension', 'Asthma', 'Cardiac Issues', 'Thyroid', 'None'].map(condition => {
                        const isSelected = formData.conditions.includes(condition);
                        return (
                          <button
                            key={condition}
                            onClick={() => handleConditionToggle(condition)}
                            className={`px-4 py-2 rounded-full border text-sm transition-all ${
                              isSelected 
                                ? (condition === 'None' ? 'bg-slate-600 border-slate-500 text-textPrimary' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400')
                                : 'bg-background border-border text-textSecondary hover:border-slate-500'
                            }`}
                          >
                            {condition}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Known Drug or Food Allergies</label>
                    <textarea 
                      name="allergies" 
                      value={formData.allergies} 
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-textTertiary resize-none h-24" 
                      placeholder="E.g. Penicillin, Peanuts (Leave blank if none)" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl font-medium text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => completeSection(2)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                  >
                    Save & Continue <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              step > 2 && (
                <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-textSecondary">{formData.bloodGroup || 'Not specified'} • {formData.conditions.length} conditions</span>
                  <button onClick={() => setStep(2)} className="text-sm text-emerald-400 hover:underline">Edit</button>
                </div>
              )
            )}
          </div>

          {/* STEP 3: Location & Preferences */}
          <div className={`bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${step < 3 ? 'opacity-50 bg-surface pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="text-indigo-400" size={20} /> 3. Location & Preferences
              </h2>
              {step < 3 ? <Lock className="text-textSecondary" size={20} /> : (completedSteps.includes(3) && step !== 3 && <Check className="text-emerald-400" size={20} />)}
            </div>
            
            {step === 3 ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                <p className="text-sm text-textSecondary mb-4">Helping us route emergency services faster.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Residential Address</label>
                    <div className="relative">
                      <textarea 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 text-textPrimary focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-textTertiary resize-none h-24" 
                        placeholder="Full address, landmark, city..." 
                      />
                      <MapPin size={18} className="absolute top-4 left-4 text-textTertiary" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Preferred Local Hospital (Optional)</label>
                    <div className="relative">
                      <select 
                        name="preferredHospital" 
                        value={formData.preferredHospital} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 text-textPrimary focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                      >
                        <option value="">Auto-select nearest facility</option>
                        <option value="aiims">AIIMS, New Delhi</option>
                        <option value="max">Max Super Speciality, Saket</option>
                        <option value="fortis">Fortis Escorts, Okhla</option>
                        <option value="apollo">Indraprastha Apollo</option>
                      </select>
                      <Building2 size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-textTertiary" />
                    </div>
                    <p className="text-xs text-textTertiary mt-2">
                      If left blank, LifeLink AI will dispatch the closest capable ambulance in an emergency.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button 
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl font-medium text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={submitForm}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
                  >
                    Complete Setup <Check size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              step > 3 && (
                <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-textSecondary">Setup complete</span>
                  <button onClick={() => setStep(3)} className="text-sm text-indigo-400 hover:underline">Edit</button>
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
