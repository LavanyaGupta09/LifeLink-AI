import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Delete } from 'lucide-react';

const PhoneSimulatorPage: React.FC = () => {
  const [display, setDisplay] = useState('');
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Speech synthesis helper
  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Indian English accent fits well
    utterance.rate = 0.9;
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (callState === 'connected') {
      const t = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      setTimer(t);
      return () => clearInterval(t);
    }
  }, [callState]);

  const handleKeyPress = async (key: string) => {
    if (callState === 'idle') {
      setDisplay(prev => prev + key);
    } else if (callState === 'connected') {
      setDisplay(key);
      
      if (key === '1') {
        window.speechSynthesis.cancel();
        // Play DTMF tone (optional, skipped for simplicity)
        
        // Trigger the backend API to simulate Twilio webhook
        try {
            const formData = new URLSearchParams();
            formData.append('Digits', '1');
            formData.append('From', '+919999999999');
            
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/api/telephony/ivr/input`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });
            
            speak("Your emergency request has been received. Please stay on the line.");
        } catch (error) {
            console.error("Failed to trigger SOS:", error);
            speak("Sorry, there was a network error processing your request.");
        }
      } else if (key === '9') {
        window.speechSynthesis.cancel();
        speak("Welcome to Life Link A I. For emergency S O S, press 1. To repeat, press 9.");
      } else {
        window.speechSynthesis.cancel();
        speak("Invalid option. Please try again.");
      }
    }
  };

  const handleCall = () => {
    if (display.trim() === '') return;
    
    setCallState('calling');
    
    // Simulate ring delay
    setTimeout(() => {
      setCallState('connected');
      setCallDuration(0);
      speak("Welcome to Life Link A I. For emergency S O S, press 1. To repeat, press 9.");
    }, 2000);
  };

  const handleEnd = () => {
    window.speechSynthesis.cancel();
    if (timer) clearInterval(timer);
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setDisplay('');
      setCallDuration(0);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[320px] bg-gray-800 rounded-[3rem] p-4 shadow-2xl border-4 border-gray-700 relative overflow-hidden">
        
        {/* Top speaker grill */}
        <div className="w-16 h-2 bg-gray-900 rounded-full mx-auto mb-6"></div>

        {/* Screen */}
        <div className="bg-[#9bb99b] h-48 rounded-xl mb-6 border-4 border-gray-600 p-3 flex flex-col justify-between shadow-inner">
          <div className="flex justify-between items-center text-gray-800 text-xs font-bold font-mono">
            <span>📶 100%</span>
            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          
          <div className="text-center font-mono font-bold text-gray-800 break-words flex-grow flex flex-col justify-center">
            {callState === 'idle' && (
              <div className="text-2xl tracking-widest">{display || 'LifeLink'}</div>
            )}
            {callState === 'calling' && (
              <div className="animate-pulse">
                <div className="text-lg">Calling...</div>
                <div className="text-xl mt-2">{display}</div>
              </div>
            )}
            {callState === 'connected' && (
              <div>
                <div className="text-lg mb-1">{display.length > 3 ? display : 'Connected'}</div>
                <div className="text-2xl">{formatTime(callDuration)}</div>
              </div>
            )}
            {callState === 'ended' && (
              <div className="text-xl">Call Ended</div>
            )}
          </div>
          
          <div className="flex justify-between text-gray-800 text-[10px] font-bold font-mono uppercase">
            <span>{callState === 'idle' && display ? 'Options' : 'Menu'}</span>
            <span>{callState === 'idle' && display ? 'Clear' : 'Names'}</span>
          </div>
        </div>

        {/* Function keys */}
        <div className="flex justify-between px-2 mb-4">
          <div className="w-12 h-6 bg-gray-700 rounded-full"></div>
          <div className="w-16 h-12 bg-gray-700 rounded-full flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all">
            <div className="w-8 h-8 rounded-full border-2 border-gray-500"></div>
          </div>
          <div className="w-12 h-6 bg-gray-700 rounded-full"></div>
        </div>

        {/* Call/End buttons */}
        <div className="flex justify-between px-4 mb-6">
          <button 
            onClick={handleCall}
            disabled={callState !== 'idle' || !display}
            className="w-14 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 disabled:opacity-50 transition-transform"
          >
            <Phone size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={() => {
                if (callState === 'idle' && display) {
                    setDisplay(prev => prev.slice(0, -1));
                } else if (callState !== 'idle') {
                    handleEnd();
                }
            }}
            className="w-14 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
          >
            {callState === 'idle' && display ? <Delete size={20} /> : <PhoneOff size={20} fill="currentColor" />}
          </button>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 px-2">
          {[
            { key: '1', sub: 'oo' }, { key: '2', sub: 'abc' }, { key: '3', sub: 'def' },
            { key: '4', sub: 'ghi' }, { key: '5', sub: 'jkl' }, { key: '6', sub: 'mno' },
            { key: '7', sub: 'pqrs' }, { key: '8', sub: 'tuv' }, { key: '9', sub: 'wxyz' },
            { key: '*', sub: '+' }, { key: '0', sub: ' ␣ ' }, { key: '#', sub: '⌂' }
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => handleKeyPress(btn.key)}
              className="bg-gray-700 h-12 rounded-xl flex flex-col items-center justify-center text-white shadow-md active:bg-gray-600 active:scale-95 transition-all"
            >
              <span className="text-xl font-bold leading-none">{btn.key}</span>
              <span className="text-[9px] text-gray-400 mt-0.5 uppercase">{btn.sub}</span>
            </button>
          ))}
        </div>
        
        {/* Bottom mic hole */}
        <div className="w-2 h-2 bg-gray-900 rounded-full absolute bottom-4 right-6"></div>
      </div>
      
      {/* Helper text for judges */}
      <div className="fixed bottom-4 text-center text-gray-400 text-sm max-w-sm">
        <p>Hackathon Prototype: Type any number and press Call. Audio will play automatically via your browser.</p>
        <p className="mt-2 text-xs">Press '1' during the call to trigger the SOS in the main dashboard.</p>
      </div>
    </div>
  );
};

export default PhoneSimulatorPage;
