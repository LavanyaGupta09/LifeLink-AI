import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Phone, Star, Clock, Award, Filter, Search, ChevronRight, CheckCircle2, Languages, MapPin, Zap, VideoOff, MicOff, PhoneOff, Activity } from 'lucide-react';
import type { Doctor } from '../types/health.types';
import { useAuthStore } from '../store/authStore';
import JitsiVideoCall from '../components/telemedicine/JitsiVideoCall';

const SPECIALITIES = [
  { name: 'General Physician', icon: '🩺', color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20' },
  { name: 'Dermatology', icon: '💆', color: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
  { name: 'Pediatrics', icon: '🧸', color: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/20' },
  { name: 'Orthopedics', icon: '🦴', color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-500/20' },
  { name: 'Cardiology', icon: '❤️', color: 'from-rose-500/20 to-rose-500/5', text: 'text-rose-400', border: 'border-rose-500/20' },
  { name: 'Psychiatry', icon: '🧠', color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20' },
];

export default function DoctorPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [activeCall, setActiveCall] = useState<Doctor | null>(null);
  const [callElapsed, setCallElapsed] = useState(0);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase.from('doctors').select('*, users(full_name)');
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formatted = data.map(d => ({
            id: d.id,
            name: d.users?.full_name || 'Dr. Unknown',
            specialization: d.specialization || 'General',
            hospitalName: 'Apollo Hospitals',
            status: d.status || 'available',
            rating: d.rating || 4.8,
            consultationFee: d.consultation_fee || 500,
            experienceYears: d.experience_years || 12,
            videoCallAvailable: d.video_call_available,
            languages: ['English', 'Hindi']
          }));
          setDoctors(formatted);
        } else {
          const { MOCK_DOCTORS } = await import('../data/mockData');
          setDoctors(MOCK_DOCTORS.map(d => ({
            ...d, 
            specialization: d.specialization || d.specialty || 'General',
            hospitalName: d.hospitalName || d.hospital || 'Apollo Hospitals',
            languages: ['English', 'Hindi']
          })));
        }
      } catch (err) {
        const { MOCK_DOCTORS } = await import('../data/mockData');
        setDoctors(MOCK_DOCTORS.map(d => ({
          ...d, 
          specialization: d.specialization || d.specialty || 'General',
          hospitalName: d.hospitalName || d.hospital || 'Apollo Hospitals',
          languages: ['English', 'Hindi']
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = selectedSpec === 'All' 
    ? doctors 
    : doctors.filter(d => {
        const spec = d.specialization || d.specialty || d.specialisation || '';
        return spec.includes(selectedSpec.split(' ')[0]);
      });

  const startCall = async (doc: Doctor) => {
    setActiveCall(doc);
    const t = setInterval(() => setCallElapsed(e => e + 1), 1000);
    
    // Broadcast via Real-time to ensure Doctor Workspace rings instantly!
    const payload = {
      id: `call_${Date.now()}`,
      patient_id: user?.id || `anon_${Date.now()}`,
      patient_name: user?.fullName || 'Guest Patient',
      age: 30, // Mock for demo
      gender: 'Not Specified',
      triage_level: 'high', // Use high to ensure it pops up
      status: 'waiting',
      blood_group: 'O+',
      symptoms: `Consultation request for ${doc.specialization}`,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.channel('doctor_calls').send({
        type: 'broadcast',
        event: 'incoming_call',
        payload: payload
      });

      // Also attempt to insert to DB if user is logged in
      if (user) {
        await supabase.from('telemedicine_queue').insert(payload);
      }
    } catch (err) {
      console.error('Failed to sync queue', err);
    }
    
    return () => clearInterval(t);
  };

  const endCall = () => {
    setActiveCall(null);
    setCallElapsed(0);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // LIVE JITSI VIDEO CALL OVERLAY
  if (activeCall) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden">
        <JitsiVideoCall 
          roomName={`LifeLink_Consult_${activeCall.id}`}
          displayName={user?.fullName || 'Patient'}
          onReadyToClose={endCall}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-20 px-6 py-6 ">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Consult a Doctor</h1>
          <p className="text-xs text-emerald-400 font-medium">Apollo 24|7 Network</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">
          <Search size={20} />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 flex flex-col gap-6">
        
        {/* 1. CONSULT IN 15 MINS BANNER */}
        <div className="w-full bg-gradient-to-br from-[#131F35] to-[#0B1121] border border-emerald-500/30 rounded-3xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Live Queue Active</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">Doctor in <br/><span className="text-emerald-400">15 mins</span></h2>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <Zap size={24} className="animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-5 max-w-[200px]">Instant video consultation for general health issues & fever.</p>
          <button 
            onClick={() => doctors.length > 0 && startCall(doctors[0])}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2"
          >
            <Video size={18} /> Consult Now (₹500)
          </button>
        </div>

        {/* FAMILY DOCTOR CARD */}
        <div className="bg-gradient-to-br from-[#131F35] to-[#0B1121] border border-[#3D91FF]/30 rounded-3xl p-5 shadow-[0_0_40px_rgba(61,145,255,0.05)] relative overflow-hidden group mb-2">
          <div className="absolute top-0 right-0 bg-[#3D91FF]/10 text-[#3D91FF] text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-xl border-l border-b border-[#3D91FF]/20 flex items-center gap-1">
            <Star size={10} className="fill-[#3D91FF]" /> Your Family Doctor
          </div>
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 relative flex-shrink-0 border border-slate-700">
                <img src={`https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&auto=format&fit=crop`} alt="Dr. Meera Nair" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
            </div>
            <div className="flex-1 pt-1">
              <h4 className="font-bold text-white text-lg leading-tight">Dr. Meera Nair</h4>
              <p className="text-xs font-medium text-[#3D91FF] mb-2">General Physician · Apollo Hospitals</p>
            </div>
          </div>
          <button 
            onClick={() => startCall({ id: 'doc_meera', name: 'Dr. Meera Nair', specialization: 'General Physician', hospitalName: 'Apollo Hospitals', status: 'available', rating: 4.9, consultationFee: 500, experienceYears: 15, videoCallAvailable: true, languages: ['English', 'Hindi'] })}
            className="w-full mt-4 bg-[#3D91FF]/10 hover:bg-[#3D91FF]/20 text-[#3D91FF] font-bold py-2.5 rounded-xl border border-[#3D91FF]/30 transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            <Video size={16} /> Consult Now
          </button>
        </div>

        {/* PHYSIOTHERAPY HUB ENTRY */}
        <div 
          className="bg-gradient-to-r from-[#1E1B4B] to-[#131F35] border border-[#8B5CF6]/30 rounded-3xl p-5 shadow-[0_0_40px_rgba(139,92,246,0.05)] cursor-pointer hover:border-[#8B5CF6]/60 transition-all group"
          onClick={() => navigate('/physiotherapy')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> At Home & Online
            </div>
          </div>
          <h3 className="font-bold text-white text-lg">Physiotherapy & Rehab</h3>
          <p className="text-sm text-slate-400 mt-1">Book home visits, online consults, and track your recovery journey.</p>
        </div>

        {/* 2. SHOP BY SPECIALITY */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-white">Specialities</h3>
            <span className="text-xs font-bold text-emerald-400 cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SPECIALITIES.map((spec) => (
              <button 
                key={spec.name}
                onClick={() => setSelectedSpec(selectedSpec === spec.name ? 'All' : spec.name)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all active:scale-95 ${selectedSpec === spec.name ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : `bg-gradient-to-b ${spec.color} ${spec.border}`}`}
              >
                <span className="text-2xl mb-2 drop-shadow-md">{spec.icon}</span>
                <span className={`text-[10px] font-bold text-center leading-tight ${selectedSpec === spec.name ? 'text-emerald-400' : 'text-slate-300'}`}>{spec.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. PREMIUM DOCTOR CARDS */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4">Available Specialists {selectedSpec !== 'All' && `(${selectedSpec})`}</h3>
          
          <div className="flex flex-col gap-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="w-full h-48 bg-[#131F35] rounded-3xl animate-pulse"></div>)
            ) : filtered.length === 0 ? (
              <div className="text-center p-10 bg-[#131F35] rounded-3xl border border-slate-800">
                <Search size={40} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">No doctors found for this speciality.</p>
              </div>
            ) : (
              filtered.map((doc, idx) => (
                <div key={doc.id} className="bg-[#131F35] border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
                  
                  {/* Next Slot Badge */}
                  <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-xl border-l border-b border-emerald-500/20 flex items-center gap-1">
                    <Clock size={10} /> {doc.status === 'available' ? 'Available Now' : 'Next slot: 2:00 PM'}
                  </div>

                  <div className="flex gap-4">
                    {/* Doctor Avatar */}
                    <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-800 relative flex-shrink-0 border border-slate-700">
                       <img src={`https://i.pravatar.cc/150?u=${doc.id}`} alt={doc.name} className="w-full h-full object-cover" />
                       {doc.status === 'available' && <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>}
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white text-lg leading-tight">{doc.name}</h4>
                      </div>
                      <p className="text-xs font-medium text-emerald-400 mb-2">{doc.specialization}</p>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Award size={12} className="text-amber-400" /> {doc.experienceYears} Years Experience
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Languages size={12} className="text-[#3D91FF]" /> {doc.languages.join(', ')}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Star size={12} className="text-amber-400 fill-amber-400" /> {doc.rating} ({Math.floor(Math.random() * 200 + 50)} ratings)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Consultation Fee</p>
                      <p className="font-black text-white text-lg">₹{doc.consultationFee}</p>
                    </div>
                    
                    <button 
                      onClick={() => startCall(doc)}
                      className="bg-gradient-to-r from-[#00C9A7] to-[#009E83] hover:from-[#00b596] hover:to-[#008f76] text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-transform active:scale-95 shadow-lg shadow-[#00C9A7]/20 flex items-center gap-2"
                    >
                      <Video size={16} /> Consult Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
