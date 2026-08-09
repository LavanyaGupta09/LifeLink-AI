import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, AlertCircle, Phone, ArrowUpRight, CheckCircle, Car, Wrench, IndianRupee, History, Clock, FileText, Send, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import FreeMap from '../components/FreeMap';
import { fetchRoute } from '../utils/mapUtils';

type TabId = 'dispatch' | 'ledger' | 'maintenance';

interface TripLog {
  id: string;
  date: string;
  patient: string;
  route: string;
  distance: string;
  payout: string;
  status: 'Completed' | 'Cancelled';
}

const MOCK_TRIPS: TripLog[] = [
  { id: 'tr1', date: 'Aug 9, 10:30 AM', patient: 'Ravi Sharma', route: 'Safdarjung → AIIMS', distance: '4.2 km', payout: '₹450', status: 'Completed' },
  { id: 'tr2', date: 'Aug 8, 04:15 PM', patient: 'Sunita Devi', route: 'Lajpat Nagar → Max Saket', distance: '8.5 km', payout: '₹750', status: 'Completed' },
  { id: 'tr3', date: 'Aug 8, 01:20 PM', patient: 'Unknown', route: 'Cancelled at scene', distance: '2.1 km', payout: '₹150', status: 'Cancelled' },
  { id: 'tr4', date: 'Aug 7, 09:00 AM', patient: 'Amit Verma', route: 'Vasant Kunj → Apollo', distance: '12.4 km', payout: '₹1200', status: 'Completed' },
];

