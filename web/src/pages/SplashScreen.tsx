import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isOnboarded } = useAuthStore();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (isAuthenticated && user) {
          if (user.verificationStatus === 'pending_approval') {
            navigate('/b2b/pending-review');
          } else if (user.role === 'patient') navigate('/dashboard');
          else if (user.role === 'doctor') navigate('/b2b/doctor');
          else if (user.role === 'hospital_admin') navigate('/b2b/hospital');
          else if (user.role === 'pharmacy_manager') navigate('/b2b/pharmacy');
          else if (user.role === 'lab_tech') navigate('/b2b/lab');
          else if (user.role === 'driver') navigate('/b2b/driver');
          else navigate('/role-select');
        } else {
          navigate(isOnboarded ? '/role-select' : '/onboarding');
        }
      }, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, user, isOnboarded]);

  return (
    <div className={`splash-screen ${fadeOut ? 'animate-fade-out' : ''}`}>
      <div className="splash-bg" />
      <div className="splash-grid" />

      <div className="splash-content animate-scale-in">
        <div className="splash-logo animate-heartbeat">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="url(#splashGrad)" />
            <path
              d="M28 40C28 40 14 31.5 14 22.5C14 17.8 17.8 14 22.5 14C24.9 14 27.1 15.1 28 17C28.9 15.1 31.1 14 33.5 14C38.2 14 42 17.8 42 22.5C42 31.5 28 40 28 40Z"
              fill="white"
            />
            <path d="M22 27h5l2-5 3 10 2-5h4" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="splashGrad" x1="0" y1="0" x2="56" y2="56">
                <stop stopColor="#00C9A7" />
                <stop offset="1" stopColor="#009E83" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="splash-title font-display">
          Life<span className="text-brand">Link</span> AI
        </h1>
        <p className="splash-tagline">Emergency Healthcare, Within Seconds</p>

        <div className="splash-pulse-rings">
          <div className="pulse-ring r1" />
          <div className="pulse-ring r2" />
          <div className="pulse-ring r3" />
        </div>
      </div>

      <div className="splash-footer animate-fade-in delay-500">
        <p className="text-xs text-tertiary">Powered by AI · HIPAA Compliant · E2E Encrypted</p>
      </div>

      <style>{`
        .splash-screen {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--bg-base);
        }
        .splash-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,201,167,0.12) 0%, transparent 70%);
        }
        .splash-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(0,201,167,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,201,167,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }
        .splash-logo {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,201,167,0.1);
          border-radius: 28px;
          border: 1px solid rgba(0,201,167,0.25);
        }
        .splash-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-top: 8px;
        }
        .splash-tagline {
          color: var(--text-secondary);
          font-size: 0.9375rem;
          text-align: center;
          margin-top: -4px;
        }
        .splash-pulse-rings {
          position: absolute;
          pointer-events: none;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .pulse-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid var(--primary);
          transform: translate(-50%, -50%);
          top: -48px;
          left: -48px;
          opacity: 0;
          animation: sos-ripple 2.4s ease-out infinite;
        }
        .r1 { width: 120px; height: 120px; animation-delay: 0s; }
        .r2 { width: 160px; height: 160px; animation-delay: 0.6s; }
        .r3 { width: 200px; height: 200px; animation-delay: 1.2s; }
        .splash-footer {
          position: absolute;
          bottom: 40px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
