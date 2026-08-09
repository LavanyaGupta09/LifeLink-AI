import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, ArrowRight, ArrowLeft, ScanFace, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuthStore();
  const [step, setStep] = useState<'email' | 'otp' | 'easyModePrompt'>('email');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendOTP = async () => {
    if (!email.includes('@')) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/auth/send-otp?email=${encodeURIComponent(email)}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
      setStep('otp');
      if (data.otp) {
          setOtp(data.otp);
          setTimeout(() => handleVerifyOTP(data.otp), 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (codeToVerify?: string) => {
    const finalOtp = typeof codeToVerify === 'string' ? codeToVerify : otp;
    if (finalOtp.length < 6) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: finalOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid or expired OTP');
      
      demoLogin(); // Authenticates and sets user in store
      if (parseInt(age) >= 60) {
        setStep('easyModePrompt');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      demoLogin();
      navigate('/dashboard');
    }, 1500);
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
        <div className="auth-header">
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
            
            <div className="otp-container mt-6 relative flex flex-col items-center">
              <input 
                type="text" 
                inputMode="numeric"
                className="otp-input" 
                maxLength={6}
                placeholder="000000"
                value={otp}
                onPaste={(e) => {
                  e.preventDefault();
                  const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                  setOtp(paste);
                  if (paste.length === 6) {
                    setTimeout(() => handleVerifyOTP(paste), 0);
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                  if (val.length === 6) {
                    setTimeout(() => handleVerifyOTP(val), 0);
                  }
                }}
                style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.5rem', paddingLeft: '0.8rem' }}
              />
              {otp.length > 0 && otp.length < 6 && (
                <p className="text-red-500 text-xs font-bold mt-2 animate-fade-in">OTP must be 6 digits.</p>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center w-full">
                 <p className="text-red-500 text-xs font-bold text-center">{errorMessage}</p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-block btn-lg mt-6 flex items-center justify-center gap-2"
              onClick={() => handleVerifyOTP()}
              disabled={otp.length < 6 || isLoading}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
            </button>

            <button className="btn-link mt-4" onClick={() => setStep('email')}>
              Change email address
            </button>
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
          min-height: 100vh;
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
