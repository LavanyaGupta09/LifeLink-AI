import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin, CheckCircle, Clock, Ambulance, Building2 } from 'lucide-react';
import { useAshaStore } from '../../store/ashaStore';

const AshaEmergencyAlert: React.FC = () => {
  const navigate = useNavigate();
  const { emergencyAlerts, ashaProfile } = useAshaStore();

  const stageLabels: Record<string, { label: string; color: string }> = {
    sos_sent: { label: 'SOS Bheja Gaya', color: '#FF4757' },
    team_notified: { label: 'Team ko Bataya', color: '#F97316' },
    ambulance_dispatched: { label: 'Ambulance Bheji', color: '#3B82F6' },
    hospital_alerted: { label: 'Hospital Alert', color: '#8B5CF6' },
    help_arriving: { label: 'Madad Aa Rahi Hai', color: '#00C9A7' },
  };

  const stages = ['sos_sent', 'team_notified', 'ambulance_dispatched', 'hospital_alerted', 'help_arriving'];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
      {/* Header */}
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#FF4757]">Emergency Alerts</h1>
          <p className="text-[10px] text-textSecondary">Saari emergency ki jaankari</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {emergencyAlerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
              <CheckCircle size={36} className="text-[#00C9A7]" />
            </div>
            <h2 className="text-lg font-bold mb-2 text-[#00C9A7]">Sab Theek Hai!</h2>
            <p className="text-textTertiary text-sm">Koi emergency alert nahi hai abhi</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {emergencyAlerts.map((alert) => {
              const currentStageIndex = stages.indexOf(alert.stage);
              const stageInfo = stageLabels[alert.stage];

              return (
                <div
                  key={alert.id}
                  className="bg-background border border-[#FF4757]/20 rounded-2xl overflow-hidden"
                >
                  {/* Alert Header */}
                  <div className="bg-[#FF4757]/10 px-5 py-3 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-[#FF4757] shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-[#FF4757]">Gambhir Sthiti!</h3>
                      <p className="text-[10px] text-textSecondary">{alert.description}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Location */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-xs text-textTertiary">Location</p>
                        <p className="text-sm font-bold text-textPrimary">Gaon: {alert.village}</p>
                        {alert.distance && (
                          <p className="text-[10px] text-textTertiary">Distance: {alert.distance}</p>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#F97316]/10 rounded-full flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-[#F97316]" />
                      </div>
                      <div>
                        <p className="text-xs text-textTertiary">Emergency Request Time</p>
                        <p className="text-sm font-bold text-textPrimary">{formatTime(alert.createdAt)}</p>
                      </div>
                    </div>

                    {/* Status Pipeline */}
                    <div className="bg-background rounded-xl p-4">
                      <h4 className="text-xs font-bold text-textSecondary mb-3">STATUS</h4>
                      {stages.map((stage, i) => {
                        const info = stageLabels[stage];
                        const isDone = i <= currentStageIndex;
                        const isCurrent = i === currentStageIndex;
                        const Icon = i === 2 ? Ambulance : i === 3 ? Building2 : i === 0 ? AlertTriangle : CheckCircle;

                        return (
                          <div key={stage} className="flex items-start gap-3 relative">
                            {/* Vertical line */}
                            {i < stages.length - 1 && (
                              <div className={`absolute left-3 top-6 w-0.5 h-6 ${isDone ? 'bg-gradient-to-b' : 'bg-surface'}`}
                                style={isDone ? { backgroundImage: `linear-gradient(${info.color}, ${stageLabels[stages[i + 1]]?.color || info.color})` } : {}}
                              />
                            )}
                            
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                isDone ? '' : 'bg-surface'
                              } ${isCurrent ? 'animate-pulse' : ''}`}
                              style={isDone ? { backgroundColor: info.color } : {}}
                            >
                              {isDone ? (
                                <CheckCircle size={12} className="text-textPrimary" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                              )}
                            </div>
                            <span
                              className={`text-sm py-0.5 ${isDone ? 'font-bold' : 'text-textTertiary'}`}
                              style={isDone ? { color: info.color } : {}}
                            >
                              {info.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AshaEmergencyAlert;
