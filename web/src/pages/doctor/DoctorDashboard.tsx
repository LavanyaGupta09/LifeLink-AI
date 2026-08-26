import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Clock, Wallet, Users, Video, FileText,
  Upload, Calendar, Star, ChevronRight, MessageSquare, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 w-full">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Doctor Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white font-bold transition text-sm flex items-center gap-2">
          <LogOut size={16} />Logout
        </button>
      </div>
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Stat 1 */}
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Today's Consultations</p>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-black text-white">18</h3>
            <div className="flex flex-col items-end">
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp size={12} /> 12% vs yesterday
              </span>
              <div className="w-16 h-8 mt-2 opacity-50 flex items-end gap-1">
                 {/* Fake Sparkline */}
                 <div className="w-2 bg-emerald-500 h-2 rounded-t-sm"></div>
                 <div className="w-2 bg-emerald-500 h-4 rounded-t-sm"></div>
                 <div className="w-2 bg-emerald-500 h-3 rounded-t-sm"></div>
                 <div className="w-2 bg-emerald-500 h-6 rounded-t-sm"></div>
                 <div className="w-2 bg-emerald-500 h-5 rounded-t-sm"></div>
                 <div className="w-2 bg-emerald-500 h-8 rounded-t-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div 
          onClick={() => navigate('/doctor/on-call')}
          className="bg-gradient-to-br from-[#1a1c3a] to-[#0f1123] border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500 transition-all cursor-pointer shadow-lg shadow-purple-500/5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <p className="text-sm text-slate-300 font-medium mb-1 relative z-10">Pending Consultations</p>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-black text-white">3</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Clock size={20} className="text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            View waiting patients <ChevronRight size={14} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Today's Earnings</p>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-black text-white">₹ 8,450</h3>
            <div className="flex flex-col items-end">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                <Wallet size={20} className="text-blue-400" />
              </div>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp size={12} /> 18% vs yesterday
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Total Patients</p>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-black text-white">1,245</h3>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users size={20} className="text-amber-400" />
            </div>
          </div>
          <div 
            onClick={() => navigate('/doctor/patients')}
            className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform cursor-pointer"
          >
            View all patients <ChevronRight size={14} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (2 spans) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Live Consultations Panel */}
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Live Consultations
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs ml-2">3 Waiting</span>
              </h3>
              <button onClick={() => navigate('/doctor/consultations')} className="text-sm font-bold text-blue-400 hover:text-blue-300">View All</button>
            </div>
            
            <div className="flex-1 custom-scrollbar pr-2 space-y-4 relative">
              {[
                { name: 'Priya Sharma', age: 28, gender: 'Female', symptoms: 'Fever, Headache', time: '04:32' },
                { name: 'Rahul Verma', age: 35, gender: 'Male', symptoms: 'Cold, Cough', time: '03:15' },
                { name: 'Anita Joshi', age: 60, gender: 'Female', symptoms: 'BP Checkup', time: '01:47' }
              ].map((patient, i) => (
                <div key={i} className="flex items-center justify-between bg-[#0B1121] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                    <div>
                      <h4 className="text-white font-bold">{patient.name}</h4>
                      <p className="text-slate-400 text-xs">{patient.age} • {patient.gender}</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <p className="text-slate-300 text-sm font-medium">{patient.symptoms}</p>
                    <p className="text-emerald-400 text-xs font-medium">Waiting for {patient.time}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors">
                      <MessageSquare size={18} />
                    </button>
                    <button onClick={() => navigate('/doctor/on-call')} className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors">
                      <Video size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/doctor/on-call')} className="w-full mt-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              Go to Consultation Room <ChevronRight size={16} />
            </button>
          </div>

        </div>

        {/* Right Column (1 span) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Today's Schedule Panel */}
          <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" /> Today's Schedule
              </h3>
              <button onClick={() => navigate('/doctor/scheduled')} className="text-sm font-bold text-blue-400 hover:text-blue-300">View Calendar</button>
            </div>

            <div className="flex-1 custom-scrollbar pr-2 relative">
               <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800"></div>
               
               {[
                 { time: '10:00 AM', name: 'Sneha Patel', type: 'Follow-up Consultation', status: 'Completed' },
                 { time: '11:30 AM', name: 'Vikram Singh', type: 'Diabetes Consultation', status: 'Completed' },
                 { time: '01:00 PM', name: 'Amit Kumar', type: 'General Checkup', status: 'Upcoming' },
                 { time: '02:30 PM', name: 'Neha Gupta', type: 'Thyroid Consultation', status: 'Upcoming' },
                 { time: '04:00 PM', name: 'Rajesh Mehta', type: 'Chest Pain Consultation', status: 'Upcoming' },
               ].map((apt, i) => (
                 <div key={i} className="flex gap-4 mb-6 relative">
                   <div className="w-12 text-right shrink-0 relative z-10 bg-[#131F35] py-1">
                     <span className="text-xs font-bold text-slate-400">{apt.time}</span>
                   </div>
                   <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 relative z-10 ${apt.status === 'Completed' ? 'bg-slate-600 border-2 border-[#131F35]' : 'bg-blue-500 border-2 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
                   <div className="flex-1 bg-[#0B1121] p-3 rounded-xl border border-slate-800">
                     <div className="flex justify-between items-start">
                       <h4 className="text-white font-bold text-sm">{apt.name}</h4>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${apt.status === 'Completed' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-400'}`}>
                         {apt.status}
                       </span>
                     </div>
                     <p className="text-slate-500 text-xs mt-1">{apt.type}</p>
                   </div>
                 </div>
               ))}
            </div>

            <button onClick={() => navigate('/doctor/scheduled')} className="w-full mt-2 py-2 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors">
              View Full Schedule <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Patient Overview Chart (Mock) */}
        <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-white">Patient Overview</h3>
             <select className="bg-transparent text-xs text-slate-400 outline-none cursor-pointer">
               <option>This Month</option>
               <option>Last Month</option>
             </select>
           </div>
           <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6">
             <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
               {/* Mock Donut Chart using SVG */}
               <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="20" />
                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="125.6" className="drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="170.6" strokeDashoffset="200" transform="rotate(180 50 50)" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <span className="text-xl font-black text-white leading-none">248</span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
               </div>
             </div>
             <div className="flex-1 space-y-3">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-xs text-slate-300">New Patients</span>
                 </div>
                 <p className="text-sm font-bold text-white pl-4">128 (52%)</p>
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                   <span className="text-xs text-slate-300">Returning Patients</span>
                 </div>
                 <p className="text-sm font-bold text-white pl-4">96 (39%)</p>
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                   <span className="text-xs text-slate-300">Follow-ups</span>
                 </div>
                 <p className="text-sm font-bold text-white pl-4">24 (9%)</p>
               </div>
             </div>
           </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-white">Recent Reviews</h3>
             <button onClick={() => navigate('/doctor/reviews')} className="text-xs font-bold text-blue-400 hover:text-blue-300">View All</button>
           </div>
           
           <div className="space-y-4">
             <div className="border-b border-slate-800 pb-4">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-3">
                   <img src="https://i.pravatar.cc/100?img=5" alt="user" className="w-8 h-8 rounded-full border border-slate-700" />
                   <div>
                     <h4 className="text-white font-bold text-sm leading-none">Pooja Mehta</h4>
                     <div className="flex text-amber-500 text-[10px] mt-1">
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <span className="text-slate-400 ml-1">5.0</span>
                     </div>
                   </div>
                 </div>
               </div>
               <p className="text-slate-400 text-xs line-clamp-2">"Very helpful and explained everything clearly. Thank you doctor!"</p>
               <p className="text-[10px] text-slate-500 mt-2 text-right">2 days ago</p>
             </div>
             <div>
               <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-3">
                   <img src="https://i.pravatar.cc/100?img=8" alt="user" className="w-8 h-8 rounded-full border border-slate-700" />
                   <div>
                     <h4 className="text-white font-bold text-sm leading-none">Arjun Singh</h4>
                     <div className="flex text-amber-500 text-[10px] mt-1">
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <Star size={10} fill="currentColor"/>
                       <span className="text-slate-400 ml-1">5.0</span>
                     </div>
                   </div>
                 </div>
               </div>
               <p className="text-slate-400 text-xs line-clamp-2">"Great experience, very professional and kind."</p>
               <p className="text-[10px] text-slate-500 mt-2 text-right">5 days ago</p>
             </div>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-6">
           <h3 className="font-bold text-white mb-6">Quick Actions</h3>
           
           <div className="grid grid-cols-2 gap-4">
             <button onClick={() => navigate('/doctor/prescriptions')} className="bg-[#0B1121] hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
               <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <FileText size={20} className="text-purple-400" />
               </div>
               <span className="text-white font-bold text-xs">Create<br/>Prescription</span>
             </button>
             
             <button onClick={() => navigate('/doctor/medical-records')} className="bg-[#0B1121] hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
               <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <Upload size={20} className="text-blue-400" />
               </div>
               <span className="text-white font-bold text-xs">Upload<br/>Report</span>
             </button>

             <button onClick={() => navigate('/doctor/patients')} className="bg-[#0B1121] hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <Users size={20} className="text-emerald-400" />
               </div>
               <span className="text-white font-bold text-xs">Patient<br/>Directory</span>
             </button>

             <button onClick={() => navigate('/doctor/settings')} className="bg-[#0B1121] hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
               <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <Clock size={20} className="text-amber-400" />
               </div>
               <span className="text-white font-bold text-xs">Update<br/>Availability</span>
             </button>
           </div>
        </div>

      </div>

    </div>
  );
}
