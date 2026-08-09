import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mic, Bell, Heart, ChevronRight, Shield, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const steps = [
  {
    id: 'intro',
    icon: <Shield size={48} color="#00C9A7" />,
    title: 'Your AI Health Guardian',
    description: 'LifeLink AI monitors your health in real-time and connects you to emergency care within seconds — anywhere, anytime.',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(0,201,167,0.15) 0%, transparent 65%)',
  },
  {
    id: 'location',
    icon: <MapPin size={48} color="#3D91FF" />,
    title: 'Live Location Sharing',
    description: 'Share your real-time location with emergency services and family during SOS events. Always know where your loved ones are.',
    permission: 'Allow Location Access',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(61,145,255,0.15) 0%, transparent 65%)',
    permColor: '#3D91FF',
  },
  {
    id: 'mic',
    icon: <Mic size={48} color="#8B5CF6" />,
    title: 'Hands-Free Voice SOS',
    description: 'Activate emergency mode completely hands-free. Just say "LifeLink SOS" and our AI handles the rest.',
    permission: 'Allow Microphone Access',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.15) 0%, transparent 65%)',
    permColor: '#8B5CF6',
  },
  {
    id: 'notif',
    icon: <Bell size={48} color="#FFA502" />,
    title: 'Instant Emergency Alerts',
    description: 'Get life-saving alerts and notify your family in seconds. No setup needed — LifeLink does it automatically.',
    permission: 'Allow Notifications',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(255,165,2,0.15) 0%, transparent 65%)',
    permColor: '#FFA502',
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [entering, setEntering] = useState(false);
  const [permsGranted, setPermsGranted] = useState<Record<string, boolean>>({});

  const goNext = () => {
    if (current < steps.length - 1) {
      setEntering(true);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setEntering(false);
      }, 200);
    } else {
      navigate('/login');
    }
  };

  const handlePermission = async () => {
    const step = steps[current];
    try {
      if (step.id === 'location') {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermsGranted(prev => ({ ...prev, [step.id]: true }));
            goNext();
          },
          (err) => {
            alert('Location permission is required for SOS routing.');
          }
        );
      } else if (step.id === 'mic') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setPermsGranted(prev => ({ ...prev, [step.id]: true }));
        goNext();
      } else if (step.id === 'notif') {
        if ('Notification' in window) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            setPermsGranted(prev => ({ ...prev, [step.id]: true }));
          }
        }
        goNext();
      }
    } catch (e) {
      alert('Permission denied. Please allow it to continue.');
    }
  };

  const skip = () => {
    navigate('/login');
  };

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const isPermGranted = permsGranted[step.id];

  return (
    <div className="onboarding-screen">
      <div className="onboard-bg" style={{ background: step.bg }} />

      {/* Skip */}
      {!isLast && (
        <button className="skip-btn" onClick={skip}>
          Skip
        </button>
      )}

      {/* Illustration area */}
      <div className={`onboard-hero ${entering ? 'exiting' : 'entering'}`}>
        <div className="onboard-icon-wrap">{step.icon}</div>

        {/* Decorative floating items */}
        <div className="decor-pill top-left animate-float">
          <Heart size={12} fill="#FF4757" color="#FF4757" />
          <span>98 BPM</span>
        </div>
        <div className="decor-pill bottom-right animate-float delay-300">
          <div className="status-dot online" />
          <span>Ambulance ETA 4 min</span>
        </div>
      </div>

      {/* Content */}
      <div className="onboard-content">
        <div className={`onboard-text ${entering ? 'exiting' : 'entering'}`}>
          <h2 className="onboard-title font-display">{step.title}</h2>
          <p className="onboard-desc">{step.description}</p>
        </div>

        {/* Dots */}
        <div className="onboard-dots">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        {/* Permission or Next */}
        {step.permission && !isPermGranted ? (
          <button
            className="btn btn-ghost btn-block mb-3 flex items-center justify-center gap-2"
            style={{ borderColor: step.permColor, color: step.permColor }}
            onClick={handlePermission}
          >
            {step.permission}
          </button>
        ) : step.permission && isPermGranted ? (
          <button
            className="btn btn-ghost btn-block mb-3 flex items-center justify-center gap-2"
            style={{ borderColor: '#2ED573', color: '#2ED573' }}
            disabled
          >
            <Check size={18} /> Permission Granted
          </button>
        ) : null}

        <button 
          className="btn btn-primary btn-block btn-lg" 
          onClick={goNext}
          disabled={step.permission && !isPermGranted} // Block progress until permission is granted
        >
          {isLast ? 'Get Started' : 'Continue'}
          <ChevronRight size={18} />
        </button>

        {!isLast && (
          <button className="btn btn-ghost btn-block mt-2" onClick={skip}>
            Sign in to existing account
          </button>
        )}
      </div>

      <style>{`
        .onboarding-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-base);
          position: relative;
          overflow: hidden;
        }
        .onboard-bg {
          position: absolute;
          inset: 0;
          transition: background 0.5s ease;
        }
        .skip-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: var(--radius-full);
          z-index: 10;
          font-family: var(--font-body);
        }
        .skip-btn:hover { color: var(--text-primary); background: var(--bg-elevated); }
        .onboard-hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: opacity 0.2s, transform 0.2s;
        }
        .onboard-hero.exiting { opacity: 0; transform: translateX(-30px); }
        .onboard-hero.entering { opacity: 1; transform: translateX(0); animation: slide-in 0.35s var(--ease-out); }
        .onboard-icon-wrap {
          width: 120px;
          height: 120px;
          border-radius: 36px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
        }
        .decor-pill {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .top-left { top: 30%; left: 5%; }
        .bottom-right { bottom: 20%; right: 5%; }
        .onboard-content {
          background: var(--bg-surface);
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
          border-top: 1px solid var(--border);
          padding: 32px 24px 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .onboard-text { transition: opacity 0.2s, transform 0.2s; }
        .onboard-text.exiting { opacity: 0; transform: translateY(10px); }
        .onboard-text.entering { animation: fade-in 0.35s var(--ease-out); }
        .onboard-title { font-size: 1.5rem; margin-bottom: 10px; }
        .onboard-desc { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.65; }
        .onboard-dots {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--border-light);
          border: none;
          cursor: pointer;
          transition: all var(--duration-normal);
          padding: 0;
        }
        .dot.active {
          background: var(--primary);
          width: 24px;
          box-shadow: 0 0 8px var(--primary-glow);
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
