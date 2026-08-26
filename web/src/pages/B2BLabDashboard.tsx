import React, { useState } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, UploadCloud, FileCheck, CheckCircle2, ShieldCheck, MapPin, ListPlus, MessageSquare, Plus, Save, Phone, Clock, AlertTriangle, LogOut, ChevronLeft, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type TabId = 'uploader' | 'catalog' | 'fleet' | 'sms';

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: string;
  isOffered: boolean;
  homeCollection: boolean;
}

interface Phlebotomist {
  id: string;
  name: string;
  patient: string;
  status: 'En Route' | 'Collecting' | 'Returning' | 'Offline';
  eta: string;
  lat: number;
  lng: number;
}

interface SMSLog {
  id: string;
  phone: string;
  reportName: string;
  time: string;
  status: 'Delivered' | 'Pending' | 'Failed';
}

const INITIAL_TESTS: LabTest[] = [
  { id: 't1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: '450', isOffered: true, homeCollection: true },
  { id: 't2', name: 'Lipid Profile', category: 'Biochemistry', price: '800', isOffered: true, homeCollection: true },
  { id: 't3', name: 'Thyroid Panel (T3, T4, TSH)', category: 'Hormones', price: '650', isOffered: true, homeCollection: true },
  { id: 't4', name: 'HbA1c', category: 'Diabetology', price: '500', isOffered: true, homeCollection: true },
  { id: 't5', name: 'Vitamin D (25-OH)', category: 'Vitamins', price: '1200', isOffered: false, homeCollection: false },
  { id: 't6', name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: '750', isOffered: true, homeCollection: true },
];

const MOCK_FLEET: Phlebotomist[] = [
  { id: 'ph1', name: 'Suresh Kumar', patient: 'Ravi Sharma', status: 'En Route', eta: '12 mins', lat: 30, lng: 40 },
  { id: 'ph2', name: 'Amit Singh', patient: 'Aisha Khan', status: 'Collecting', eta: '--', lat: 60, lng: 80 },
  { id: 'ph3', name: 'Manoj Tiwari', patient: 'N/A', status: 'Returning', eta: '25 mins', lat: 20, lng: 70 },
  { id: 'ph4', name: 'Vikram Das', patient: 'N/A', status: 'Offline', eta: '--', lat: 10, lng: 10 },
];

const MOCK_SMS: SMSLog[] = [
  { id: 's1', phone: '+91 98765 43210', reportName: 'Lipid Profile', time: '10:45 AM', status: 'Delivered' },
  { id: 's2', phone: '+91 91234 56780', reportName: 'CBC_Report.pdf', time: '09:30 AM', status: 'Delivered' },
  { id: 's3', phone: '+91 99887 76655', reportName: 'Thyroid_Panel', time: '08:15 AM', status: 'Pending' },
];

export default function B2BLabDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('uploader');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  // ── Vault Uploader ──
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setErrorMsg("Invalid file type. Only PDF, JPG, and PNG are allowed."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit."); return;
    }
    setUploadStatus("encrypting");
    setTimeout(() => setUploadStatus("ai_processing"), 1500);
    setTimeout(() => setUploadStatus("success"), 4000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  // ── Test Catalog ──
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [savingCatalog, setSavingCatalog] = useState(false);

  const updateTest = (id: string, field: keyof LabTest, value: any) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveCatalog = () => {
    setSavingCatalog(true);
    setTimeout(() => setSavingCatalog(false), 1000);
  };

  // ── Auto-SMS ──
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);

  return (
    <div className={`w-full min-h-screen bg-[#0B1121] text-white font-sans flex flex-col relative pb-[120px] md:pb-0 px-6 py-6 transition-all duration-300 ${isSidebarExpanded ? 'md:pl-72' : ''}`}>
      
      {/* HEADER */}
      <header className="w-full flex justify-between items-center p-6 lg:px-10 lg:py-8 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          {!isSidebarExpanded && (
            <button 
              onClick={() => setIsSidebarExpanded(true)}
              className="hidden md:flex w-10 h-10 rounded-lg hover:bg-slate-800 items-center justify-center text-slate-400 transition-colors mr-2"
            >
              <Menu size={24} />
            </button>
          )}
          <div className="w-14 h-14 rounded-full bg-fuchsia-600 flex items-center justify-center font-bold text-2xl shadow-lg shadow-fuchsia-600/20">
            <FlaskConical size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Diagnostics Lab</h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">Partner Portal • NABL Accredited</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button onClick={handleLogout} className="px-5 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white font-bold transition flex items-center gap-2">
             <LogOut size={18} /> Logout
           </button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full flex-1 p-6 lg:p-10 flex flex-col min-h-0">

        {/* ═══ VAULT UPLOADER ═══ */}
        {activeTab === 'uploader' && (
          <div className="flex-1 w-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Patient Vault Uploader</h2>
              <p className="text-slate-400 text-lg">Securely push encrypted PDF lab reports directly into the patient's personal health vault.</p>
            </div>

            <div 
              className={`flex-1 w-full bg-[#131B2F] border-4 border-dashed rounded-3xl p-10 lg:p-16 flex flex-col items-center justify-center transition-all shadow-xl ${dragActive ? 'border-fuchsia-500 bg-[#1e102e]' : 'border-slate-800'} ${uploadStatus === 'success' ? 'border-emerald-500 bg-[#0f241a]' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              {uploadStatus === 'success' ? (
                <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]"><CheckCircle2 size={48} /></div>
                  <h3 className="text-3xl font-black text-white mb-3">Upload & Analysis Complete</h3>
                  <p className="text-emerald-400 text-lg mb-8">Report securely encrypted and pushed to patient Vault.</p>
                  
                  <div className="bg-[#0B1121] border border-rose-500/30 rounded-2xl p-6 w-full max-w-3xl text-left mb-8 shadow-xl">
                    <p className="text-sm font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FlaskConical size={18}/> AI Red-Flag Summary (Gemini 2.0)</p>
                    <p className="text-slate-300 text-lg font-medium leading-relaxed">Critical Finding: Fasting Blood Sugar is <span className="text-rose-400 font-bold">210 mg/dL</span>. Elevated risk for severe hyperglycemia. Patient's primary care physician has been automatically alerted.</p>
                  </div>
                  
                  <button onClick={() => setUploadStatus(null)} className="text-slate-400 font-bold hover:text-white underline text-lg">Upload another report</button>
                </div>
              ) : uploadStatus === 'ai_processing' ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"><div className="animate-spin rounded-full h-16 w-16 border-4 border-b-rose-500 border-t-transparent border-l-rose-500 border-r-transparent"></div></div>
                  <h3 className="text-3xl font-black text-white mb-3">AI Scanning...</h3>
                  <p className="text-slate-400 text-lg">Gemini 2.0 is extracting text and checking for critical red-flag values.</p>
                </div>
              ) : uploadStatus === 'encrypting' ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mb-6 text-sky-400 animate-pulse"><ShieldCheck size={48} /></div>
                  <h3 className="text-3xl font-black text-white mb-3">Zero-Knowledge Encryption</h3>
                  <p className="text-slate-400 text-lg">Securing report with patient's public key before vault injection.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-[#0B1121] rounded-full flex items-center justify-center mb-8 text-slate-500 border border-slate-800 shadow-inner">
                    <UploadCloud size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Drag & Drop Lab Report</h3>
                  <p className="text-slate-400 text-lg mb-10 max-w-md">Supports PDF, DICOM, or HL7 messages up to 50MB.</p>
                  
                  {errorMsg && <p className="text-red-500 font-bold mb-6 animate-fade-in text-lg">{errorMsg}</p>}
                  
                  <label className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_0_30px_rgba(192,38,211,0.3)] cursor-pointer">
                    BROWSE FILES
                    <input type="file" className="hidden" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileSelect} />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TEST CATALOG ═══ */}
        {activeTab === 'catalog' && (
          <div className="flex-1 w-full flex flex-col">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Test Catalog & Pricing</h2>
                <p className="text-slate-400 text-lg">Manage available diagnostic tests, pricing, and home collection options.</p>
              </div>
              <button 
                onClick={saveCatalog}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-600/20 active:scale-95"
              >
                {savingCatalog ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={20}/>}
                Save Catalog
              </button>
            </header>
            
            <div className="bg-[#131B2F] rounded-3xl shadow-xl border border-slate-800 overflow-hidden flex-1">
              <table className="w-full text-left text-sm lg:text-base">
                <thead>
                  <tr className="bg-[#0B1121] border-b border-slate-800 text-xs text-slate-400 uppercase tracking-widest font-black">
                    <th className="px-8 py-5">Test Name</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Price (₹)</th>
                    <th className="px-8 py-5 text-center">Offered</th>
                    <th className="px-8 py-5 text-center">Home Collection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tests.map(test => (
                    <tr key={test.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-200">{test.name}</td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{test.category}</td>
                      <td className="px-8 py-5">
                        <div className="relative w-32">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input 
                            value={test.price} 
                            onChange={e => updateTest(test.id, 'price', e.target.value)}
                            disabled={!test.isOffered}
                            className="w-full bg-[#0B1121] border border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-fuchsia-500 disabled:opacity-50 text-white font-bold transition-colors"
                          />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={test.isOffered} onChange={(e) => updateTest(test.id, 'isOffered', e.target.checked)} />
                          <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-fuchsia-600"></div>
                        </label>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={test.homeCollection} onChange={(e) => updateTest(test.id, 'homeCollection', e.target.checked)} disabled={!test.isOffered} />
                          <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-fuchsia-600 peer-disabled:opacity-20"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-[#0B1121] border-t border-slate-800 text-center">
                <button className="text-base font-black tracking-widest text-fuchsia-500 hover:text-fuchsia-400 flex items-center justify-center gap-2 mx-auto uppercase transition-colors"><Plus size={20}/> Add New Test</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FLEET MAP ═══ */}
        {activeTab === 'fleet' && (
          <div className="flex-1 w-full flex flex-col">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Phlebotomist Fleet Map</h2>
              <p className="text-slate-400 text-lg">Live GPS tracking for home collection agents.</p>
            </header>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Agent List (Left - 4 cols) */}
              <div className="w-full lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
                {MOCK_FLEET.map(agent => (
                  <div key={agent.id} className="bg-[#131B2F] p-6 rounded-3xl shadow-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white text-lg">{agent.name}</h4>
                      <span className={`text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border ${
                        agent.status === 'Offline' ? 'bg-slate-800/50 text-slate-400 border-slate-700' :
                        agent.status === 'En Route' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                        agent.status === 'Collecting' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    {agent.status !== 'Offline' && (
                      <div className="text-base text-slate-400 font-medium space-y-2 bg-[#0B1121] p-4 rounded-2xl border border-slate-800/50">
                        <p className="flex items-center gap-3"><MapPin size={18} className="text-fuchsia-500"/> {agent.patient}</p>
                        <p className="flex items-center gap-3"><Clock size={18} className="text-fuchsia-500"/> ETA: {agent.eta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Map Placeholder (Right - 8 cols) */}
              <div className="w-full lg:col-span-8 bg-[#0B1121] rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-xl min-h-[500px]">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                
                {/* Mock Markers */}
                {MOCK_FLEET.map(agent => (
                  <div key={agent.id} className="absolute" style={{ top: `${agent.lat}%`, left: `${agent.lng}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="relative group cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border-2 border-[#0B1121] shadow-[0_0_15px_rgba(0,0,0,0.5)] ${agent.status === 'Offline' ? 'bg-slate-500' : agent.status === 'En Route' ? 'bg-sky-500' : agent.status === 'Collecting' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {agent.status !== 'Offline' && (
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-50 ${agent.status === 'En Route' ? 'bg-sky-500' : agent.status === 'Collecting' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-[#131B2F] border border-slate-700 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
                        <p className="font-bold text-sm mb-1">{agent.name}</p>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{agent.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="absolute bottom-6 right-6 bg-[#131B2F]/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <div className="flex items-center gap-3 mb-3"><div className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"/> En Route</div>
                  <div className="flex items-center gap-3 mb-3"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"/> Collecting</div>
                  <div className="flex items-center gap-3 mb-3"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"/> Returning</div>
                  <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-500"/> Offline</div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═══ AUTO-SMS ═══ */}
        {activeTab === 'sms' && (
          <div className="flex-1 w-full flex flex-col">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Auto-SMS Dispatch</h2>
                <p className="text-slate-400 text-lg">Automatically notify patients when their lab reports are uploaded to their Vault.</p>
              </div>
              <div className="flex items-center gap-4 bg-[#131B2F] px-6 py-3 rounded-2xl border border-slate-800 shadow-lg">
                <span className="text-sm font-black uppercase tracking-widest text-slate-300">Master Toggle:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoSmsEnabled} onChange={(e) => setAutoSmsEnabled(e.target.checked)} />
                  <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </label>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
              {/* Template Editor */}
              <div className="flex flex-col gap-6">
                <div className="bg-[#131B2F] rounded-3xl shadow-xl border border-slate-800 p-8 flex-1 flex flex-col">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-xl"><MessageSquare size={24} className="text-fuchsia-500"/> SMS Template</h3>
                  <div className="bg-[#0B1121] p-6 rounded-2xl border border-slate-700 font-mono text-base text-slate-300 leading-loose flex-1 shadow-inner">
                    Dear [Patient_Name],<br/><br/>
                    Your [Report_Name] report is now available in your LifeLink Vault.<br/><br/>
                    Login to view: lifelink.app/vault<br/><br/>
                    - LifeLink Diagnostics
                  </div>
                  <p className="text-sm text-slate-500 mt-6 flex items-center gap-2 font-medium"><AlertTriangle size={16} className="text-amber-500"/> Variables in brackets are auto-filled per patient.</p>
                </div>
                
                <button className="w-full border-2 border-fuchsia-600 text-fuchsia-500 hover:bg-fuchsia-600 hover:text-white font-black text-lg py-5 rounded-2xl transition-all shadow-lg active:scale-95">
                  EDIT TEMPLATE
                </button>
              </div>

              {/* Delivery Log */}
              <div className="bg-[#131B2F] rounded-3xl shadow-xl border border-slate-800 overflow-y-auto flex flex-col min-h-screen w-full">
                <div className="px-8 py-6 border-b border-slate-800 bg-[#0B1121]"><h3 className="font-bold text-white text-lg">Recent Dispatch Log</h3></div>
                <div className="divide-y divide-slate-800/50 flex-1 overflow-y-auto">
                  {MOCK_SMS.map(log => (
                    <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                      <div>
                        <p className="font-bold text-base text-white flex items-center gap-3 mb-1"><Phone size={16} className="text-slate-500"/> {log.phone}</p>
                        <p className="text-sm text-slate-400 font-medium">{log.reportName} <span className="text-slate-600 mx-2">•</span> {log.time}</p>
                      </div>
                      <span className={`text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${
                        log.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                        log.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FLOATING BOTTOM NAV / DESKTOP SIDEBAR */}
      <div className={`fixed bottom-6 md:bottom-auto md:top-0 md:left-0 md:h-full w-[90%] left-[5%] md:left-0 bg-[#131B2F]/90 backdrop-blur-xl border border-slate-700/50 md:border-y-0 md:border-l-0 md:border-r md:rounded-none rounded-full px-4 py-3 md:px-0 md:py-6 flex md:flex-col justify-between md:justify-start items-center gap-0 md:gap-4 shadow-2xl z-50 overflow-x-auto md:overflow-visible transition-transform duration-300 ${isSidebarExpanded ? 'md:w-64 md:items-start md:px-4 md:translate-x-0' : 'md:w-64 md:-translate-x-full'}`}>
        
        {/* Toggle Button (Desktop only) */}
        <div className="hidden md:flex w-full justify-end mb-4 pr-1">
          <button 
            onClick={() => setIsSidebarExpanded(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <button onClick={() => setActiveTab('uploader')} className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'uploader' ? 'text-fuchsia-500 md:bg-fuchsia-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'VAULT' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center"><UploadCloud size={28}/></span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">VAULT</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">VAULT</span>}
        </button>
        <button onClick={() => setActiveTab('catalog')} className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'catalog' ? 'text-fuchsia-500 md:bg-fuchsia-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'TESTS' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center"><ListPlus size={28}/></span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">TESTS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">TESTS</span>}
        </button>
        <button onClick={() => setActiveTab('fleet')} className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'fleet' ? 'text-fuchsia-500 md:bg-fuchsia-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'FLEET' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center"><MapPin size={28}/></span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">FLEET</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">FLEET</span>}
        </button>
        <button onClick={() => setActiveTab('sms')} className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'sms' ? 'text-fuchsia-500 md:bg-fuchsia-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`} title={!isSidebarExpanded ? 'SMS' : undefined}>
          <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center"><MessageSquare size={28}/></span>
          {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">SMS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">SMS</span>}
        </button>
      </div>

    </div>
  );
}
