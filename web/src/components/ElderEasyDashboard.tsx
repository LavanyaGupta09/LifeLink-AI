import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useTriageStore } from '../store/triageStore';
import { useGeolocation } from '../hooks/useGeolocation';

const ElderEasyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setSymptoms, analyzeSymptoms } = useTriageStore();
  const { location } = useGeolocation();
  
  const [primaryContact, setPrimaryContact] = useState<any>(null);
  const [loadingContact, setLoadingContact] = useState(true);
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessingIntent, setIsProcessingIntent] = useState(false);
  const [sosStatus, setSosStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Fetch primary emergency contact
  useEffect(() => {
    const fetchContact = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('family_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();
          
        if (data) {
          setPrimaryContact(data);
        }
      } catch (err) {
        console.error('Error fetching primary contact', err);
      } finally {
        setLoadingContact(false);
      }
    };
    fetchContact();
  }, [user]);

  // Handle GIANT RED SOS
  const handleSOS = async () => {
    if (sosStatus !== 'idle') return;
    setSosStatus('sending');
    try {
      await supabase.from('emergency_requests').insert({
        user_id: user?.id,
        status: 'critical',
        source: 'elder_easy_mode',
        lat: location?.lat || 28.5355,
        lng: location?.lng || 77.2690,
        dispatched_at: new Date().toISOString()
      });
      setSosStatus('sent');
      setTimeout(() => {
        navigate('/sos');
      }, 500);
    } catch (err) {
      console.error('Failed to trigger SOS', err);
      setSosStatus('idle');
      // Fallback
      navigate('/sos');
    }
  };

  // Handle VOICE AI ASSISTANT
  const handleVoice = () => {
    if (!isListening && !isProcessingIntent) {
      setIsListening(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onresult = async (e: any) => {
          const text = e.results[0][0].transcript;
          setIsListening(false);
          setIsProcessingIntent(true);
          
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://lifelink-ai-rwru.onrender.com';
            const response = await fetch(`${API_URL}/api/v1/voice/parse-intent`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text })
            });
            const data = await response.json();
            const { intent, action_payload } = data;
            
            switch (intent) {
              case 'EMERGENCY':
                handleSOS();
                break;
              case 'SYMPTOMS':
                setSymptoms(action_payload || text);
                await analyzeSymptoms((action_payload || text).split(',').map(s => s.trim()), 'en');
                navigate('/symptoms');
                break;
              case 'NAVIGATION':
                navigate('/' + (action_payload || '').replace(/^\/+/, ''));
                break;
              case 'GENERAL':
              default:
                alert(`AI Assistant: ${action_payload || 'I could not understand that command.'}`);
                break;
            }
          } catch (err) {
            console.warn('Backend unavailable, using simulated NLP logic', err);
            let intent = 'GENERAL';
            let action_payload = 'I heard: ' + text;
            
            const lowerText = text.toLowerCase();
            if (lowerText.includes('emergency') || lowerText.includes('help') || lowerText.includes('sos')) {
              intent = 'EMERGENCY';
            } else if (lowerText.includes('pain') || lowerText.includes('hurt') || lowerText.includes('symptom')) {
              intent = 'SYMPTOMS';
              action_payload = text;
            } else if (lowerText.includes('hospital') || lowerText.includes('ambulance') || lowerText.includes('navigate')) {
              intent = 'NAVIGATION';
              action_payload = 'hospitals';
            }

            switch (intent) {
              case 'EMERGENCY':
                handleSOS();
                break;
              case 'SYMPTOMS':
                setSymptoms(action_payload || text);
                await analyzeSymptoms((action_payload || text).split(',').map(s => s.trim()), 'en');
                navigate('/symptoms');
                break;
              case 'NAVIGATION':
                navigate('/' + (action_payload || '').replace(/^\/+/, ''));
                break;
              case 'GENERAL':
              default:
                alert(`AI Assistant (Simulated): I could not understand that command. Did you mean 'help' or 'hospital'?`);
                break;
            }
          } finally {
            setIsProcessingIntent(false);
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } else {
        setTimeout(() => setIsListening(false), 3000);
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col p-4 bg-slate-950">
      {/* Small Header for Exit/Logout if needed */}
      <div className="flex justify-between items-center mb-4 pt-[env(safe-area-inset-top)]">
        <h2 className="text-white font-bold text-xl ml-2">Elder Mode</h2>
        <button 
          onClick={() => navigate('/settings')}
          className="px-4 py-2 bg-slate-800 rounded-full text-slate-300 font-bold border border-slate-700"
        >
          Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* BUTTON 1: GIANT RED SOS */}
        <button 
          onClick={handleSOS}
          disabled={sosStatus !== 'idle'}
          className="h-[30%] w-full bg-red-600 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl shadow-red-900/40 active:scale-95 transition-transform border border-red-500"
        >
          <span className="text-5xl mb-2">🚨</span>
          <span className="text-3xl font-black">
            {sosStatus === 'sending' ? 'SENDING SOS...' : sosStatus === 'sent' ? 'SOS DISPATCHED!' : '1-TAP AMBULANCE'}
          </span>
        </button>

        {/* BUTTON 2: VOICE AI ASSISTANT */}
        <button 
          onClick={handleVoice}
          className="h-[30%] w-full bg-emerald-600 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-900/40 active:scale-95 transition-transform border border-emerald-500 mt-4"
        >
          <span className="text-5xl mb-2">🗣️</span>
          <span className="text-3xl font-black text-center px-4 leading-tight">
            {isProcessingIntent ? 'PROCESSING...' : isListening ? 'LISTENING...' : 'TAP & SPEAK TO AI'}
          </span>
        </button>

        {/* BUTTON 3: DIRECT FAMILY DIALER */}
        {loadingContact ? (
          <div className="h-[30%] w-full bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl border-2 border-slate-700 animate-pulse mt-4">
            <span className="text-xl font-bold text-slate-400">Loading Contact...</span>
          </div>
        ) : primaryContact ? (
          <a 
            href={`tel:${primaryContact.phone}`}
            className="h-[30%] w-full bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform border-2 border-slate-700 mt-4"
          >
            <span className="text-5xl mb-2">📞</span>
            <span className="text-2xl font-black text-center px-4 leading-tight">
              CALL {primaryContact.name.toUpperCase()}<br/>
              <span className="text-lg text-slate-400">({primaryContact.relationship.toUpperCase()})</span>
            </span>
          </a>
        ) : (
          <button 
            onClick={() => navigate('/family/add')}
            className="h-[30%] w-full bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform border-2 border-slate-700 mt-4"
          >
            <span className="text-5xl mb-2">➕</span>
            <span className="text-2xl font-black text-center px-4 leading-tight">ADD EMERGENCY<br/>CONTACT</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ElderEasyDashboard;
