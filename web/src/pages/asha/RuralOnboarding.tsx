import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, MapPin, User, Phone, Home, ShieldAlert, Globe, ChevronRight, Loader2, AlertCircle, Mic } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAshaStore } from '../../store/ashaStore';

interface FormErrors {
  name?: string;
  mobile?: string;
  village?: string;
  emergencyName?: string;
  emergencyMobile?: string;
}

const RuralOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuthStore();
  const { setAreaType } = useAshaStore();

  // Form state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [language] = useState('हिंदी');

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'denied'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice input state
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const speechSupported = typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Hindi numeral → ASCII digit conversion
  const hindiToDigits = (text: string): string => {
    const map: Record<string, string> = {
      '०':'0','१':'1','२':'2','३':'3','४':'4',
      '५':'5','६':'6','७':'7','८':'8','९':'9',
    };
    return text.split('').map(ch => map[ch] || ch).join('');
  };

  // ── Voice Input Handler ──
  const startVoiceInput = (fieldName: string, setter: (val: string) => void, isNumeric = false) => {
    if (!speechSupported) {
      setSpeechError('आवाज़ से जानकारी भरना उपलब्ध नहीं है। कृपया टाइप करके भरें।');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setActiveVoiceField(fieldName);
    setSpeechError(null);

    recognition.onresult = (e: any) => {
      let text = e.results[0][0].transcript.trim();
      if (isNumeric) {
        text = hindiToDigits(text).replace(/\D/g, '').slice(0, 10);
      }
      setter(text);
      clearError(fieldName as keyof FormErrors);
      setActiveVoiceField(null);
    };

    recognition.onerror = (e: any) => {
      setActiveVoiceField(null);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setSpeechError('आवाज़ से जानकारी भरना उपलब्ध नहीं है। कृपया टाइप करके भरें।');
      } else {
        setSpeechError('आवाज़ नहीं सुनाई दी। कृपया फिर से कोशिश करें।');
      }
      setTimeout(() => setSpeechError(null), 5000);
    };

    recognition.onend = () => {
      setActiveVoiceField(null);
    };

    try {
      recognition.start();
    } catch {
      setActiveVoiceField(null);
      setSpeechError('आवाज़ से जानकारी भरना उपलब्ध नहीं है। कृपया टाइप करके भरें।');
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

  // ── Geolocation ──
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setIsLocating(true);
    setLocationStatus('idle');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Try reverse geocoding with a free service
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=hi`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            const villageName = addr.village || addr.town || addr.city || addr.suburb || addr.county || '';
            if (villageName) {
              setVillage(villageName);
              setLocationStatus('success');
              // Clear village error if it existed
              setErrors(prev => ({ ...prev, village: undefined }));
            } else {
              setLocationStatus('denied');
            }
          } else {
            setLocationStatus('denied');
          }
        } catch {
          setLocationStatus('denied');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── Validation ──
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedVillage = village.trim();
    const trimmedEmName = emergencyName.trim();
    const trimmedEmMobile = emergencyMobile.trim();

    if (!trimmedName) {
      newErrors.name = 'कृपया अपना नाम लिखें';
    }

    if (!trimmedMobile || !/^[6-9]\d{9}$/.test(trimmedMobile)) {
      newErrors.mobile = 'कृपया सही मोबाइल नंबर डालें';
    }

    if (!trimmedVillage) {
      newErrors.village = 'कृपया अपने गाँव का नाम लिखें';
    }

    if (!trimmedEmName) {
      newErrors.emergencyName = 'कृपया आपातकालीन संपर्क का नाम लिखें';
    }

    if (!trimmedEmMobile || !/^[6-9]\d{9}$/.test(trimmedEmMobile)) {
      newErrors.emergencyMobile = 'कृपया सही मोबाइल नंबर डालें';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!validate()) return;

    setIsSubmitting(true);

    // Save rural user data locally
    const ruralUserData = {
      name: name.trim(),
      mobile: mobile.trim(),
      village: village.trim(),
      emergencyContact: {
        name: emergencyName.trim(),
        mobile: emergencyMobile.trim(),
      },
      language,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem('lifelink-rural-user', JSON.stringify(ruralUserData));

    // Set area type to rural
    setAreaType('rural');

    // Demo login so the user is authenticated for dashboard
    demoLogin();

    // Update user name in auth store
    const authState = useAuthStore.getState();
    if (authState.user) {
      useAuthStore.getState().updateUser({ fullName: name.trim() });
    }

    // Update emergency contact
    useAuthStore.getState().updatePrimaryContact({
      name: emergencyName.trim(),
      phone: emergencyMobile.trim(),
    });

    // Short delay for visual feedback, then navigate
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 600);
  };

  // ── Clear error on input ──
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="rural-onboarding-page">
      <div className="rural-onboarding-container">

        {/* ── Header / Branding ── */}
        <div className="ro-header">
          <div className="ro-brand">
            <HeartPulse size={28} className="text-[#00C9A7]" />
            <span className="ro-brand-text">
              LifeLink <span className="text-[#00C9A7]">AI</span>
            </span>
          </div>
        </div>

        {/* ── Welcome Section ── */}
        <div className="ro-welcome">
          <h1 className="ro-greeting">नमस्ते! 👋</h1>
          <h2 className="ro-welcome-sub">LifeLink में आपका स्वागत है</h2>
          <p className="ro-welcome-hint">कुछ आसान जानकारी भरें और आगे बढ़ें</p>
        </div>

        {/* Voice hint */}
        <p className="ro-voice-hint">टाइप नहीं करना चाहते? 🎙️ बोलकर जानकारी भरें</p>
        {speechError && (
          <p className="ro-speech-error">⚠️ {speechError}</p>
        )}

        {/* ── Form ── */}
        <div className="ro-form">

          {/* FIELD 1: Name */}
          <div className="ro-field">
            <label className="ro-label">
              <User size={20} className="ro-label-icon" />
              आपका नाम
            </label>
            <div className="ro-input-wrap">
              <input
                type="text"
                className={`ro-input ${errors.name ? 'ro-input-error' : ''}`}
                placeholder={activeVoiceField === 'name' ? '🎙️ बोलिए...' : 'अपना नाम लिखें'}
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                autoComplete="name"
              />
              <button
                type="button"
                className={`ro-mic-btn ${activeVoiceField === 'name' ? 'ro-mic-active' : ''}`}
                onClick={() => startVoiceInput('name', setName)}
                disabled={activeVoiceField !== null && activeVoiceField !== 'name'}
                aria-label="आवाज़ से नाम भरें"
              >
                <Mic size={18} />
              </button>
            </div>
            {activeVoiceField === 'name' && <p className="ro-listening-label">🎙️ बोलिए...</p>}
            {errors.name && (
              <p className="ro-error">
                <AlertCircle size={14} /> {errors.name}
              </p>
            )}
          </div>

          {/* FIELD 2: Mobile */}
          <div className="ro-field">
            <label className="ro-label">
              <Phone size={20} className="ro-label-icon" />
              मोबाइल नंबर
            </label>
            <div className="ro-input-wrap">
              <input
                type="tel"
                inputMode="numeric"
                className={`ro-input ${errors.mobile ? 'ro-input-error' : ''}`}
                placeholder={activeVoiceField === 'mobile' ? '🎙️ बोलिए...' : 'अपना मोबाइल नंबर लिखें'}
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(val);
                  clearError('mobile');
                }}
                maxLength={10}
                autoComplete="tel"
              />
              <button
                type="button"
                className={`ro-mic-btn ${activeVoiceField === 'mobile' ? 'ro-mic-active' : ''}`}
                onClick={() => startVoiceInput('mobile', setMobile, true)}
                disabled={activeVoiceField !== null && activeVoiceField !== 'mobile'}
                aria-label="आवाज़ से नंबर भरें"
              >
                <Mic size={18} />
              </button>
            </div>
            {activeVoiceField === 'mobile' && <p className="ro-listening-label">🎙️ बोलिए...</p>}
            {errors.mobile && (
              <p className="ro-error">
                <AlertCircle size={14} /> {errors.mobile}
              </p>
            )}
          </div>

          {/* FIELD 3: Village */}
          <div className="ro-field">
            <label className="ro-label">
              <Home size={20} className="ro-label-icon" />
              आपका गाँव
            </label>
            <div className="ro-input-wrap">
              <input
                type="text"
                className={`ro-input ${errors.village ? 'ro-input-error' : ''}`}
                placeholder={activeVoiceField === 'village' ? '🎙️ बोलिए...' : 'अपने गाँव का नाम लिखें'}
                value={village}
                onChange={(e) => { setVillage(e.target.value); clearError('village'); }}
              />
              <button
                type="button"
                className={`ro-mic-btn ${activeVoiceField === 'village' ? 'ro-mic-active' : ''}`}
                onClick={() => startVoiceInput('village', setVillage)}
                disabled={activeVoiceField !== null && activeVoiceField !== 'village'}
                aria-label="आवाज़ से गाँव का नाम भरें"
              >
                <Mic size={18} />
              </button>
            </div>
            {activeVoiceField === 'village' && <p className="ro-listening-label">🎙️ बोलिए...</p>}
            {/* Location Button */}
            <button
              type="button"
              className="ro-location-btn"
              onClick={handleGetLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>जगह ढूँढ रहे हैं...</span>
                </>
              ) : (
                <>
                  <MapPin size={18} />
                  <span>📍 मेरी जगह पता करें</span>
                </>
              )}
            </button>
            {locationStatus === 'success' && (
              <p className="ro-location-success">✅ जगह मिल गई</p>
            )}
            {locationStatus === 'denied' && (
              <p className="ro-location-denied">जगह नहीं मिली — ऊपर गाँव का नाम लिखें</p>
            )}
            {errors.village && (
              <p className="ro-error">
                <AlertCircle size={14} /> {errors.village}
              </p>
            )}
          </div>

          {/* FIELD 4: Emergency Contact */}
          <div className="ro-field">
            <label className="ro-label">
              <ShieldAlert size={20} className="ro-label-icon" />
              आपातकालीन संपर्क
            </label>
            <p className="ro-helper">मुसीबत में इस व्यक्ति से संपर्क किया जाएगा</p>

            <div className="ro-emergency-group">
              <div className="ro-input-wrap">
                <input
                  type="text"
                  className={`ro-input ${errors.emergencyName ? 'ro-input-error' : ''}`}
                  placeholder={activeVoiceField === 'emergencyName' ? '🎙️ बोलिए...' : 'नाम'}
                  value={emergencyName}
                  onChange={(e) => { setEmergencyName(e.target.value); clearError('emergencyName'); }}
                />
                <button
                  type="button"
                  className={`ro-mic-btn ${activeVoiceField === 'emergencyName' ? 'ro-mic-active' : ''}`}
                  onClick={() => startVoiceInput('emergencyName', setEmergencyName)}
                  disabled={activeVoiceField !== null && activeVoiceField !== 'emergencyName'}
                  aria-label="आवाज़ से नाम भरें"
                >
                  <Mic size={18} />
                </button>
              </div>
              {activeVoiceField === 'emergencyName' && <p className="ro-listening-label">🎙️ बोलिए...</p>}
              {errors.emergencyName && (
                <p className="ro-error">
                  <AlertCircle size={14} /> {errors.emergencyName}
                </p>
              )}

              <div className="ro-input-wrap">
                <input
                  type="tel"
                  inputMode="numeric"
                  className={`ro-input ${errors.emergencyMobile ? 'ro-input-error' : ''}`}
                  placeholder={activeVoiceField === 'emergencyMobile' ? '🎙️ बोलिए...' : 'मोबाइल नंबर'}
                  value={emergencyMobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setEmergencyMobile(val);
                    clearError('emergencyMobile');
                  }}
                  maxLength={10}
                />
                <button
                  type="button"
                  className={`ro-mic-btn ${activeVoiceField === 'emergencyMobile' ? 'ro-mic-active' : ''}`}
                  onClick={() => startVoiceInput('emergencyMobile', setEmergencyMobile, true)}
                  disabled={activeVoiceField !== null && activeVoiceField !== 'emergencyMobile'}
                  aria-label="आवाज़ से नंबर भरें"
                >
                  <Mic size={18} />
                </button>
              </div>
              {activeVoiceField === 'emergencyMobile' && <p className="ro-listening-label">🎙️ बोलिए...</p>}
              {errors.emergencyMobile && (
                <p className="ro-error">
                  <AlertCircle size={14} /> {errors.emergencyMobile}
                </p>
              )}
            </div>
          </div>

          {/* FIELD 5: Language */}
          <div className="ro-field">
            <label className="ro-label">
              <Globe size={20} className="ro-label-icon" />
              भाषा चुनें
            </label>
            <div className="ro-language-chip-selected">
              <span>🇮🇳</span>
              <span>{language}</span>
              <span className="ro-lang-check">✓</span>
            </div>
          </div>

        </div>

        {/* ── Submit Button ── */}
        <button
          className="ro-submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <>
              <span>आगे बढ़ें</span>
              <ChevronRight size={22} />
            </>
          )}
        </button>

        {/* ── Footer ── */}
        <p className="ro-footer">आपकी जानकारी पूरी तरह सुरक्षित है 🔒</p>

      </div>

      {/* ── Scoped Styles ── */}
      <style>{`
        .rural-onboarding-page {
          min-height: 100dvh;
          background: linear-gradient(180deg, #040814 0%, #0A1628 50%, #060B14 100%);
          display: flex;
          justify-content: center;
          padding: 0;
        }

        .rural-onboarding-container {
          width: 100%;
          max-width: 480px;
          padding: 20px 20px 40px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Header ── */
        .ro-header {
          display: flex;
          justify-content: center;
          padding: 16px 0 8px;
        }
        .ro-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ro-brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        /* ── Welcome ── */
        .ro-welcome {
          text-align: center;
          padding: 20px 0 24px;
        }
        .ro-greeting {
          font-size: 2.25rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .ro-welcome-sub {
          font-size: 1.15rem;
          font-weight: 600;
          color: #00C9A7;
          margin: 0 0 12px;
          line-height: 1.3;
        }
        .ro-welcome-hint {
          font-size: 0.95rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        /* ── Form ── */
        .ro-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Field ── */
        .ro-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ── Label ── */
        .ro-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.05rem;
          font-weight: 700;
          color: #e2e8f0;
          padding-left: 2px;
        }
        .ro-label-icon {
          color: #00C9A7;
          flex-shrink: 0;
        }

        /* ── Input ── */
        .ro-input {
          width: 100%;
          background: #0F1D32;
          border: 1.5px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 16px 18px;
          font-size: 1.05rem;
          font-weight: 500;
          color: #ffffff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
          box-sizing: border-box;
        }
        .ro-input::placeholder {
          color: #64748b;
          font-weight: 400;
        }
        .ro-input:focus {
          border-color: #00C9A7;
          box-shadow: 0 0 0 3px rgba(0, 201, 167, 0.12);
        }
        .ro-input-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
        }

        /* ── Error ── */
        .ro-error {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #f87171;
          margin: 0;
          padding-left: 4px;
        }

        /* ── Helper ── */
        .ro-helper {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0;
          padding-left: 4px;
          line-height: 1.4;
        }

        /* ── Emergency Contact Group ── */
        .ro-emergency-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Location Button ── */
        .ro-location-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: rgba(0, 201, 167, 0.08);
          border: 1.5px dashed rgba(0, 201, 167, 0.35);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #00C9A7;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 48px;
        }
        .ro-location-btn:hover:not(:disabled) {
          background: rgba(0, 201, 167, 0.14);
          border-color: rgba(0, 201, 167, 0.5);
        }
        .ro-location-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .ro-location-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ro-location-success {
          font-size: 0.85rem;
          font-weight: 600;
          color: #34d399;
          margin: 0;
          padding-left: 4px;
        }
        .ro-location-denied {
          font-size: 0.82rem;
          font-weight: 500;
          color: #94a3b8;
          margin: 0;
          padding-left: 4px;
        }

        /* ── Language Chip ── */
        .ro-language-chip-selected {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 201, 167, 0.1);
          border: 1.5px solid rgba(0, 201, 167, 0.4);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 1.05rem;
          font-weight: 600;
          color: #00C9A7;
          min-height: 48px;
        }
        .ro-lang-check {
          margin-left: auto;
          font-size: 1.1rem;
          font-weight: 800;
          color: #00C9A7;
        }

        /* ── Submit Button ── */
        .ro-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: linear-gradient(135deg, #00C9A7 0%, #00B396 100%);
          border: none;
          border-radius: 18px;
          padding: 18px 24px;
          font-size: 1.2rem;
          font-weight: 800;
          color: #040814;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 32px;
          min-height: 60px;
          box-shadow: 0 4px 24px rgba(0, 201, 167, 0.25);
        }
        .ro-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 32px rgba(0, 201, 167, 0.35);
        }
        .ro-submit-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .ro-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* ── Footer ── */
        .ro-footer {
          text-align: center;
          font-size: 0.82rem;
          color: #64748b;
          margin-top: 20px;
          padding-bottom: 20px;
        }

        /* ── Voice Input ── */
        .ro-voice-hint {
          text-align: center;
          font-size: 0.88rem;
          color: #64748b;
          margin: 0 0 6px;
          padding: 0 4px;
          line-height: 1.5;
        }
        .ro-speech-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.82rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 12px;
          padding: 10px 14px;
          margin: 0 0 8px;
          text-align: center;
          line-height: 1.5;
        }
        .ro-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .ro-input-wrap .ro-input {
          padding-right: 54px;
        }
        .ro-mic-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(0, 201, 167, 0.3);
          background: rgba(0, 201, 167, 0.08);
          color: #00C9A7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
          flex-shrink: 0;
        }
        .ro-mic-btn:hover:not(:disabled) {
          background: rgba(0, 201, 167, 0.18);
          border-color: rgba(0, 201, 167, 0.5);
        }
        .ro-mic-btn:active:not(:disabled) {
          transform: translateY(-50%) scale(0.9);
        }
        .ro-mic-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }
        .ro-mic-active {
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: rgba(239, 68, 68, 0.5) !important;
          color: #ef4444 !important;
          animation: ro-mic-pulse 1.2s ease-in-out infinite;
        }
        @keyframes ro-mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }
        .ro-listening-label {
          font-size: 0.82rem;
          color: #ef4444;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 2px 0 0;
          padding-left: 4px;
          animation: ro-blink 1s step-end infinite;
        }
        @keyframes ro-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── Responsive adjustments ── */
        @media (max-width: 380px) {
          .ro-greeting {
            font-size: 1.9rem;
          }
          .ro-welcome-sub {
            font-size: 1.05rem;
          }
          .ro-input {
            padding: 14px 16px;
            font-size: 1rem;
          }
          .ro-input-wrap .ro-input {
            padding-right: 50px;
          }
          .ro-mic-btn {
            width: 36px;
            height: 36px;
            right: 6px;
          }
          .ro-submit-btn {
            padding: 16px 20px;
            font-size: 1.1rem;
            min-height: 56px;
          }
        }

        @media (min-width: 481px) {
          .rural-onboarding-container {
            padding: 32px 32px 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default RuralOnboarding;
