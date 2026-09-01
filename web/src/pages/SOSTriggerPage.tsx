import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useSOSStore } from '../store/sosStore';
import { useAuthStore } from '../store/authStore';

/**
 * Auto-trigger SOS page.
 * 
 * When this URL is opened (e.g., from Android's built-in Emergency SOS
 * which opens a custom URL on triple power-button press), it immediately
 * acquires the user's location and triggers SOS — no taps required.
 * 
 * URL: /sos-trigger
 * 
 * This is the key page that makes the "power button 3x → SOS" work:
 * Users configure their phone's native Emergency SOS setting to open
 * https://life-link-ai-psi.vercel.app/sos-trigger
 */
const SOSTriggerPage: React.FC = () => {
  const navigate = useNavigate();
  const { triggerSOS, isSOSActive } = useSOSStore();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'locating' | 'triggering' | 'done'>('locating');

  useEffect(() => {
    // If SOS is already active, go directly to the SOS page
    if (isSOSActive) {
      navigate('/sos', { replace: true });
      return;
    }

    // Vibrate to confirm the app opened
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }

    const doTrigger = (lat: number, lng: number) => {
      setStatus('triggering');
      triggerSOS('critical', 'hardware', lat, lng);
      setStatus('done');
      // Small delay so the user sees the confirmation, then redirect
      setTimeout(() => navigate('/sos', { replace: true }), 800);
    };

    // Try real geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => doTrigger(pos.coords.latitude, pos.coords.longitude),
        () => doTrigger(28.5355, 77.2690), // Fallback coords
        { timeout: 5000, maximumAge: 60000, enableHighAccuracy: true }
      );
    } else {
      doTrigger(28.5355, 77.2690);
    }
  }, [triggerSOS, isSOSActive, navigate]);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #1A0A10 0%, #060B14 50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Pulsing SOS icon */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF4757, #D63031)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        boxShadow: '0 0 60px rgba(255,71,87,0.5), 0 0 120px rgba(255,71,87,0.2)',
        animation: 'pulse-danger 1s ease-in-out infinite',
      }}>
        {status === 'locating' ? (
          <Loader2 size={48} color="white" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <AlertTriangle size={48} color="white" fill="white" />
        )}
      </div>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: 900,
        color: '#FF4757',
        marginBottom: '12px',
        letterSpacing: '-0.02em',
      }}>
        {status === 'locating' ? 'LOCATING YOU...' :
         status === 'triggering' ? 'ACTIVATING SOS...' :
         'SOS ACTIVATED'}
      </h1>

      <p style={{
        fontSize: '0.9rem',
        color: '#94A3B8',
        maxWidth: '300px',
        lineHeight: 1.6,
      }}>
        {status === 'locating'
          ? 'Acquiring your GPS location for emergency dispatch...'
          : 'Emergency services are being notified. Help is on the way.'}
      </p>

      {user && (
        <p style={{
          fontSize: '0.75rem',
          color: '#64748B',
          marginTop: '24px',
        }}>
          Logged in as {user.fullName || user.phone}
        </p>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SOSTriggerPage;
