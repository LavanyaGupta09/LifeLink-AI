import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoOff, PhoneIncoming, X, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const MOCK_QUEUE_FALLBACK = [
  { id: 'mq_1', patient_id: 'pat_001', patient_name: 'Lavanya Gupta', age: 29, gender: 'Female', triage_level: 'critical', status: 'waiting', blood_group: 'B+', symptoms: 'Severe chest pain, radiating to left arm', created_at: new Date().toISOString() },
  { id: 'mq_2', patient_id: 'pat_002', patient_name: 'Rahul Sharma', age: 45, gender: 'Male', triage_level: 'high', status: 'waiting', blood_group: 'O-', symptoms: 'High fever, shortness of breath', created_at: new Date(Date.now() - 300000).toISOString() },
];

export default function DoctorOnCall() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (isOnline) {
        setIsOnline(false);
      }
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  const [isOnline, setIsOnline] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [ringingPatient, setRingingPatient] = useState<any | null>(null);
  const declinedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isOnline) {
      setQueue([]);
      setRingingPatient(null);
      return;
    }
    const fetchQueue = async () => {
      try {
        const { data, error } = await supabase
          .from('telemedicine_queue')
          .select('*')
          .eq('status', 'waiting')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        const fetchedData = data && data.length > 0 ? data : MOCK_QUEUE_FALLBACK;
        setQueue(fetchedData.filter((p: any) => !declinedIdsRef.current.has(p.id)));
      } catch (err) {
        setQueue(MOCK_QUEUE_FALLBACK.filter(p => !declinedIdsRef.current.has(p.id)));
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    
    const channel = supabase.channel('doctor_calls')
      .on('broadcast', { event: 'incoming_call' }, (payload) => {
        setQueue((prevQueue) => {
          if (prevQueue.some(p => p.id === payload.payload.id)) return prevQueue;
          return [payload.payload, ...prevQueue];
        });
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      setRingingPatient(queue[0]);
    } else {
      setRingingPatient(null);
    }
  }, [queue, isOnline]);

  const admitPatient = async (patient: any) => {
    try {
      if (!patient.id.startsWith('mq_')) {
        await supabase.from('telemedicine_queue').update({ status: 'in_progress' }).eq('id', patient.id);
      }
      // Pass patient state to consultation room
      navigate('/doctor/consultation-room', { state: { patient } });
    } catch (err) {
      console.error(err);
    }
  };

  const declinePatient = async (patient: any) => {
    try {
      if (!patient.id.startsWith('mq_')) {
        await supabase.from('telemedicine_queue').update({ status: 'declined' }).eq('id', patient.id);
      }
      declinedIdsRef.current.add(patient.id);
      setQueue(prev => prev.filter(p => p.id !== patient.id));
      setRingingPatient(null);
    } catch (err) {
      console.error('Error declining patient', err);
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* LOGOUT BUTTON */}
      <button 
        onClick={handleLogout}
        className="absolute top-8 right-8 px-4 py-2 bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors rounded-xl text-sm font-bold flex items-center gap-2 z-40"
      >
        <LogOut size={16} /> Logout
      </button>
      
      {/* INCOMING CALL OVERLAY */}
      {ringingPatient && (
        <div className="absolute inset-0 bg-[#060B14]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#131F35] border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 animate-pulse"></div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              <div className="w-24 h-24 bg-gradient-to-br from-[#00C9A7] to-[#009E83] rounded-full flex items-center justify-center shadow-lg relative z-10 border-4 border-[#131F35]">
                <PhoneIncoming size={40} className="text-white animate-bounce" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-1">Incoming Consult...</h2>
            <p className="text-emerald-400 font-bold tracking-widest text-sm uppercase mb-6 animate-pulse">Apollo On-Call</p>
            
            <div className="bg-[#0B1121] border border-slate-800 rounded-xl p-4 w-full mb-8 text-left">
              <p className="font-bold text-lg text-white mb-1">{ringingPatient.patient_name}</p>
              <p className="text-sm text-slate-400 mb-3">{ringingPatient.age}y • {ringingPatient.gender}</p>
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block mb-1">Chief Complaint</span>
                <p className="text-sm text-rose-100">{ringingPatient.symptoms}</p>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => declinePatient(ringingPatient)}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
              >
                <X size={20} /> Decline
              </button>
              <button 
                onClick={() => admitPatient(ringingPatient)}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-emerald-600/30 flex justify-center items-center gap-2"
              >
                <Video size={20} /> Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDLE STATE */}
      {!ringingPatient && (
        <div className="flex flex-col items-center max-w-md mx-auto">
          {isOnline ? (
            <>
              <div className="relative mb-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-emerald-500/10 rounded-full animate-ping opacity-20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-emerald-500/20 rounded-full animate-pulse opacity-40 pointer-events-none"></div>
                <div className="w-32 h-32 bg-[#131F35] border border-emerald-500/30 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <Video size={48} className="text-emerald-400" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">You are Online</h2>
              <p className="text-slate-400 text-lg mb-8">Waiting for patients to request a Doctor On-Call...</p>
              <button 
                onClick={() => setIsOnline(false)}
                className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <VideoOff size={18} /> Go Offline
              </button>
            </>
          ) : (
            <>
              <div className="w-32 h-32 bg-[#131F35] border border-slate-800 rounded-full flex items-center justify-center mb-8 relative z-10">
                <VideoOff size={48} className="text-slate-600" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight opacity-50">Offline</h2>
              <p className="text-slate-500 text-lg mb-8">Go online to start receiving instant patient consultations from the LifeLink platform.</p>
              <button 
                onClick={() => setIsOnline(true)}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-lg"
              >
                <Video size={24} /> Go Online Now
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
