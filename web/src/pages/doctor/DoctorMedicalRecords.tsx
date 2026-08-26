import React from 'react';
import { Stethoscope, Upload, File, Download, Search, Filter } from 'lucide-react';

export default function DoctorMedicalRecords() {
  const records = [
    { name: 'Complete Blood Count (CBC)', date: 'Aug 15, 2026', patient: 'Aarav Sharma', type: 'Lab Report', size: '1.2 MB' },
    { name: 'Chest X-Ray', date: 'Jul 22, 2026', patient: 'Vikram Singh', type: 'Imaging', size: '4.5 MB' },
    { name: 'MRI Scan - Brain', date: 'Jun 10, 2026', patient: 'Sneha Desai', type: 'Imaging', size: '12.8 MB' },
    { name: 'Lipid Profile', date: 'May 05, 2026', patient: 'Priya Patel', type: 'Lab Report', size: '0.8 MB' },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Stethoscope className="text-cyan-400" /> Medical Records
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Access and upload patient EMR and lab reports.</p>
        </div>
        <button className="w-full md:w-auto justify-center px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-600/20">
          <Upload size={18} /> Upload Record
        </button>
      </div>

      <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search records..." className="bg-[#0B1121] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 outline-none w-full sm:w-64" />
            </div>
            <button className="flex justify-center items-center gap-2 text-slate-400 hover:text-white font-bold text-sm bg-[#0B1121] px-4 py-2 rounded-xl border border-slate-700 transition-colors w-full sm:w-auto">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {records.map((record, i) => (
            <div key={i} className="bg-[#0B1121] border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-colors group cursor-pointer flex flex-col">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <File size={24} />
              </div>
              <h3 className="text-white font-bold text-sm mb-1 line-clamp-1" title={record.name}>{record.name}</h3>
              <p className="text-slate-400 text-xs mb-4">{record.patient} • {record.date}</p>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{record.type}</span>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-xs">{record.size}</span>
                  <Download size={16} className="hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
