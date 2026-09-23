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
          <h2 className="text-xl md:text-2xl font-bold text-textPrimary flex items-center gap-2">
            <Users className="text-amber-400" /> Patient Directory
          </h2>
          <p className="text-textSecondary mt-1 text-sm md:text-base">Manage and view all your registered patients.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-textPrimary placeholder-slate-500 focus:border-amber-500 outline-none w-full sm:w-64 transition-colors"
            />
          </div>
          <button className="flex justify-center items-center gap-2 text-textSecondary hover:text-textPrimary font-bold text-sm bg-card px-4 py-2 rounded-xl border border-border transition-colors w-full sm:w-auto">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card border border-border rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-textSecondary pl-6">Patient</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-textSecondary">ID & Demographics</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-textSecondary">Primary Condition</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-textSecondary">Last Visit</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-textSecondary text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {patients.map((p, i) => (
              <tr key={p.id} className="hover:bg-surface transition-colors group">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt={p.name} className="w-10 h-10 rounded-full border border-border object-cover" />
                    <div>
                      <p className="text-textPrimary font-bold text-sm">{p.name}</p>
                      <div className="flex items-center gap-2 text-textTertiary text-xs mt-0.5">
                        <Phone size={10} /> {p.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-textSecondary font-mono text-xs mb-0.5">{p.id}</p>
                  <p className="text-textSecondary text-xs">{p.age} yrs • {p.gender}</p>
                </td>
                <td className="p-4">
                  <span className="bg-surface text-textSecondary px-2.5 py-1 rounded-md text-xs font-medium border border-border">
                    {p.condition}
                  </span>
                </td>
                <td className="p-4 text-textSecondary text-sm">
                  {p.lastVisit}
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate('/doctor/medical-records')} className="p-2 text-textSecondary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="View Records">
                      <FileText size={18} />
                    </button>
                    <button className="px-4 py-2 bg-background border border-border hover:border-amber-500 text-amber-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
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
          <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
             <div className="flex items-center gap-3">
               <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt={p.name} className="w-12 h-12 rounded-full border border-border object-cover" />
               <div>
                 <p className="text-textPrimary font-bold text-sm">{p.name}</p>
                 <p className="text-textSecondary text-xs">{p.id} • {p.age} yrs • {p.gender}</p>
               </div>
             </div>
             <div className="flex flex-col gap-1.5">
               <span className="bg-surface w-max text-textSecondary px-2 py-0.5 rounded-md text-xs font-medium border border-border">{p.condition}</span>
               <div className="flex items-center gap-2 text-textSecondary text-xs mt-1">
                 <Phone size={12} className="text-textTertiary" /> {p.phone}
               </div>
               <div className="text-textSecondary text-xs mt-0.5">Last visit: <span className="text-textSecondary">{p.lastVisit}</span></div>
             </div>
             <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
                <button onClick={() => navigate('/doctor/medical-records')} className="flex-1 justify-center py-2 text-textSecondary border border-border hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                  <FileText size={14} /> Records
                </button>
                <button className="flex-1 justify-center py-2 bg-background border border-border hover:border-amber-500 text-amber-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                  Profile <ChevronRight size={14} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
