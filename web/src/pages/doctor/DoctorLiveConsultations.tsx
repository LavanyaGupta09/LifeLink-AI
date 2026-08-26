import React from 'react';
import { Activity, MessageSquare, Video, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorLiveConsultations() {
  const navigate = useNavigate();

  const activeConsultations = [
    { name: 'Priya Sharma', age: 28, gender: 'Female', symptoms: 'Fever, Headache', time: '04:32', triage: 'medium', blood_group: 'A+' },
    { name: 'Rahul Verma', age: 35, gender: 'Male', symptoms: 'Cold, Cough', time: '03:15', triage: 'low', blood_group: 'O-' },
    { name: 'Anita Joshi', age: 60, gender: 'Female', symptoms: 'BP Checkup', time: '01:47', triage: 'high', blood_group: 'B+' },
    { name: 'Sameer Patel', age: 42, gender: 'Male', symptoms: 'Severe Stomach Pain', time: '00:45', triage: 'critical', blood_group: 'AB+' }
  ];

  const getTriageColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-400" /> Live Consultations
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Patients currently waiting in your digital queue.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          {activeConsultations.length} Waiting
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeConsultations.map((patient, i) => (
          <div key={i} className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-emerald-500/30 transition-all group">
            
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-0 w-full md:w-auto">
              <div className="relative shrink-0 flex gap-4 w-full sm:w-auto items-center sm:items-start">
                <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt={patient.name} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-emerald-500 transition-colors" />
                <div className="absolute -bottom-2 left-10 md:left-12 bg-[#0B1121] rounded-full p-1 border border-slate-800">
                  <span className={`block w-3 h-3 rounded-full ${getTriageColor(patient.triage).split(' ')[0].replace('text', 'bg')}`}></span>
                </div>
                {/* Mobile Title */}
                <div className="sm:hidden">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    {patient.name}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getTriageColor(patient.triage)}`}>
                    {patient.triage}
                  </span>
                </div>
              </div>
              
              <div className="w-full sm:w-auto">
                <h3 className="hidden sm:flex text-xl font-bold text-white mb-1 items-center gap-3">
                  {patient.name}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getTriageColor(patient.triage)}`}>
                    {patient.triage}
                  </span>
                </h3>
                <p className="text-slate-400 text-xs md:text-sm mb-3">{patient.age}y • {patient.gender} • Blood: {patient.blood_group}</p>
                
                <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg inline-block w-full sm:w-auto">
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Chief Complaint</p>
                  <p className="text-sm text-rose-200 font-medium">{patient.symptoms}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4 ml-0 md:ml-6 mt-4 md:mt-0 w-full md:w-auto border-t border-slate-800/80 md:border-t-0 pt-4 md:pt-0">
              <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold text-sm">
                  <Clock size={16} /> Waiting: {patient.time}
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Chat
                </button>
                <button onClick={() => navigate('/doctor/on-call')} className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white transition-all rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <Video size={16} /> Join Call
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
