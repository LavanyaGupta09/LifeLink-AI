import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, FileText, ClipboardList, PhoneCall, Bot, Mic, ShieldAlert, HeartPulse, LogOut, Calendar, Pill, Search, QrCode, Send, Clock, Check, X, Plus, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type TabId = 'session' | 'calendar' | 'prescription' | 'history';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

type SlotStatus = 'available' | 'blocked' | 'booked';

const MEDICINE_DB = [
  'Paracetamol 500mg', 'Amoxicillin 500mg', 'Metformin 500mg', 'Atorvastatin 20mg',
  'Omeprazole 20mg', 'Azithromycin 500mg', 'Cetirizine 10mg', 'Ibuprofen 400mg',
  'Amlodipine 5mg', 'Losartan 50mg', 'Pantoprazole 40mg', 'Montelukast 10mg',
  'Salbutamol Inhaler', 'Metoprolol 50mg', 'Clopidogrel 75mg', 'Aspirin 75mg',
  'Doxycycline 100mg', 'Ciprofloxacin 500mg', 'Ranitidine 150mg', 'Diclofenac 50mg',
  'Gabapentin 300mg', 'Prednisolone 5mg', 'Levothyroxine 50mcg', 'Insulin Glargine',
];

interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PastConsult {
  id: string;
  date: string;
  patientName: string;
  patientId: string;
  phone: string;
  diagnosis: string;
  prescriptions: string[];
  notes: string;
}

