import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Activity, Droplets, HeartPulse, FileText, Pill, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AgoraVideoCall from '../../components/telemedicine/AgoraVideoCall';

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
    symptoms: 'Mild fever, dry cough for 3 days.',
    channel_id: 'consult_demo_channel'
  });

  const [agoraConfig, setAgoraConfig] = useState<{ token: string; appId: string; channel: string } | null>(null);
  const [callLoading, setCallLoading] = useState(true);
  const [agoraError, setAgoraError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchToken = async () => {
      try {
        const channelId = currentPatient.channel_id || `consult_${user?.id || 'demo'}`;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/agora/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel_name: channelId, uid: 0, role: 1 })
        });
        if (!res.ok) throw new Error('Failed to fetch token');
        const data = await res.json();
        setAgoraConfig({ token: data.token, appId: data.app_id, channel: channelId });
      } catch (err) {
        console.error(err);
        if (!import.meta.env.VITE_AGORA_APP_ID) {
          setAgoraError("VITE_AGORA_APP_ID is not configured in .env.local");
        } else {
          setAgoraError("Failed to fetch Agora token. Please check backend configuration.");
        }
      } finally {
        setCallLoading(false);
      }
    };
    fetchToken();
  }, [currentPatient, user]);

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
      <div className="h-[50vh] xl:h-auto xl:flex-1 bg-black relative flex flex-col border-b xl:border-b-0 xl:border-r border-slate-800 shrink-0 overflow-hidden">
        {callLoading ? (
           <div className="flex-1 flex flex-col items-center justify-center text-white gap-4 h-full">
             <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-bold tracking-tight">Connecting to Secure Server...</p>
           </div>
        ) : agoraError ? (
           <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center max-w-md mx-auto h-full">
             <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-500/50">
               <VideoOff size={32} />
             </div>
             <h3 className="text-xl font-bold mb-2">Configuration Required</h3>
             <p className="text-slate-400 mb-6 text-sm">{agoraError}</p>
             <button onClick={() => navigate('/doctor/on-call')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition-colors">Go Back</button>
           </div>
        ) : agoraConfig ? (
           <AgoraVideoCall 
             channelName={agoraConfig.channel}
             token={agoraConfig.token}
             appId={agoraConfig.appId}
             onReadyToClose={endConsultation}
           />
        ) : null}
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
