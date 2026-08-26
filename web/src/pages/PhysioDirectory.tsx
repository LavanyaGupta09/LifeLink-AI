import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Star, MapPin, Award, ChevronRight } from 'lucide-react';

const DIRECTORY = [
  { id: 'd1', name: 'Dr. Priya Sharma', role: 'Senior Physiotherapist', rating: '4.8', distance: '2.4 km', fee: 600, exp: '12 Years', spec: 'Orthopedic & Sports Rehab', image: 'https://i.pravatar.cc/150?u=d1' },
  { id: 'd2', name: 'Dr. Rahul Verma', role: 'Sports Rehab Specialist', rating: '4.9', distance: '3.1 km', fee: 800, exp: '9 Years', spec: 'Neurological Rehabilitation', image: 'https://i.pravatar.cc/150?u=d2' },
  { id: 'd3', name: 'Dr. Anita Desai', role: 'Physiotherapist', rating: '4.7', distance: '5.0 km', fee: 500, exp: '5 Years', spec: 'Post-Surgery Recovery', image: 'https://i.pravatar.cc/150?u=d3' },
];

export default function PhysioDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-[120px] px-6 py-6">
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 flex items-center gap-4 -mx-6 px-6 mb-6">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/physiotherapy')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Find Physiotherapist</h1>
        </div>
      </header>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or condition..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131F35] border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button className="w-12 h-12 rounded-2xl bg-[#131F35] border border-slate-800 flex items-center justify-center text-slate-400">
          <Filter size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {DIRECTORY.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase())).map(p => (
          <div key={p.id} className="bg-[#131F35] border border-slate-800 rounded-3xl p-5 shadow-xl relative group">
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-800 relative flex-shrink-0 border border-slate-700">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-lg leading-tight">{p.name}</h4>
                  <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Verified
                  </div>
                </div>
                <p className="text-xs font-medium text-emerald-400 mb-2">{p.spec}</p>
                
                <div className="flex flex-col gap-1 text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5"><Award size={12} className="text-amber-400" /> {p.exp} Experience</div>
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#3D91FF]" /> {p.distance} away</div>
                  <div className="flex items-center gap-1.5"><Star size={12} className="text-amber-400 fill-amber-400" /> {p.rating} (120+ ratings)</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Per Session</p>
                <p className="font-black text-white text-base">₹{p.fee}</p>
              </div>
              <button 
                onClick={() => navigate('/physiotherapy/home')}
                className="bg-white text-[#0B1121] font-bold py-2 px-6 rounded-xl text-sm transition-transform active:scale-95"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
