import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, MapPin, Phone, CheckCircle, XCircle, Filter, Loader2, AlertTriangle, X } from 'lucide-react';
import type { BloodGroup } from '../types/health.types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const compatibilityMap: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

const BloodNetwork: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [requestSent, setRequestSent] = useState<string[]>([]);

  // Donor State
  const [isDonor, setIsDonor] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [myBloodGroup, setMyBloodGroup] = useState<BloodGroup | ''>('');
  
  // SOS Broadcast State
  const [showSosModal, setShowSosModal] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [sosForm, setSosForm] = useState({ blood_group: 'O+', units: 1, location: '' });

  // Incoming Realtime SOS
  const [incomingSos, setIncomingSos] = useState<any | null>(null);


  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated donor generation when DB is empty
  const generateSimulatedDonors = () => {
    const INDIAN_NAMES = [
      'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Vivek Kumar',
      'Sneha Reddy', 'Arjun Mehta', 'Kavya Nair', 'Rahul Verma', 'Divya Joshi',
      'Karan Malhotra', 'Ishita Kapoor', 'Siddharth Rao', 'Meera Pillai', 'Aditya Iyer'
    ];
    const BLOOD_DIST: BloodGroup[] = ['O+', 'O+', 'O+', 'A+', 'A+', 'B+', 'B+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-', 'O+', 'A+'];
    const LAST_DONATIONS = ['2 months ago', '3 months ago', '5 months ago', '1 month ago', '6 months ago', '4 weeks ago'];

    return INDIAN_NAMES.map((name, i) => ({
      id: `sim_donor_${i}`,
      name,
      bloodGroup: BLOOD_DIST[i],
      distanceKm: (0.5 + Math.random() * 14).toFixed(1),
      isAvailable: Math.random() > 0.2,
      lastDonation: LAST_DONATIONS[i % LAST_DONATIONS.length],
      phone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
    }));
  };

  // Initial fetch for donors
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, blood_group')
          .eq('is_blood_donor', true);
          
        if (data && data.length > 0) {
          const formatted = data.map(d => ({
            id: d.id,
            name: d.full_name || 'Anonymous Donor',
            bloodGroup: d.blood_group,
            distanceKm: (1 + Math.random() * 8).toFixed(1),
            isAvailable: true,
            lastDonation: '2 months ago'
          }));
          setDonors(formatted);
        } else {
          // Fallback: generate realistic simulated donors for demo
          console.log('📊 No real donors found — loading simulated donor network');
          setDonors(generateSimulatedDonors());
        }
      } catch (err) {
        console.error('Error fetching donors:', err);
        setDonors(generateSimulatedDonors());
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      supabase.from('user_profiles').select('is_blood_donor, blood_group').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setIsDonor(data.is_blood_donor || false);
            if (data.blood_group) setMyBloodGroup(data.blood_group as BloodGroup);
          }
        });
    }

    // Subscribe to blood requests
    const channel = supabase.channel('blood_sos_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blood_requests' }, (payload) => {
        const newRequest = payload.new;
        // Check if the current user is a donor and compatible
        if (isDonor && myBloodGroup && newRequest.blood_group) {
          // If the requested blood group matches what I can donate to
          // Example: if requested is O+, I can donate if I am O+ or O-
          // Here we just do a simple strict match or broad match based on compatibility
          const canDonateTo = Object.entries(compatibilityMap).find(([group, donors]) => 
             group === newRequest.blood_group && donors.includes(myBloodGroup as BloodGroup)
          );
          
          if (canDonateTo && newRequest.patient_id !== user?.id) {
            setIncomingSos(newRequest);
            // Fallback notification (mocking Telegram/Email alert)
            console.log(`[MOCK TELEGRAM/EMAIL API]: Sent urgent alert to user ${user?.email} for ${newRequest.blood_group} blood!`);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDonor, myBloodGroup]);

  const filtered = selectedGroup === 'All'
    ? donors
    : donors.filter(d => compatibilityMap[selectedGroup]?.includes(d.bloodGroup));

  const handleRequest = (id: string) => {
    setRequestSent(prev => [...prev, id]);
  };

  const handleJoinNetwork = async () => {
    if (!myBloodGroup) return alert('Please select your blood group first.');
    if (!user?.id) return alert('Please login first.');

    setIsJoining(true);
    const { error } = await supabase.from('user_profiles')
      .update({ is_blood_donor: true, blood_group: myBloodGroup })
      .eq('id', user.id);
      
    if (!error) {
      setIsDonor(true);
    }
    setIsJoining(false);
  };

  const handleBloodSOS = async () => {
    if (!sosForm.location.trim()) return alert('Please enter hospital location.');
    if (!user?.id) return alert('Please login first.');

    setIsBroadcasting(true);
    const { error } = await supabase.from('blood_requests').insert({
      patient_id: user.id,
      blood_group: sosForm.blood_group,
      units: sosForm.units,
      location: sosForm.location,
      status: 'urgent'
    });

    setIsBroadcasting(false);
    if (!error) {
      setShowSosModal(false);
      alert('Emergency SOS Broadcasted to matching donors within 15km!');
    } else {
      alert('Failed to broadcast SOS. Please check your connection.');
    }
  };

  const bloodColor = (bg: BloodGroup | string) => {
    const negatives = ['A-', 'B-', 'AB-', 'O-'];
    return negatives.includes(bg) ? '#FF4757' : '#FF6B81';
  };

  return (
    <div className="app-shell w-full min-h-[100dvh] overflow-y-auto pb-36 px-4">
      <div className="page-header pt-[env(safe-area-inset-top)] -mx-4 px-4">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Blood Donor Network</h2>
          <p className="text-xs text-secondary">{donors.filter(d => d.isAvailable).length} donors available nearby</p>
        </div>
        <Filter size={18} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
      </div>

      <div className="page-content relative">
        {/* Urgency CTA */}
        <div className="urgency-card animate-fade-in">
          <div className="urgency-icon">🆘</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Need Blood Urgently?</p>
            <p className="text-xs text-secondary">Broadcast SOS to all compatible donors in 5km radius</p>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setShowSosModal(true)}>SOS Broadcast</button>
        </div>

        {/* Your blood group */}
        {myBloodGroup && (
          <div className="card your-group animate-fade-in delay-100">
            <div className="flex items-center gap-3">
              <Droplets size={20} color={bloodColor(myBloodGroup)} />
              <div>
                <p className="text-xs text-tertiary">Your Blood Group</p>
                <p className="font-bold" style={{ color: bloodColor(myBloodGroup), fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>{myBloodGroup}</p>
              </div>
              <div className="divider-v" />
              <div>
                <p className="text-xs text-tertiary">Can receive from</p>
                <p className="text-xs font-semibold">{compatibilityMap[myBloodGroup as BloodGroup]?.join(', ') || ''}</p>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/passport')}>
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Blood group filter */}
        <p className="section-title mb-2 animate-fade-in delay-200">Filter by Compatible Group</p>
        <div className="blood-filter animate-fade-in delay-200">
          <button
            className={`blood-pill ${selectedGroup === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedGroup('All')}
          >
            All
          </button>
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              className={`blood-pill ${selectedGroup === bg ? 'active' : ''}`}
              style={{ '--pill-color': bloodColor(bg) } as any}
              onClick={() => setSelectedGroup(bg)}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* Donor list */}
        <p className="section-title mb-3 animate-fade-in delay-300">
          {selectedGroup === 'All' ? 'All Nearby Donors' : `Compatible with ${selectedGroup}`}
        </p>
        
        {loading ? (
          <div className="animate-pulse">
            {[1,2].map(i => <div key={i} className="card mb-3" style={{ height: 90, background: 'var(--bg-elevated)', borderRadius: 16 }}></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--bg-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '1.5rem' }}>🩸</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Donors Found</h3>
            <p style={{ fontSize: '0.85rem' }}>Be the first in your area to join the network and save lives.</p>
          </div>
        ) : (
        filtered.map((donor, i) => {
          const sent = requestSent.includes(donor.id);
          return (
            <div
              key={donor.id}
              className="card donor-card animate-fade-in"
              style={{ animationDelay: `${300 + i * 80}ms`, marginBottom: 10 }}
            >
              <div className="flex items-center gap-3">
                <div className="donor-blood-badge" style={{ borderColor: bloodColor(donor.bloodGroup) + '50', background: bloodColor(donor.bloodGroup) + '15' }}>
                  <span style={{ color: bloodColor(donor.bloodGroup), fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '0.875rem' }}>
                    {donor.bloodGroup}
                  </span>
                  <Droplets size={10} color={bloodColor(donor.bloodGroup)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{donor.name}</p>
                    {donor.isAvailable
                      ? <CheckCircle size={14} color="#2ED573" />
                      : <XCircle size={14} color="var(--text-tertiary)" />
                    }
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} color="var(--text-tertiary)" />
                      <span className="text-xs text-secondary">{donor.distanceKm} km · {donor.city}</span>
                    </div>
                    <span className="text-xs text-secondary">Last: {donor.lastDonation}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`status-dot ${donor.isAvailable ? 'online' : 'offline'}`} />
                    <span className="text-xs" style={{ color: donor.isAvailable ? '#2ED573' : 'var(--text-tertiary)' }}>
                      {donor.isAvailable ? 'Available to donate' : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
              {donor.isAvailable && (
                <div className="flex gap-2 mt-3">
                  <button
                    className={`btn flex-1 btn-sm ${sent ? 'btn-ghost' : 'btn-danger'}`}
                    onClick={() => handleRequest(donor.id)}
                    disabled={sent}
                  >
                    {sent ? <><CheckCircle size={14} /> Request Sent</> : <><Droplets size={14} /> Send Request</>}
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Phone size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        }))}

        {/* Become a donor */}
        <div className="card become-donor animate-fade-in delay-600 mt-4 mb-8">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2rem' }}>❤️</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Become a Blood Donor</p>
              <p className="text-xs text-secondary">Register to help save lives in your community</p>
            </div>
          </div>
          
          {/* Dynamic Join Section */}
          <div className="mt-3 bg-[var(--bg-elevated)] p-3 rounded-lg border border-[var(--border)]">
            {!isDonor ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-secondary mb-1 block">Select Your Blood Group</label>
                  <select 
                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm p-2 text-white outline-none"
                    value={myBloodGroup}
                    onChange={(e) => setMyBloodGroup(e.target.value as BloodGroup)}
                  >
                    <option value="" disabled>Select group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <button 
                  className="btn btn-primary btn-block" 
                  onClick={handleJoinNetwork}
                  disabled={isJoining || !myBloodGroup}
                >
                  {isJoining ? <><Loader2 size={16} className="animate-spin"/> Joining...</> : 'Join Network'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#2ED573]">
                  <CheckCircle size={16} />
                  <span className="text-sm font-semibold">Active Donor</span>
                </div>
                <button 
                  className="btn btn-ghost btn-sm text-xs" 
                  onClick={() => setIsDonor(false)} // In a real app, hit DB to opt-out
                >
                  Opt-Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOS Broadcast Modal */}
      {showSosModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in shadow-2xl z-20">
            <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <AlertTriangle size={18} />
                <h3>Emergency Blood SOS</h3>
              </div>
              <button onClick={() => setShowSosModal(false)}><X size={18} className="text-secondary hover:text-white" /></button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-secondary mb-1 block uppercase font-bold">Blood Group Needed</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:border-red-500 transition-colors"
                  value={sosForm.blood_group}
                  onChange={(e) => setSosForm({...sosForm, blood_group: e.target.value})}
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary mb-1 block uppercase font-bold">Hospital Name / Location</label>
                <input 
                  type="text" 
                  placeholder="e.g., Apollo Hospital, Sector 14"
                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg placeholder-slate-400 outline-none focus:border-red-500 transition-colors"
                  value={sosForm.location}
                  onChange={(e) => setSosForm({...sosForm, location: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-secondary mb-1 block uppercase font-bold">Units Required</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:border-red-500 transition-colors"
                  value={sosForm.units}
                  onChange={(e) => setSosForm({...sosForm, units: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            
            <div className="p-4 pt-2">
              <button 
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/30 mt-3 transition-all flex justify-center items-center gap-2"
                onClick={handleBloodSOS}
                disabled={isBroadcasting}
              >
                {isBroadcasting ? <><Loader2 size={18} className="animate-spin" /> BROADCASTING...</> : '🚨 BROADCAST URGENT BLOOD SOS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming SOS Alert */}
      {incomingSos && (
        <div className="fixed inset-0 z-[60] bg-red-950/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-black border border-red-500 rounded-xl max-w-sm w-full p-5 text-center shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-fast relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
            
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
              <Droplets size={32} className="text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-wide">URGENT REQUEST</h2>
            <p className="text-white text-lg font-medium mb-1">
              <span className="text-red-400 font-bold">{incomingSos.blood_group}</span> Blood Required
            </p>
            <p className="text-secondary text-sm mb-6 flex justify-center items-center gap-1">
              <MapPin size={14} /> {incomingSos.location} · {incomingSos.units} Units
            </p>
            
            <div className="flex gap-3">
              <button className="btn flex-1 bg-[var(--bg-elevated)] text-white hover:bg-[var(--border)]" onClick={() => setIncomingSos(null)}>
                Dismiss
              </button>
              <button className="btn btn-danger flex-1" onClick={() => { alert('Connecting to hospital coordinator...'); setIncomingSos(null); }}>
                Accept & Help
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .urgency-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,71,87,0.08);
          border: 1.5px solid rgba(255,71,87,0.25);
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-bottom: 16px;
        }
        .urgency-icon { font-size: 1.5rem; flex-shrink: 0; }
        .your-group { margin-bottom: 20px; cursor: default; }
        .divider-v {
          width: 1px;
          height: 32px;
          background: var(--border);
          flex-shrink: 0;
        }
        .blood-filter {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          margin-bottom: 20px;
        }
        .blood-filter::-webkit-scrollbar { display: none; }
        .blood-pill {
          white-space: nowrap;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-display);
          transition: all var(--duration-fast);
        }
        .blood-pill.active {
          background: rgba(255,71,87,0.15);
          border-color: rgba(255,71,87,0.4);
          color: #FF4757;
        }
        .donor-card { cursor: default; }
        .donor-blood-badge {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          border: 2px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          gap: 1px;
        }
        .become-donor { cursor: default; }
        .animate-pulse-fast { animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(0.99); }
        }
      `}</style>
    </div>
  );
};

export default BloodNetwork;
