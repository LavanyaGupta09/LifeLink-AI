import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Upload, FileCheck, CheckCircle2, LogOut, MapPin, ListPlus, MessageSquare, Plus, Save, Phone, Clock, AlertTriangle } from 'lucide-react';
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

const B2BLabDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('uploader');

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

  // ── Fleet Map ──
  // Using absolute positioning to simulate a map
  
  // ── Auto-SMS ──
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'uploader', label: 'Vault Uploader', icon: <Upload size={18} /> },
    { id: 'catalog', label: 'Test Catalog', icon: <ListPlus size={18} /> },
    { id: 'fleet', label: 'Phlebotomist Fleet', icon: <MapPin size={18} /> },
    { id: 'sms', label: 'Auto-SMS Dispatch', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-fuchsia-900 text-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <FlaskConical size={24} className="text-fuchsia-400" />
          <h1 className="text-lg font-bold leading-tight">Diagnostics Lab<br/><span className="text-xs font-normal text-fuchsia-300">Partner Portal</span></h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-fuchsia-800/50 text-fuchsia-300' : 'text-fuchsia-200/50 hover:text-white'}`}
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
      <main className="flex-1 overflow-y-auto">
        {/* ═══ VAULT UPLOADER ═══ */}
        {activeTab === 'uploader' && (
          <div className="p-8 h-full flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Patient Vault Uploader</h2>
                <p className="text-slate-500">Securely push encrypted PDF lab reports directly into the patient's personal health vault.</p>
              </div>

              <div 
                className={`border-4 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-colors bg-white ${dragActive ? 'border-fuchsia-400 bg-fuchsia-50' : 'border-slate-200'} ${uploadStatus === 'success' ? 'border-emerald-400 bg-emerald-50' : ''}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                {uploadStatus === 'success' ? (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600"><CheckCircle2 size={40} /></div>
                    <h3 className="text-2xl font-bold text-emerald-800 mb-2">Upload & Analysis Complete</h3>
                    <p className="text-emerald-600 text-center mb-6">The report was encrypted and pushed to the patient's Vault.</p>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 w-full text-left mb-6">
                      <p className="text-xs font-bold text-rose-500 uppercase mb-2 flex items-center gap-2"><FlaskConical size={14}/> AI Red-Flag Summary (Gemini)</p>
                      <p className="text-slate-700 text-sm font-medium">Critical Finding: Fasting Blood Sugar is 210 mg/dL. Elevated risk for severe hyperglycemia. Patient's PCP has been automatically alerted.</p>
                    </div>
                    <button onClick={() => setUploadStatus(null)} className="text-slate-500 font-bold hover:text-slate-700 underline">Upload another report</button>
                  </>
                ) : uploadStatus === 'ai_processing' ? (
                  <>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 border-t-rose-200"></div></div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">AI Scanning...</h3>
                    <p className="text-slate-500 text-center">Gemini 2.5 Flash is extracting biomarkers to flag critical anomalies.</p>
                  </>
                ) : uploadStatus === 'encrypting' ? (
                  <>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div></div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Encrypting & Uploading...</h3>
                    <p className="text-slate-500 text-center">Generating secure vault keys.</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6 text-fuchsia-600"><Upload size={40} /></div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Drag & drop PDF report</h3>
                    <p className="text-slate-500 text-center mb-2">or click to browse from your EHR system.</p>
                    <p className="text-slate-400 text-xs text-center mb-8">Max size: 5MB (PDF, JPG, PNG)</p>
                    {errorMsg && <p className="text-red-500 font-bold mb-4 animate-fade-in">{errorMsg}</p>}
                    <label className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-fuchsia-600/20 cursor-pointer">
                      Select File
                      <input type="file" className="hidden" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileSelect} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TEST CATALOG ═══ */}
        {activeTab === 'catalog' && (
          <div className="p-8">
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Test Catalog & Pricing</h2>
                <p className="text-slate-500">Manage available diagnostic tests, pricing, and home collection options.</p>
              </div>
              <button 
                onClick={saveCatalog}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                {savingCatalog ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={18}/>}
                Save Catalog
              </button>
            </header>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Test Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Price (₹)</th>
                    <th className="px-6 py-4 font-semibold text-center">Offered</th>
                    <th className="px-6 py-4 font-semibold text-center">Home Collection</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map(test => (
                    <tr key={test.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{test.name}</td>
                      <td className="px-6 py-4 text-slate-500">{test.category}</td>
                      <td className="px-6 py-4">
                        <div className="relative w-24">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                          <input 
                            value={test.price} 
                            onChange={e => updateTest(test.id, 'price', e.target.value)}
                            disabled={!test.isOffered}
                            className="w-full bg-white border border-slate-200 rounded md:rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-fuchsia-500 disabled:bg-slate-100 disabled:text-slate-400 font-bold"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={test.isOffered} onChange={(e) => updateTest(test.id, 'isOffered', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={test.homeCollection} onChange={(e) => updateTest(test.id, 'homeCollection', e.target.checked)} disabled={!test.isOffered} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600 peer-disabled:opacity-50"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <button className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center justify-center gap-1 mx-auto"><Plus size={16}/> Add New Test</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FLEET MAP ═══ */}
        {activeTab === 'fleet' && (
          <div className="p-8 h-full flex flex-col">
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Phlebotomist Fleet Map</h2>
              <p className="text-slate-500">Live GPS tracking for home collection agents.</p>
            </header>
            
            <div className="flex-1 flex gap-6 min-h-0">
              {/* Map Placeholder */}
              <div className="flex-1 bg-slate-200 rounded-xl border border-slate-300 relative overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Mock Markers */}
                {MOCK_FLEET.map(agent => (
                  <div key={agent.id} className="absolute" style={{ top: `${agent.lat}%`, left: `${agent.lng}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="relative group cursor-pointer">
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${agent.status === 'Offline' ? 'bg-slate-400' : agent.status === 'En Route' ? 'bg-sky-500' : agent.status === 'Collecting' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {agent.status !== 'Offline' && (
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${agent.status === 'En Route' ? 'bg-sky-500' : agent.status === 'Collecting' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        <p className="font-bold">{agent.name}</p>
                        <p className="text-slate-400">{agent.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-sky-500"/> En Route</div>
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-amber-500"/> Collecting</div>
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Returning</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"/> Offline</div>
                </div>
              </div>

              {/* Agent List */}
              <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2">
                {MOCK_FLEET.map(agent => (
                  <div key={agent.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900">{agent.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        agent.status === 'Offline' ? 'bg-slate-100 text-slate-500' :
                        agent.status === 'En Route' ? 'bg-sky-100 text-sky-700' :
                        agent.status === 'Collecting' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    {agent.status !== 'Offline' && (
                      <div className="text-sm text-slate-600">
                        <p className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-slate-400"/> {agent.patient}</p>
                        <p className="flex items-center gap-2"><Clock size={14} className="text-slate-400"/> ETA: {agent.eta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ AUTO-SMS ═══ */}
        {activeTab === 'sms' && (
          <div className="p-8">
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Auto-SMS Dispatch</h2>
                <p className="text-slate-500">Automatically notify patients when their lab reports are uploaded to their Vault.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700">Master Toggle:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoSmsEnabled} onChange={(e) => setAutoSmsEnabled(e.target.checked)} />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </label>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-fuchsia-600"/> SMS Template</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 leading-relaxed">
                    Dear [Patient_Name],<br/><br/>
                    Your [Report_Name] report is now available in your LifeLink Vault.<br/><br/>
                    Login to view: lifelink.app/vault<br/><br/>
                    - LifeLink Diagnostics
                  </div>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1"><AlertTriangle size={12}/> Variables in brackets are auto-filled per patient.</p>
                </div>
                
                <button className="w-full border-2 border-fuchsia-600 text-fuchsia-600 font-bold py-3 rounded-lg hover:bg-fuchsia-50 transition-colors">
                  Edit Template
                </button>
              </div>

              <div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-700 text-sm">Recent Dispatch Log</h3></div>
                  <div className="divide-y divide-slate-100">
                    {MOCK_SMS.map(log => (
                      <div key={log.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-800 flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {log.phone}</p>
                          <p className="text-xs text-slate-500 mt-1">{log.reportName} • {log.time}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${log.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : log.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default B2BLabDashboard;
