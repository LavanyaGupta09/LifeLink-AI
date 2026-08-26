import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, X, Send, Activity, User, Hospital, Ambulance,
  Pill, FileText, Heart, UserCheck, Stethoscope, BriefcaseMedical,
  ShieldCheck, Shield, ChevronDown, CheckCircle, Loader2, Sparkles, MessageSquare, CarFront
} from 'lucide-react';
import { api } from '../services/api';

// Icon mapping helper
const getIcon = (iconName: string, size = 16) => {
  switch (iconName) {
    case 'activity': return <Activity size={size} />;
    case 'doctor':
    case 'user': return <User size={size} />;
    case 'hospital': return <Hospital size={size} />;
    case 'ambulance': return <Ambulance size={size} />;
    case 'pharmacy':
    case 'pill': return <Pill size={size} />;
    case 'file': return <FileText size={size} />;
    case 'heart': return <Heart size={size} />;
    case 'user-check': return <UserCheck size={size} />;
    case 'stethoscope': return <Stethoscope size={size} />;
    case 'medical': return <BriefcaseMedical size={size} />;
    case 'shield': return <Shield size={size} />;
    case 'shield-check': return <ShieldCheck size={size} />;
    case 'car':
    case 'car-front': return <CarFront size={size} />;
    default: return <MessageSquare size={size} />;
  }
};

type ActionItem = {
  id: string;
  label: string;
  icon: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionItem[];
  urgency?: string;
};

export default function LifeLinkAIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Expose global open method
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openLifeLinkAI', handleOpen);
    return () => window.removeEventListener('openLifeLinkAI', handleOpen);
  }, []);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let initialActions = [
        { id: 'symptom_check', label: 'Check Symptoms', icon: 'activity' },
        { id: 'find_doctor', label: 'Find Doctor', icon: 'doctor' },
        { id: 'find_hospital', label: 'Find Hospital', icon: 'hospital' }
      ];
      let greeting = "Hi! I'm LifeLink AI. How can I help you today? You can describe any health concerns or services you're looking for.";

      if (location.pathname === '/community') {
        initialActions = [
          { id: 'chat_find_discussions', label: 'Find Discussions', icon: 'file' },
          { id: 'chat_ask_question', label: 'How to ask a question?', icon: 'medical' },
          { id: 'chat_guidelines', label: 'Community Guidelines', icon: 'shield-check' }
        ];
        greeting = "Hi! I'm your Community AI Assistant. Are you looking for a specific discussion or do you have a question for the community?";
      }

      setMessages([{
        role: 'assistant',
        content: greeting,
        actions: initialActions
      }]);
    }
  }, [isOpen, location.pathname, messages.length]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const sendDirectMessage = async (text: string) => {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm here to help.",
        actions: data.actions || [],
        urgency: data.urgency
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "LifeLink AI is temporarily unavailable. Please try again later.",
        actions: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (actionId: string) => {
    if (actionId.startsWith('chat_')) {
      let prompt = '';
      if (actionId === 'chat_find_discussions') prompt = 'Can you help me find discussions about specific health topics?';
      if (actionId === 'chat_ask_question') prompt = 'How do I ask a new question in the community?';
      if (actionId === 'chat_guidelines') prompt = 'What are the community guidelines?';
      
      if (prompt) {
        sendDirectMessage(prompt);
      }
      return;
    }

    setIsOpen(false); // Close AI when navigating
    switch (actionId) {
      case 'symptom_check': navigate('/symptoms'); break;
      case 'find_doctor': navigate('/doctor'); break;
      case 'find_hospital': navigate('/hospitals'); break;
      case 'pharmacy':
      case 'medicine_delivery': navigate('/pharmacy'); break;
      case 'ambulance': navigate('/ambulance'); break;
      case 'transportation': 
      case 'uber':
        window.dispatchEvent(new Event('openUberRideFlow')); 
        break;
      case 'lab_test': navigate('/lab'); break;
      case 'insurance': navigate('/insurance'); break;
      case 'physiotherapy': navigate('/physiotherapy'); break;
      case 'home_healthcare': navigate('/homecare'); break;
      case 'medical_equipment': navigate('/equipment'); break;
      case 'family': navigate('/family'); break;
      case 'community': navigate('/community'); break;
      case 'mental_wellness': navigate('/doctor'); break;
      default: console.log('Unknown action:', actionId);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm here to help.",
        actions: data.actions || [],
        urgency: data.urgency
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "LifeLink AI is temporarily unavailable. Please use the navigation options below.",
        actions: [
          { id: 'symptom_check', label: 'Symptoms', icon: 'activity' },
          { id: 'find_hospital', label: 'Hospitals', icon: 'hospital' },
          { id: 'find_doctor', label: 'Doctor', icon: 'user' },
          { id: 'ambulance', label: 'Ambulance', icon: 'ambulance' }
        ]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 bg-gradient-to-r from-[#3D91FF] to-blue-600 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(61,145,255,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
        >
          <Bot size={24} className="group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-[#060B14]"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-28 md:right-8 md:w-[400px] md:h-[600px] z-[100] bg-[#060B14] md:bg-[#0B1121] md:border border-slate-800 md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-12 duration-300">
          
          {/* Header */}
          <div className="bg-[#131B2F] border-b border-slate-800/80 p-4 pt-[env(safe-area-inset-top,16px)] flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3D91FF] to-blue-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                <Bot size={20} className="text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight flex items-center gap-1">
                  LifeLink AI <Sparkles size={12} className="text-amber-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium">Your Health Companion</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#060B14]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-[#3D91FF]/20 text-[#3D91FF]'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 text-sm ${msg.role === 'user' ? 'bg-[#3D91FF] text-white rounded-2xl rounded-tr-sm' : 'bg-[#131B2F] text-slate-200 border border-slate-800/80 rounded-2xl rounded-tl-sm'}`}>
                    
                    {msg.role === 'assistant' && (msg.urgency === 'critical' || msg.urgency === 'high') && (
                      <div className="mb-2 bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded-lg text-xs font-bold flex gap-2">
                        <span>🚨</span> This may require urgent attention.
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
                
                {/* Action Buttons below AI message */}
                {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                  <div className="ml-10 mt-2 flex flex-col gap-2">
                    {msg.actions.map(action => {
                      const isPrimary = action.id === 'ambulance';
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleAction(action.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left
                            ${isPrimary 
                              ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                              : 'bg-[#131B2F] hover:bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                        >
                          {getIcon(action.icon, 14)}
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 max-w-[90%] self-start">
                <div className="w-8 h-8 rounded-full bg-[#3D91FF]/20 text-[#3D91FF] flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="p-4 bg-[#131B2F] border border-slate-800/80 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#3D91FF] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#3D91FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#3D91FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#131B2F] border-t border-slate-800 pb-[max(env(safe-area-inset-bottom,12px),12px)] md:rounded-b-3xl">
            <div className="relative flex items-end bg-[#060B14] border border-slate-700 rounded-2xl p-1 focus-within:border-[#3D91FF]/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your symptoms or ask a question..."
                className="w-full bg-transparent border-none text-white text-sm px-3 py-2.5 resize-none max-h-32 min-h-[44px] focus:outline-none scrollbar-hide"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 shrink-0 m-1 bg-[#3D91FF] text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-slate-700"
              >
                <Send size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
