import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, MapPin, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorScheduled() {
  const navigate = useNavigate();
  
  const schedule = [
    { time: '10:00 AM', name: 'Sneha Patel', type: 'Follow-up Consultation', mode: 'Video Call', status: 'Completed', duration: '30 min' },
    { time: '11:30 AM', name: 'Vikram Singh', type: 'Diabetes Consultation', mode: 'In-Person', status: 'Completed', duration: '45 min' },
    { time: '01:00 PM', name: 'Amit Kumar', type: 'General Checkup', mode: 'Video Call', status: 'Upcoming', duration: '30 min' },
    { time: '02:30 PM', name: 'Neha Gupta', type: 'Thyroid Consultation', mode: 'Video Call', status: 'Upcoming', duration: '20 min' },
    { time: '04:00 PM', name: 'Rajesh Mehta', type: 'Chest Pain Consultation', mode: 'In-Person', status: 'Upcoming', duration: '40 min' },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-400" /> Appointment Schedule
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manage your upcoming consultations and visits.</p>
        </div>
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="bg-[#131F35] border border-slate-800 rounded-xl p-1 flex items-center gap-1 min-w-max">
             <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold shadow-md">Today</button>
             <button className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-bold transition-colors">Tomorrow</button>
             <button className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-bold transition-colors flex items-center gap-2">
               <CalendarIcon size={14} /> Pick Date
             </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Thursday, Aug 19, 2026</h3>
        <button className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm bg-[#131F35] px-4 py-2 rounded-lg border border-slate-800 transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-10 top-4 bottom-4 w-px bg-slate-800/80 z-0 hidden md:block"></div>
        {schedule.map((apt, i) => (
          <div key={i} className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-blue-500/30 transition-colors relative z-10">
            
            <div className="flex items-start md:items-center gap-4 md:gap-6 mb-4 md:mb-0">
              <div className="w-20 text-right shrink-0 bg-[#131F35] py-2 hidden md:block">
                <span className="text-sm font-bold text-white">{apt.time}</span>
              </div>
              <div className={`w-4 h-4 rounded-full shrink-0 hidden md:block ${apt.status === 'Completed' ? 'bg-slate-600 border-4 border-[#131F35]' : 'bg-blue-500 border-4 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`}></div>
              
              <div className="flex items-center gap-3 md:gap-4 w-full">
                <img src={`https://i.pravatar.cc/100?img=${i + 15}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700 object-cover shrink-0" alt="patient"/>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white leading-tight">{apt.name}</h3>
                  <p className="text-slate-400 text-xs md:text-sm mt-1">{apt.type}</p>
                </div>
                <div className="md:hidden text-right">
                   <span className="text-sm font-bold text-white block">{apt.time}</span>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${apt.status === 'Completed' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-400'}`}>{apt.status}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8 ml-0 md:ml-6">
              <div className="flex items-center gap-2 text-slate-300 bg-[#0B1121] px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
                {apt.mode === 'Video Call' ? <Video size={14} className="text-emerald-400" /> : <MapPin size={14} className="text-rose-400" />}
                {apt.mode}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock size={14} /> {apt.duration}
              </div>
              
              {apt.status === 'Upcoming' ? (
                <button onClick={() => navigate('/doctor/consultation-room')} className="ml-auto md:ml-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white transition-all rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20">
                  Start Session
                </button>
              ) : (
                <button className="ml-auto md:ml-0 px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold text-sm border border-slate-700 cursor-not-allowed">
                  Completed
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
