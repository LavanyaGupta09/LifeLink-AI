import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, Phone, Activity, Droplets, MapPin, 
  Building2, ChevronRight, ChevronLeft, Check, AlertCircle, Heart
} from 'lucide-react';

export default function PatientOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const submitForm = () => {
    // In a real app, save to backend here
    navigate('/dashboard');
  };

  const renderStepIndicators = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 ${
            step >= i 
              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
              : 'bg-[#131B2F]/60 border-slate-700 text-slate-400'
          }`}>
            {step > i ? <Check size={18} /> : i}
          </div>
          {i < 3 && (
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
              step > i ? 'bg-blue-500' : 'bg-slate-800'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="w-full min-h-screen bg-[#0B1121] px-4 md:px-6 py-12 flex flex-col items-center justify-start md:justify-center overflow-y-auto text-white font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
          >
            <Heart size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            Welcome to LifeLink
          </h1>
          <p className="text-slate-400">Let's set up your health profile for personalized emergency care.</p>
        </div>

        {renderStepIndicators()}

        {/* Main Card */}
        <div className="bg-[#131B2F]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient orb in background */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 relative z-10"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <User className="text-blue-400" size={20} /> Basic Details
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">Your core identification information.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} 
                        className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600" 
                        placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Primary Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
                        className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600" 
                        placeholder="+91 98765 43210" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
                        <div className="relative">
                          <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} 
                            className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} 
                          className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2 text-red-400">
                    <AlertCircle size={20} /> Emergency Contact
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">Who should we notify in an emergency?</p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Contact Name</label>
                        <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} 
                          className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600" placeholder="Jane Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Relation</label>
                        <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleInputChange} 
                          className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600" placeholder="Spouse, Parent..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                      <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} 
                        className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 relative z-10"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <Activity className="text-emerald-400" size={20} /> Clinical Baseline
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">Vital health information for paramedics.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Blood Group</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <button
                            key={bg}
                            onClick={() => setFormData({...formData, bloodGroup: bg})}
                            className={`py-2 rounded-xl border font-semibold transition-all ${
                              formData.bloodGroup === bg 
                                ? 'bg-red-500/20 border-red-500 text-red-400' 
                                : 'bg-[#0B1121] border-slate-700 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Pre-existing Conditions</label>
                      <div className="flex flex-wrap gap-2">
                        {['Diabetes', 'Hypertension', 'Asthma', 'Cardiac Issues', 'Thyroid', 'None'].map(condition => {
                          const isSelected = formData.conditions.includes(condition);
                          return (
                            <button
                              key={condition}
                              onClick={() => handleConditionToggle(condition)}
                              className={`px-4 py-2 rounded-full border text-sm transition-all ${
                                isSelected 
                                  ? (condition === 'None' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400')
                                  : 'bg-[#0B1121] border-slate-700 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {condition}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Known Drug or Food Allergies</label>
                      <textarea 
                        name="allergies" 
                        value={formData.allergies} 
                        onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                        className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 resize-none h-24" 
                        placeholder="E.g. Penicillin, Peanuts (Leave blank if none)" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 relative z-10"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <MapPin className="text-indigo-400" size={20} /> Location & Preferences
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">Helping us route emergency services faster.</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Residential Address</label>
                      <div className="relative">
                        <textarea 
                          name="address" 
                          value={formData.address} 
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 resize-none h-24" 
                          placeholder="Full address, landmark, city..." 
                        />
                        <MapPin size={18} className="absolute top-4 left-4 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Local Hospital (Optional)</label>
                      <div className="relative">
                        <select 
                          name="preferredHospital" 
                          value={formData.preferredHospital} 
                          onChange={handleInputChange} 
                          className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                        >
                          <option value="">Auto-select nearest facility</option>
                          <option value="aiims">AIIMS, New Delhi</option>
                          <option value="max">Max Super Speciality, Saket</option>
                          <option value="fortis">Fortis Escorts, Okhla</option>
                          <option value="apollo">Indraprastha Apollo</option>
                        </select>
                        <Building2 size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        If left blank, LifeLink AI will dispatch the closest capable ambulance in an emergency.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation CTAs */}
        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={step === 1 ? () => navigate('/dashboard') : prevStep}
            className="px-6 py-3 rounded-xl font-medium text-slate-400 hover:text-white transition-colors"
          >
            {step === 1 ? 'Skip for Now' : 'Back'}
          </button>
          
          <button 
            onClick={step === 3 ? submitForm : nextStep}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            {step === 3 ? 'Complete Setup' : 'Continue'} 
            {step < 3 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
