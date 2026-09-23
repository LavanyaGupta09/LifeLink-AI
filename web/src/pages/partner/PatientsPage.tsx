import React, { useState } from 'react';
import { Users, Search, Filter, Plus, ChevronDown, Activity, Calendar, FileText } from 'lucide-react';
import { usePartnerStore } from '../../store/partnerStore';

const PatientsPage: React.FC = () => {
  const { patients, addPatient } = usePartnerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 30,
    gender: 'Male',
    phone: '',
    medicalId: ''
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.medicalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({
      ...newPatient,
      medicalId: `MED-${Math.floor(Math.random() * 100000)}`,
      lastVisit: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(false);
    setNewPatient({ name: '', age: 30, gender: 'Male', phone: '', medicalId: '' });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
            <Users className="text-[#00C9A7]" /> Patients
          </h2>
          <p className="text-sm text-textSecondary mt-1">Manage patient records and histories</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-[#00C9A7] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-textPrimary px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-background border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search name, phone, or Medical ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border focus:border-[#00C9A7] focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-textPrimary placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Data List (Cards for both Mobile and Desktop for patients) */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full p-8 text-center text-textTertiary bg-background rounded-2xl border border-border">No patients found.</div>
          ) : filteredPatients.map(patient => (
            <div key={patient.id} className="bg-background border border-border hover:border-border hover:bg-card rounded-2xl p-5 flex flex-col gap-4 transition-colors group">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-textSecondary font-bold text-lg overflow-hidden shrink-0">
                    {patient.avatar ? <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" /> : patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-textPrimary text-base">{patient.name}</h3>
                    <p className="text-xs text-textSecondary">{patient.medicalId}</p>
                  </div>
                </div>
                <div className="bg-card px-2 py-1 rounded text-[10px] text-textSecondary font-medium border border-border">
                  {patient.gender} • {patient.age}y
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-textTertiary font-bold uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-textSecondary">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-textTertiary font-bold uppercase tracking-wider mb-0.5">Last Visit</p>
                  <p className="text-textSecondary">{new Date(patient.lastVisit).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-2 pt-4 border-t border-border opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button className="flex-1 py-2 bg-card text-textSecondary hover:text-textPrimary hover:bg-surface text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Activity size={14} /> Records
                </button>
                <button className="flex-1 py-2 bg-card text-textSecondary hover:text-[#00C9A7] hover:bg-[#00C9A7]/10 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Calendar size={14} /> Book
                </button>
                <button className="flex-1 py-2 bg-card text-textSecondary hover:text-[#3D91FF] hover:bg-[#3D91FF]/10 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                  <FileText size={14} /> Bill
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-textPrimary">Add New Patient</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-textSecondary hover:text-textPrimary"><Plus className="rotate-45" size={20}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 flex flex-col gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textSecondary">Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={newPatient.name} onChange={e=>setNewPatient({...newPatient, name: e.target.value})} className="w-full bg-card border border-border focus:border-[#00C9A7] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-textPrimary" placeholder="e.g. Rahul Sharma" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-textSecondary">Age</label>
                  <input type="number" value={newPatient.age} onChange={e=>setNewPatient({...newPatient, age: Number(e.target.value)})} className="w-full bg-card border border-border focus:border-[#00C9A7] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-textPrimary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-textSecondary">Gender</label>
                  <select value={newPatient.gender} onChange={e=>setNewPatient({...newPatient, gender: e.target.value})} className="w-full bg-card border border-border focus:border-[#00C9A7] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-textPrimary">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textSecondary">Phone Number <span className="text-red-500">*</span></label>
                <input required type="tel" value={newPatient.phone} onChange={e=>setNewPatient({...newPatient, phone: e.target.value})} className="w-full bg-card border border-border focus:border-[#00C9A7] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-textPrimary" placeholder="+91 XXXXX XXXXX" />
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface text-sm font-bold text-textSecondary transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-textPrimary text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientsPage;