const B2BDoctorWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('session');

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  // ── Live Session ──
  const [isRecording, setIsRecording] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const generateNote = () => {
    setAiNote(`SUBJECTIVE: Patient reports severe chest pain radiating to left arm.
OBJECTIVE: Vitals HR 110, SpO2 92%. Patient appears diaphoretic.
ASSESSMENT: Suspected Myocardial Infarction.
PLAN: Dispatch ALS ambulance immediately. Aspirin 325mg chewed.`);
  };

  // ── Calendar ──
  const [calendarSlots, setCalendarSlots] = useState<Record<string, SlotStatus>>(() => {
    const initial: Record<string, SlotStatus> = {};
    DAYS.forEach(d => SLOTS.forEach(s => {
      const key = `${d}-${s}`;
      if (d === 'Mon' && s === '10:00') initial[key] = 'booked';
      else if (d === 'Wed' && s === '14:00') initial[key] = 'booked';
      else if (d === 'Sat' && (s === '09:00' || s === '10:00')) initial[key] = 'blocked';
      else initial[key] = 'available';
    }));
    return initial;
  });

  const toggleSlot = (key: string) => {
    setCalendarSlots(prev => {
      if (prev[key] === 'booked') return prev; // Can't toggle booked
      return { ...prev, [key]: prev[key] === 'available' ? 'blocked' : 'available' };
    });
  };

  const upcomingConsults = [
    { id: 'tc1', patient: 'Ravi Sharma', time: 'Mon 10:00 AM', condition: 'Diabetes Follow-up', avatar: '👨‍🦳' },
    { id: 'tc2', patient: 'Aisha Khan', time: 'Wed 02:00 PM', condition: 'Thyroid Review', avatar: '👩' },
  ];

  // ── E-Prescription ──
  const [rxPatient, setRxPatient] = useState('');
  const [rxAge, setRxAge] = useState('');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [rxGenerated, setRxGenerated] = useState(false);

  const filteredMeds = medSearch.length > 1 ? MEDICINE_DB.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).slice(0, 6) : [];

  const addMedicine = (med: string) => {
    setRxItems(prev => [...prev, { id: `rx_${Date.now()}`, medicine: med, dosage: '1 tab', frequency: 'Twice daily', duration: '7 days' }]);
    setMedSearch('');
    setShowMedDropdown(false);
  };

  const removeMedicine = (id: string) => {
    setRxItems(prev => prev.filter(item => item.id !== id));
  };

  const updateRxItem = (id: string, field: keyof PrescriptionItem, value: string) => {
    setRxItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // ── Patient History ──
  const [historySearch, setHistorySearch] = useState('');
  const [historyResults, setHistoryResults] = useState<PastConsult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const MOCK_HISTORY: PastConsult[] = [
    { id: 'c1', date: 'Jul 28, 2024', patientName: 'Ravi Sharma', patientId: 'PT-001', phone: '9876543210', diagnosis: 'Type II Diabetes — Uncontrolled', prescriptions: ['Metformin 500mg BD', 'Atorvastatin 20mg OD'], notes: 'HbA1c at 8.9%. Advised strict diet. Follow-up in 2 weeks.' },
    { id: 'c2', date: 'Jul 15, 2024', patientName: 'Ravi Sharma', patientId: 'PT-001', phone: '9876543210', diagnosis: 'Hypertension Stage I', prescriptions: ['Amlodipine 5mg OD'], notes: 'BP 145/92. Started on low-dose CCB. Monitor weekly.' },
    { id: 'c3', date: 'Aug 1, 2024', patientName: 'Aisha Khan', patientId: 'PT-002', phone: '9123456780', diagnosis: 'Hypothyroidism', prescriptions: ['Levothyroxine 50mcg OD'], notes: 'TSH 8.2. Started thyroid replacement. Recheck in 6 weeks.' },
  ];

  const handleHistorySearch = () => {
    const q = historySearch.toLowerCase().trim();
    setSearchPerformed(true);
    setHistoryResults(MOCK_HISTORY.filter(c => c.patientId.toLowerCase().includes(q) || c.phone.includes(q) || c.patientName.toLowerCase().includes(q)));
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'session', label: 'Live Session', icon: <Video size={18} /> },
    { id: 'calendar', label: 'Calendar & Slots', icon: <Calendar size={18} /> },
    { id: 'prescription', label: 'E-Prescription', icon: <Pill size={18} /> },
    { id: 'history', label: 'Patient History', icon: <Search size={18} /> },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0F172A] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 p-5 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
            <Video className="text-indigo-400" size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Doctor Workspace</h1>
            <p className="text-[10px] text-slate-500">Dr. Sarah Jenkins</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <button className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold mt-auto py-2" onClick={handleLogout}>
          <LogOut size={16} /> Log Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ═══ LIVE SESSION ═══ */}
        {activeTab === 'session' && (
          <>
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg">Telehealth Session</h2>
              </div>
              <div className="bg-rose-500/10 text-rose-500 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-rose-500/20">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live (04:12)
              </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950 p-4">
                <div className="flex-1 bg-black rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl flex items-center justify-center">
                  <div className="text-center opacity-50">
                    <Video size={48} className="mx-auto mb-2 text-slate-600" />
                    <p>Jitsi WebRTC Stream Active</p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-32 h-44 bg-slate-800 rounded-lg border-2 border-slate-600"></div>
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700"><Mic size={20} /></button>
                  <button className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700"><PhoneCall size={20} /></button>
                </div>
              </div>
              <div className="w-1/2 flex flex-col bg-slate-900 overflow-y-auto">
                <div className="p-6 border-b border-slate-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Ravi Sharma</h2>
                      <p className="text-slate-400">62 yrs • Male • <span className="text-rose-400 font-bold">O+</span></p>
                    </div>
                    <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded text-sm font-bold border border-orange-500/20 flex items-center gap-2">
                      <ShieldAlert size={16} /> Diabetes Type II
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><HeartPulse size={16}/> Live Vitals</div>
                      <div className="flex justify-between">
                        <div><span className="text-2xl font-black text-rose-500">110</span><span className="text-xs text-slate-500 ml-1">BPM</span></div>
                        <div><span className="text-2xl font-black text-sky-400">92%</span><span className="text-xs text-slate-500 ml-1">SpO2</span></div>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><ClipboardList size={16}/> Current Meds</div>
                      <ul className="text-sm text-slate-300 list-disc pl-4"><li>Metformin 500mg</li><li>Atorvastatin 20mg</li></ul>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2 text-indigo-400"><Bot size={18}/> AI Clinical Assistant</h3>
                    <button onClick={() => { setIsRecording(!isRecording); if(isRecording) generateNote(); }} className={`text-sm px-3 py-1.5 rounded font-bold flex items-center gap-2 ${isRecording ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {isRecording ? <><div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"/> Listening...</> : <><Mic size={14}/> Dictate Note</>}
                    </button>
                  </div>
                  <textarea className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none" placeholder="SOAP note will be auto-generated here via Gemini 2.5 Flash-Lite..." value={aiNote} onChange={(e) => setAiNote(e.target.value)} />
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2"><FileText size={18} /> Sign & Save to EHR</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ CALENDAR & SLOTS ═══ */}
        {activeTab === 'calendar' && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-1">Weekly Schedule</h2>
            <p className="text-slate-500 text-sm mb-6">Click slots to toggle Available / Blocked. Booked slots are locked.</p>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden mb-8">
              <div className="grid grid-cols-8 text-center text-xs font-bold text-slate-400 uppercase border-b border-slate-700">
                <div className="p-3 border-r border-slate-700">Time</div>
                {DAYS.map(d => <div key={d} className="p-3 border-r border-slate-700 last:border-r-0">{d}</div>)}
              </div>
              {SLOTS.map(slot => (
                <div key={slot} className="grid grid-cols-8 border-b border-slate-700/50 last:border-b-0">
                  <div className="p-3 text-xs font-mono text-slate-500 border-r border-slate-700 flex items-center justify-center">{slot}</div>
                  {DAYS.map(day => {
                    const key = `${day}-${slot}`;
                    const st = calendarSlots[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSlot(key)}
                        className={`p-3 border-r border-slate-700/50 last:border-r-0 text-[10px] font-bold uppercase transition-colors ${
                          st === 'booked' ? 'bg-sky-500/15 text-sky-400 cursor-not-allowed' :
                          st === 'blocked' ? 'bg-slate-700/50 text-slate-500 hover:bg-slate-600/50' :
                          'bg-emerald-500/8 text-emerald-500 hover:bg-emerald-500/15'
                        }`}
                      >
                        {st === 'booked' ? '📅 Booked' : st === 'blocked' ? '— Off' : '✓ Open'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Clock size={18} className="text-sky-400" /> Upcoming Teleconsultations</h3>
            <div className="grid grid-cols-2 gap-4">
              {upcomingConsults.map(c => (
                <div key={c.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                  <div className="text-3xl">{c.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.patient}</p>
                    <p className="text-xs text-slate-400">{c.condition}</p>
                    <p className="text-xs text-sky-400 font-bold mt-1">{c.time}</p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"><Video size={12} /> Join</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ E-PRESCRIPTION PAD ═══ */}
        {activeTab === 'prescription' && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-1">Digital E-Prescription Pad</h2>
            <p className="text-slate-500 text-sm mb-6">Generate secure, QR-coded prescriptions and send them directly to the patient's vault.</p>

            {!rxGenerated ? (
              <div className="max-w-3xl">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Patient Name</label>
                    <input value={rxPatient} onChange={e => setRxPatient(e.target.value)} placeholder="Ravi Sharma" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Age</label>
                    <input value={rxAge} onChange={e => setRxAge(e.target.value)} placeholder="62" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Diagnosis</label>
                    <input value={rxDiagnosis} onChange={e => setRxDiagnosis(e.target.value)} placeholder="Type II Diabetes" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600" />
                  </div>
                </div>

                {/* Medicine autocomplete */}
                <div className="relative mb-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Add Medicines</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      value={medSearch}
                      onChange={e => { setMedSearch(e.target.value); setShowMedDropdown(true); }}
                      onFocus={() => setShowMedDropdown(true)}
                      placeholder="Search generic medicines..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                    />
                  </div>
                  {showMedDropdown && filteredMeds.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredMeds.map(m => (
                        <button key={m} onClick={() => addMedicine(m)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-600/20 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                          <Plus size={12} className="text-indigo-400" /> {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescription table */}
                {rxItems.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden mb-6">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                          <th className="px-4 py-3 font-semibold">Medicine</th>
                          <th className="px-4 py-3 font-semibold">Dosage</th>
                          <th className="px-4 py-3 font-semibold">Frequency</th>
                          <th className="px-4 py-3 font-semibold">Duration</th>
                          <th className="px-4 py-3 font-semibold w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rxItems.map(item => (
                          <tr key={item.id} className="border-b border-slate-700/50">
                            <td className="px-4 py-2 font-medium text-indigo-300">{item.medicine}</td>
                            <td className="px-4 py-2"><input value={item.dosage} onChange={e => updateRxItem(item.id, 'dosage', e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-20 outline-none focus:ring-1 focus:ring-indigo-500" /></td>
                            <td className="px-4 py-2">
                              <select value={item.frequency} onChange={e => updateRxItem(item.id, 'frequency', e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                                <option>Once daily</option><option>Twice daily</option><option>Thrice daily</option><option>As needed</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <select value={item.duration} onChange={e => updateRxItem(item.id, 'duration', e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                                <option>3 days</option><option>5 days</option><option>7 days</option><option>14 days</option><option>30 days</option>
                              </select>
                            </td>
                            <td className="px-4 py-2"><button onClick={() => removeMedicine(item.id)} className="text-red-500 hover:text-red-400"><X size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { if (rxItems.length > 0) setRxGenerated(true); }} disabled={rxItems.length === 0} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors">
                    <QrCode size={16} /> Generate QR Prescription
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                  <QrCode size={40} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-1">Prescription Generated</h3>
                <p className="text-slate-400 text-sm mb-6">Secure QR code created for {rxPatient || 'Patient'}</p>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 text-left mb-6">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Prescribed Medications</p>
                  {rxItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-b-0">
                      <span className="text-sm font-medium text-indigo-300">{item.medicine}</span>
                      <span className="text-xs text-slate-400">{item.dosage} • {item.frequency} • {item.duration}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"><Send size={16} /> Send to Patient Vault</button>
                  <button onClick={() => { setRxGenerated(false); setRxItems([]); setRxPatient(''); setRxAge(''); setRxDiagnosis(''); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg">New Prescription</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ PATIENT HISTORY ═══ */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-1">Patient History Search</h2>
            <p className="text-slate-500 text-sm mb-6">Search by Patient ID, phone, or name. Only patients who granted access are visible.</p>
            <div className="flex gap-3 mb-6 max-w-xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleHistorySearch()}
                  placeholder="Patient ID (PT-001) or phone (9876543210)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                />
              </div>
              <button onClick={handleHistorySearch} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-sm">Search</button>
            </div>

            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3 mb-6 flex items-center gap-2 text-xs text-slate-500 max-w-xl">
              <ShieldAlert size={14} className="text-amber-500 shrink-0" />
              <span>Results restricted to patients who have explicitly granted you access to their health records.</span>
            </div>

            {searchPerformed && historyResults.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <User size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">No records found</p>
                <p className="text-sm">Try a different Patient ID or phone number.</p>
              </div>
            )}

            <div className="space-y-4 max-w-3xl">
              {historyResults.map(consult => (
                <div key={consult.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold">{consult.patientName} <span className="text-xs text-slate-500 font-mono ml-2">{consult.patientId}</span></p>
                      <p className="text-xs text-slate-400">{consult.date}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{consult.diagnosis}</span>
                  </div>
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Prescriptions</p>
                    <div className="flex gap-2 flex-wrap">
                      {consult.prescriptions.map((p, i) => (
                        <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{p}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{consult.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default B2BDoctorWorkspace;
