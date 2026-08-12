import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, setOnboarded, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    dob: '',
    bloodGroup: '',
    ecName: '',
    ecPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dob || !formData.bloodGroup || !formData.ecName || !formData.ecPhone) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = user?.id || 'usr_demo';

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: formData.fullName,
          dob: formData.dob,
          blood_group: formData.bloodGroup,
          is_onboarded: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      const { error: ecError } = await supabase
        .from('family_members')
        .insert({
          patient_id: userId,
          name: formData.ecName,
          phone: formData.ecPhone,
          relationship: 'Emergency Contact',
          is_primary: true
        });

      if (ecError) throw ecError;

      updateUser({ fullName: formData.fullName });
      setOnboarded();
      
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('Onboarding Error:', err);
      if (!navigator.onLine || err.message?.includes('fetch')) {
        updateUser({ fullName: formData.fullName });
        setOnboarded();
        navigate('/dashboard', { replace: true });
      } else {
        setError(err.message || 'An error occurred during setup.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
          min-height: 100dvh;
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
