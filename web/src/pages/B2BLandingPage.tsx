import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Pill, ShieldCheck, ChevronRight, Activity, TrendingUp } from 'lucide-react';

const B2BLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity size={28} className="text-[#0ea5e9]" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">LifeLink <span className="text-[#0ea5e9]">Enterprise</span></h1>
        </div>
        <button className="text-sm font-semibold text-slate-500 hover:text-slate-900" onClick={() => navigate('/')}>
          Return to Patient App
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Partner with the Future of Emergency Care</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Monetize your services and save lives by joining the LifeLink AI network.
            Real-time trauma alerting for Hospitals and automated fulfillment for Pharmacies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Hospital ER Desk Card */}
          <div 
            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate('/b2b/hospital')}
          >
            <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={28} className="text-[#0ea5e9]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">Hospital ER Desk</h3>
            <p className="text-slate-600 mb-6">
              Receive automated Pre-Arrival Trauma Alerts. See patient vitals, medical history, and precise ambulance ETAs before they reach your doors.
            </p>
            <div className="flex items-center justify-between text-sm font-semibold text-[#0ea5e9]">
              <span>Enterprise Subscription Required</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pharmacy Network Card */}
          <div 
            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate('/b2b/pharmacy')}
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Pill size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">Pharmacy Fulfillment</h3>
            <p className="text-slate-600 mb-6">
              Connect your local inventory to our AI Pillbox. Receive automated refill requests and earn fulfillment fees directly from our network.
            </p>
            <div className="flex items-center justify-between text-sm font-semibold text-emerald-600">
              <span>Pay-per-fulfillment Model</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <div className="mt-16 bg-slate-900 rounded-3xl p-10 text-white flex items-center justify-between shadow-2xl">
          <div>
            <h3 className="text-3xl font-bold mb-2">HIPAA Compliant. End-to-End Encrypted.</h3>
            <p className="text-slate-400">Join 500+ healthcare institutions already on the network.</p>
          </div>
          <ShieldCheck size={64} className="text-sky-400 opacity-80" />
        </div>
      </main>
    </div>
  );
};

export default B2BLandingPage;
