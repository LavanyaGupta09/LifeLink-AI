import React, { useState } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, AlertCircle, Phone, CheckCircle, Car, Wrench, History, Clock, Loader2, Gauge, Droplets, BatteryCharging, AlertTriangle, FileText, ChevronLeft, Menu, HeartPulse, Pill, Heart, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import FreeMap from '../components/FreeMap';
import { fetchRoute } from '../utils/mapUtils';
import QRScannerModal from '../components/QRScannerModal';

type TabId = 'dispatch' | 'ledger' | 'maintenance';

const B2BDriverApp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('dispatch');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  
  // ── Dispatch State ──
  const [status, setStatus] = useState<'idle' | 'dispatched' | 'enroute' | 'arrived'>('idle');
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<string>("0.0");
  const [etaMins, setEtaMins] = useState<number>(0);
  const [reqId, setReqId] = useState<string>('test-req-123'); // Demo request ID
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedPatient, setScannedPatient] = useState<any>(null);

  // Map Fallback to New Delhi
  const driverLoc: [number, number] = [28.6139, 77.2090];
  const patientLoc: [number, number] = [28.5520, 77.2510];

  React.useEffect(() => {
    if (status === 'dispatched' || status === 'enroute') {
      const getRoute = async () => {
        const route = await fetchRoute(driverLoc[1], driverLoc[0], patientLoc[1], patientLoc[0]);
        if (route) {
          setRouteCoords(route.coordinates);
          setDistanceKm((route.distanceMeters / 1000).toFixed(1));
          setEtaMins(Math.ceil(route.durationSeconds / 60));
        }
      };
      getRoute();
    } else {
      setRouteCoords([]);
      setDistanceKm("0.0");
      setEtaMins(0);
    }
  }, [status]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleDutyStatus = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase.from('ambulances').update({ status: isOnline ? 'offline' : 'active' }).eq('driver_id', user.id);
      setIsOnline(!isOnline);
      if (isOnline) setStatus('idle');
      showToast(isOnline ? 'You are now Offline' : 'You are now Online');
    } catch (err) {
      console.error(err);
      showToast('Error updating status');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptDispatch = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase.from('emergency_requests').update({ status: 'accepted', ambulance_id: user.id }).eq('id', reqId);
      setStatus('enroute');
      showToast('Dispatch Accepted');
    } catch (err) {
      console.error(err);
      showToast('Failed to accept dispatch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-[#0B1121] text-white font-sans flex flex-col relative pb-[120px] md:pb-0 px-6 py-6 transition-all duration-300 ${isSidebarExpanded ? 'md:pl-72' : ''}`}>
      
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold z-[100] shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

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
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/20">
            <Car size={28} className="text-emerald-950" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              CAD Dispatch
              {isOnline && <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest border border-emerald-500/50 animate-pulse">Live</span>}
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">Unit: DL-01-AB-1234 • EMS Responder</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-3 bg-[#131B2F] border border-slate-800 rounded-xl hover:bg-slate-800 font-bold transition">Settings</button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full flex-1 p-6 lg:p-10">
        
        {/* TAB 1: CAD DISPATCH */}
        {activeTab === 'dispatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full animate-in fade-in zoom-in-95 duration-200">
            
            {/* LEFT PANE: SHIFT CONTROLS & DISPATCH (Spans 4 cols on desktop) */}
            <div className="w-full lg:col-span-4 flex flex-col gap-6 lg:gap-8 h-full">
              
              {/* Shift Toggle Panel */}
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col gap-4">
                <h3 className="text-slate-400 font-bold tracking-wider uppercase text-sm">Duty Status</h3>
                <button 
                  onClick={toggleDutyStatus}
                  disabled={isLoading}
                  className={`w-full py-5 font-black text-xl flex justify-center items-center gap-3 rounded-2xl transition-all active:scale-95 ${
                    isOnline ? 'bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-500' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-500'}`} />
                      {isOnline ? 'ONLINE & AVAILABLE' : 'GO ON DUTY'}
                    </>
                  )}
                </button>
              </div>

              {!isOnline && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Car size={40} className="text-slate-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-300 mb-2">You are Offline</h2>
                  <p className="text-slate-500 text-lg">Toggle your shift to ONLINE to connect to the CAD dispatch system.</p>
                </div>
              )}

              {isOnline && status === 'idle' && (
                <div className="bg-[#131B2F] border border-emerald-500/20 rounded-3xl p-8 shadow-xl text-center flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute w-64 h-64 border border-emerald-500/10 rounded-full animate-ping opacity-50"></div>
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative z-10">
                    <MapPin size={40} className="text-emerald-500 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white relative z-10">Standing By</h2>
                  <p className="text-slate-400 text-lg relative z-10">Awaiting emergency dispatch...</p>
                  <button className="mt-8 text-sm text-emerald-500 underline font-bold relative z-10" onClick={() => setStatus('dispatched')}>Simulate Alert</button>
                </div>
              )}

              {isOnline && status !== 'idle' && (
                <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="bg-red-500/20 text-red-400 text-xs font-black uppercase px-3 py-1 rounded mb-3 inline-block border border-red-500/20 animate-pulse">CRITICAL DISPATCH</span>
                      <h3 className="text-2xl font-black text-white">{scannedPatient?.name || 'Ravi Sharma (62M)'}</h3>
                      <p className="text-slate-400 text-lg">Suspected Cardiac Arrest</p>
                      {scannedPatient?.lifelink_token && (
                        <p className="text-emerald-400 text-xs mt-1 font-mono">Token: {scannedPatient.lifelink_token}</p>
                      )}
                    </div>
                    <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 hover:bg-slate-700 transition-colors shadow-lg"><Phone size={24} /></button>
                  </div>

                  {scannedPatient && (
                    <div className="mb-8 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
                      {scannedPatient.blood && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex flex-col">
                          <span className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Droplets size={12}/> Blood Type</span>
                          <span className="text-white font-black text-xl">{scannedPatient.blood}</span>
                        </div>
                      )}
                      {scannedPatient.allergies && scannedPatient.allergies.length > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><AlertTriangle size={12}/> Allergies</span>
                          <span className="text-white font-semibold text-sm leading-tight line-clamp-2">{scannedPatient.allergies.join(', ')}</span>
                        </div>
                      )}
                      {scannedPatient.conditions && scannedPatient.conditions.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Activity size={12}/> Conditions</span>
                          <span className="text-white font-semibold text-sm leading-tight line-clamp-2">{scannedPatient.conditions.join(', ')}</span>
                        </div>
                      )}
                      {scannedPatient.meds && scannedPatient.meds.length > 0 && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex flex-col justify-center">
                          <span className="text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Pill size={12}/> Medications</span>
                          <span className="text-white font-semibold text-sm leading-tight line-clamp-2">{scannedPatient.meds.join(', ')}</span>
                        </div>
                      )}
                      {scannedPatient.contact && (
                        <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Phone size={12}/> Emg Contact</span>
                          <span className="text-white font-semibold text-sm">{scannedPatient.contact}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#0B1121] rounded-2xl p-5 border border-slate-800 mb-8 flex gap-5">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shrink-0 shadow-inner"><AlertCircle size={24} className="text-emerald-500" /></div>
                    <div>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Pickup Location</p>
                      <p className="text-lg font-medium text-slate-200">123 Safdarjung Enclave, New Delhi</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {status === 'dispatched' ? (
                      <button onClick={acceptDispatch} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20">
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'ACCEPT DISPATCH'}
                      </button>
                    ) : status === 'enroute' ? (
                      <div className="flex flex-col gap-4">
                        <button onClick={() => setStatus('arrived')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20">
                          <MapPin size={24} /> MARK ARRIVED ON SCENE
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => setShowScannerModal(true)} 
                          className="w-full bg-[#3D91FF]/10 hover:bg-[#3D91FF]/20 text-[#3D91FF] border border-[#3D91FF]/30 font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          <CheckCircle size={24} /> {scannedPatient ? 'PATIENT SCANNED' : 'SCAN PATIENT QR'}
                        </button>
                        <button onClick={() => { setStatus('idle'); setScannedPatient(null); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-lg py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 border border-slate-700 shadow-lg">
                          <CheckCircle size={24} className="text-emerald-400" /> PATIENT HANDED OVER
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT PANE: LIVE MAP (Spans 8 cols on desktop) */}
            <div className="w-full lg:col-span-8 bg-[#131B2F] border border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[500px] relative flex flex-col">
               {isOnline && status !== 'idle' ? (
                 <>
                   <div className="absolute top-6 left-6 z-10 flex gap-4">
                     <div className="bg-[#131B2F]/90 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center">
                       <div className="flex items-center gap-2 text-emerald-400 font-black mb-1 text-sm tracking-wider uppercase"><Clock size={16} /> ETA</div>
                       <p className="text-3xl font-black text-white">{etaMins} <span className="text-lg text-slate-400">min</span></p>
                     </div>
                     <div className="bg-[#131B2F]/90 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center">
                       <div className="flex items-center gap-2 text-slate-400 font-black mb-1 text-sm tracking-wider uppercase"><Navigation size={16} /> Dist</div>
                       <p className="text-3xl font-black text-white">{distanceKm} <span className="text-lg text-slate-400">km</span></p>
                     </div>
                   </div>
                   <div className="w-full h-full flex-1">
                     <FreeMap
                        center={driverLoc}
                        zoom={13}
                        routeCoordinates={routeCoords}
                        markers={[
                          { id: 'driver', lat: driverLoc[0], lng: driverLoc[1], label: 'Ambulance' },
                          { id: 'patient', lat: patientLoc[0], lng: patientLoc[1], label: 'Emergency' }
                        ]}
                     />
                   </div>
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-900 flex-col">
                   <MapPin size={64} className="text-slate-800 mb-4" />
                   <h2 className="text-slate-500 font-bold text-xl">Map Offline</h2>
                   <p className="text-slate-600">Go online and accept a dispatch to view route.</p>
                 </div>
               )}
            </div>

          </div>
        )}

        {/* TAB 2: LOGS / LEDGER */}
        {activeTab === 'ledger' && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Dispatch Ledger</h2>
              <div className="bg-[#131F35] border border-slate-800 rounded-lg p-1 flex items-center">
                 <button className="px-4 py-1.5 rounded-md bg-slate-800 text-white text-sm font-medium">Today</button>
                 <button className="px-4 py-1.5 rounded-md text-slate-400 text-sm font-medium hover:text-white">This Week</button>
              </div>
            </div>

            <div className="bg-[#131F35] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B1121] border-b border-slate-800">
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Date/Time</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Patient</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Destination</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Distance</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-5 text-sm text-slate-300">
                        <div className="font-bold text-white">Aug 1{i}, 2026</div>
                        <div className="text-slate-500">14:{i}0 PM</div>
                      </td>
                      <td className="p-5 text-sm font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">P{i}</div>
                        Rahul Sharma
                      </td>
                      <td className="p-5 text-sm text-slate-400">Max Super Speciality Hospital</td>
                      <td className="p-5 text-sm text-slate-300 font-bold">{12 + i}.4 km</td>
                      <td className="p-5 text-sm">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">Completed</span>
                      </td>
                      <td className="p-5 text-sm text-right">
                        <button className="text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 justify-end w-full">
                          <FileText size={14} /> View Log
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FLEET / MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-8">Fleet Telemetry</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl top-0"></div>
                <Droplets size={32} className="text-emerald-400 mb-4" />
                <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xs mb-1">Fuel Level</h3>
                <p className="text-3xl font-black text-white">78%</p>
              </div>
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute w-32 h-32 bg-blue-500/10 rounded-full blur-2xl top-0"></div>
                <Gauge size={32} className="text-blue-400 mb-4" />
                <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xs mb-1">Odometer</h3>
                <p className="text-3xl font-black text-white">42,105 <span className="text-lg text-slate-500">km</span></p>
              </div>
              <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute w-32 h-32 bg-rose-500/10 rounded-full blur-2xl top-0"></div>
                <BatteryCharging size={32} className="text-rose-400 mb-4" />
                <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xs mb-1">Battery Health</h3>
                <p className="text-3xl font-black text-white">94%</p>
              </div>
            </div>

            <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Wrench size={20} className="text-slate-400" /> Vehicle Health Status</h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">All Systems Nominal</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-[#0B1121] rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold">Engine Diagnostics</h4>
                      <p className="text-sm text-slate-400">Last checked: Today, 08:00 AM</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">OK</span>
                </div>
                <div className="flex items-center justify-between p-5 bg-[#0B1121] rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold">Tire Pressure Monitor</h4>
                      <p className="text-sm text-slate-400">32 PSI average across all tires</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">OK</span>
                </div>
                <div className="flex items-center justify-between p-5 bg-[#0B1121] rounded-2xl border border-rose-500/30 bg-rose-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400"><AlertTriangle size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold text-rose-400">Oxygen Cylinder Capacity</h4>
                      <p className="text-sm text-slate-400">Main cylinder at 15% - requires refill</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors rounded-lg text-xs font-bold uppercase tracking-wider border border-rose-500/20">Request Refill</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {showScannerModal && (
        <QRScannerModal 
          onClose={() => setShowScannerModal(false)}
          onScanSuccess={(data) => {
            setScannedPatient(data);
            setShowScannerModal(false);
            showToast('Patient Medical Data Linked');
          }}
        />
      )}

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

         <button 
           onClick={() => setActiveTab('dispatch')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'dispatch' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'CAD' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">📡</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">CAD</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">CAD</span>}
         </button>
         <button 
           onClick={() => setActiveTab('ledger')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'ledger' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'LOGS' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">📋</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">LOGS</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">LOGS</span>}
         </button>
         <button 
           onClick={() => setActiveTab('maintenance')}
           className={`flex items-center active:scale-95 transition-all w-full px-2 md:px-3 py-2 md:py-3 md:rounded-xl ${activeTab === 'maintenance' ? 'text-emerald-400 md:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/50'} ${!isSidebarExpanded ? 'flex-col md:justify-center' : 'md:justify-start md:flex-row md:gap-3'}`}
           title={!isSidebarExpanded ? 'FLEET' : undefined}
         >
           <span className="text-2xl md:text-xl shrink-0 flex items-center justify-center">🔧</span>
           {isSidebarExpanded ? <span className="text-sm font-bold tracking-wide hidden md:block whitespace-nowrap">FLEET</span> : <span className="text-[9px] md:text-[10px] mt-2 font-bold tracking-widest hidden md:block text-center">FLEET</span>}
         </button>
      </div>

    </div>
  );
};

export default B2BDriverApp;
