import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useSOSStore } from '../store/sosStore';
import { useSOSGuardStore } from '../store/sosGuardStore';

/**
 * A global floating SOS button visible on all pages (except SOS itself).
 * 
 * Trigger methods:
 * 1. Triple-tap the floating SOS button within 2 seconds
 * 2. Triple power-button press (via visibilitychange detection)
 * 3. Triple volume-key press (Android Chrome)
 * 4. Device shake (accelerometer — mobile)
 * 5. Triple 'P' key press (desktop testing)
 */
const FloatingSOSTrigger: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerSOS, isSOSActive } = useSOSStore();
  const { isCooldownActive, isLocked } = useSOSGuardStore();

  const [tapCount, setTapCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  // Visibility / volume / key timestamps
  const visibilityTs = useRef<number[]>([]);
  const volumeTs = useRef<number[]>([]);
  const keyTs = useRef<number[]>([]);

  const REQUIRED = 3;
  const WINDOW_MS = 3000;

  // ─── Hide on certain routes ───
  const hiddenRoutes = ['/', '/onboarding', '/sos', '/login', '/role-select', '/b2b/auth', '/b2b/pending-review'];
  const shouldHide =
    hiddenRoutes.some((r) => location.pathname === r) ||
    location.pathname.startsWith('/b2b/') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/doctor/') ||
    location.pathname.startsWith('/partner/') ||
    isSOSActive;

  // ─── Fire SOS ───
  const fireSOS = useCallback(() => {
    if (firedRef.current || isSOSActive) return;
    if (isLocked || isCooldownActive()) return;

    firedRef.current = true;

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }

    const doTrigger = (lat: number, lng: number) => {
      triggerSOS('critical', 'hardware', lat, lng);
      navigate('/sos');
      setTimeout(() => { firedRef.current = false; }, 5000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => doTrigger(pos.coords.latitude, pos.coords.longitude),
        () => doTrigger(28.5355, 77.2690),
        { timeout: 3000, maximumAge: 60000 }
      );
    } else {
      doTrigger(28.5355, 77.2690);
    }
  }, [triggerSOS, isSOSActive, isLocked, isCooldownActive, navigate]);

  // ─── Helper: record timestamp + check threshold ───
  const recordAndCheck = useCallback(
    (tsRef: React.MutableRefObject<number[]>) => {
      const now = Date.now();
      tsRef.current.push(now);
      tsRef.current = tsRef.current.filter((t) => now - t <= WINDOW_MS);
      if (tsRef.current.length >= REQUIRED) {
        tsRef.current = [];
        fireSOS();
      }
    },
    [fireSOS]
  );

  // ─── Triple-tap on the SOS button ───
  const handleSOSTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (newCount >= REQUIRED) {
      setTapCount(0);
      setShowConfirm(true);
    } else {
      tapTimerRef.current = setTimeout(() => setTapCount(0), 2000);
    }
  };

  const handleConfirmSOS = () => {
    setShowConfirm(false);
    fireSOS();
  };

  // ─── Global listeners: visibility, volume keys, 'P' key, shake ───
  useEffect(() => {
    const handleVisibility = () => recordAndCheck(visibilityTs);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Volume keys
      if (['VolumeDown', 'VolumeUp', 'AudioVolumeDown', 'AudioVolumeUp'].includes(e.key)) {
        e.preventDefault();
        recordAndCheck(volumeTs);
        return;
      }
      // Desktop 'P' key (skip if typing)
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key.toLowerCase() === 'p') {
        recordAndCheck(keyTs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('keydown', handleKeyDown);

    // ── Shake detection (DeviceMotion) ──
    let lastShakeTime = 0;
    const shakeTs: number[] = [];
    const SHAKE_THRESHOLD = 25; // m/s²

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const force = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      if (force > SHAKE_THRESHOLD && now - lastShakeTime > 500) {
        lastShakeTime = now;
        shakeTs.push(now);
        const recent = shakeTs.filter((t) => now - t <= WINDOW_MS);
        if (recent.length >= REQUIRED) {
          shakeTs.length = 0;
          fireSOS();
        }
      }
    };

    // Request motion permission on iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      // Will need user gesture to request — handled elsewhere
    } else if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [recordAndCheck, fireSOS]);

  if (shouldHide) return null;

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={handleSOSTap}
        id="floating-sos-btn"
        className="fixed z-[999] shadow-2xl"
        style={{
          bottom: '90px',
          right: '16px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: tapCount > 0
            ? 'linear-gradient(135deg, #FF4757, #FF6B81)'
            : 'linear-gradient(135deg, #D63031, #FF4757)',
          border: tapCount > 0 ? '3px solid #fff' : '2px solid rgba(255,71,87,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: tapCount > 0 ? 'scale(1.15)' : 'scale(1)',
          boxShadow: tapCount > 0
            ? '0 0 30px rgba(255,71,87,0.8), 0 0 60px rgba(255,71,87,0.4)'
            : '0 4px 20px rgba(255,71,87,0.4), 0 0 40px rgba(255,71,87,0.15)',
          animation: tapCount > 0 ? 'pulse-danger 0.5s ease-in-out infinite' : undefined,
        }}
      >
        <AlertTriangle size={20} color="white" fill="white" style={{ marginBottom: '1px' }} />
        <span style={{ fontSize: '7px', fontWeight: 900, color: 'white', letterSpacing: '0.1em' }}>
          {tapCount > 0 ? `${REQUIRED - tapCount}×` : 'SOS'}
        </span>
      </button>

      {/* Tap counter indicator */}
      {tapCount > 0 && tapCount < REQUIRED && (
        <div
          className="fixed z-[1000] animate-fade-in"
          style={{
            bottom: '152px',
            right: '16px',
            background: '#FF4757',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(255,71,87,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          Tap {REQUIRED - tapCount} more time{REQUIRED - tapCount > 1 ? 's' : ''}!
        </div>
      )}

      {/* Confirmation overlay */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="mx-6 w-full max-w-sm rounded-3xl p-6 text-center animate-fade-in"
            style={{
              background: 'linear-gradient(180deg, #1A0A10 0%, #0B1121 100%)',
              border: '1px solid rgba(255,71,87,0.3)',
              boxShadow: '0 0 80px rgba(255,71,87,0.2)',
            }}
          >
            <div
              className="mx-auto mb-4 flex items-center justify-center"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4757, #D63031)',
                boxShadow: '0 0 40px rgba(255,71,87,0.5)',
                animation: 'pulse-danger 1s ease-in-out infinite',
              }}
            >
              <AlertTriangle size={32} color="white" fill="white" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
              Trigger SOS?
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.6 }}>
              This will alert emergency services, notify your emergency contacts, and dispatch an ambulance to your location.
            </p>

            <button
              onClick={handleConfirmSOS}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FF4757, #D63031)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                marginBottom: '12px',
                boxShadow: '0 4px 20px rgba(255,71,87,0.4)',
                letterSpacing: '0.05em',
              }}
            >
              🚨 YES, I NEED HELP NOW
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'transparent',
                color: '#94A3B8',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: '1px solid rgba(148,163,184,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <X size={16} /> Cancel (False Alarm)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSOSTrigger;
