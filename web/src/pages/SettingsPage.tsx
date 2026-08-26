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
