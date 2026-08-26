import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Activity, Droplets, HeartPulse, FileText, Pill, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ConsultationRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Try to get patient from router state, fallback to mock if direct navigation
  const [currentPatient] = useState<any>(location.state?.patient || {
    id: 'mq_mock',
    patient_id: 'pat_000',
    patient_name: 'Demo Patient',
    age: 30,
    gender: 'Male',
    blood_group: 'O+',
    triage_level: 'medium',
    symptoms: 'Mild fever, dry cough for 3 days.'
  });

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // Prescription State
  const [rxMedicine, setRxMedicine] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxDuration, setRxDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const getTriageColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const endConsultation = () => {
    setShowSummaryModal(true);
  };

  const submitSummaryAndClose = async () => {
    setIsSubmitting(true);
    try {
      if (rxMedicine && rxDosage && rxDuration && user) {
        await supabase.from('prescriptions').insert({
          patient_id: currentPatient.patient_id || 'unknown',
          doctor_id: user.id,
          medicine: rxMedicine,
          dosage: rxDosage,
          duration: rxDuration,
          notes: ''
        });
      }
      
      // Navigate back to on-call or dashboard
      navigate('/doctor/on-call');
    } catch (err) {
      console.error(err);
      navigate('/doctor/on-call');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col xl:flex-row bg-[#060B14] relative animate-in fade-in zoom-in-95 duration-200">
      
      {/* VIDEO AREA (Left side) */}
      <div className="h-[50vh] xl:h-auto xl:flex-1 bg-black relative flex flex-col border-b xl:border-b-0 xl:border-r border-slate-800 shrink-0">
        {isVideoOn ? (
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop" alt="Patient Video" className="absolute inset-0 w-full h-full object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900"><VideoOff size={64} className="text-slate-600" /></div>
        )}
        
        {/* Top Overlay */}
        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent p-6 z-10 flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-2xl drop-shadow-md flex items-center gap-3">
              {currentPatient.patient_name}
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getTriageColor(currentPatient.triage_level)}`}>
                {currentPatient.triage_level}
              </span>
            </h3>
            <p className="text-slate-300 text-sm drop-shadow-md font-medium mt-1">
              {currentPatient.age}y • {currentPatient.gender} • Blood: {currentPatient.blood_group || 'N/A'}
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-bold tracking-widest">04:23</span>
          </div>
        </div>

        {/* Doctor PiP */}
        <div className="absolute bottom-24 right-4 md:right-6 w-32 h-48 md:w-48 md:h-64 bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl z-10">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop" alt="Doctor Video" className="w-full h-full object-cover" />
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl z-20">
          <button onClick={() => setIsMicOn(!isMicOn)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'}`}>
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button onClick={() => setIsVideoOn(!isVideoOn)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'}`}>
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          <button onClick={endConsultation} className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all ml-4">
            <PhoneOff size={28} />
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR (EMR & Prescriptions) */}
      <div className="xl:w-96 bg-[#0B1121] flex flex-col shrink-0 xl:h-full flex-1">
        
        {/* Case Overview */}
        <div className="p-6 border-b border-slate-800/80 bg-[#131F35]/30">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Activity size={14} className="text-[#00C9A7]"/> Case Overview</h4>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#0B1121] border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
              <HeartPulse size={16} className="text-rose-500 mb-1" />
              <span className="text-white font-bold">98</span>
            </div>
            <div className="bg-[#0B1121] border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
              <Droplets size={16} className="text-blue-500 mb-1" />
              <span className="text-white font-bold">{currentPatient.blood_group || 'N/A'}</span>
            </div>
            <div className="bg-[#0B1121] border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
              <Activity size={16} className="text-emerald-500 mb-1" />
              <span className="text-white font-bold">99%</span>
            </div>
          </div>

          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-sm text-rose-200">
            <span className="font-bold uppercase tracking-wider text-[10px] text-rose-500 block mb-1">Chief Complaint</span>
            {currentPatient.symptoms}
          </div>
        </div>

        {/* E-Prescription Pad */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[#131F35]/10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2"><FileText size={14} className="text-[#00C9A7]"/> e-Prescription Pad</h4>
          
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Medication</label>
              <input 
                value={rxMedicine} onChange={e => setRxMedicine(e.target.value)}
                className="w-full bg-[#131F35] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#00C9A7] outline-none transition-colors" 
                placeholder="Search drug database..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Dosage</label>
                <input 
                  value={rxDosage} onChange={e => setRxDosage(e.target.value)}
                  className="w-full bg-[#131F35] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#00C9A7] outline-none transition-colors" 
                  placeholder="e.g. 1-0-1"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Duration</label>
                <input 
                  value={rxDuration} onChange={e => setRxDuration(e.target.value)}
                  className="w-full bg-[#131F35] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#00C9A7] outline-none transition-colors" 
                  placeholder="e.g. 5 Days"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SUMMARY MODAL ON END CALL */}
      {showSummaryModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Consultation Summary</h2>
            
            <div className="mb-6">
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Diagnosis / Doctor's Notes</label>
              <textarea 
                className="w-full h-32 bg-[#0B1121] border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                placeholder="Add final diagnosis, recommended tests, or notes..."
              ></textarea>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-white mb-3">Prescription Status</h3>
              {rxMedicine ? (
                 <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                   <Pill size={16} className="text-emerald-400 mt-0.5" />
                   <div>
                     <p className="text-emerald-400 font-bold text-sm">{rxMedicine}</p>
                     <p className="text-emerald-500/70 text-xs">{rxDosage} for {rxDuration}</p>
                   </div>
                 </div>
              ) : (
                 <div className="bg-slate-800/50 p-4 rounded-xl text-slate-400 text-sm text-center">
                   No prescription added.
                 </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Back to Call
              </button>
              <button 
                onClick={submitSummaryAndClose}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Sign & Close</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
