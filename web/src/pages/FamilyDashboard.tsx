import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Phone, ChevronRight, Plus, Users, HeartPulse, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import LifeLinkAIAssistant from '../components/LifeLinkAIAssistant';

const statusConfig = {
  safe: { color: '#2ED573', label: 'Safe', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  sos: { color: '#FF4757', label: 'SOS Active!', dot: 'bg-rose-500 animate-pulse', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  unknown: { color: '#5A6B8A', label: 'Location Off', dot: 'bg-slate-500', bg: 'bg-transparent', border: 'border-transparent' },
};

const FamilyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<any | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const fetchFamily = async () => {
      if (!user?.id) { setLoadingFamily(false); return; }
      try {
        const { data, error } = await supabase.from('family_members').select('*').eq('user_id', user.id);
        if (error) throw error;
        if (data) {
          const mapped = data.map(d => ({
            id: d.id, name: d.name, relationship: d.relationship, age: d.age || 45,
            status: d.status || 'safe', bloodGroup: d.blood_group, phone: d.phone,
            lat: d.lat, lng: d.lng, lastSeen: d.last_seen || 'just now', easyModeEnabled: d.easy_mode_enabled || false
          }));
          setFamilyMembers(mapped);
          if (mapped.length > 0) setSelected(mapped[0]); // Auto-select first member on desktop
        }
      } catch (err) { console.error('Error fetching family:', err); }
      finally { setLoadingFamily(false); }
    };
    fetchFamily();
  }, [user]);

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col relative pb-[120px] md:pb-0 md:pl-24 px-6 py-6 ">
      
      {/* HEADER */}
      <header className="w-full bg-[#131F35] border-b border-slate-800 px-6 py-4 lg:px-10 lg:py-6 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-[#0B1121] border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Family Command Center</h1>
            <p className="text-slate-400 text-xs lg:text-sm">Manage & Monitor your linked family members</p>
          </div>
        </div>
        <button className="bg-[#3D91FF]/10 text-[#3D91FF] hover:bg-[#3D91FF]/20 border border-[#3D91FF]/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors" onClick={() => setShowInvite(true)}>
          <Plus size={18} /> Invite
        </button>
      </header>

      {/* INVITE MODAL */}
      {showInvite && (
        <div className="fixed inset-0 bg-[#060B14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-black mb-2 text-white">Invite Family Member</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">Enter their email to send a secure LifeLink connection request.</p>
            <input type="email" placeholder="Email address" className="w-full p-4 rounded-xl border border-slate-700 bg-[#0B1121] mb-6 text-white focus:outline-none focus:border-[#3D91FF] transition-colors" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <div className="flex gap-4">
              <button className="flex-1 py-4 rounded-xl font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#3D91FF] to-blue-600 shadow-[0_0_20px_rgba(61,145,255,0.3)] hover:shadow-[0_0_30px_rgba(61,145,255,0.5)] transition-all active:scale-95" onClick={() => { alert(`Invitation sent to ${inviteEmail}!`); setShowInvite(false); setInviteEmail(''); }}>Send Invite</button>
            </div>
          </div>
        </div>
      )}

      <main className="w-full flex-1 p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0">
        
        {/* LEFT PANE - Member List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 pb-20 md:pb-0">
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><HeartPulse size={20} /></div>
            <div>
              <p className="font-bold text-emerald-400 text-sm">All Members Safe</p>
              <p className="text-xs text-emerald-500/70">No active SOS events</p>
            </div>
          </div>

          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mt-2">Linked Members ({familyMembers.length})</h2>

          {loadingFamily ? (
            <div className="animate-pulse flex flex-col gap-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-[#131F35] rounded-2xl border border-slate-800" />)}
            </div>
          ) : familyMembers.length === 0 ? (
            <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center">
              <Users size={40} className="text-slate-600 mb-4" />
              <p className="text-slate-300 font-bold mb-2">No Family Added</p>
              <p className="text-xs text-slate-500">Invite family members to share health updates and SOS alerts.</p>
            </div>
          ) : (
            familyMembers.map((member) => {
              const sc = statusConfig[member.status as keyof typeof statusConfig];
              const isSelected = selected?.id === member.id;
              return (
                <button
                  key={member.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all border ${isSelected ? `bg-[#1a2942] border-[#3D91FF]/50 shadow-[0_0_20px_rgba(61,145,255,0.1)]` : `bg-[#131F35] border-slate-800 hover:border-slate-600`} ${member.status === 'sos' ? 'border-rose-500/50 shadow-[0_0_20px_rgba(255,71,87,0.2)]' : ''}`}
                  onClick={() => setSelected(member)}
                >
                  <div className="relative w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#131F35] ${sc.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-base truncate">{member.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{member.relationship} • {member.age} yrs</p>
                  </div>
                  <ChevronRight size={18} className={`flex-shrink-0 transition-transform ${isSelected ? 'text-[#3D91FF] rotate-90 lg:rotate-0' : 'text-slate-600'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* RIGHT PANE - Detailed View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full hidden lg:flex">
          {selected ? (
            <div className="bg-[#131F35] border border-slate-800 rounded-3xl overflow-y-auto flex flex-col min-h-screen w-full shadow-2xl relative">
              
              {selected.status === 'sos' && (
                <div className="absolute top-0 left-0 w-full h-full bg-rose-500/5 pointer-events-none animate-pulse" />
              )}

              {/* Detail Header */}
              <div className="p-8 border-b border-slate-800/80 flex justify-between items-start bg-[#0B1121]/50 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center font-black text-3xl shadow-inner">
                    {selected.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{selected.name}</h2>
                    <p className="text-sm text-slate-400 font-medium mt-1 flex items-center gap-2">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{selected.relationship}</span> 
                      {selected.phone && <span><Phone size={12} className="inline mr-1" />{selected.phone}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${statusConfig[selected.status as keyof typeof statusConfig].bg} ${statusConfig[selected.status as keyof typeof statusConfig].border}`} style={{ color: statusConfig[selected.status as keyof typeof statusConfig].color }}>
                    <div className={`w-2 h-2 rounded-full ${statusConfig[selected.status as keyof typeof statusConfig].dot}`} />
                    {statusConfig[selected.status as keyof typeof statusConfig].label}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Last ping: {selected.lastSeen}</p>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-8 flex-1 overflow-y-auto grid grid-cols-2 gap-6 relative z-10">
                
                {/* Actions */}
                <div className="col-span-2 flex gap-4">
                  <button className="flex-1 bg-[#0B1121] border border-slate-700 hover:border-[#3D91FF] py-4 rounded-2xl font-bold text-slate-300 hover:text-white transition-all flex justify-center items-center gap-2" onClick={() => navigate('/passport')}>
                    <Activity size={18} className="text-[#3D91FF]" /> Shared Health Vault
                  </button>
                  <button className="flex-1 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 py-4 rounded-2xl font-bold text-rose-500 transition-all flex justify-center items-center gap-2 active:scale-95">
                    <AlertTriangle size={18} /> Remote SOS Override
                  </button>
                </div>

                {/* Map Location */}
                <div className="col-span-2 bg-[#0B1121] border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-64 flex flex-col items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <MapPin size={48} className={`mb-2 ${selected.status === 'sos' ? 'text-rose-500 animate-bounce' : 'text-[#3D91FF] group-hover:-translate-y-2 transition-transform'}`} />
                  <p className="font-bold text-white relative z-10">Live GPS Location</p>
                  <p className="text-xs text-slate-400 relative z-10">Click to expand map view</p>
                </div>

                {/* Device Settings */}
                <div className="col-span-1 bg-[#0B1121] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-300 text-sm mb-1 uppercase tracking-widest">Device Mode</h4>
                    <p className="text-xs text-slate-500 mb-4">Simplify UI for seniors</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Elder Easy Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={selected.easyModeEnabled} onChange={(e) => alert(`Easy Mode for ${selected.name} remotely ${e.target.checked ? 'enabled' : 'disabled'}.`)} />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D91FF]"></div>
                    </label>
                  </div>
                </div>

                {/* Adherence */}
                <div className="col-span-1 bg-[#0B1121] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                   <div>
                    <h4 className="font-bold text-slate-300 text-sm mb-1 uppercase tracking-widest">Pill Adherence</h4>
                    <p className="text-xs text-slate-500 mb-4">Weekly medication compliance</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`text-4xl font-black ${selected.id === 'f1' ? 'text-amber-500' : 'text-emerald-500'}`}>{selected.id === 'f1' ? '78%' : '98%'}</span>
                    {selected.id === 'f1' && <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">1 Missed</span>}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-[#131F35] border border-slate-800 rounded-3xl h-full flex items-center justify-center text-center opacity-50">
              <div>
                <Users size={64} className="mx-auto text-slate-600 mb-4" />
                <p className="text-xl font-bold text-slate-400">Select a family member</p>
              </div>
            </div>
          )}
        </div>

      </main>
      <LifeLinkAIAssistant />
    </div>
  );
};

export default FamilyDashboard;
