import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, ShieldCheck, Clock, Package, X, ChevronRight, Heart, Sparkles, Filter, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import {
  EQUIPMENT_CATALOG,
  RENTAL_DURATIONS,
  MOCK_RENTALS,
  type Equipment,
  type EquipmentCategory,
} from '../data/equipmentData';

type Mode = 'rent' | 'buy';
type CategoryFilter = 'All' | EquipmentCategory;

interface CheckoutState {
  equipment: Equipment | null;
  mode: Mode;
  duration: string;
  address: string;
  step: 'details' | 'payment' | 'confirmed';
}

const CATEGORY_FILTERS: { label: string; value: CategoryFilter; emoji: string }[] = [
  { label: 'All', value: 'All', emoji: '✨' },
  { label: 'Home Recovery', value: 'Home Recovery', emoji: '🛏️' },
  { label: 'Respiratory', value: 'Respiratory', emoji: '🫁' },
  { label: 'Patient Care', value: 'Patient Care', emoji: '💓' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available: { label: '🟢 Available', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  rented: { label: '🟡 Rented Out', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  sold: { label: '🔵 Sold', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  maintenance: { label: '🔴 Maintenance', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const EquipmentMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('rent');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);
  const [showSpecs, setShowSpecs] = useState<string | null>(null);

  // My active rentals (mock — in real app, filter by user)
  const myRentals = MOCK_RENTALS.filter(r => r.status === 'active' || r.status === 'overdue').slice(0, 2);

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return EQUIPMENT_CATALOG.filter(eq => {
      const matchesCategory = category === 'All' || eq.category === category;
      const matchesSearch = !searchQuery ||
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, searchQuery]);

  const openCheckout = (equipment: Equipment, purchaseMode: Mode) => {
    setCheckout({
      equipment,
      mode: purchaseMode,
      duration: '1m',
      address: '',
      step: 'details',
    });
  };

  const getPrice = (eq: Equipment, dur: string) => {
    const duration = RENTAL_DURATIONS.find(d => d.value === dur);
    return Math.round(eq.rentPrice * (duration?.multiplier || 1));
  };

  const handleConfirmPayment = () => {
    setCheckout(prev => prev ? { ...prev, step: 'confirmed' } : null);
    setTimeout(() => {
      setCheckout(null);
      navigate('/tracking/equipment');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-[#060B14] text-white font-sans flex flex-col pb-24 px-0 py-0">

      {/* ═══════════════════════════════════════════
          STICKY HEADER
          ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center gap-4">
        <button
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Medical Equipment</h1>
          <p className="text-xs text-cyan-400 font-medium flex items-center gap-1">
            <Package size={10} /> Rent or Buy • Home Delivery & Setup
          </p>
        </div>
        <div className="relative">
          <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white active:scale-95 transition-transform">
            <Sparkles size={18} className="text-cyan-400" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-5">

        {/* ═══════════════════════════════════════════
            SEARCH BAR
            ═══════════════════════════════════════════ */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full bg-[#131B2F] border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
            placeholder="Search equipment, brands..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ═══════════════════════════════════════════
            CATEGORY FILTER PILLS
            ═══════════════════════════════════════════ */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 border ${
                category === cat.value
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                  : 'bg-[#131B2F] text-slate-400 border-slate-800 hover:border-slate-600'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            RENT / BUY TOGGLE
            ═══════════════════════════════════════════ */}
        <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-1.5 flex relative">
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 transition-all duration-300 ease-out"
            style={{
              left: mode === 'rent' ? '6px' : '50%',
              width: 'calc(50% - 8px)',
            }}
          />
          <button
            onClick={() => setMode('rent')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors relative z-10 flex items-center justify-center gap-2 ${
              mode === 'rent' ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            <Clock size={16} /> Rent Equipment
          </button>
          <button
            onClick={() => setMode('buy')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors relative z-10 flex items-center justify-center gap-2 ${
              mode === 'buy' ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            <Package size={16} /> Buy Equipment
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            MY ACTIVE RENTALS (if any)
            ═══════════════════════════════════════════ */}
        {myRentals.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" /> My Active Rentals
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {myRentals.map(rental => (
                <div
                  key={rental.id}
                  className={`min-w-[280px] bg-gradient-to-br from-[#131B2F] to-[#0B1121] border rounded-2xl p-4 relative overflow-hidden flex-shrink-0 ${
                    rental.status === 'overdue' ? 'border-rose-500/40' : 'border-slate-800'
                  }`}
                >
                  {rental.status === 'overdue' && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{rental.equipmentEmoji}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{rental.equipmentName}</h4>
                      <p className="text-xs text-slate-400">₹{rental.monthlyRate.toLocaleString()}/mo</p>
                    </div>
                    {rental.status === 'overdue' ? (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle size={10} /> OVERDUE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-lg">
                        {rental.daysRemaining}d left
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-xl active:scale-95 transition-transform">
                      Extend Rental
                    </button>
                    <button className="flex-1 py-2 text-xs font-bold text-slate-300 bg-slate-800/50 border border-slate-700 rounded-xl active:scale-95 transition-transform">
                      Schedule Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
            EQUIPMENT CATALOG
            ═══════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {filteredEquipment.length} Equipment{filteredEquipment.length !== 1 ? 's' : ''} Available
            </h3>
            <button className="flex items-center gap-1 text-xs text-slate-500 font-bold">
              <Filter size={12} /> Sort
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {filteredEquipment.map(eq => {
              const statusCfg = STATUS_CONFIG[eq.status];
              const isAvailable = eq.status === 'available';

              return (
                <div
                  key={eq.id}
                  className="bg-gradient-to-br from-[#131B2F] to-[#0D1626] border border-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all"
                >
                  {/* Glow accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Status badge */}
                  <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}>
                    {statusCfg.label}
                  </div>

                  {/* Top row: emoji + details */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#0B1121] border border-slate-800 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                      {eq.emoji}
                    </div>
                    <div className="flex-1 pr-20">
                      <h4 className="font-bold text-white text-base leading-tight mb-1">{eq.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mb-2">{eq.brand} • {eq.category}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star size={11} fill="#FFA502" color="#FFA502" />
                          <span className="text-xs font-bold text-white">{eq.rating}</span>
                        </div>
                        <span className="text-xs text-slate-600">({eq.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Description (truncated) */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{eq.description}</p>

                  {/* Specs toggle */}
                  <button
                    onClick={() => setShowSpecs(showSpecs === eq.id ? null : eq.id)}
                    className="text-[11px] font-bold text-cyan-400 mb-3 flex items-center gap-1 hover:text-cyan-300 transition-colors"
                  >
                    {showSpecs === eq.id ? 'Hide Specs' : 'View Specs'}
                    <ChevronRight size={12} className={`transition-transform ${showSpecs === eq.id ? 'rotate-90' : ''}`} />
                  </button>

                  {showSpecs === eq.id && (
                    <div className="bg-[#0B1121] rounded-xl p-3 border border-slate-800/50 mb-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        {eq.specs.map((spec, i) => (
                          <p key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                            {spec}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price row */}
                  <div className="bg-[#0B1121] rounded-2xl p-4 border border-slate-800/50 mb-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                          {mode === 'rent' ? 'Rental Price' : 'Purchase Price'}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">
                            ₹{mode === 'rent' ? eq.rentPrice.toLocaleString() : eq.buyPrice.toLocaleString()}
                          </span>
                          {mode === 'rent' && <span className="text-xs text-slate-500 font-medium">/month</span>}
                        </div>
                      </div>
                      {mode === 'rent' ? (
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-medium">Security Deposit</p>
                          <p className="text-sm font-bold text-amber-400">₹{eq.securityDeposit.toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-bold">{eq.warranty}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Insurance advisory */}
                  {eq.insuranceAdvisory && (
                    <div className="flex items-center gap-2 mb-4 bg-purple-500/5 border border-purple-500/20 rounded-xl px-3 py-2">
                      <Heart size={12} className="text-purple-400 shrink-0" />
                      <span className="text-[10px] text-purple-300 font-medium">May be covered under health insurance reimbursement</span>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => isAvailable && openCheckout(eq, mode)}
                    disabled={!isAvailable}
                    className={`w-full py-3.5 rounded-2xl font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-sm ${
                      isAvailable
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-600/20'
                        : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        {mode === 'rent' ? <Clock size={16} /> : <Package size={16} />}
                        {mode === 'rent' ? 'Rent Now' : 'Buy Now'}
                      </>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            RECOVERY PLAN CTA
            ═══════════════════════════════════════════ */}
        <div
          className="bg-gradient-to-br from-[#131B2F] to-[#0B1121] border border-cyan-500/20 rounded-3xl p-5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate('/physiotherapy/recovery')}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center">
              <Sparkles size={22} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-0.5">Recovery Plan Equipment</h3>
              <p className="text-xs text-slate-400">View equipment recommended in your recovery plan</p>
            </div>
            <ChevronRight size={20} className="text-slate-600" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          CHECKOUT BOTTOM SHEET (OVERLAY)
          ═══════════════════════════════════════════ */}
      {checkout && checkout.equipment && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => checkout.step !== 'confirmed' && setCheckout(null)}
          />

          {/* Sheet */}
          <div className="relative bg-[#0D1626] border-t border-slate-800 rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>

            <div className="px-6 pb-8">
              {/* Confirmed state */}
              {checkout.step === 'confirmed' && (
                <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-black text-white mb-2">Order Confirmed!</h2>
                  <p className="text-sm text-slate-400 text-center">Redirecting to live tracking...</p>
                </div>
              )}

              {/* Details / Payment */}
              {checkout.step !== 'confirmed' && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-white">
                      {checkout.step === 'details' ? 'Order Details' : 'Confirm Payment'}
                    </h2>
                    <button
                      onClick={() => setCheckout(null)}
                      className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Equipment summary */}
                  <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-4 flex items-center gap-4 mb-5">
                    <span className="text-3xl">{checkout.equipment.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">{checkout.equipment.name}</h3>
                      <p className="text-xs text-slate-400">{checkout.equipment.brand}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 uppercase font-bold">{checkout.mode}</span>
                    </div>
                  </div>

                  {checkout.step === 'details' && (
                    <>
                      {/* Rent: Duration selector */}
                      {checkout.mode === 'rent' && (
                        <div className="mb-5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                            Rental Duration
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {RENTAL_DURATIONS.map(dur => (
                              <button
                                key={dur.value}
                                onClick={() => setCheckout(prev => prev ? { ...prev, duration: dur.value } : null)}
                                className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                                  checkout.duration === dur.value
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    : 'bg-[#131B2F] text-slate-400 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {dur.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      <div className="mb-5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                          Delivery Address
                        </label>
                        <textarea
                          className="w-full bg-[#131B2F] border border-slate-700/50 rounded-2xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm resize-none h-20"
                          placeholder="Enter full delivery address..."
                          value={checkout.address}
                          onChange={e => setCheckout(prev => prev ? { ...prev, address: e.target.value } : null)}
                        />
                      </div>

                      {/* Price breakdown */}
                      <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            {checkout.mode === 'rent'
                              ? `Rental (${RENTAL_DURATIONS.find(d => d.value === checkout.duration)?.label})`
                              : 'Equipment Price'}
                          </span>
                          <span className="text-white font-bold">
                            ₹{checkout.mode === 'rent'
                              ? getPrice(checkout.equipment, checkout.duration).toLocaleString()
                              : checkout.equipment.buyPrice.toLocaleString()}
                          </span>
                        </div>
                        {checkout.mode === 'rent' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Security Deposit (Refundable)</span>
                            <span className="text-amber-400 font-bold">₹{checkout.equipment.securityDeposit.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Delivery & Setup</span>
                          <span className="text-emerald-400 font-bold">FREE</span>
                        </div>
                        <div className="border-t border-slate-800 pt-3 flex justify-between text-base">
                          <span className="text-white font-bold">Total Payable</span>
                          <span className="text-cyan-400 font-black text-xl">
                            ₹{(
                              (checkout.mode === 'rent'
                                ? getPrice(checkout.equipment, checkout.duration) + checkout.equipment.securityDeposit
                                : checkout.equipment.buyPrice)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Buy: warranty info */}
                      {checkout.mode === 'buy' && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
                          <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-emerald-400">{checkout.equipment.warranty}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">7-day return policy • Free installation included</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setCheckout(prev => prev ? { ...prev, step: 'payment' } : null)}
                        className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-600/20 active:scale-[0.97] transition-transform text-sm flex items-center justify-center gap-2"
                      >
                        Proceed to Payment <ChevronRight size={16} />
                      </button>
                    </>
                  )}

                  {checkout.step === 'payment' && (
                    <>
                      {/* Payment summary */}
                      <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-5 mb-5">
                        <h4 className="text-sm font-bold text-white mb-4">Payment Summary</h4>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Amount</span>
                            <span className="text-white font-bold">
                              ₹{(
                                checkout.mode === 'rent'
                                  ? getPrice(checkout.equipment, checkout.duration) + checkout.equipment.securityDeposit
                                  : checkout.equipment.buyPrice
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Delivery Address</span>
                            <span className="text-slate-300 text-right max-w-[60%]">{checkout.address || 'Not specified'}</span>
                          </div>
                        </div>

                        {/* Mock payment methods */}
                        <div className="space-y-2">
                          {['UPI / Google Pay', 'Credit / Debit Card', 'Net Banking'].map((method, i) => (
                            <button
                              key={method}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                i === 0
                                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                  : 'bg-[#0B1121] border-slate-800 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                i === 0 ? 'border-cyan-500' : 'border-slate-700'
                              }`}>
                                {i === 0 && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />}
                              </div>
                              <span className="text-sm font-bold">{method}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Delivery info */}
                      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
                        <Truck size={20} className="text-cyan-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-cyan-300">Estimated Delivery: Within 24-48 hours</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Includes professional setup & installation</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setCheckout(prev => prev ? { ...prev, step: 'details' } : null)}
                          className="flex-1 py-4 rounded-2xl font-bold bg-slate-800 text-slate-300 active:scale-[0.97] transition-transform text-sm"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleConfirmPayment}
                          className="flex-[2] py-4 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.97] transition-transform text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Confirm & Pay
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-up animation style */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default EquipmentMarketplace;
