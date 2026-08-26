import { useState } from 'react';
import { Search, MapPin, Map } from 'lucide-react';

interface LocationFallbackProps {
  onSearch: (city: string) => void;
  errorMessage?: string;
}

export default function LocationFallback({ onSearch, errorMessage }: LocationFallbackProps) {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in" style={{ minHeight: '60vh' }}>
      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
        <MapPin size={28} className="text-brand" />
      </div>
      
      <h2 className="text-xl font-display font-bold mb-2">Location Required</h2>
      <p className="text-sm text-secondary mb-8 max-w-xs mx-auto">
        We need your location to find nearby hospitals, pharmacies, and dispatch ambulances accurately.
      </p>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-6 w-full max-w-sm">
          {errorMessage}
        </div>
      )}

      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <p className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-4 text-left">
          Enter City Manually
        </p>
        
        <form onSubmit={handleSubmit} className="relative mb-4">
          <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Delhi, Bangalore"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            autoFocus
          />
        </form>
        
        <button 
          onClick={handleSubmit}
          disabled={!city.trim()}
          className="w-full bg-brand text-slate-950 font-bold text-sm py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#20c283] transition-colors flex items-center justify-center gap-2"
        >
          <Search size={16} />
          Search Location
        </button>
      </div>
    </div>
  );
}
