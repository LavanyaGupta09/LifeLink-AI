import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, Stethoscope, Ambulance, Building2, ShieldCheck, Wrench, 
  ChevronRight, Calendar, FolderHeart, Users, MessageSquare, ClipboardList, 
  CalendarCheck, Radio, Map, Bell, LayoutDashboard, Package, Box, Repeat, 
  Truck, Activity, FileText, Lock, Clock, Heart, HeadphonesIcon, Shield
} from 'lucide-react';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#040814] text-slate-200 font-sans flex flex-col items-center">
      
      {/* TOP HEADER */}
      <header className="w-full px-8 py-6 flex flex-col md:flex-row items-center justify-between z-10 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3D91FF]">
               <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
             </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">LifeLink <span className="text-[#3D91FF]">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Secure • Trusted • Always Here</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 md:mt-0 bg-[#0A1128] rounded-full px-6 py-2 border border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-300 font-medium border-r border-slate-700 pr-4">
            <Shield size={16} className="text-[#3D91FF]" />
            <span>Secure Portal</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#00C9A7]">
            <HeadphonesIcon size={16} />
            <span>24/7 Support</span>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
           <div className="flex items-center gap-2 bg-[#0A1128] border border-slate-800 px-4 py-2 rounded-full text-sm font-medium text-slate-300">
             <div className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse"></div>
             System Status
           </div>
        </div>
      </header>

      {/* CENTERED CONTENT AREA */}
      <div className="flex-1 flex flex-col justify-center items-center w-full py-8">
        
        {/* HERO TITLE */}
        <div className="flex flex-col items-center mb-10 relative z-10 text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Welcome to <span className="text-[#3D91FF]">LifeLink AI</span></h2>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#3D91FF]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#3D91FF]/50" />
            <p className="text-sm font-medium">Who are you? Select your role to enter the <span className="text-[#3D91FF]">secure portal</span>.</p>
            <div className="w-1.5 h-1.5 rounded-full bg-[#3D91FF]/50" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#3D91FF]/50" />
          </div>
        </div>

        {/* ROLES GRID */}
        <main className="w-full max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pb-10">
        
        {/* PATIENT CARD */}
        <div className="bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex flex-col h-[300px] group border border-[#00C9A7]/20 hover:border-[#00C9A7]/60 hover:shadow-[0_0_30px_rgba(0,201,167,0.15)] transition-all duration-300 cursor-pointer" onClick={() => navigate('/login')}>
          <div className="absolute right-0 bottom-12 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none origin-bottom-right">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B1221] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent z-10" />
            <img src="/images/role_patient.jpg" alt="Patient Family" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-500 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
          </div>
          <div className="relative z-20 w-3/5 flex-1">
            <div className="w-14 h-14 bg-[#00C9A7] rounded-full flex items-center justify-center text-[#0B1221] mb-3 shadow-[0_0_20px_rgba(0,201,167,0.3)]">
              <Users size={26} />
            </div>
            <h3 className="text-2xl font-bold text-[#00C9A7] mb-1">Patient / Family</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Access healthcare services, manage family health profiles and much more.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 border border-[#00C9A7]/30 text-[#00C9A7] bg-[#00C9A7]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Calendar size={14}/> Book Services</span>
              <span className="flex items-center gap-1.5 border border-[#00C9A7]/30 text-[#00C9A7] bg-[#00C9A7]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><FolderHeart size={14}/> Health Records</span>
            </div>
            <button className="w-full bg-[#00C9A7] hover:bg-[#00B092] text-[#0B1221] py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors">
              Enter as Patient / Family <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* DOCTOR CARD */}
        <div className="bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex flex-col h-[300px] group border border-[#3B82F6]/20 hover:border-[#3B82F6]/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer" onClick={() => navigate('/b2b/auth?role=doctor')}>
          <div className="absolute right-0 bottom-12 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none origin-bottom-right">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B1221] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent z-10" />
            <img src="/images/role_doctor.jpg" alt="Doctor" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-500 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
          </div>
          <div className="relative z-20 w-3/5 flex-1">
            <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Stethoscope size={26} />
            </div>
            <h3 className="text-2xl font-bold text-[#3B82F6] mb-1">Doctor</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Provide consultations, respond to patients, and manage your practice efficiently.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 border border-[#3B82F6]/30 text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><MessageSquare size={14}/> Consultations</span>
              <span className="flex items-center gap-1.5 border border-[#3B82F6]/30 text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><ClipboardList size={14}/> Patient Records</span>
            </div>
            <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors">
              Enter as Doctor <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* FIRST RESPONDER CARD */}
        <div className="bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex flex-col h-[300px] group border border-[#F97316]/20 hover:border-[#F97316]/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all duration-300 cursor-pointer" onClick={() => navigate('/b2b/auth?role=first_responder')}>
          <div className="absolute right-0 bottom-12 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none origin-bottom-right">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B1221] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent z-10" />
            <img src="/images/role_responder.jpg" alt="First Responder" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-500 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
          </div>
          <div className="relative z-20 w-3/5 flex-1">
            <div className="w-14 h-14 bg-[#F97316] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <Ambulance size={26} />
            </div>
            <h3 className="text-2xl font-bold text-[#F97316] mb-1">First Responder</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Respond to emergencies, receive dispatches, and save lives.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 border border-[#F97316]/30 text-[#F97316] bg-[#F97316]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Radio size={14}/> Live Dispatches</span>
              <span className="flex items-center gap-1.5 border border-[#F97316]/30 text-[#F97316] bg-[#F97316]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Map size={14}/> GPS Routing</span>
            </div>
            <button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors">
              Enter as First Responder <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* FACILITY PARTNER CARD */}
        <div className="bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex flex-col h-[300px] group border border-[#A855F7]/20 hover:border-[#A855F7]/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer" onClick={() => navigate('/b2b/auth?role=hospital_admin')}>
          <div className="absolute right-0 bottom-12 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none origin-bottom-right">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B1221] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent z-10" />
            <img src="/images/role_facility.jpg" alt="Facility Partner" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-500 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
          </div>
          <div className="relative z-20 w-3/5 flex-1">
            <div className="w-14 h-14 bg-[#A855F7] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Building2 size={26} />
            </div>
            <h3 className="text-2xl font-bold text-[#A855F7] mb-1">Facility Partner</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Manage hospital, lab, or pharmacy operations and inventory with ease.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 border border-[#A855F7]/30 text-[#A855F7] bg-[#A855F7]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><LayoutDashboard size={14}/> Dashboard</span>
              <span className="flex items-center gap-1.5 border border-[#A855F7]/30 text-[#A855F7] bg-[#A855F7]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Package size={14}/> Inventory</span>
            </div>
            <button className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors">
              Enter as Facility Partner <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* EQUIPMENT PROVIDER CARD */}
        <div className="bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex flex-col h-[300px] group border border-[#06B6D4]/20 hover:border-[#06B6D4]/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer" onClick={() => navigate('/b2b/auth?role=equipment')}>
          <div className="absolute right-0 bottom-12 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none origin-bottom-right">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B1221] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent z-10" />
            <img src="/images/role_equipment.jpg" alt="Equipment Provider" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-500 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
          </div>
          <div className="relative z-20 w-3/5 flex-1">
            <div className="w-14 h-14 bg-[#06B6D4] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Wrench size={26} />
            </div>
            <h3 className="text-2xl font-bold text-[#06B6D4] mb-1">Equipment Provider</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Manage medical equipment, track rentals, and handle deliveries.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 border border-[#06B6D4]/30 text-[#06B6D4] bg-[#06B6D4]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Box size={14}/> Inventory</span>
              <span className="flex items-center gap-1.5 border border-[#06B6D4]/30 text-[#06B6D4] bg-[#06B6D4]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Repeat size={14}/> Rentals</span>
            </div>
            <button className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors">
              Enter as Equipment Provider <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* SYSTEM ADMINISTRATOR CARD */}
        <div className="bg-[#0B1221] rounded-3xl p-6 relative overflow-hidden flex flex-col h-[300px] group border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300 cursor-pointer" onClick={() => navigate('/admin/login')}>
          <div className="absolute right-0 bottom-12 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none origin-bottom-right">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B1221] z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent z-10" />
            <img src="/images/role_admin.jpg" alt="System Administrator" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-500 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
          </div>
          <div className="relative z-20 w-3/5 flex-1">
            <div className="w-14 h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <ShieldCheck size={26} />
            </div>
            <h3 className="text-2xl font-bold text-[#8B5CF6] mb-1">System Administrator</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Manage users, verify providers, and monitor system activity securely.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 border border-[#8B5CF6]/30 text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Users size={14}/> Users</span>
              <span className="flex items-center gap-1.5 border border-[#8B5CF6]/30 text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full text-xs font-semibold"><Activity size={14}/> System</span>
            </div>
            <button className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors">
              Enter as Administrator <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[#070D18] py-8 border-t border-slate-800 shrink-0">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 shrink-0 rounded-full border border-[#00C9A7]/30 flex items-center justify-center text-[#00C9A7] bg-[#00C9A7]/5">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-0.5">Secure & Private</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Your data is encrypted and always protected.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 shrink-0 rounded-full border border-[#3D91FF]/30 flex items-center justify-center text-[#3D91FF] bg-[#3D91FF]/5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-0.5">Verified & Trusted</h4>
              <p className="text-slate-400 text-xs leading-relaxed">All providers are verified for your safety.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 shrink-0 rounded-full border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] bg-[#A855F7]/5">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-0.5">Always Accessible</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Services and support available 24/7.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 shrink-0 rounded-full border border-[#F43F5E]/30 flex items-center justify-center text-[#F43F5E] bg-[#F43F5E]/5">
              <Heart size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-0.5">Care That Connects</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Bringing healthcare and people closer, every day.</p>
            </div>
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default RoleSelectionPage;
