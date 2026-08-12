import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Mail, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/* ─── Admin Theme Colors ─── */
const c = {
  bg: '#0a0f1a',
  surface: '#111827',
  card: '#1a2332',
  border: '#1f2937',
  borderFocus: '#10b981',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  accent: '#10b981',
  accentHover: '#059669',
  accentGlow: 'rgba(16, 185, 129, 0.25)',
  danger: '#f43f5e',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: c.surface,
  color: c.text,
  border: `1px solid ${c.border}`,
  borderRadius: '12px',
  padding: '14px 16px 14px 46px',
  fontSize: '0.95rem',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box' as const,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: c.textDim,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '8px',
};

const iconWrap: React.CSSProperties = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: c.textDim,
  pointerEvents: 'none',
};

const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = c.borderFocus;
  e.currentTarget.style.boxShadow = `0 0 0 3px ${c.accentGlow}`;
};
const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = c.border;
  e.currentTarget.style.boxShadow = 'none';
};

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { superAdminLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && pin.length === 6) {
      superAdminLogin();
      navigate('/admin/compliance');
    } else {
      setError('Invalid credentials or PIN format');
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '448px',
      margin: '0 auto',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      background: c.bg,
      color: c.text,
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* ── Back Button ── */}
      <button
        onClick={() => navigate('/role-select')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: c.textDim,
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'color 0.2s',
          padding: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = c.text; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = c.textDim; }}
      >
        <ArrowLeft size={16} />
        Back to Role Selection
      </button>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
        <div style={{
          width: '68px', height: '68px',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '18px',
          boxShadow: `0 0 30px ${c.accentGlow}`,
        }}>
          <ShieldCheck size={34} color={c.accent} />
        </div>
        <h1 style={{
          fontSize: '1.625rem',
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          margin: 0,
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '-0.02em',
        }}>
          System Administrator Access
        </h1>
        <p style={{
          color: c.textDim,
          marginTop: '10px',
          textAlign: 'center',
          fontSize: '0.85rem',
          lineHeight: '1.5',
        }}>
          Secure authentication gateway for platform administration.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: 'rgba(244,63,94,0.08)',
          border: '1px solid rgba(244,63,94,0.2)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{ color: c.danger, fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Admin Email */}
        <div>
          <label style={labelStyle}>Admin Email Address</label>
          <div style={{ position: 'relative' }}>
            <div style={iconWrap}><Mail size={18} /></div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lifelink.ai"
              required
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>
        </div>

        {/* Security Password */}
        <div>
          <label style={labelStyle}>Security Password</label>
          <div style={{ position: 'relative' }}>
            <div style={iconWrap}><Lock size={18} /></div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>
        </div>

        {/* 6-Digit Admin PIN */}
        <div>
          <label style={labelStyle}>6-Digit Admin PIN / MFA Key</label>
          <div style={{ position: 'relative' }}>
            <div style={iconWrap}><KeyRound size={18} /></div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="— — — — — —"
              maxLength={6}
              required
              style={{
                ...inputStyle,
                paddingLeft: '46px',
                textAlign: 'center',
                fontSize: '1.25rem',
                letterSpacing: '0.5em',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              }}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>
        </div>

        {/* Authenticate Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${c.accent}, ${c.accentHover})`,
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.25s',
            marginTop: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            boxShadow: `0 4px 24px ${c.accentGlow}, 0 0 40px rgba(16,185,129,0.1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 6px 32px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.15)`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 24px ${c.accentGlow}, 0 0 40px rgba(16,185,129,0.1)`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ShieldCheck size={20} />
          Authenticate Admin Session
        </button>
      </form>

      {/* ── Footer ── */}
      <p style={{
        textAlign: 'center',
        color: c.textDim,
        fontSize: '0.7rem',
        marginTop: '32px',
        opacity: 0.6,
      }}>
        Access restricted to authorized personnel. All sessions are logged.
      </p>
    </div>
  );
};

export default AdminLogin;
