import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, MapPin, Calendar, Clock, ChevronRight, Activity, 
  Droplets, Heart, FileText, CheckCircle2, Home, Building2, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useGeolocation } from '../hooks/useGeolocation';

const HEALTH_PACKAGES = [
  { id: 'pkg_1', name: 'Full Body Checkup', tests: 84, fasting: '10-12 hrs', price: 1299, originalPrice: 2499, icon: <Activity size={20} className="text-emerald-400" /> },
  { id: 'pkg_2', name: 'Advanced Heart Care', tests: 12, fasting: '10-12 hrs', price: 1499, originalPrice: 2000, icon: <Heart size={20} className="text-rose-400" /> },
  { id: 'pkg_3', name: 'Women\'s Wellness', tests: 45, fasting: 'Not required', price: 999, originalPrice: 1500, icon: <Droplets size={20} className="text-[#3D91FF]" /> },
];

const INDIVIDUAL_TESTS = [
  { id: 't_1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 450 },
  { id: 't_2', name: 'Lipid Profile', category: 'Biochemistry', price: 800 },
  { id: 't_3', name: 'Thyroid Panel (T3, T4, TSH)', category: 'Hormones', price: 650 },
  { id: 't_4', name: 'HbA1c', category: 'Diabetology', price: 500 },
  { id: 't_5', name: 'Vitamin D (25-OH)', category: 'Vitamins', price: 1200 },
];

const DATES = Array.from({ length: 5 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    date: d,
    dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dateStr: d.getDate().toString()
  };
});

const TIME_SLOTS = [
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
];

const LabPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { location } = useGeolocation();
  
  const [query, setQuery] = useState('');
  
  // Booking Modal State
  const [bookingItem, setBookingItem] = useState<any | null>(null);
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('home');
  const [selectedDate, setSelectedDate] = useState<Date>(DATES[0].date);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [isBooking, setIsBooking] = useState(false);
  
  // Vault State
  const [myBookings, setMyBookings] = useState<any[]>([
    { id: 'b_old1', itemName: 'Lipid Profile', date: 'Oct 12, 2023', status: 'Completed', reportUrl: '#' }
  ]);

  const handleBook = async () => {
    if (!bookingItem) return;
    setIsBooking(true);
    
    const payload = {
      id: `lab_ord_${Date.now()}`,
      patient_id: user?.id || `anon_${Date.now()}`,
      patient_name: user?.fullName || 'Guest Patient',
      test_name: bookingItem.name,
      collection_type: collectionType,
      appointment_date: selectedDate.toISOString(),
      appointment_time: selectedTime,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    try {
      await supabase.channel('lab_orders').send({
        type: 'broadcast',
        event: 'incoming_order',
        payload: payload
      });
      
      setTimeout(() => {
        setMyBookings(prev => [{
          id: payload.id,
          itemName: payload.test_name,
          date: `${selectedDate.toLocaleDateString()} at ${selectedTime}`,
          status: 'Phlebotomist Assigned',
          isNew: true
        }, ...prev]);
        setBookingItem(null);
        setIsBooking(false);
        navigate('/tracking/lab');
      }, 800);
      
    } catch (e) {
      console.error(e);
      setIsBooking(false);
      alert('Failed to book test. Please try again.');
    }
  };

  const filteredTests = INDIVIDUAL_TESTS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-24 relative px-6 py-6 ">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight text-white">Diagnostics</h1>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <MapPin size={10} /> {location ? 'Apollo Labs Near You' : 'Locating...'}
          </p>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-6">
        
        {/* WIDGET 1: SEARCH & POPULAR PACKAGES */}
        <section>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full bg-[#131F35] border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#3D91FF]/60 focus:ring-1 focus:ring-[#3D91FF]/50 transition-all text-base shadow-inner"
              placeholder="Search for tests (e.g., CBC, Thyroid)..."
              value={query} onChange={e => setQuery(e.target.value)}
            />
          </div>

          {!query && (
            <>
              <h3 className="text-lg font-bold text-white mb-3 px-1">Popular Health Packages</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1" style={{ scrollSnapType: 'x mandatory' }}>
                {HEALTH_PACKAGES.map(pkg => (
                  <div key={pkg.id} className="min-w-[260px] bg-gradient-to-br from-[#131F35] to-[#0B1121] border border-slate-800 rounded-3xl p-5 flex flex-col relative" style={{ scrollSnapAlign: 'start' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                        {pkg.icon}
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-500/20">
                        SAVE {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-lg mb-1">{pkg.name}</h4>
                    <p className="text-xs font-medium text-[#3D91FF] mb-4">Includes {pkg.tests} Tests</p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <div className="flex items-center gap-1"><Clock size={12} /> Fasting: {pkg.fasting}</div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-lg font-black text-white">₹{pkg.price}</span>
                        <span className="text-[10px] text-slate-500 line-through ml-1">₹{pkg.originalPrice}</span>
                      </div>
                      <button 
                        onClick={() => setBookingItem(pkg)}
                        className="bg-[#3D91FF]/10 text-[#3D91FF] border border-[#3D91FF]/30 font-bold py-1.5 px-4 rounded-xl text-xs active:scale-95 transition-transform"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* INDIVIDUAL TESTS LIST */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-white mb-3 px-1">{query ? 'Search Results' : 'Individual Tests'}</h3>
            <div className="flex flex-col gap-3">
              {filteredTests.map(test => (
                <div key={test.id} className="bg-[#131F35] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{test.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{test.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-white">₹{test.price}</span>
                    <button 
                      onClick={() => setBookingItem(test)}
                      className="text-xs font-bold text-[#3D91FF] bg-[#3D91FF]/10 px-3 py-1 rounded-lg border border-[#3D91FF]/20"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
              {filteredTests.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">No tests found matching "{query}"</p>
              )}
            </div>
          </div>
        </section>

        {/* WIDGET 3: DIGITAL LAB REPORT VAULT */}
        <section className="mt-4">
          <h3 className="text-lg font-bold text-white mb-3 px-1">My Bookings & Reports</h3>
          <div className="flex flex-col gap-3">
            {myBookings.map((bk, i) => (
              <div key={bk.id} className="bg-gradient-to-br from-[#131B2F] to-[#0B1121] border border-slate-800 rounded-3xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
                {bk.isNew && <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg">NEW</div>}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
                    bk.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-[#3D91FF]/10 border-[#3D91FF]/20 text-[#3D91FF]'
                  }`}>
                    {bk.status === 'Completed' ? <FileText size={18} /> : <Activity size={18} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm leading-tight mb-0.5">{bk.itemName}</h4>
                    <p className="text-xs text-slate-400 mb-2">{bk.date}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        bk.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {bk.status}
                      </span>
                    </div>
                  </div>
                  {bk.status === 'Completed' && (
                    <button className="p-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700 transition-colors">
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* WIDGET 2: BOOKING MODAL/DRAWER */}
      {bookingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
          <div className="bg-[#131F35] w-full rounded-t-3xl border-t border-slate-700 shadow-2xl pb-[env(safe-area-inset-bottom,20px)] flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#131F35] rounded-t-3xl z-10">
              <div>
                <h3 className="font-bold text-lg text-white leading-tight">{bookingItem.name}</h3>
                <p className="text-sm font-black text-[#3D91FF]">₹{bookingItem.price}</p>
              </div>
              <button onClick={() => setBookingItem(null)} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <h4 className="text-sm font-bold text-white mb-3">Collection Mode</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => setCollectionType('home')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    collectionType === 'home' 
                      ? 'bg-[#3D91FF]/10 border-[#3D91FF] text-[#3D91FF] shadow-[0_0_15px_rgba(61,145,255,0.15)]' 
                      : 'bg-[#0B1121] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Home size={20} />
                  <span className="text-xs font-bold">Home Collection</span>
                </button>
                <button 
                  onClick={() => setCollectionType('lab')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    collectionType === 'lab' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-[#0B1121] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 size={20} />
                  <span className="text-xs font-bold">Visit Lab Center</span>
                </button>
              </div>

              <h4 className="text-sm font-bold text-white mb-3">Select Date</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-4">
                {DATES.map(d => {
                  const isSelected = selectedDate.getDate() === d.date.getDate();
                  return (
                    <button 
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.date)}
                      className={`min-w-[60px] p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-white border-white text-black shadow-lg shadow-white/10' 
                          : 'bg-[#0B1121] border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">{d.dayStr}</span>
                      <span className="text-xl font-black">{d.dateStr}</span>
                    </button>
                  );
                })}
              </div>

              <h4 className="text-sm font-bold text-white mb-3">Select Time Slot</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TIME_SLOTS.map(t => (
                  <button 
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedTime === t 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-[#0B1121] border-slate-800 text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-[#131F35] sticky bottom-0">
              <button 
                onClick={handleBook}
                disabled={isBooking}
                className="w-full bg-[#3D91FF] text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(61,145,255,0.3)] disabled:opacity-70 disabled:active:scale-100"
              >
                {isBooking ? <Activity className="animate-spin" size={18} /> : <Calendar size={18} />}
                {isBooking ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabPage;
