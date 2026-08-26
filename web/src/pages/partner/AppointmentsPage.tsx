import React, { useState } from 'react';
import { Calendar, Search, Filter, Plus, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { usePartnerStore } from '../../store/partnerStore';
import type { Appointment } from '../../store/partnerStore';

const AppointmentsPage: React.FC = () => {
  const { appointments, addAppointment, updateAppointmentStatus } = usePartnerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newApt, setNewApt] = useState({
    patientName: '',
    doctorName: '',
    department: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'Consultation'
  });

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      ...newApt,
      patientId: `P${Math.floor(Math.random() * 1000)}`,
      status: 'Confirmed'
    });
    setIsAddModalOpen(false);
    // Reset form
    setNewApt({ ...newApt, patientName: '', doctorName: '' });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="text-[#00C9A7]" /> Appointments
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage and schedule patient visits</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Add Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B1221] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search patient or doctor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto bg-[#131B2F] border border-slate-700 text-slate-300 text-sm rounded-xl py-2 pl-9 pr-8 focus:outline-none focus:border-[#3D91FF] appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Data Table / Cards */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-[#0B1221] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131B2F] border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Patient</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Doctor & Dept</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Date & Time</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAppointments.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No appointments found.</td></tr>
              ) : filteredAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-[#131B2F]/50 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{apt.patientName}</p>
                    <p className="text-xs text-slate-500">{apt.patientId}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-300 text-sm">{apt.doctorName}</p>
                    <p className="text-xs text-slate-500">{apt.department}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-300 text-sm">{new Date(apt.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</p>
                    <p className="text-xs text-slate-500">{apt.time}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-md">{apt.type}</span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      apt.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                      apt.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {apt.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.status === 'Pending' && (
                        <button onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors" title="Confirm">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {(apt.status === 'Confirmed' || apt.status === 'Pending') && (
                         <button onClick={() => updateAppointmentStatus(apt.id, 'Completed')} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Mark Completed">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Cancel">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-[#0B1221] rounded-2xl border border-slate-800">No appointments found.</div>
          ) : filteredAppointments.map(apt => (
            <div key={apt.id} className="bg-[#0B1221] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-base">{apt.patientName}</p>
                  <p className="text-xs text-slate-500">{apt.department} • {apt.type}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                  apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  apt.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                  apt.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {apt.status}
                </div>
              </div>
              <div className="h-[1px] w-full bg-slate-800/50"></div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock size={14} className="text-[#3D91FF]" />
                  <span>{new Date(apt.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}, {apt.time}</span>
                </div>
                <span className="text-slate-400">{apt.doctorName}</span>
              </div>
              
              {/* Mobile Actions */}
              {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800/50">
                  {apt.status === 'Pending' && (
                    <button onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')} className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold rounded-lg transition-colors">Confirm</button>
                  )}
                  {apt.status === 'Confirmed' && (
                    <button onClick={() => updateAppointmentStatus(apt.id, 'Completed')} className="flex-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white text-xs font-bold rounded-lg transition-colors">Complete</button>
                  )}
                  <button onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')} className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-colors">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#0B1221] border border-slate-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">New Appointment</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 flex flex-col gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Patient Name <span className="text-red-500">*</span></label>
                <input required type="text" value={newApt.patientName} onChange={e=>setNewApt({...newApt, patientName: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" placeholder="e.g. John Doe" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Doctor Name <span className="text-red-500">*</span></label>
                <input required type="text" value={newApt.doctorName} onChange={e=>setNewApt({...newApt, doctorName: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" placeholder="e.g. Dr. Smith" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Department</label>
                  <select value={newApt.department} onChange={e=>setNewApt({...newApt, department: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white">
                    <option>Cardiology</option>
                    <option>Orthopedics</option>
                    <option>General Medicine</option>
                    <option>Pediatrics</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Type</label>
                  <select value={newApt.type} onChange={e=>setNewApt({...newApt, type: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white">
                    <option>Consultation</option>
                    <option>Follow-up</option>
                    <option>Checkup</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Date</label>
                  <input type="date" value={newApt.date} onChange={e=>setNewApt({...newApt, date: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Time</label>
                  <input type="time" value={newApt.time.replace(' AM', '').replace(' PM', '')} onChange={e=>setNewApt({...newApt, time: e.target.value + ' AM'})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-bold text-slate-300 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentsPage;
