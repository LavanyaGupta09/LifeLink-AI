import React, { useState } from 'react';
import { Users, Search, Filter, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 'P001', name: 'Aarav Sharma', age: 45, gender: 'Male', lastVisit: 'Aug 15, 2026', condition: 'Hypertension', phone: '+91 9876543210' },
    { id: 'P002', name: 'Priya Patel', age: 32, gender: 'Female', lastVisit: 'Aug 10, 2026', condition: 'Diabetes Type 2', phone: '+91 8765432109' },
    { id: 'P003', name: 'Rohan Gupta', age: 28, gender: 'Male', lastVisit: 'Jul 28, 2026', condition: 'Asthma', phone: '+91 7654321098' },
    { id: 'P004', name: 'Sneha Desai', age: 55, gender: 'Female', lastVisit: 'Jul 15, 2026', condition: 'Arthritis', phone: '+91 6543210987' },
    { id: 'P005', name: 'Vikram Singh', age: 62, gender: 'Male', lastVisit: 'Jun 30, 2026', condition: 'Coronary Artery Disease', phone: '+91 5432109876' },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-amber-400" /> Patient Directory
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manage and view all your registered patients.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#131F35] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 outline-none w-full sm:w-64 transition-colors"
            />
          </div>
          <button className="flex justify-center items-center gap-2 text-slate-400 hover:text-white font-bold text-sm bg-[#131F35] px-4 py-2 rounded-xl border border-slate-800 transition-colors w-full sm:w-auto">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#131F35] border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B1121] border-b border-slate-800">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 pl-6">Patient</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">ID & Demographics</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Primary Condition</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Last Visit</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {patients.map((p, i) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt={p.name} className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                    <div>
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                        <Phone size={10} /> {p.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-slate-300 font-mono text-xs mb-0.5">{p.id}</p>
                  <p className="text-slate-400 text-xs">{p.age} yrs • {p.gender}</p>
                </td>
                <td className="p-4">
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                    {p.condition}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {p.lastVisit}
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate('/doctor/medical-records')} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="View Records">
                      <FileText size={18} />
                    </button>
                    <button className="px-4 py-2 bg-[#0B1121] border border-slate-700 hover:border-amber-500 text-amber-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                      View Profile <ChevronRight size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {patients.map((p, i) => (
          <div key={p.id} className="bg-[#131F35] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
             <div className="flex items-center gap-3">
               <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt={p.name} className="w-12 h-12 rounded-full border border-slate-700 object-cover" />
               <div>
                 <p className="text-white font-bold text-sm">{p.name}</p>
                 <p className="text-slate-400 text-xs">{p.id} • {p.age} yrs • {p.gender}</p>
               </div>
             </div>
             <div className="flex flex-col gap-1.5">
               <span className="bg-slate-800 w-max text-slate-300 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-700">{p.condition}</span>
               <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                 <Phone size={12} className="text-slate-500" /> {p.phone}
               </div>
               <div className="text-slate-400 text-xs mt-0.5">Last visit: <span className="text-slate-300">{p.lastVisit}</span></div>
             </div>
             <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-3 mt-1">
                <button onClick={() => navigate('/doctor/medical-records')} className="flex-1 justify-center py-2 text-slate-400 border border-slate-700 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                  <FileText size={14} /> Records
                </button>
                <button className="flex-1 justify-center py-2 bg-[#0B1121] border border-slate-700 hover:border-amber-500 text-amber-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                  Profile <ChevronRight size={14} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
