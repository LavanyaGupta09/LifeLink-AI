import React, { useState } from 'react';
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

  const handleSave = () => {
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

    navigate(-1); // Go back to previous screen
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header sticky pt-[env(safe-area-inset-top)]">
        <button className="icon-btn-raw" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="header-title pt-[env(safe-area-inset-top)]">Edit Profile</h2>
        <div style={{ width: 24 }} />
      </div>

      <div className="p-5">
        <h3 className="text-secondary text-sm font-semibold mb-4 uppercase tracking-wider">Personal Information</h3>
        
        <div className="input-group">
          <label className="input-label">Full Name</label>
          <div className="input-field-wrap">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              name="fullName"
              className="form-input" 
              value={formData.fullName} 
              onChange={handleNameChange}
              onBlur={() => setFormData({ ...formData, fullName: formData.fullName.trim() })}
              placeholder="e.g. Priya Sharma"
            />
          </div>
        </div>

        <div className="input-group mt-4 relative">
          <label className="input-label">Personal Phone</label>
          <div className="input-field-wrap mb-4">
            <Phone size={18} className="input-icon" />
            <input 
              type="tel" 
              inputMode="numeric"
              name="phone"
              className="form-input" 
              value={formData.phone} 
              onChange={handlePhoneChange}
              placeholder="9876543210"
            />
            {formData.phone.length > 0 && formData.phone.length < 10 && (
              <p className="text-red-500 text-xs font-bold absolute -bottom-5 left-1 animate-fade-in">Must be exactly 10 digits.</p>
            )}
          </div>
        </div>

        <div className="input-group mt-4 relative">
          <label className="input-label">Blood Pressure (SYS/DIA)</label>
          <div className="input-field-wrap mb-4">
            <HeartPulse size={18} className="input-icon" />
            <input 
              type="text" 
              inputMode="numeric"
              name="bloodPressure"
              className="form-input" 
              value={formData.bloodPressure} 
              onChange={handleBPChange}
              placeholder="120/80"
            />
            {formData.bloodPressure && !formData.bloodPressure.includes('/') && formData.bloodPressure.length > 0 && (
              <p className="text-red-500 text-xs font-bold absolute -bottom-5 left-1 animate-fade-in">Must be in SYS/DIA format.</p>
            )}
          </div>
        </div>

        <div className="input-group mt-4">
          <label className="input-label">Date of Birth</label>
          <div className="input-field-wrap">
            <Calendar size={18} className="input-icon" />
            <input 
              type="date" 
              name="dateOfBirth"
              className="form-input" 
              value={formData.dateOfBirth} 
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="text-secondary text-sm font-semibold mb-4 mt-8 uppercase tracking-wider">Primary Emergency Contact</h3>

        <div className="input-group">
          <label className="input-label">Contact Name</label>
          <div className="input-field-wrap">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              name="ecName"
              className="form-input" 
              value={formData.ecName} 
              onChange={handleNameChange}
              onBlur={() => setFormData({ ...formData, ecName: formData.ecName.trim() })}
              placeholder="e.g. Lavanya"
            />
          </div>
        </div>

        <div className="input-group mt-4">
          <label className="input-label">Relationship</label>
          <div className="input-field-wrap">
            <AlertTriangle size={18} className="input-icon" />
            <input 
              type="text" 
              name="ecRelationship"
              className="form-input" 
              value={formData.ecRelationship} 
              onChange={handleChange}
              placeholder="e.g. Daughter"
            />
          </div>
        </div>

        <div className="input-group mt-4 relative">
          <label className="input-label">Contact Phone</label>
          <div className="input-field-wrap mb-4">
            <Phone size={18} className="input-icon" />
            <input 
              type="tel" 
              inputMode="numeric"
              name="ecPhone"
              className="form-input" 
              value={formData.ecPhone} 
              onChange={handlePhoneChange}
              placeholder="9900112233"
            />
            {formData.ecPhone.length > 0 && formData.ecPhone.length < 10 && (
              <p className="text-red-500 text-xs font-bold absolute -bottom-5 left-1 animate-fade-in">Must be exactly 10 digits.</p>
            )}
          </div>
        </div>

        <h3 className="text-secondary text-sm font-semibold mb-4 mt-8 uppercase tracking-wider">Accessibility & Display</h3>
        
        <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <div>
            <h4 className="font-semibold text-white">Easy Mode</h4>
            <p className="text-xs text-secondary mt-1">Oversized text & buttons for better readability</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={user?.easyModeEnabled || false} 
              onChange={(e) => toggleEasyMode(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-[var(--bg-elevated)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
          </label>
        </div>

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

        <button className="btn btn-primary w-full mt-8 flex items-center justify-center gap-2" onClick={handleSave}>
          <Save size={20} />
          Save Changes
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
