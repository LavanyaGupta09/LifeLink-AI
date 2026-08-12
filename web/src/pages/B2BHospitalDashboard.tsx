import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertTriangle, Clock, Activity, Video, LogOut, CheckCircle, GripVertical, Users, ShieldCheck, FileText, ChevronRight, Send, Lock, Plus, Bed, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import FreeMap from '../components/FreeMap';
import { fetchRoute } from '../utils/mapUtils';
import { supabase } from '../lib/supabase';

type TabId = 'alerts' | 'beds' | 'insurance' | 'handoff';

interface PatientCard {
  id: string;
  name: string;
  age: number;
  condition: string;
  triage: 'Critical' | 'High' | 'Medium';
  blood: string;
  doctor: string;
}

type KanbanColumn = 'enroute' | 'triage' | 'icu' | 'general';

const KANBAN_COLUMNS: { id: KanbanColumn; label: string; color: string; bg: string }[] = [
  { id: 'enroute', label: 'En-Route', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { id: 'triage', label: 'Triage', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
  { id: 'icu', label: 'ICU', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
  { id: 'general', label: 'General Ward', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
];

const INITIAL_BEDS: Record<KanbanColumn, PatientCard[]> = {
  enroute: [
    { id: 'p1', name: 'Ravi Sharma', age: 62, condition: 'Suspected MI', triage: 'Critical', blood: 'O+', doctor: 'Dr. Mehta' },
    { id: 'p2', name: 'Priya Nair', age: 28, condition: 'Trauma — RTA', triage: 'High', blood: 'B+', doctor: 'Dr. Kapoor' },
  ],
  triage: [
    { id: 'p3', name: 'Amit Verma', age: 45, condition: 'Acute Abdomen', triage: 'High', blood: 'A+', doctor: 'Dr. Saxena' },
  ],
  icu: [
    { id: 'p4', name: 'Sunita Devi', age: 71, condition: 'Stroke (CVA)', triage: 'Critical', blood: 'AB+', doctor: 'Dr. Reddy' },
  ],
  general: [
    { id: 'p5', name: 'Karan Singh', age: 34, condition: 'Fracture — L Arm', triage: 'Medium', blood: 'O-', doctor: 'Dr. Joshi' },
  ],
};

interface HandoffNote {
  id: string;
  doctor: string;
  timestamp: string;
  content: string;
  locked: boolean;
}

interface InsuranceRequest {
  id: string;
  patient: string;
  insurer: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  refNumber: string;
  timestamp: string;
}

const B2BHospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('alerts');

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  // ── Alerts ──
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const hospitalLoc: [number, number] = [28.5520, 77.2510];
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('emergency_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data) {
        setActiveAlerts(data.map((req: any) => ({
          id: req.id,
          patientName: 'Unknown Patient', // Would join user profile in real app
          age: 45,
          blood: 'A+',
          triage: 'Critical',
          condition: req.triage_notes || 'Unknown Emergency',
          eta: '4 mins',
          ambulance: 'DL-01-AB-1234',
          liveVitals: { hr: 110, spo2: 92 },
          coords: [req.lat, req.lng] as [number, number],
          status: req.status
        })));
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (id: string) => {
    await supabase.from('emergency_requests').update({ status: 'resolved' }).eq('id', id);
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleReject = async (id: string) => {
    await supabase.from('emergency_requests').update({ status: 'resolved' }).eq('id', id); // Reject would pass to another hospital, resolved for demo
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    if (activeAlerts.length > 0 && activeTab === 'alerts') {
      const alert = activeAlerts[0];
      fetchRoute(alert.coords[1], alert.coords[0], hospitalLoc[1], hospitalLoc[0]).then(route => {
        if (route) setRouteCoords(route.coordinates);
      });
    }
  }, [activeAlerts, activeTab]);

  // ── Kanban ──
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [dragItem, setDragItem] = useState<{ card: PatientCard; from: KanbanColumn } | null>(null);

  const handleDragStart = (card: PatientCard, from: KanbanColumn) => {
    setDragItem({ card, from });
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('kanban-col-dragover');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('kanban-col-dragover');
  };
  const handleDrop = (to: KanbanColumn, e: React.DragEvent) => {
    e.currentTarget.classList.remove('kanban-col-dragover');
    if (!dragItem || dragItem.from === to) return;
    setBeds(prev => {
      const updated = { ...prev };
      updated[dragItem.from] = prev[dragItem.from].filter(c => c.id !== dragItem.card.id);
      updated[to] = [...prev[to], dragItem.card];
      return updated;
    });
    setDragItem(null);
  };

  // ── Insurance ──
  const [selectedPatient, setSelectedPatient] = useState('Ravi Sharma');
  const [selectedInsurer, setSelectedInsurer] = useState('Star Health');
  const [insuranceRequests, setInsuranceRequests] = useState<InsuranceRequest[]>([
    { id: 'ins_1', patient: 'Sunita Devi', insurer: 'HDFC Ergo', status: 'Approved', refNumber: 'PA-2024-88912', timestamp: '10:15 AM' },
  ]);
  const [sendingInsurance, setSendingInsurance] = useState(false);
  const insurers = ['Star Health', 'HDFC Ergo', 'ICICI Lombard', 'Max Bupa', 'Bajaj Allianz'];

  const handleSendPreAuth = () => {
    setSendingInsurance(true);
    setTimeout(() => {
      const statuses: ('Approved' | 'Pending')[] = ['Approved', 'Pending'];
      setInsuranceRequests(prev => [{
        id: `ins_${Date.now()}`,
        patient: selectedPatient,
        insurer: selectedInsurer,
        status: statuses[Math.floor(Math.random() * 2)],
        refNumber: `PA-2024-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);
      setSendingInsurance(false);
    }, 2000);
  };

  // ── Handoff Notes ──
  const [handoffNotes, setHandoffNotes] = useState<HandoffNote[]>([
    { id: 'hn_1', doctor: 'Dr. Anil Kapoor', timestamp: 'Aug 9, 06:00 AM — Morning Shift', content: 'Patient in Bed ICU-3 (Sunita Devi) showing improvement. Reduced vasopressor support. Monitor urine output closely. CT follow-up scheduled for noon. ER was quiet overnight — 2 walk-in cases discharged.', locked: true },
    { id: 'hn_2', doctor: 'Dr. Priya Saxena', timestamp: 'Aug 8, 10:00 PM — Night Shift', content: 'Busy shift. 3 trauma cases from highway pileup — all stable now. Ravi Sharma (Bed ICU-1) deteriorated briefly at 11 PM — bolus given, stabilized by midnight. Low on O-negative blood — bank notified.', locked: true },
  ]);
  const [newNote, setNewNote] = useState('');

  const handleSaveNote = () => {
    if (!newNote.trim()) return;
    setHandoffNotes(prev => [{
      id: `hn_${Date.now()}`,
      doctor: 'Dr. Sarah Jenkins (You)',
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' — Current Shift',
      content: newNote,
      locked: true,
    }, ...prev]);
    setNewNote('');
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'alerts', label: 'Active Alerts', icon: <AlertTriangle size={18} /> },
    { id: 'beds', label: 'Bed Manager', icon: <Bed size={18} /> },
    { id: 'insurance', label: 'Insurance Auth', icon: <ShieldCheck size={18} /> },
    { id: 'handoff', label: 'Shift Handoff', icon: <FileText size={18} /> },
  ];

  const triageColor = (t: string) => {
    if (t === 'Critical') return { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#ef4444' };
    if (t === 'High') return { bg: 'rgba(249,115,22,0.12)', border: '#f97316', text: '#f97316' };
    return { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: '#3b82f6' };
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <Building2 size={24} className="text-sky-400" />
          <h1 className="text-lg font-bold">ER Command Desk</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-sky-600/20 text-sky-400' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <button className="flex items-center gap-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white mt-auto px-4 py-3 rounded-lg font-bold transition-colors border border-red-500/30 w-full justify-start z-50 relative shadow-lg" onClick={handleLogout}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* ═══ ACTIVE ALERTS TAB ═══ */}
        {activeTab === 'alerts' && (
          <>
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Incoming Trauma Alerts</h2>
                <p className="text-slate-500">Real-time ambulance telemetry and patient data.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Live
              </div>
            </header>
            {activeAlerts.map(alert => (
              <div key={alert.id} className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden">
                <div className="bg-red-500 text-white px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <AlertTriangle size={24} className="animate-pulse" />
                    CRITICAL INBOUND — {alert.eta}
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold tracking-wider">
                    AMB: {alert.ambulance}
                  </span>
                </div>
                <div className="p-6 grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{alert.patientName}</h3>
                        <p className="text-slate-600">{alert.age} yrs • Blood: <span className="font-bold text-red-600">{alert.blood}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-400 uppercase">Condition</p>
                        <p className="font-bold text-slate-800 text-lg">{alert.condition}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        className="btn bg-slate-900 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 flex-1 justify-center"
                        onClick={() => handleAccept(alert.id)}
                      >
                        <CheckCircle size={20} /> Authorize ER Admission
                      </button>
                      <button 
                        className="btn bg-red-100 text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-red-200 flex-1 justify-center"
                        onClick={() => handleReject(alert.id)}
                      >
                        <XCircle size={20} /> Reject / Route Elsewhere
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col justify-center items-center">
                    <p className="text-sm font-semibold text-slate-400 uppercase mb-4">Live Vitals</p>
                    <div className="w-full flex justify-between mb-4">
                      <div className="text-center">
                        <span className="block text-3xl font-black text-red-500">{alert.liveVitals.hr}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">BPM</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-3xl font-black text-sky-500">{alert.liveVitals.spo2}%</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">SpO2</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full w-[92%]" />
                    </div>
                  </div>
                </div>

                {/* Live Ambulance Map */}
                <div className="h-48 border-t border-slate-200 bg-slate-100 relative">
                  <FreeMap
                    center={hospitalLoc}
                    zoom={13}
                    routeCoordinates={routeCoords}
                    markers={[
                      { id: 'hosp', lat: hospitalLoc[0], lng: hospitalLoc[1], label: 'Your Hospital' },
                      { id: 'amb', lat: alert.coords[0], lng: alert.coords[1], label: `Inbound: ${alert.ambulance}` }
                    ]}
                  />
                  <div className="absolute top-2 left-2 z-[1000] bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 rounded shadow">
                    Live Telemetry Routing
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ═══ BED ALLOCATION KANBAN ═══ */}
        {activeTab === 'beds' && (
          <>
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Bed Allocation Manager</h2>
                <p className="text-slate-500">Drag patients between stages to update their status.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={16} />
                {Object.values(beds).flat().length} patients total
              </div>
            </header>
            <div className="grid grid-cols-4 gap-4" style={{ minHeight: 500 }}>
              {KANBAN_COLUMNS.map(col => (
                <div
                  key={col.id}
                  className="kanban-col rounded-xl border-2 border-dashed p-3 flex flex-col transition-colors"
                  style={{ borderColor: `${col.color}40`, background: col.bg }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(col.id, e)}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: col.color }}>{col.label}</h3>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: `${col.color}20`, color: col.color }}>{beds[col.id].length}</span>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    {beds[col.id].map(card => {
                      const tc = triageColor(card.triage);
                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => handleDragStart(card, col.id)}
                          className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                          style={{ borderLeftWidth: 4, borderLeftColor: tc.border }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-bold text-sm text-slate-900">{card.name}</p>
                            <GripVertical size={14} className="text-slate-300 mt-0.5" />
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{card.age}y • {card.blood} • {card.condition}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: tc.bg, color: tc.text }}>{card.triage}</span>
                            <span className="text-[10px] text-slate-400">{card.doctor}</span>
                          </div>
                        </div>
                      );
                    })}
                    {beds[col.id].length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">Drop patient here</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ INSURANCE PRE-AUTH ═══ */}
        {activeTab === 'insurance' && (
          <>
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Insurance Pre-Authorization</h2>
                <p className="text-slate-500">Send patient SOS data to partner insurers for instant ER admission approval.</p>
              </div>
            </header>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Send size={16} className="text-sky-500" /> New Request</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient</label>
                    <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none">
                      {Object.values(beds).flat().map(p => (
                        <option key={p.id} value={p.name}>{p.name} — {p.condition}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Insurance Partner</label>
                    <select value={selectedInsurer} onChange={e => setSelectedInsurer(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none">
                      {insurers.map(ins => <option key={ins} value={ins}>{ins}</option>)}
                    </select>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Auto-Populated SOS Data</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Blood:</span> <span className="font-bold">O+</span></div>
                      <div><span className="text-slate-400">HR:</span> <span className="font-bold text-red-500">110 bpm</span></div>
                      <div><span className="text-slate-400">SpO2:</span> <span className="font-bold text-sky-500">92%</span></div>
                      <div><span className="text-slate-400">Triage:</span> <span className="font-bold text-red-500">Critical</span></div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendPreAuth}
                    disabled={sendingInsurance}
                    className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {sendingInsurance ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><ShieldCheck size={18} /> Send Pre-Auth Request</>
                    )}
                  </button>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-700 text-sm">Authorization History</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                      <th className="px-6 py-3 font-semibold">Time</th>
                      <th className="px-6 py-3 font-semibold">Patient</th>
                      <th className="px-6 py-3 font-semibold">Insurer</th>
                      <th className="px-6 py-3 font-semibold">Ref #</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceRequests.map(req => (
                      <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-500">{req.timestamp}</td>
                        <td className="px-6 py-3 font-semibold text-slate-800">{req.patient}</td>
                        <td className="px-6 py-3 text-slate-600">{req.insurer}</td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-500">{req.refNumber}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ═══ SHIFT HANDOFF NOTES ═══ */}
        {activeTab === 'handoff' && (
          <>
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Shift Handoff Notes</h2>
                <p className="text-slate-500">Leave critical notes for the incoming ER team. Saved notes are immutable.</p>
              </div>
            </header>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={16} className="text-sky-500" /> Your Note — Current Shift</h3>
                <span className="text-xs text-slate-400">Dr. Sarah Jenkins</span>
              </div>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Document critical observations, pending labs, patient status updates, and anything the next team needs to know..."
                className="w-full border border-slate-200 rounded-lg p-4 text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none resize-none bg-slate-50"
                rows={5}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Lock size={14} /> Save & Lock Note
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {handoffNotes.map(note => (
                <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{note.doctor}</p>
                      <p className="text-xs text-slate-400">{note.timestamp}</p>
                    </div>
                    {note.locked && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        .kanban-col-dragover {
          background: rgba(56, 189, 248, 0.08) !important;
          border-color: rgba(56, 189, 248, 0.5) !important;
        }
      `}</style>
    </div>
  );
};

export default B2BHospitalDashboard;
