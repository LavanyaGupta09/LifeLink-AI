import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MessageCircle, Bot, Search, ThumbsUp, 
  MessageSquare, Share2, MoreHorizontal, Sparkles, Plus,
  Stethoscope, Pill, HeartPulse, ShieldCheck, Activity, CheckCircle, Loader2
} from 'lucide-react';
import { simulateRAGPipeline, type RAGStep, type RAGResponse } from '../services/aiKnowledgeEngine';

type Post = {
  id: string;
  author: string;
  authorRole: string;
  avatar: string;
  category: string;
  content: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
};

const CATEGORIES = [
  { id: 'all', label: 'All Discussions' },
  { id: 'hospitals', label: 'Hospitals', icon: <Activity size={14} /> },
  { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={14} /> },
  { id: 'medicines', label: 'Medicines', icon: <Pill size={14} /> },
  { id: 'health', label: 'Health Issues', icon: <HeartPulse size={14} /> },
  { id: 'insurance', label: 'Insurance', icon: <ShieldCheck size={14} /> }
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Rajiv Sharma',
    authorRole: 'Patient',
    avatar: 'R',
    category: 'Hospitals',
    content: 'Has anyone visited Apollo Hospital in Jubilee Hills recently? Looking for reviews on their Cardiology department and wait times. My father needs an angioplasty soon.',
    timeAgo: '2h ago',
    likes: 24,
    comments: 8,
  },
  {
    id: 'p2',
    author: 'Dr. Neha Verma',
    authorRole: 'Verified Doctor',
    avatar: 'N',
    category: 'Health Issues',
    content: 'With the sudden drop in temperature, Im seeing a 40% spike in viral fever cases. Remember to stay hydrated, avoid crowded places, and consult a doctor if fever persists over 48 hours.',
    timeAgo: '5h ago',
    likes: 156,
    comments: 42,
  },
  {
    id: 'p3',
    author: 'Priya Patel',
    authorRole: 'Family Caregiver',
    avatar: 'P',
    category: 'Medicines',
    content: 'Does anyone know if generic alternatives for Rosuvastatin 10mg are as effective? The branded ones are getting quite expensive for a monthly prescription.',
    timeAgo: '1d ago',
    likes: 12,
    comments: 15,
  }
];

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'community' | 'ai'>('community');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Chat State
  // Local state for interactive mock posts
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  // Trigger global AI instead of local tab
  const handleOpenAI = () => {
    window.dispatchEvent(new Event('openLifeLinkAI'));
  };

  const filteredPosts = posts.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full bg-[#0B1121] text-white font-sans flex flex-col pb-[120px] md:pb-12 md:pl-28 relative min-h-screen px-6 py-6 ">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#8B5CF6]/10 to-transparent pointer-events-none" />
      
      {/* HEADER */}
      <header className="w-full flex items-center gap-4 p-6 lg:px-10 lg:py-8 relative z-10">
        <button 
          className="w-12 h-12 flex items-center justify-center bg-[#131B2F] border border-slate-800 rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-lg" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} className="text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
            <MessageCircle size={32} className="text-[#8B5CF6]" />
            LifeLink Community
          </h1>
          <p className="text-slate-400 text-sm lg:text-base font-medium mt-1">Ask, Discuss, and Support</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full px-6 flex-1 relative z-10 flex flex-col gap-6">
        
        {/* DUAL PATH SWITCHER */}
        <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-1 flex">
          <button 
            onClick={() => setActiveTab('community')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'community' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageCircle size={18} />
            Community Forum
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'ai' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Bot size={18} />
            Ask LifeLink AI <Sparkles size={14} className="text-amber-300" />
          </button>
        </div>

        {activeTab === 'community' ? (
          <>
            {/* Search & Action */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search discussions..." 
                  className="w-full bg-[#131B2F] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#8B5CF6] transition-colors text-white"
                />
              </div>
              <button 
                onClick={() => setActiveTab('ai')}
                className="bg-[#8B5CF6] hover:bg-purple-600 text-white px-6 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Plus size={18} /> Ask AI
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]' : 'bg-[#131B2F] border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Post Feed */}
            <div className="flex flex-col gap-4 pb-10">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-[#131B2F] rounded-3xl border border-slate-800">
                  <MessageCircle size={40} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-400">No discussions found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your filters or ask a new question.</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl transition-all hover:border-slate-700 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${post.authorRole === 'Verified Doctor' ? 'bg-[#00C9A7]/20 text-[#00C9A7]' : 'bg-slate-800 text-white'}`}>
                          {post.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{post.author}</span>
                            {post.authorRole === 'Verified Doctor' && (
                              <span className="bg-[#00C9A7]/20 text-[#00C9A7] text-[10px] uppercase font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck size={10} /> Verified
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{post.timeAgo} • {post.category}</span>
                        </div>
                      </div>
                      <button className="text-slate-600 hover:text-slate-300 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed mb-5">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-6 border-t border-slate-800/80 pt-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.isLiked ? 'text-[#8B5CF6]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <ThumbsUp size={16} className={post.isLiked ? "fill-current" : ""} /> {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">
                        <MessageSquare size={16} /> {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors ml-auto">
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <AIResearchTab />
        )}
      </main>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const AIResearchTab = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [steps, setSteps] = useState<RAGStep[]>([]);
  const [result, setResult] = useState<RAGResponse | null>(null);

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = directQuery || query;
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSteps([]);
    setResult(null);

    const res = await simulateRAGPipeline(searchQuery, (updatedSteps) => {
      setSteps([...updatedSteps]);
    });
    
    setResult(res);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="relative">
        <Bot size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B5CF6]" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask any medical question or search community threads..." 
          className="w-full bg-[#131B2F] border-2 border-slate-700/50 rounded-2xl py-5 pl-14 pr-32 focus:outline-none focus:border-[#8B5CF6] transition-colors text-lg text-white shadow-xl"
          disabled={isSearching}
        />
        <button 
          type="submit" 
          disabled={isSearching || !query.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#8B5CF6] hover:bg-purple-600 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          Ask AI
        </button>
      </form>

      {!isSearching && steps.length === 0 && !result && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-sm text-slate-400 font-medium w-full mb-1">Try asking:</span>
          {["What are the early symptoms of dengue?", "How can I prevent high blood pressure?", "What should I do for a mild fever?", "Is vitamin B12 deficiency common?"].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                setQuery(suggestion);
                handleSearch(undefined, suggestion);
              }}
              className="bg-[#131B2F] border border-slate-800 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-slate-300 px-4 py-2 rounded-xl text-sm transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {steps.length > 0 && (
        <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-slate-300 flex items-center gap-2">
            <Loader2 size={18} className="text-[#8B5CF6] animate-spin" /> 
            AI is researching...
          </h3>
          <div className="flex flex-col gap-3 pl-2 border-l-2 border-slate-800 ml-2">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                {step.status === 'pending' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600 bg-transparent" />
                ) : step.status === 'active' ? (
                  <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse" />
                ) : (
                  <CheckCircle size={18} className="text-[#00C9A7]" />
                )}
                <div>
                  <span className={`text-sm font-bold ${step.status === 'complete' ? 'text-slate-400' : 'text-slate-200'}`}>
                    {step.source}
                  </span>
                  <span className={`text-sm ml-2 ${step.status === 'complete' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {step.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[#131B2F] border border-[#8B5CF6]/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#8B5CF6] to-[#00C9A7]" />
          
          <div className="prose prose-invert max-w-none">
            {result.text.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-slate-200 leading-relaxed text-lg mb-4" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>

          {result.sources.length > 0 && (
            <div className="mt-4 pt-6 border-t border-slate-800/80">
              <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} /> Verified Sources
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 flex flex-col">
                    <span className="text-sm font-bold text-slate-300">{src.name}</span>
                    <span className="text-xs text-[#00C9A7] font-medium">{Math.round(src.confidence * 100)}% Confidence Match</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
