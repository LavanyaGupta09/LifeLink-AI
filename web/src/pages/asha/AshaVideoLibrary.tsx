import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Download, Wifi } from 'lucide-react';

interface VideoItem {
  id: string;
  emoji: string;
  title: string;
  duration: string;
  color: string;
}

const videos: VideoItem[] = [
  {
    id: 'v1',
    emoji: '🐍',
    title: 'Saanp kaatne par kya karein?',
    duration: '15 sec',
    color: '#2ED573',
  },
  {
    id: 'v2',
    emoji: '☀️',
    title: 'Loo lagne par kya karein?',
    duration: '20 sec',
    color: '#F97316',
  },
  {
    id: 'v3',
    emoji: '❤️',
    title: 'Heart attack / CPR',
    duration: '25 sec',
    color: '#FF4757',
  },
  {
    id: 'v4',
    emoji: '🔥',
    title: 'Jalne par kya karein?',
    duration: '20 sec',
    color: '#F59E0B',
  },
  {
    id: 'v5',
    emoji: '🤰',
    title: 'Delivery mein dikkat aaye toh?',
    duration: '30 sec',
    color: '#EC4899',
  },
  {
    id: 'v6',
    emoji: '💧',
    title: 'Dast / Dehydration mein kya karein?',
    duration: '15 sec',
    color: '#3B82F6',
  },
];

const AshaVideoLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    setPlayingId(id);
    // Demo: show playing state for a moment
    setTimeout(() => setPlayingId(null), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
      {/* Header */}
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Emergency Videos</h1>
          <p className="text-[10px] text-textSecondary">Zaruri videos — Offline bhi chalega</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Offline Badge */}
        <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/20 rounded-xl p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-[#00C9A7]" />
            <span className="text-xs font-bold text-[#00C9A7]">Video offline bhi chalega</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download size={12} className="text-textSecondary" />
            <span className="text-[10px] text-textSecondary">2-5 MB total</span>
          </div>
        </div>

        {/* Video Cards */}
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => handlePlay(video.id)}
              className="w-full bg-background border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-border transition-all text-left active:scale-[0.98] group"
            >
              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{ backgroundColor: `${video.color}15`, borderColor: `${video.color}30`, borderWidth: '1px', borderStyle: 'solid' }}
              >
                {playingId === video.id ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full animate-pulse"
                        style={{
                          height: `${12 + i * 4}px`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-3xl">{video.emoji}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-textPrimary mb-1 leading-snug">{video.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-textTertiary bg-surface px-2 py-0.5 rounded-full">
                    ⏱ {video.duration}
                  </span>
                </div>
              </div>

              {/* Play button */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: video.color }}
              >
                {playingId === video.id ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={18} className="text-textPrimary ml-0.5" fill="white" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="bg-card border border-border rounded-xl p-4 mt-6 text-center">
          <p className="text-[10px] text-textTertiary leading-relaxed">
            ⚠️ Yeh videos sirf pehli madad ke liye hain.<br />
            Gambhir sthiti mein hamesha <strong className="text-textPrimary">doctor se milein</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AshaVideoLibrary;
