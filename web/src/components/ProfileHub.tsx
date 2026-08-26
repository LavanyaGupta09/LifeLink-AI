import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ChevronDown, ChevronUp, FileText, Pill, FlaskConical, Building2, QrCode, Download, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHub: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState<string | null>('consultations');
  const [data, setData] = useState<any>({
    consultations: [],
    medicines: [],
    labs: [],
    hospitals: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user && !isEditing) {
      setEditData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user, isEditing]);

  // Mock data fallbacks
  const mockConsultations = [
    { id: '1', doctor_name: 'Dr. Sarah Smith', specialty: 'General Physician', status: 'Completed', date: '2026-08-10', rx: true },
    { id: '2', doctor_name: 'Dr. R. K. Sharma', specialty: 'Cardiologist', status: 'Completed', date: '2026-07-22', rx: true },
    { id: '3', doctor_name: 'Dr. Anil Kumar', specialty: 'Dermatologist', status: 'Cancelled', date: '2026-06-15', rx: false }
  ];

  const mockMedicines = [
    { id: 'M1', items: 'Paracetamol 500mg, Amoxicillin', status: 'Delivered', date: '2026-08-12' },
    { id: 'M2', items: 'Vitamin C, Zinc Supplements', status: 'Out for Delivery', date: '2026-08-15' }
  ];

  const mockLabs = [
    { id: 'L1', test_name: 'Complete Blood Count (CBC)', lab_name: 'Apollo Diagnostics', status: 'Report Ready', date: '2026-08-01' },
    { id: 'L2', test_name: 'Thyroid Profile', lab_name: 'Dr. Lal PathLabs', status: 'Sample Collected', date: '2026-08-14' }
  ];

  const mockHospitals = [
    { id: 'H1', hospital_name: 'Max Super Speciality', type: 'OPD Consultation', date: '2026-05-10', status: 'Discharged' },
    { id: 'H2', hospital_name: 'Fortis Escorts', type: 'Emergency ER', date: '2025-11-20', status: 'Discharged' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData({
          consultations: mockConsultations,
          medicines: mockMedicines,
          labs: mockLabs,
          hospitals: mockHospitals
        });
      } catch (err) {
        setData({
          consultations: mockConsultations,
          medicines: mockMedicines,
          labs: mockLabs,
          hospitals: mockHospitals
        });
      }
    };
    fetchData();
  }, []);

  const toggleAccordion = (section: string) => {
    setActiveAccordion(prev => prev === section ? null : section);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 pb-20">
      
      {/* HEADER IDENTITY CARD */}
      <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D91FF]/10 rounded-full blur-3xl"></div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3D91FF] to-[#009E83] flex items-center justify-center font-black text-3xl text-white shadow-lg relative z-10">
          {user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'US'}
        </div>
        <div className="relative z-10 flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <input type="text" className="bg-[#0B1121] border border-slate-700 rounded-lg p-2 text-white text-sm" value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} placeholder="Full Name" />
              <input type="text" className="bg-[#0B1121] border border-slate-700 rounded-lg p-2 text-white text-sm" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Phone Number" />
              <input type="email" className="bg-[#0B1121] border border-slate-700 rounded-lg p-2 text-white text-sm" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email Address" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => { updateUser(editData); setIsEditing(false); }} className="px-4 py-1.5 bg-[#3D91FF] hover:bg-[#3D91FF]/80 text-white rounded-lg text-xs font-bold transition-colors">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">{user?.fullName || 'Demo User'}</h2>
              <p className="text-slate-400 text-sm mb-3">{user?.phone} • {user?.email || 'user@example.com'}</p>
              <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors">
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* WIDGET 1: HEALTH ID & ABHA */}
      <div className="bg-gradient-to-br from-[#00C9A7]/10 to-[#131B2F] border border-[#00C9A7]/30 rounded-3xl p-6 shadow-xl flex flex-col cursor-pointer hover:shadow-[0_0_30px_rgba(0,201,167,0.15)] transition-all" onClick={() => navigate('/passport')}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[#00C9A7] font-bold uppercase tracking-widest text-xs mb-1">Digital Health Locker</h3>
            <p className="text-white font-bold text-lg flex items-center gap-2">
              ABHA ID: 91-XXXX-XXXX-XXXX <CheckCircle size={16} className="text-[#00C9A7]" />
            </p>
          </div>
          <div className="bg-[#00C9A7]/20 p-3 rounded-2xl text-[#00C9A7]">
            <QrCode size={28} />
          </div>
        </div>
        <button className="w-full bg-[#00C9A7]/10 text-[#00C9A7] font-bold py-3 rounded-xl hover:bg-[#00C9A7]/20 transition-colors flex items-center justify-center gap-2 text-sm">
          View Emergency QR Code <ChevronRight size={16} />
        </button>
      </div>

      {/* WIDGET 2: ACTIVITY HISTORY */}
      <div className="bg-[#131B2F] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-[#0B1121]">
          <h3 className="text-white font-bold text-lg">My Activity</h3>
        </div>

        {/* Online Consultations */}
        <div className="border-b border-slate-800/50">
          <button 
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/20 transition-colors"
            onClick={() => toggleAccordion('consultations')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#3D91FF]/10 text-[#3D91FF] flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold">Online Consultations</h4>
                <p className="text-slate-500 text-xs">Telemedicine & Prescriptions</p>
              </div>
            </div>
            {activeAccordion === 'consultations' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>
          
          {activeAccordion === 'consultations' && (
            <div className="p-5 pt-0 bg-slate-900/30">
              {data.consultations.map((c: any) => (
                <div key={c.id} className="bg-[#0B1121] border border-slate-800 rounded-xl p-4 mb-3 last:mb-0 flex justify-between items-center">
                  <div>
                    <h5 className="text-white font-bold">{c.doctor_name}</h5>
                    <p className="text-slate-400 text-xs mb-2">{c.specialty} • {c.date}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${c.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {c.status}
                    </span>
                  </div>
                  {c.rx && (
                    <button className="flex flex-col items-center justify-center gap-1 text-[#3D91FF] hover:text-white transition-colors bg-[#3D91FF]/10 p-3 rounded-xl border border-[#3D91FF]/20">
                      <Download size={18} />
                      <span className="text-[9px] font-bold uppercase">Rx</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medicines */}
        <div className="border-b border-slate-800/50">
          <button 
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/20 transition-colors"
            onClick={() => toggleAccordion('medicines')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Pill size={20} />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold">Medicine Orders</h4>
                <p className="text-slate-500 text-xs">Pharmacy Deliveries</p>
              </div>
            </div>
            {activeAccordion === 'medicines' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>
          
          {activeAccordion === 'medicines' && (
            <div className="p-5 pt-0 bg-slate-900/30">
              {data.medicines.map((m: any) => (
                <div key={m.id} className="bg-[#0B1121] border border-slate-800 rounded-xl p-4 mb-3 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-white font-bold text-sm leading-tight pr-4">{m.items}</h5>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md whitespace-nowrap ${m.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs flex items-center gap-1"><Clock size={12}/> {m.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lab Tests */}
        <div className="border-b border-slate-800/50">
          <button 
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/20 transition-colors"
            onClick={() => toggleAccordion('labs')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FlaskConical size={20} />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold">Lab Tests</h4>
                <p className="text-slate-500 text-xs">Diagnostics & Reports</p>
              </div>
            </div>
            {activeAccordion === 'labs' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>
          
          {activeAccordion === 'labs' && (
            <div className="p-5 pt-0 bg-slate-900/30">
              {data.labs.map((l: any) => (
                <div key={l.id} className="bg-[#0B1121] border border-slate-800 rounded-xl p-4 mb-3 last:mb-0 flex justify-between items-center">
                  <div>
                    <h5 className="text-white font-bold">{l.test_name}</h5>
                    <p className="text-slate-400 text-xs mb-2">{l.lab_name} • {l.date}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-purple-500/10 text-purple-400">
                      {l.status}
                    </span>
                  </div>
                  {l.status === 'Report Ready' && (
                    <button className="flex flex-col items-center justify-center gap-1 text-purple-400 hover:text-white transition-colors bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                      <Download size={18} />
                      <span className="text-[9px] font-bold uppercase">PDF</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hospitals */}
        <div>
          <button 
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/20 transition-colors"
            onClick={() => toggleAccordion('hospitals')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold">Hospital Visits</h4>
                <p className="text-slate-500 text-xs">Admissions & ER</p>
              </div>
            </div>
            {activeAccordion === 'hospitals' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>
          
          {activeAccordion === 'hospitals' && (
            <div className="p-5 pt-0 bg-slate-900/30">
              {data.hospitals.map((h: any) => (
                <div key={h.id} className="bg-[#0B1121] border border-slate-800 rounded-xl p-4 mb-3 last:mb-0 flex justify-between items-center">
                  <div>
                    <h5 className="text-white font-bold">{h.hospital_name}</h5>
                    <p className="text-slate-400 text-xs mb-2">{h.type} • {h.date}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                      {h.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProfileHub;
