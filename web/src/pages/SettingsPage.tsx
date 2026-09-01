import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Calendar, AlertTriangle, LogOut, HeartPulse, Droplets } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { bloodAPI } from '../services/api';
import { supabase } from '../lib/supabase';
import { ScanFace } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, emergencyContacts, updateUser, updatePrimaryContact, toggleEasyMode, logout, healthProfile } = useAuthStore();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  
  const handleToggleDonor = async (checked: boolean) => {
    setIsDonor(checked);
    try {
      const mockUserId = 'usr_demo';
      const bloodGroup = healthProfile?.bloodGroup || 'A+';
      const lat = 28.5355;
      const lng = 77.2690;
      await bloodAPI.registerDonor(mockUserId, bloodGroup, lat, lng, checked);
    } catch (err) {
      console.error('Failed to update donor status', err);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };
  
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState('');

  const handleRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    setPasskeyStatus('');
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn not supported on this browser.');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "LifeLink AI",
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: user?.phone || "user@lifelink.com",
            displayName: user?.fullName || "LifeLink User"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", 
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (credential) {
        setPasskeyStatus('Passkey registered successfully! You can now use Face ID / Fingerprint to log in.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setPasskeyStatus('Registration canceled.');
      } else {
        setPasskeyStatus(err.message || 'Failed to register passkey. Ensure your device supports WebAuthn.');
      }
    } finally {
      setIsRegisteringPasskey(false);
    }
  };
  
  const primaryContact = emergencyContacts[0] || { name: '', relationship: '', phone: '' };

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    ecName: primaryContact.name,
    ecRelationship: primaryContact.relationship,
    ecPhone: primaryContact.phone,
    bloodPressure: healthProfile?.bloodPressure || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Use Supabase session if available, otherwise fallback to the global store user (for demo/development)
        const userId = session?.user?.id || user?.id;
        
        if (!userId) {
          navigate('/login');
          return;
        }
        
        setActiveSessionId(userId);
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || prev.fullName,
            dateOfBirth: profile.dob || prev.dateOfBirth,
          }));
        }

        // Fetch primary contact
        const { data: contact } = await supabase
          .from('family_members')
          .select('*')
          .eq('user_id', userId)
          .eq('is_primary', true)
          .single();
          
        if (contact) {
          setFormData(prev => ({
            ...prev,
            ecName: contact.name || prev.ecName,
            ecRelationship: contact.relationship || prev.ecRelationship,
            ecPhone: contact.phone ? contact.phone.replace('+91 ', '') : prev.ecPhone,
          }));
        }
      } catch (err) {
        console.error("Session fetch error:", err);
      } finally {
        setSessionLoading(false);
      }
    };
    
    fetchSessionAndData();
  }, [navigate]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^A-Za-z\s-]/g, '');
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setFormData({ ...formData, [e.target.name]: val });
    }
  };

  const handleBPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d/]/g, '');
    if (val.length === 3 && !val.includes('/')) {
      val = val + '/';
    } else if (val.length > 3 && !val.includes('/')) {
      val = val.slice(0, 3) + '/' + val.slice(3, 7);
    }
    setFormData({ ...formData, bloodPressure: val.slice(0, 7) });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!activeSessionId) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ full_name: formData.fullName, dob: formData.dateOfBirth })
        .eq('id', activeSessionId);

      if (profileError) throw profileError;

      const { error: contactError } = await supabase
        .from('family_members')
        .update({ name: formData.ecName, phone: formData.ecPhone, relationship: formData.ecRelationship })
        .eq('user_id', activeSessionId)
        .eq('is_primary', true);

      // We don't throw on contactError because they might not have an emergency contact row yet
      if (contactError) console.warn('Could not update contact:', contactError);

      updateUser({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
      });
      
      updatePrimaryContact({
        name: formData.ecName,
        relationship: formData.ecRelationship,
        phone: formData.ecPhone,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return <div className="text-white text-center mt-20">Loading Profile...</div>;
  }

  if (user?.role === 'equipment') {
    return (
      <div className="w-full px-6 overflow-y-auto pb-36 bg-[#0B1121] min-h-screen text-white">
        {/* Header */}
        <div className="header sticky pt-[env(safe-area-inset-top)] z-50 bg-[#0B1121] border-b border-slate-800 -mx-4 px-4 pb-4 mb-6 mt-4 flex items-center justify-between">
          <button className="text-slate-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-white">Provider Settings</h2>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <h3 className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Business Profile</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Business Name</label>
            <input 
              type="text" 
              defaultValue="LifeCare Medical Equipments Ltd."
              className="w-full bg-[#131B2F] text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Support Phone</label>
            <div className="flex items-center w-full bg-[#131B2F] text-white border border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500 transition-all overflow-hidden">
              <span className="pl-3.5 pr-2 py-3.5 text-slate-400 font-semibold border-r border-slate-700 bg-slate-800/80 text-sm">+91</span>
              <input 
                type="tel" 
                defaultValue="9876543210"
                className="w-full bg-transparent text-white p-3.5 outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Service Area Radius (km)</label>
            <input 
              type="number" 
              defaultValue="50"
              className="w-full bg-[#131B2F] text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder-slate-500"
            />
          </div>

          <h3 className="text-slate-400 text-sm font-bold mt-6 mb-2 uppercase tracking-wider">Preferences</h3>
          
          <div className="flex items-center justify-between p-4 bg-[#131B2F] border border-slate-700 rounded-xl mt-2">
            <div>
              <h4 className="font-semibold text-white">Auto-Accept Rentals</h4>
              <p className="text-xs text-slate-400 mt-1">Automatically approve rentals if inventory is available</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <button 
            className={`w-full mt-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 ${success ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} transition-colors`} 
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
              }, 1000);
            }}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>✅ Settings Saved</>
            ) : (
              <><Save size={20} /> Save Settings</>
            )}
          </button>

          {/* Logout Section */}
          <div className="mt-10 mb-8 border-t border-slate-800 pt-8">
            {showLogoutConfirm ? (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col items-center">
                <AlertTriangle className="text-red-500 mb-2" size={24} />
                <p className="text-red-500 font-bold mb-4 text-center">Are you sure you want to log out?</p>
                <div className="flex gap-3 w-full">
                  <button 
                    className="px-4 py-2 bg-slate-800 rounded-lg flex-1 text-slate-400 font-bold hover:bg-slate-700"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex-1 font-bold"
                    onClick={handleLogout}
                  >
                    Confirm Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="w-full py-3.5 border border-red-500/30 text-red-500 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 font-bold transition-colors"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut size={20} /> Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 overflow-y-auto pb-36 bg-slate-950">
      {/* Header */}
      <div className="header sticky pt-[env(safe-area-inset-top)] z-50 bg-slate-950 border-b border-slate-800 -mx-4 px-4 pb-2 mb-4">
        <button className="icon-btn-raw" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="header-title pt-[env(safe-area-inset-top)] text-white">Edit Profile</h2>
        <div style={{ width: 24 }} />
      </div>

      {/* Prominent Easy Mode Toggle */}
      <div className="flex items-center justify-between p-5 bg-emerald-900/30 border-2 border-emerald-500/50 rounded-2xl mb-6 shadow-lg shadow-emerald-900/20">
        <div>
          <h4 className="font-bold text-[1.1rem] text-emerald-400">Elder Easy Mode (60+)</h4>
          <p className="text-xs text-emerald-100/70 mt-1 font-medium">Massive text, 1-tap SOS, voice AI</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer scale-110">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={user?.easyModeEnabled || false} 
            onChange={(e) => toggleEasyMode(e.target.checked)} 
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* 🚨 Emergency SOS Power Button Setup Guide */}
      <div className="mb-6 rounded-2xl overflow-hidden border-2 border-[#FF4757]/40 shadow-lg shadow-red-900/20" style={{ background: 'linear-gradient(180deg, rgba(255,71,87,0.08) 0%, rgba(6,11,20,0) 100%)' }}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FF4757]/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-[#FF4757]" />
            </div>
            <div>
              <h4 className="font-bold text-[1rem] text-[#FF4757]">Power Button SOS Setup</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Press power button 3× to auto-trigger LifeLink SOS</p>
            </div>
          </div>
          
          <div className="bg-[#0B1121] border border-slate-800 rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-300 font-semibold mb-3">📱 Follow these steps on your phone:</p>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FF4757] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="text-sm text-white font-medium">Open Phone Settings</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Go to <strong className="text-slate-200">Settings → Safety & Emergency</strong> (Android) or <strong className="text-slate-200">Settings → Emergency SOS</strong> (iPhone)</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FF4757] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-sm text-white font-medium">Enable Emergency SOS</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Turn on <strong className="text-slate-200">"Press power button 3/5 times for Emergency SOS"</strong></p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FF4757] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-sm text-white font-medium">Set LifeLink as SOS Action</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Under <strong className="text-slate-200">"SOS actions"</strong>, add a website/URL and paste:</p>
                  <div 
                    className="mt-2 bg-black/60 border border-slate-700 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:border-[#FF4757]/50 transition-colors group"
                    onClick={() => {
                      navigator.clipboard.writeText('https://life-link-ai-psi.vercel.app/sos-trigger');
                      alert('✅ SOS URL copied to clipboard!');
                    }}
                  >
                    <code className="text-[10px] text-[#FF4757] font-mono break-all">https://life-link-ai-psi.vercel.app/sos-trigger</code>
                    <span className="text-[9px] text-slate-500 group-hover:text-[#FF4757] flex-shrink-0 font-bold transition-colors">COPY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="flex-1 py-2.5 bg-[#FF4757]/10 border border-[#FF4757]/30 text-[#FF4757] rounded-xl text-xs font-bold hover:bg-[#FF4757]/20 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText('https://life-link-ai-psi.vercel.app/sos-trigger');
                alert('✅ SOS URL copied! Now paste it in your phone\'s Emergency SOS settings.');
              }}
            >
              📋 Copy SOS URL
            </button>
            <button 
              className="flex-1 py-2.5 bg-[#131B2F] border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:bg-[#1A2542] transition-colors"
              onClick={() => window.open('https://life-link-ai-psi.vercel.app/sos-trigger', '_blank')}
            >
              🔗 Test SOS Link
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-secondary text-sm font-semibold mb-2 uppercase tracking-wider">Personal Information</h3>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
          <input 
            type="text" 
            name="fullName"
            value={formData.fullName} 
            onChange={handleNameChange}
            onBlur={() => setFormData({ ...formData, fullName: formData.fullName.trim() })}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-500"
            placeholder="e.g. Priya Sharma"
          />
        </div>

        <div className="flex flex-col gap-1.5 relative mt-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Date of Birth</label>
          <input 
            type="date" 
            name="dateOfBirth"
            value={formData.dateOfBirth} 
            onChange={handleChange}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-1.5 relative mt-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Blood Pressure (SYS/DIA)</label>
          <input 
            type="text" 
            inputMode="numeric"
            name="bloodPressure"
            value={formData.bloodPressure} 
            onChange={handleBPChange}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-500"
            placeholder="120/80"
          />
          {formData.bloodPressure && !formData.bloodPressure.includes('/') && formData.bloodPressure.length > 0 && (
            <p className="text-red-500 text-xs font-bold absolute -bottom-5 left-1 animate-fade-in">Must be in SYS/DIA format.</p>
          )}
        </div>

        <h3 className="text-secondary text-sm font-semibold mt-6 mb-2 uppercase tracking-wider">Primary Emergency Contact</h3>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Contact Name</label>
          <input 
            type="text" 
            name="ecName"
            value={formData.ecName} 
            onChange={handleNameChange}
            onBlur={() => setFormData({ ...formData, ecName: formData.ecName.trim() })}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-500"
            placeholder="e.g. Lavanya"
          />
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Relationship</label>
          <input 
            type="text" 
            name="ecRelationship"
            value={formData.ecRelationship} 
            onChange={handleChange}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-500"
            placeholder="e.g. Daughter"
          />
        </div>

        <div className="flex flex-col gap-1.5 mt-2 relative">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Contact Phone</label>
          <div className="flex items-center w-full bg-slate-800 text-white border border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all overflow-hidden">
            <span className="pl-3.5 pr-2 py-3.5 text-slate-400 font-semibold border-r border-slate-700 bg-slate-800/80 text-sm">+91</span>
            <input 
              type="tel" 
              inputMode="numeric"
              name="ecPhone"
              value={formData.ecPhone} 
              onChange={handlePhoneChange}
              className="w-full bg-transparent text-white p-3.5 outline-none placeholder-slate-500"
              placeholder="9900112233"
            />
          </div>
          {formData.ecPhone.length > 0 && formData.ecPhone.length < 10 && (
            <p className="text-red-500 text-xs font-bold absolute -bottom-5 left-1 animate-fade-in">Must be exactly 10 digits.</p>
          )}
        </div>

        <h3 className="text-secondary text-sm font-semibold mb-4 mt-8 uppercase tracking-wider">Accessibility & Display</h3>
        
        <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl mt-4">
          <div>
            <div className="flex items-center gap-2">
              <Droplets size={16} color="#FF4757" />
              <h4 className="font-semibold text-white">Register as Blood Donor</h4>
            </div>
            <p className="text-xs text-secondary mt-1">Opt-in to receive emergency blood requests nearby</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isDonor} 
              onChange={(e) => handleToggleDonor(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-[var(--bg-elevated)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4757]"></div>
          </label>
        </div>

        <h3 className="text-secondary text-sm font-semibold mb-4 mt-8 uppercase tracking-wider">Security</h3>
        
        <div className="flex flex-col gap-2 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ScanFace size={18} color="var(--primary)" />
            <h4 className="font-semibold text-white">Biometric Login</h4>
          </div>
          <p className="text-xs text-secondary mb-4">Set up Face ID or Fingerprint for instant, passwordless access to your account.</p>
          
          <button 
            className="btn btn-ghost w-full border border-[var(--primary)] text-[var(--primary)] text-sm py-2"
            onClick={handleRegisterPasskey}
            disabled={isRegisteringPasskey}
          >
            {isRegisteringPasskey ? 'Registering...' : 'Register Face ID / Fingerprint'}
          </button>
          
          {passkeyStatus && (
            <p className={`text-xs mt-2 ${passkeyStatus.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {passkeyStatus}
            </p>
          )}
        </div>

        <button 
          className={`btn w-full mt-8 flex items-center justify-center gap-2 ${success ? 'bg-green-600 hover:bg-green-500 text-white border-green-500' : 'btn-primary'} transition-colors`} 
          onClick={handleSave}
          disabled={loading || success}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : success ? (
            <>
              <span className="text-xl">✅</span>
              Profile Updated Successfully!
            </>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
        </button>

        {/* Logout Section */}
        <div className="mt-10 mb-8 border-t border-[var(--border)] pt-8">
          {showLogoutConfirm ? (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col items-center animate-fade-in">
              <AlertTriangle className="text-red-500 mb-2" size={24} />
              <p className="text-red-500 font-bold mb-4 text-center">Are you sure you want to log out?</p>
              <div className="flex gap-3 w-full">
                <button 
                  className="btn btn-ghost flex-1 text-slate-400"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn bg-red-600 hover:bg-red-700 text-white flex-1 font-bold"
                  onClick={handleLogout}
                >
                  Confirm Log Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="btn border border-red-500/30 text-red-500 w-full flex items-center justify-center gap-2 hover:bg-red-500/10"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={20} />
              Log Out
            </button>
          )}
        </div>
      </div>

      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-label {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .input-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-tertiary);
        }
        .form-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 14px 12px 42px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
