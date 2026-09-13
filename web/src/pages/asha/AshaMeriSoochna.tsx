import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, AlertTriangle, ChevronRight, Stethoscope } from 'lucide-react';
import { useAshaStore } from '../../store/ashaStore';

const AshaMeriSoochna: React.FC = () => {
  const navigate = useNavigate();
  const { patientVisits } = useAshaStore();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getVisitTypeLabel = (type: string) => {
    switch (type) {
      case 'asha_visit': return 'ASHA Visit';
      case 'triage': return 'Doctor se Salah';
      case 'followup': return 'Follow-up';
      default: return type;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#040814] text-white pb-32">
      {/* Header */}
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-[#040814]/95 backdrop-blur-sm z-30 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-[#0B1221] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Meri Soochna</h1>
          <p className="text-[10px] text-slate-400">Mere patients ki jaankari</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Stats bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-[#0B1221] border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#00C9A7]">{patientVisits.length}</p>
            <p className="text-[10px] text-slate-400">Total Visits</p>
          </div>
          <div className="flex-1 bg-[#0B1221] border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#FF4757]">{patientVisits.filter(v => v.isCritical).length}</p>
            <p className="text-[10px] text-slate-400">Gambhir</p>
          </div>
          <div className="flex-1 bg-[#0B1221] border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#3B82F6]">{patientVisits.filter(v => !v.isCritical).length}</p>
            <p className="text-[10px] text-slate-400">Sthir</p>
          </div>
        </div>

        {/* Visit List */}
        {patientVisits.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Abhi koi record nahi hai</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {patientVisits.map((visit) => (
              <div
                key={visit.id}
                className={`bg-[#0B1221] border rounded-2xl p-5 relative overflow-hidden ${
                  visit.isCritical ? 'border-[#FF4757]/30' : 'border-slate-800'
                }`}
              >
                {visit.isCritical && (
                  <div className="absolute top-0 right-0 bg-[#FF4757] text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <AlertTriangle size={10} /> Gambhir
                  </div>
                )}

                {/* Patient Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{visit.patientName}</h3>
                    <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">
                      {getVisitTypeLabel(visit.visitType)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2.5 ml-1">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Jaanch ki tareekh</p>
                      <p className="text-sm font-medium text-white">{formatDate(visit.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Stethoscope size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Kya pata chala?</p>
                      <p className="text-sm font-medium text-white">{visit.findings}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <FileText size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Kya salah di?</p>
                      <p className="text-sm font-medium text-[#00C9A7]">{visit.advice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <ChevronRight size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500">Next visit</p>
                      <p className="text-sm font-medium text-slate-300">{visit.nextVisit}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AshaMeriSoochna;
