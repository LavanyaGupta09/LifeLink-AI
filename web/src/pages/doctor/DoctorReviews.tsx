import React from 'react';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';

export default function DoctorReviews() {
  const reviews = [
    { name: 'Priya Sharma', date: '2 days ago', rating: 5, comment: 'Very helpful and explained everything clearly. Thank you doctor!' },
    { name: 'Arjun Singh', date: '5 days ago', rating: 5, comment: 'Great experience, very professional and kind.' },
    { name: 'Neha Gupta', date: '1 week ago', rating: 4, comment: 'Good consultation, but had to wait 5 minutes.' },
    { name: 'Amit Kumar', date: '2 weeks ago', rating: 5, comment: 'Doctor was very patient and prescribed exactly what was needed for my quick recovery.' },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Star className="text-amber-400" /> Patient Reviews
        </h2>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Read feedback from your past consultations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Rating Summary */}
        <div className="md:col-span-1">
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Rating</h3>
            <div className="text-5xl font-black text-white mb-2">4.8</div>
            <div className="flex justify-center text-amber-500 mb-2">
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">Based on 124 reviews</p>
            
            <div className="mt-8 space-y-3">
              {[5, 4, 3, 2, 1].map(num => (
                <div key={num} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-2">{num}</span>
                  <div className="flex-1 h-2 bg-[#0B1121] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: num === 5 ? '85%' : num === 4 ? '10%' : '2%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-3 space-y-4">
          {reviews.map((r, i) => (
            <div key={i} className="bg-[#131F35] border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <img src={`https://i.pravatar.cc/100?img=${i + 5}`} alt={r.name} className="w-10 h-10 rounded-full border border-slate-700" />
                  <div>
                    <h4 className="text-white font-bold">{r.name}</h4>
                    <p className="text-slate-500 text-xs">{r.date}</p>
                  </div>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} fill={idx < r.rating ? 'currentColor' : 'none'} className={idx >= r.rating ? 'text-slate-600' : ''} />
                  ))}
                </div>
              </div>
              <p className="text-slate-300 text-sm">{r.comment}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-4">
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold transition-colors">
                  <ThumbsUp size={14} /> Helpful
                </button>
                <button className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors">
                  <MessageCircle size={14} /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
