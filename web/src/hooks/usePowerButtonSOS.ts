import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOSStore } from '../store/sosStore';
import { useSOSGuardStore } from '../store/sosGuardStore';

/**
 * Detects triple power-button press to trigger SOS.
 *
 * Strategy (multiple detection methods):
 *
 * 1. **visibilitychange** — Each power-button press toggles the screen
 *    on/off, firing a visibilitychange event. We count ALL transitions
 *    (hidden AND visible). Three rapid presses → 3 transitions within
 *    the time window → SOS fires.
 *
 * 2. **Volume keys** — On mobile Chrome/Android, pressing the volume
 *    buttons fires 'VolumeDown' / 'VolumeUp' KeyboardEvent. Three
 *    rapid volume-down presses also triggers SOS.
 *
 * 3. **Desktop fallback** — Pressing 'P' three times rapidly triggers
 *    SOS for testing purposes (ignored when typing in inputs).
 */
export function usePowerButtonSOS() {
  const navigate = useNavigate();
  const { triggerSOS, isSOSActive } = useSOSStore();
  const { isCooldownActive, isLocked } = useSOSGuardStore();

  // Timestamp trackers for each detection method
  const visibilityTimestamps = useRef<number[]>([]);
  const volumeKeyTimestamps = useRef<number[]>([]);
  const pKeyTimestamps = useRef<number[]>([]);

  // Prevent double-fire
  const firedRef = useRef(false);

  const REQUIRED_PRESSES = 3;
  const TIME_WINDOW_MS = 3000; // all 3 presses must happen within 3 s

  const fireSOS = useCallback(() => {
    if (firedRef.current || isSOSActive) return;
    if (isLocked || isCooldownActive()) return;

    firedRef.current = true;

    // Vibrate to confirm detection (if supported)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }

    // Try to get real geolocation; fall back to default coords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          triggerSOS('critical', 'hardware', pos.coords.latitude, pos.coords.longitude);
          navigate('/sos');
          setTimeout(() => { firedRef.current = false; }, 5000);
        },
        () => {
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

  /**
   * Helper: push a timestamp, prune old entries, and check if the
   * threshold has been met.
   */
  const recordAndCheck = useCallback(
    (timestamps: React.MutableRefObject<number[]>) => {
      const now = Date.now();
      timestamps.current.push(now);
      timestamps.current = timestamps.current.filter(
        (t) => now - t <= TIME_WINDOW_MS
      );
      if (timestamps.current.length >= REQUIRED_PRESSES) {
        timestamps.current = [];
        fireSOS();
      }
    },
    [fireSOS]
  );

  useEffect(() => {
    // ── 1. Visibility-change detection (mobile power button) ──
    // Each power button press causes one visibilitychange event.
    // Count ALL transitions (both hidden→visible AND visible→hidden).
    const handleVisibilityChange = () => {
      recordAndCheck(visibilityTimestamps);
    };

    // ── 2. Volume key detection (mobile browsers) ──
    // ── 3. 'P' key detection (desktop testing) ──
    const handleKeyDown = (e: KeyboardEvent) => {
      // Volume keys (works on Android Chrome)
      if (e.key === 'VolumeDown' || e.key === 'VolumeUp' || 
          e.key === 'AudioVolumeDown' || e.key === 'AudioVolumeUp') {
        e.preventDefault();
        recordAndCheck(volumeKeyTimestamps);
        return;
      }

      // Desktop fallback: triple 'P' key
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'p') {
        recordAndCheck(pKeyTimestamps);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordAndCheck]);
}
