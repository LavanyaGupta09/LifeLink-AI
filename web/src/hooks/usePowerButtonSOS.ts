import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOSStore } from '../store/sosStore';
import { useSOSGuardStore } from '../store/sosGuardStore';

/**
 * Detects triple power-button press to trigger SOS.
 *
 * In a web app we cannot listen to the physical power button directly.
 * However, pressing the power button locks the screen, which fires a
 * `visibilitychange` event (hidden → visible cycle). Three rapid presses
 * produce three hidden→visible transitions within a short window.
 *
 * We also listen for the keyboard shortcut: pressing 'P' three times
 * rapidly (within 1.5 s) as a desktop/testing fallback.
 */
export function usePowerButtonSOS() {
  const navigate = useNavigate();
  const { triggerSOS, isSOSActive } = useSOSStore();
  const { isCooldownActive, isLocked } = useSOSGuardStore();

  // Track visibility transitions (power button proxy)
  const visibilityTimestamps = useRef<number[]>([]);
  // Track keyboard 'p' key presses (desktop fallback)
  const keyTimestamps = useRef<number[]>([]);
  // Prevent double-fire
  const firedRef = useRef(false);

  const REQUIRED_PRESSES = 3;
  const TIME_WINDOW_MS = 2000; // all 3 presses must happen within 2 s

  const fireSOS = useCallback(() => {
    if (firedRef.current || isSOSActive) return;
    if (isLocked || isCooldownActive()) return;

    firedRef.current = true;

    // Try to get real geolocation; fall back to mock coords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          triggerSOS('critical', 'hardware', pos.coords.latitude, pos.coords.longitude);
          navigate('/sos');
          // Reset after a short delay so the hook can fire again next time
          setTimeout(() => { firedRef.current = false; }, 5000);
        },
        () => {
          // Geolocation denied / error → use fallback coords
          triggerSOS('critical', 'hardware', 28.5355, 77.2690);
          navigate('/sos');
          setTimeout(() => { firedRef.current = false; }, 5000);
        },
        { timeout: 3000, maximumAge: 60000 }
      );
    } else {
      triggerSOS('critical', 'hardware', 28.5355, 77.2690);
      navigate('/sos');
      setTimeout(() => { firedRef.current = false; }, 5000);
    }
  }, [triggerSOS, isSOSActive, isLocked, isCooldownActive, navigate]);

  useEffect(() => {
    // ── Visibility-change detection (mobile power button) ──
    const handleVisibilityChange = () => {
      // We only care about the transition from hidden → visible
      // (i.e., screen turned back on after a power-button press)
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        visibilityTimestamps.current.push(now);

        // Keep only recent timestamps within the window
        visibilityTimestamps.current = visibilityTimestamps.current.filter(
          (t) => now - t <= TIME_WINDOW_MS
        );

        if (visibilityTimestamps.current.length >= REQUIRED_PRESSES) {
          visibilityTimestamps.current = [];
          fireSOS();
        }
      }
    };

    // ── Keyboard detection (desktop fallback: press 'P' 3× rapidly) ──
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input / textarea / contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'p') {
        const now = Date.now();
        keyTimestamps.current.push(now);

        keyTimestamps.current = keyTimestamps.current.filter(
          (t) => now - t <= TIME_WINDOW_MS
        );

        if (keyTimestamps.current.length >= REQUIRED_PRESSES) {
          keyTimestamps.current = [];
          fireSOS();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fireSOS]);
}
