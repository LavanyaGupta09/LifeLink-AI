import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, ArrowRight, ArrowLeft, ScanFace, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuthStore();
  const [step, setStep] = useState<'email' | 'otp' | 'easyModePrompt'>('email');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
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

  const handleSendOTP = async () => {
    if (!email.includes('@')) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp?email=${encodeURIComponent(email)}`, { method: 'POST' });
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP (Server unreachable)');
      setStep('otp');
      setOtp('');
      setResendCountdown(30);
      // The OTP is now sent via email using Resend (handled by backend)
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email.includes('@')) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp?email=${encodeURIComponent(email)}`, { method: 'POST' });
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP (Server unreachable)');
      
      setOtp('');
      setResendCountdown(30);
      setSuccessMessage('New OTP sent. Please use the latest OTP.');
      if (otpInputRef.current) otpInputRef.current.focus();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (codeToVerify?: string) => {
    if (lockoutCountdown > 0) return;
    const finalOtp = typeof codeToVerify === 'string' ? codeToVerify : otp;
    if (finalOtp.length < 6) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: finalOtp })
      });
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.message || data.detail || 'Invalid OTP or server unreachable');
      
      if (data.token) {
        localStorage.setItem('ll_access_token', data.token.access_token);
        if (data.token.refresh_token) {
          localStorage.setItem('ll_refresh_token', data.token.refresh_token);
        }
      }
      
      if (data.user) {
        const realUser = {
          id: data.user.id,
          fullName: data.user.full_name,
          email: data.user.email,
          phone: '',
          role: data.user.role,
          isVerified: true
        };
        useAuthStore.getState().login(realUser as any);
      } else {
        demoLogin(); // Fallback if no user object
      }
      
      if (parseInt(age) >= 60) {
        setStep('easyModePrompt');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("OTP Verification failed:", err);
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
  };

  const handleBiometric = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Biometrics not supported on this device/browser.');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000
        }
      });

      if (credential) {
        demoLogin();
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Biometric login was canceled.');
      } else {
        setErrorMessage(err.message || 'Biometric login failed or is not supported on this device.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container app-shell">
      <button
        id="back-to-roles-btn"
        className="back-to-roles-btn"
        onClick={() => navigate('/role-select')}
        aria-label="Back to role selection"
      >
        <ArrowLeft size={20} />
        <span>Back to Roles</span>
      </button>
      <div className="auth-content">
        <div className="auth-header pt-[env(safe-area-inset-top)]">
          <div className="auth-logo">
            <Shield size={32} color="var(--primary)" />
          </div>
          <h1 className="auth-title">LifeLink AI</h1>
          <p className="auth-subtitle">Secure Emergency Access</p>
        </div>

        {step === 'email' ? (
          <div className="auth-form animate-slide-up">
            <h3 className="form-title">Enter your email address</h3>
            <p className="form-desc">We will send you a secure OTP to verify your identity.</p>
            
            <div className="input-field-wrap mt-6">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email.length > 0 && !email.includes('@') && (
                <p className="text-red-500 text-xs font-bold mt-2 absolute -bottom-5 left-1">Must be a valid email.</p>
              )}
            </div>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center">
                 <p className="text-red-500 text-xs font-bold text-center">{errorMessage}</p>
              </div>
            )}

            <div className="input-field-wrap mt-8">
              <span className="input-icon font-semibold text-xs ml-1">AGE</span>
              <input 
                type="text" 
                inputMode="numeric"
                className="form-input" 
                placeholder="e.g. 65" 
                value={age}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (!val || (parseInt(val) >= 0 && parseInt(val) <= 120)) {
                    setAge(val);
                  }
                }}
                style={{ paddingLeft: '50px' }}
              />
            </div>

            <button 
              className="btn btn-primary btn-block btn-lg mt-8 flex items-center justify-center gap-2"
              onClick={handleSendOTP}
              disabled={!email.includes('@') || isLoading}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            <div className="auth-divider">
              <span>OR QUICK LOGIN</span>
            </div>

            <button 
              className="btn btn-ghost btn-block btn-lg flex items-center justify-center gap-2 bio-btn"
              onClick={handleBiometric}
              disabled={isLoading}
            >
              <ScanFace size={20} />
              Use FaceID / Fingerprint
            </button>
          </div>
        ) : step === 'otp' ? (
          <div className="auth-form animate-slide-up">
            <h3 className="form-title">Verify OTP</h3>
            <p className="form-desc">Enter the 6-digit code sent to {email}</p>
            
            <div className={`otp-container mt-6 relative flex flex-col items-center w-full ${isShaking ? 'animate-shake' : ''}`}>
              <div className="relative w-full">
                <input 
                  ref={otpInputRef}
                  type="text" 
                  inputMode="numeric"
                  className="otp-input w-full" 
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  disabled={isLoading || lockoutCountdown > 0}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    setErrorMessage(''); // Clear error on typing
                    if (val.length === 6 && lockoutCountdown === 0) setTimeout(() => handleVerifyOTP(val), 0);
                  }}
                  style={{
                    letterSpacing: '0.5em',
                    fontSize: '2rem',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: isShaking || errorMessage ? '1px solid rgba(239,68,68,1)' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: isShaking || errorMessage ? '0 0 15px rgba(239,68,68,0.3)' : 'none',
                    borderRadius: '16px',
                    padding: '12px 24px',
                    color: 'white',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    transition: 'all 0.2s',
                    opacity: lockoutCountdown > 0 ? 0.5 : 1
                  }}
                />
                {otp.length > 0 && lockoutCountdown === 0 && (
                  <button 
                    type="button"
                    onClick={() => { setOtp(''); setErrorMessage(''); if (otpInputRef.current) otpInputRef.current.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-800 rounded-md">Clear</span>
                  </button>
                )}
              </div>
            </div>
            
            {lockoutCountdown > 0 && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-center w-full animate-fade-in">
                 <p className="text-red-400 text-sm font-bold text-center">Too many attempts. Locked for {lockoutCountdown}s.</p>
              </div>
            )}

            {otp.length > 0 && otp.length < 6 && lockoutCountdown === 0 && !errorMessage && (
              <div className="mt-4 flex justify-center">
                <p className="text-red-500 text-xs font-bold">OTP must be 6 digits.</p>
              </div>
            )}

            {errorMessage && lockoutCountdown === 0 && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center w-full animate-fade-in">
                 <p className="text-red-500 text-sm font-bold text-center">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center w-full animate-fade-in">
                 <p className="text-green-500 text-xs font-bold text-center">{successMessage}</p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-block btn-lg mt-6 flex items-center justify-center gap-2"
              onClick={() => handleVerifyOTP()}
              disabled={isLoading || otp.length < 6 || lockoutCountdown > 0}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
            </button>

            <div className="flex flex-col items-center gap-3 mt-4">
              <button 
                className="btn-link" 
                onClick={handleResendOTP}
                disabled={isLoading || resendCountdown > 0}
                style={{ opacity: isLoading || resendCountdown > 0 ? 0.5 : 1 }}
              >
                {isLoading ? 'Sending...' : resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
              </button>
              <button className="btn-link" onClick={() => setStep('email')}>
                Change email address
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-form animate-slide-up text-center">
            <h3 className="form-title text-[1.5rem]">Enable Easy Mode?</h3>
            <p className="form-desc mt-2 text-sm">Would you like to enable 'Easy Mode' for larger text and simpler navigation?</p>
            
            <div className="flex flex-col gap-3 mt-8">
              <button 
                className="btn btn-primary btn-lg w-full"
                onClick={() => {
                  useAuthStore.getState().toggleEasyMode(true);
                  navigate('/dashboard');
                }}
              >
                Yes, Enable Easy Mode
              </button>
              <button 
                className="btn btn-ghost btn-lg w-full"
                onClick={() => {
                  navigate('/dashboard');
                }}
              >
                No, Standard Mode
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .auth-container {
          background: linear-gradient(180deg, var(--bg-base) 0%, #080C14 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          padding: 20px;
        }
        .auth-content {
          width: 100%;
          max-width: 400px;
        }
        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        .auth-logo {
          width: 64px;
          height: 64px;
          background: rgba(0,201,167,0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .auth-title {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .auth-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .auth-form {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .form-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .form-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .input-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-tertiary);
        }
        .form-input, .otp-input {
          width: 100%;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 16px 16px 46px;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus, .otp-input:focus { border-color: var(--primary); }
        .otp-input { padding: 16px; font-weight: 700; }
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-tertiary);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }
        .auth-divider span { padding: 0 16px; }
        .bio-btn {
          border: 1px dashed var(--border-light);
          background: rgba(255,255,255,0.02);
        }
        .bio-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--primary);
          color: var(--primary);
        }
        .btn-link {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8125rem;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
        }
        .back-to-roles-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 44px;
          min-height: 44px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 100;
        }
        .back-to-roles-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(-2px);
        }
        .back-to-roles-btn:active {
          transform: translateX(-1px) scale(0.97);
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
