import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, User, ChevronRight, Activity, Bone, Brain, ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'joint', icon: <Bone size={24} />, label: 'Joint / Bone Problem', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'sports', icon: <Activity size={24} />, label: 'Sports Injury', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'surgery', icon: <ArrowUpRight size={24} />, label: 'Post-Surgery Recovery', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'neuro', icon: <Brain size={24} />, label: 'Neurological Rehab', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
];

const PHYSIOS = [
  { id: 'p1', name: 'Dr. Priya Sharma', role: 'Senior Physiotherapist', rating: '4.8', distance: '2.4 km', fee: 600, image: 'https://i.pravatar.cc/150?u=p1' },
  { id: 'p2', name: 'Dr. Rahul Verma', role: 'Sports Rehab Specialist', rating: '4.9', distance: '3.1 km', fee: 800, image: 'https://i.pravatar.cc/150?u=p2' },
];

export default function PhysioHomeBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [time, setTime] = useState('');
  const [provider, setProvider] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = () => {
    setIsBooking(true);
    setTimeout(() => {
      // Direct to tracking
      navigate('/tracking/physio');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-[120px] px-6 py-6">
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 flex items-center gap-4 -mx-6 px-6 mb-6">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => step > 1 ? setStep(step - 1) : navigate('/physiotherapy')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Book Home Visit</h1>
          <p className="text-xs text-[#8B5CF6] font-medium">Step {step} of 3</p>
        </div>
      </header>

      {/* Step 1: Category */}
      {step === 1 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <h2 className="text-xl font-bold mb-2">What do you need help with?</h2>
          <p className="text-slate-400 text-sm mb-6">Select a category to find the right specialist.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => { setCategory(cat.id); setStep(2); }}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all active:scale-95 ${category === cat.id ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'bg-[#131F35] border-slate-800 hover:border-slate-700'}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${cat.bg} ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-sm text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Time & Location */}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <h2 className="text-xl font-bold mb-6">When do you need the visit?</h2>
          
          <div className="bg-[#131F35] rounded-3xl border border-slate-800 p-5 mb-6">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Clock size={20} />
              <span className="font-bold">Next Available Slots (Today)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['02:00 PM', '03:30 PM', '05:00 PM'].map(t => (
                <button 
                  key={t}
                  onClick={() => { setTime(t); setStep(3); }}
                  className={`py-3 rounded-xl text-sm font-bold border transition-colors ${time === t ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-[#0B1121] text-slate-300 border-slate-700 hover:border-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#131F35] rounded-3xl border border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-2 text-slate-300">
              <MapPin size={20} className="text-[#3D91FF]" />
              <span className="font-bold">Service Location</span>
            </div>
            <p className="text-sm text-slate-400 pl-8">42, Residency Road, Shanthala Nagar, Bangalore</p>
          </div>
        </div>
      )}

      {/* Step 3: Provider Selection */}
      {step === 3 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <h2 className="text-xl font-bold mb-6">Available Physiotherapists</h2>
          
          <div className="flex flex-col gap-4 flex-1">
            {PHYSIOS.map(p => (
              <div 
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`bg-[#131F35] border rounded-3xl p-5 cursor-pointer transition-all ${provider === p.id ? 'border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-[#8B5CF6]/5' : 'border-slate-800'}`}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                      <div className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        ⭐ {p.rating}
                      </div>
                    </div>
                    <p className="text-[#8B5CF6] text-xs font-medium mb-2">{p.role}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 text-xs flex items-center gap-1"><MapPin size={12}/> {p.distance}</span>
                      <span className="font-black text-white">₹{p.fee}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            disabled={!provider || isBooking}
            onClick={handleBook}
            className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg mt-6 flex justify-center items-center"
          >
            {isBooking ? <span className="animate-pulse">Confirming Booking...</span> : 'Confirm & Pay'}
          </button>
        </div>
      )}
    </div>
  );
}
