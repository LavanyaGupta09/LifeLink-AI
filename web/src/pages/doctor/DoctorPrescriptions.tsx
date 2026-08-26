import React, { useState } from 'react';
import { FileText, Search, Plus, Filter, Download, ChevronRight } from 'lucide-react';

export default function DoctorPrescriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const prescriptions = [
    { id: 'RX-8921A', date: 'Aug 19, 2026', patient: 'Rahul Verma', diagnosis: 'Viral Fever', status: 'Dispensed', meds: 'Paracetamol 500mg' },
    { id: 'RX-8921B', date: 'Aug 18, 2026', patient: 'Sneha Patel', diagnosis: 'Hypertension', status: 'Active', meds: 'Amlodipine 5mg' },
    { id: 'RX-8921C', date: 'Aug 18, 2026', patient: 'Amit Kumar', diagnosis: 'Acid Reflux', status: 'Dispensed', meds: 'Omeprazole 20mg' },
    { id: 'RX-8921D', date: 'Aug 17, 2026', patient: 'Anita Joshi', diagnosis: 'Migraine', status: 'Active', meds: 'Sumatriptan 50mg' },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-purple-400" /> Prescriptions
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manage e-prescriptions and view history.</p>
        </div>
        <button className="w-full md:w-auto justify-center px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20">
          <Plus size={18} /> New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: List */}
        <div className="lg:col-span-2">
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-white">Recent Prescriptions</h3>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Search..." className="w-full sm:w-48 bg-[#0B1121] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <button className="p-1.5 bg-[#0B1121] border border-slate-700 rounded-lg text-slate-400 hover:text-white shrink-0"><Filter size={16} /></button>
              </div>
            </div>

            <div className="space-y-4">
              {prescriptions.map((rx, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#0B1121] border border-slate-800 rounded-xl hover:border-purple-500/50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        {rx.patient}
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${rx.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                          {rx.status}
                        </span>
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">{rx.id} • {rx.date}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-slate-300 text-sm font-medium">{rx.diagnosis}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{rx.meds}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 sticky top-8">
            <h3 className="font-bold text-white mb-6">Quick Prescribe</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Select Patient</label>
                <select className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none appearance-none">
                  <option>Select from recent...</option>
                  <option>Priya Sharma</option>
                  <option>Rahul Verma</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Medication</label>
                <input type="text" placeholder="Drug name..." className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Dosage</label>
                  <input type="text" placeholder="e.g. 1-0-1" className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Duration</label>
                  <input type="text" placeholder="e.g. 5 days" className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Notes / Instructions</label>
                <textarea rows={3} placeholder="Take after meals..." className="w-full bg-[#0B1121] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none"></textarea>
              </div>

              <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 mt-2">
                Generate E-Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
