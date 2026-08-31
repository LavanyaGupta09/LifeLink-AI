import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, UserCheck, KeyRound, Building2, BadgeCheck, ArrowLeft, ScanFace } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'https://lifelink-ai-rwru.onrender.com';

/* ─── Inline Style Constants ─── */
const colors = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  borderFocus: '#3b82f6',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  danger: '#ef4444',
  icon: '#64748b',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: colors.surface,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: '14px 16px 14px 44px',
  fontSize: '0.95rem',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box' as const,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: colors.textMuted,
  marginBottom: '8px',
};

const iconWrapStyle: React.CSSProperties = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: colors.icon,
  pointerEvents: 'none',
};

const B2BAuth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { providerLogin } = useAuthStore();
  const [role, setRole] = useState('hospital_admin');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatePending, setSimulatePending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [hasSentOTP, setHasSentOTP] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutCountdown > 0) {
      timer = setTimeout(() => setLockoutCountdown(c => c - 1), 1000);
    } else if (lockoutCountdown === 0 && failedAttempts >= 3) {
      setFailedAttempts(0);
    }
    return () => clearTimeout(timer);
  }, [lockoutCountdown, failedAttempts]);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const requiresOTP = ['pharmacy_manager', 'driver'].includes(role);
  const requiresPassword = ['hospital_admin', 'lab_tech', 'doctor', 'equipment'].includes(role);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedIdentity = identity.trim();
    if (!trimmedIdentity.includes('@') && trimmedIdentity.length < 5) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // If we've already sent it once, call resend endpoint
    const endpoint = `${API_BASE}/api/auth/${hasSentOTP ? 'resend-otp' : 'send-otp'}?email=${encodeURIComponent(trimmedIdentity)}`;

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || 'Failed to send OTP');
      if (data.otp || data.success) {
        const isTargetEmail = trimmedIdentity.toLowerCase() === 'lavanyagupta136@gmail.com';
        setOtp(isTargetEmail ? '' : (data.otp || '123456'));
        setResendCountdown(30);
        setHasSentOTP(true);
        if (hasSentOTP) setSuccessMessage('New OTP sent. Please use the latest OTP.');
        if (otpInputRef.current) otpInputRef.current.focus();
        if (data.otp && !isTargetEmail) setTimeout(() => handleLogin(undefined, data.otp), 500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const executeLogin = () => {
    const status = simulatePending ? 'pending_approval' : 'verified';
    providerLogin(role, status);
    if (status === 'pending_approval') { navigate('/b2b/pending-review'); return; }
    if (role === 'hospital_admin') navigate('/partner/dashboard');
    else if (role === 'doctor') navigate('/b2b/doctor');
    else if (role === 'pharmacy_manager') navigate('/b2b/pharmacy');
    else if (role === 'lab_tech') navigate('/b2b/lab');
    else if (role === 'driver') navigate('/b2b/driver');
    else if (role === 'equipment') navigate('/b2b/equipment');
    else if (role === 'first_responder') navigate('/command-center');
  };

  const handleLogin = async (e?: React.FormEvent, codeToVerify?: string) => {
    if (e) e.preventDefault();
    if (lockoutCountdown > 0) return;
    const finalOtp = typeof codeToVerify === 'string' ? codeToVerify : otp;
    if (requiresOTP) {
      if (finalOtp.length < 6) return;
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identity.trim(), otp: finalOtp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.detail || 'Invalid or expired OTP');
        executeLogin();
      } catch (err: any) {
        setErrorMessage(err.message || 'Incorrect verification code. Please check and try again.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 3) {
          setLockoutCountdown(30);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      executeLogin();
    }
  };

  const handleBiometric = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error) {
        throw error;
      }
      // If passkey auth succeeds, log them in via our store
      executeLogin();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Biometric login failed or is not supported on this device.');
    } finally {
      setIsLoading(false);
    }
  };

  const fieldConfig: Record<string, { identityLabel: string; identityPlaceholder: string; licenseLabel: string; licensePlaceholder: string }> = {
    hospital_admin: { identityLabel: 'Enterprise Email', identityPlaceholder: 'admin@apollo.com', licenseLabel: 'Hospital Registration ID', licensePlaceholder: 'HOSP-1234-REG' },
    lab_tech: { identityLabel: 'Lab Manager Email', identityPlaceholder: 'tech@lalpathlabs.com', licenseLabel: 'NABL Accreditation ID', licensePlaceholder: 'NABL-5678' },
    pharmacy_manager: { identityLabel: 'Pharmacy Email', identityPlaceholder: 'pharmacy@example.com', licenseLabel: 'Drug License (DL) Number', licensePlaceholder: 'DL-RJ-1234' },
    doctor: { identityLabel: 'Individual Email', identityPlaceholder: 'dr.sharma@email.com', licenseLabel: 'Medical Council License No.', licensePlaceholder: 'MCI-009911' },
    driver: { identityLabel: 'Driver Email', identityPlaceholder: 'driver@example.com', licenseLabel: 'Commercial Vehicle License ID', licensePlaceholder: 'DL-01-C-5678' },
    equipment: { identityLabel: 'Provider Email', identityPlaceholder: 'provider@medequip.com', licenseLabel: 'Business Registration No.', licensePlaceholder: 'REG-2023-ME' },
  };
  const fields = fieldConfig[role] || fieldConfig.hospital_admin;

  return (
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      background: colors.bg,
      color: colors.text,
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>
      {/* ── Back Button ── */}
      <div style={{ marginBottom: '32px', paddingTop: '16px' }}>
        <button
          id="b2b-back-to-roles-btn"
          onClick={() => navigate('/role-select')}
          aria-label="Back to role selection"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: colors.textMuted,
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Roles</span>
        </button>
      </div>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'rgba(56,189,248,0.15)',
          border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <ShieldCheck size={32} color="#38bdf8" />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Provider Portal
        </h2>
        <p style={{ color: colors.textDim, marginTop: '8px', textAlign: 'center', fontSize: '0.875rem' }}>
          Secure Role-Based Authentication
        </p>
      </div>

      {/* ── Error Message ── */}
      {lockoutCountdown > 0 && (
        <div style={{
          marginBottom: '16px', padding: '12px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          textAlign: 'center',
          animation: 'fade-in 0.3s ease-in-out'
        }}>
          <p style={{ color: colors.danger, fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>Too many attempts. Locked for {lockoutCountdown}s.</p>
        </div>
      )}

      {errorMessage && lockoutCountdown === 0 && (
        <div style={{
          marginBottom: '16px', padding: '12px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{ color: colors.danger, fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div style={{
          marginBottom: '16px', padding: '12px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{successMessage}</p>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={(e) => handleLogin(e)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Select Designation */}
        <div>
          <label style={labelStyle}>Select Designation</label>
          <div style={{ position: 'relative' }}>
            <div style={iconWrapStyle}><UserCheck size={18} /></div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                ...inputStyle,
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '40px',
                cursor: 'pointer',
              }}
            >
              <option value="hospital_admin">ER Command Admin (Hospital)</option>
              <option value="doctor">Independent Doctor (Telehealth)</option>
              <option value="pharmacy_manager">Fulfillment Manager (Pharmacy)</option>
              <option value="lab_tech">Lab Technician (Diagnostics)</option>
              <option value="driver">Ambulance Driver (Dispatch)</option>
            </select>
          </div>
        </div>

        {/* Identity (Email) */}
        <div>
          <label style={labelStyle}>{fields.identityLabel}</label>
          <div style={{ position: 'relative' }}>
            <div style={iconWrapStyle}><Building2 size={18} /></div>
            <input
              type="email"
              placeholder={fields.identityPlaceholder}
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.25)`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          {identity.length > 0 && !identity.includes('@') && (
            <p style={{ color: colors.danger, fontSize: '0.75rem', fontWeight: 700, marginTop: '6px' }}>Must be a valid email.</p>
          )}
        </div>

        {/* License ID */}
        <div>
          <label style={labelStyle}>{fields.licenseLabel}</label>
          <div style={{ position: 'relative' }}>
            <div style={iconWrapStyle}><BadgeCheck size={18} /></div>
            <input
              type="text"
              value={licenseId}
              onChange={(e) => setLicenseId(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              placeholder={fields.licensePlaceholder}
              required
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", textTransform: 'uppercase' as const }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.25)`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Password (for admin/doctor/lab) */}
        {requiresPassword && (
          <div>
            <label style={labelStyle}>Secure Password</label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrapStyle}><KeyRound size={18} /></div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = colors.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.25)`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        )}

        {/* OTP (for pharmacy/driver) */}
        {requiresOTP && (
          <div>
            <label style={labelStyle}>One-Time Password (OTP)</label>
            <div style={{ display: 'flex', gap: '10px' }} className={isShaking ? 'animate-shake' : ''}>
              <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otp}
                  disabled={isLoading || lockoutCountdown > 0}
                  onPaste={(e) => {
                    e.preventDefault();
                    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    setOtp(paste);
                    setErrorMessage('');
                    if (paste.length === 6 && lockoutCountdown === 0) setTimeout(() => handleLogin(undefined, paste), 0);
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    setErrorMessage('');
                    if (val.length === 6 && lockoutCountdown === 0) setTimeout(() => handleLogin(undefined, val), 0);
                  }}
                  required
                  style={{
                    ...inputStyle,
                    paddingLeft: '16px',
                    paddingRight: '60px',
                    flex: 1,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                    fontSize: '1.1rem',
                    border: isShaking || errorMessage ? `1px solid ${colors.danger}` : `1px solid ${colors.border}`,
                    boxShadow: isShaking || errorMessage ? '0 0 15px rgba(239,68,68,0.3)' : 'none',
                    opacity: lockoutCountdown > 0 ? 0.5 : 1
                  }}
                  onFocus={(e) => { if (!isShaking && !errorMessage) { e.currentTarget.style.borderColor = colors.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.25)`; } }}
                  onBlur={(e) => { if (!isShaking && !errorMessage) { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; } }}
                />
                {otp.length > 0 && lockoutCountdown === 0 && (
                  <button 
                    type="button"
                    onClick={() => { setOtp(''); setErrorMessage(''); if (otpInputRef.current) otpInputRef.current.focus(); }}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: colors.textMuted,
                      cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600,
                      borderRadius: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = colors.text}
                    onMouseOut={(e) => e.currentTarget.style.color = colors.textMuted}
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={!identity.includes('@') || isLoading || resendCountdown > 0}
                style={{
                  background: colors.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: !identity.includes('@') || isLoading || resendCountdown > 0 ? 'not-allowed' : 'pointer',
                  opacity: !identity.includes('@') || isLoading || resendCountdown > 0 ? 0.5 : 1,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Send OTP'}
              </button>
            </div>
            {otp.length > 0 && otp.length < 6 && (
              <p style={{ color: colors.danger, fontSize: '0.75rem', fontWeight: 700, marginTop: '6px' }}>OTP must be exactly 6 digits.</p>
            )}
          </div>
        )}

        {/* Demo Config Toggle */}
        <div style={{
          paddingTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: colors.textDim,
          borderTop: `1px solid ${colors.border}`,
          marginTop: '4px',
        }}>
          <span>[Demo Config]</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={simulatePending}
              onChange={(e) => setSimulatePending(e.target.checked)}
              style={{ accentColor: colors.accent }}
            />
            Simulate Pending Approval
          </label>
        </div>

        {/* Biometric Button */}
        <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: colors.border }} />
          <span style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: colors.border }} />
        </div>

        <button
          type="button"
          onClick={handleBiometric}
          disabled={isLoading}
          style={{
            width: '100%',
            background: 'transparent',
            color: colors.accent,
            border: `1px solid ${colors.accent}`,
            borderRadius: '16px',
            padding: '16px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <ScanFace size={20} />
          Sign In with Face ID / Fingerprint
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (requiresOTP && otp.length < 6)}
          style={{
            width: '100%',
            background: isLoading || (requiresOTP && otp.length < 6) ? colors.surface : colors.accent,
            color: isLoading || (requiresOTP && otp.length < 6) ? colors.textDim : '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            fontSize: '1rem',
            fontWeight: 800,
            cursor: isLoading || (requiresOTP && otp.length < 6) ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            marginTop: '8px',
            letterSpacing: '0.02em',
            boxShadow: isLoading || (requiresOTP && otp.length < 6) ? 'none' : '0 4px 24px rgba(59,130,246,0.35)',
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify Credentials & Login'}
        </button>
      </form>
    </div>
  );
};

export default B2BAuth;