const B2BDriverApp: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('dispatch');
  const [isOnline, setIsOnline] = useState(false);
  
  // ── Dispatch State ──
  const [status, setStatus] = useState<'idle' | 'dispatched' | 'enroute' | 'arrived'>('idle');
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<string>("0.0");
  const [etaMins, setEtaMins] = useState<number>(0);

  // Mock Locations for OSRM Demo
  const driverLoc: [number, number] = [28.5355, 77.2650];
  const patientLoc: [number, number] = [28.5520, 77.2510];

  React.useEffect(() => {
    if (status === 'dispatched' || status === 'enroute') {
      const getRoute = async () => {
        // OSRM: lng, lat
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

  // ── Maintenance State ──
  const [maintType, setMaintType] = useState('Low Oxygen Cylinder');
  const [maintSeverity, setMaintSeverity] = useState('Low');
  const [maintNotes, setMaintNotes] = useState('');
  const [maintLogs, setMaintLogs] = useState([{ id: 'm1', type: 'Engine Check Light', severity: 'Medium', date: 'Aug 5', status: 'Resolved' }]);

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  const submitMaintenance = () => {
    if (!maintNotes) return;
    setMaintLogs([{ id: `m${Date.now()}`, type: maintType, severity: maintSeverity, date: 'Today', status: 'Pending' }, ...maintLogs]);
    setMaintNotes('');
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      
      {/* ── Top Bar & Shift Toggle ── */}
      <header className="bg-zinc-900 shadow-md z-20 shrink-0">
        <div className="p-4 flex justify-between items-center border-b border-zinc-800">
          <div>
            <h1 className="font-bold text-amber-500 flex items-center gap-2"><Navigation size={20}/> CAD Dispatch</h1>
            <p className="text-xs text-zinc-400">Unit: DL-01-AB-1234</p>
          </div>
          <button className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-1.5 rounded-full hover:bg-red-500/20 border border-red-500/20" onClick={handleLogout}>
            Log Out
          </button>
        </div>
        
        {/* Massive Shift Toggle */}
        <div className="p-4 bg-zinc-950">
          <button 
            onClick={() => {
              setIsOnline(!isOnline);
              if (isOnline) setStatus('idle'); // If going offline, reset dispatch
            }}
            className={`w-full py-4 rounded-xl font-black text-xl flex justify-center items-center gap-3 transition-colors ${
              isOnline ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-white' : 'bg-zinc-600'}`} />
            {isOnline ? 'ONLINE & AVAILABLE' : 'OFF DUTY'}
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto relative bg-zinc-950">
        
        {!isOnline && (
          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <Car size={64} className="text-zinc-700 mb-6" />
            <h2 className="text-2xl font-black text-zinc-500 mb-2">You are Offline</h2>
            <p className="text-zinc-400">Toggle your shift to ONLINE at the top to receive emergency dispatches.</p>
          </div>
        )}

        {/* ═══ DISPATCH TAB ═══ */}
        {activeTab === 'dispatch' && (
          <div className="h-full flex flex-col">
            {status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                  <MapPin size={40} className="text-zinc-700" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Standing By</h2>
                <p className="text-zinc-500">Awaiting 911 / Municipal dispatch coordinates via OSRM.</p>
                <button className="mt-8 text-sm text-zinc-500 underline" onClick={() => setStatus('dispatched')}>Simulate Incoming Alert</button>
              </div>
            )}

            {status !== 'idle' && (
              <div className="flex-1 flex flex-col">
                {/* Map Area */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                  <FreeMap
                    center={driverLoc}
                    zoom={13}
                    routeCoordinates={routeCoords}
                    markers={[
                      { id: 'driver', lat: driverLoc[0], lng: driverLoc[1], label: 'You (Ambulance)' },
                      { id: 'patient', lat: patientLoc[0], lng: patientLoc[1], label: 'Patient Location' }
                    ]}
                  />
                  
                  {status === 'enroute' && (
                    <>
                      <div className="absolute top-4 right-4 z-10 text-center">
                        <div className="bg-black/80 px-6 py-3 rounded-full border border-amber-500/30 backdrop-blur shadow-lg">
                          <span className="text-3xl font-black text-amber-500">{distanceKm}</span>
                          <span className="text-zinc-400 font-bold ml-2 text-lg">km</span>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 left-4 z-10 bg-zinc-900/90 border border-zinc-700 p-4 rounded-xl backdrop-blur max-w-[200px] shadow-lg">
                        <div className="flex items-center gap-2 text-amber-500 font-bold mb-1"><Clock size={20} /> ETA</div>
                        <p className="text-xl font-bold text-white">{etaMins} mins</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Dispatch Info Sheet */}
                <div className="bg-zinc-900 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded mb-2 inline-block">CRITICAL</span>
                      <h3 className="text-xl font-bold">Ravi Sharma (62M)</h3>
                      <p className="text-zinc-400 text-sm">Suspected Cardiac Arrest</p>
                    </div>
                    <button className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 hover:bg-zinc-700"><Phone size={20} /></button>
                  </div>

                  <div className="bg-black rounded-xl p-4 border border-zinc-800 mb-6 flex gap-4">
                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center shrink-0"><AlertCircle size={20} className="text-amber-500" /></div>
                    <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Pickup Location</p>
                      <p className="text-sm font-medium leading-tight">123 Safdarjung Enclave, New Delhi</p>
                    </div>
                  </div>

                  {status === 'dispatched' ? (
                    <button onClick={() => setStatus('enroute')} className="w-full bg-amber-500 text-black font-black py-4 rounded-xl text-lg hover:bg-amber-400 transition-colors">ACCEPT & START NAVIGATION</button>
                  ) : status === 'enroute' ? (
                    <div className="flex flex-col gap-3">
                      <button className="w-full bg-rose-600 text-white font-black py-4 rounded-xl text-lg hover:bg-rose-500 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.5)]">
                        <AlertCircle size={24} /> TRIGGER ER HAND-OFF
                      </button>
                      <button onClick={() => setStatus('arrived')} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-lg hover:bg-blue-500 flex justify-center items-center gap-2">
                        <MapPin size={24} /> MARK ARRIVED
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setStatus('idle')} className="w-full bg-green-600 text-white font-black py-4 rounded-xl text-lg hover:bg-green-500 flex justify-center items-center gap-2">
                      <CheckCircle size={24} /> PATIENT SECURED
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TRIP LEDGER ═══ */}
        {activeTab === 'ledger' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Trip Ledger</h2>
            
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase mb-1">Month Earnings</p>
                <p className="text-3xl font-black text-amber-500">₹14,500</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 mb-1">42 Trips</p>
                <p className="text-xs text-zinc-400">184 km Driven</p>
              </div>
            </div>

            <div className="space-y-4 pb-20">
              {MOCK_TRIPS.map(trip => (
                <div key={trip.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-zinc-400">{trip.date}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${trip.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-zinc-200">{trip.patient}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{trip.route}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-500">{trip.payout}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{trip.distance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ MAINTENANCE LOG ═══ */}
        {activeTab === 'maintenance' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Fleet Maintenance</h2>
            <p className="text-sm text-zinc-400 mb-6">Report vehicle or supply issues to the municipal fleet manager.</p>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 mb-8">
              <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2"><Wrench size={18}/> New Issue Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Issue Category</label>
                  <select value={maintType} onChange={e => setMaintType(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 outline-none">
                    <option>Low Oxygen Cylinder</option>
                    <option>Engine Check Light</option>
                    <option>Tire Puncture / Pressure</option>
                    <option>Low Medical Supplies (Bandages, IVs)</option>
                    <option>Other Mechanical Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Severity</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'Critical'].map(lvl => (
                      <button key={lvl} onClick={() => setMaintSeverity(lvl)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${maintSeverity === lvl ? (lvl === 'Critical' ? 'bg-red-500/20 border-red-500 text-red-500' : lvl === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-emerald-500/20 border-emerald-500 text-emerald-500') : 'bg-black border-zinc-800 text-zinc-500'}`}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Notes</label>
                  <textarea value={maintNotes} onChange={e => setMaintNotes(e.target.value)} placeholder="Describe the issue..." rows={3} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 outline-none resize-none" />
                </div>
                <button onClick={submitMaintenance} disabled={!maintNotes} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-3 rounded-lg flex items-center justify-center gap-2">
                  <Send size={16} /> Submit to Manager
                </button>
              </div>
            </div>

            <h3 className="font-bold text-zinc-400 mb-3 text-sm uppercase">Recent Submissions</h3>
            <div className="space-y-3 pb-20">
              {maintLogs.map(log => (
                <div key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-200 text-sm">{log.type}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500">{log.date}</span>
                      <span className={`text-[10px] font-bold ${log.severity === 'Critical' ? 'text-red-500' : log.severity === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{log.severity}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${log.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation Tab Bar ── */}
      <nav className="bg-zinc-950 border-t border-zinc-900 p-2 flex justify-around shrink-0 z-20 pb-safe">
        <button 
          onClick={() => setActiveTab('dispatch')}
          className={`flex flex-col items-center gap-1 p-2 w-24 rounded-lg transition-colors ${activeTab === 'dispatch' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Navigation size={22} />
          <span className="text-[10px] font-bold uppercase">Dispatch</span>
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center gap-1 p-2 w-24 rounded-lg transition-colors ${activeTab === 'ledger' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <History size={22} />
          <span className="text-[10px] font-bold uppercase">Ledger</span>
        </button>
        <button 
          onClick={() => setActiveTab('maintenance')}
          className={`flex flex-col items-center gap-1 p-2 w-24 rounded-lg transition-colors ${activeTab === 'maintenance' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Wrench size={22} />
          <span className="text-[10px] font-bold uppercase">Fleet</span>
        </button>
      </nav>
      
    </div>
  );
};

export default B2BDriverApp;
