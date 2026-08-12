import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminderStore } from '../store/reminderStore';
import { Pill, Camera, Plus, CheckCircle, AlertTriangle, ChevronLeft, Loader2, Info } from 'lucide-react';
import type { MedicineReminder } from '../types/health.types';

const MedicineRemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const { reminders, addReminder, getAdherenceRate, triggerAlarm } = useReminderStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    
    // Simulate API call to /api/v1/reminders/parse-prescription
    setTimeout(() => {
      setIsUploading(false);
      const mockParsed: MedicineReminder = {
        id: `rem_${Date.now()}`,
        userId: 'u1',
        medicineName: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily',
        timeSlots: [{ time: '08:00', timing: 'After Food' }],
        isCritical: true,
        currentStock: 30,
        active: true,
      };
      addReminder(mockParsed);
      alert('Prescription parsed via AI successfully!');
    }, 2000);
  };

  const adherence = getAdherenceRate();

  return (
    <div className="page-content bg-[#060B14] min-h-[100dvh] pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold font-display text-white">Pillbox</h1>
      </div>

      {/* Adherence Widget */}
      <div className="card card-glass mb-6 border-[#3D91FF]/30 bg-[#3D91FF]/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Weekly Adherence</p>
            <h2 className="text-3xl font-bold text-white">{adherence}%</h2>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${adherence > 80 ? 'border-success text-success' : 'border-warning text-warning'}`}>
            <CheckCircle size={28} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button className="btn btn-primary flex flex-col gap-2 py-4 h-auto" onClick={handleUpload}>
          {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
          <span className="text-sm">Scan Prescription</span>
        </button>
        <button className="btn btn-ghost border-dashed border-2 flex flex-col gap-2 py-4 h-auto">
          <Plus size={24} />
          <span className="text-sm">Manual Entry</span>
        </button>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <h3 className="text-lg font-bold text-white mb-4">Active Medications</h3>
      
      {reminders.length === 0 ? (
        <div className="text-center p-8 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)]">
          <Pill size={40} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-secondary font-medium">No medications added yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map((rem) => (
            <div key={rem.id} className="card bg-[var(--bg-card)] p-4 border-[var(--border)]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    {rem.medicineName}
                    {rem.isCritical && <AlertTriangle size={16} className="text-danger" />}
                  </h4>
                  <p className="text-sm text-secondary">{rem.dosage} • {rem.frequency}</p>
                </div>
                <div className="text-right">
                  <span className="bg-[#3D91FF]/20 text-[#3D91FF] text-xs font-bold px-2 py-1 rounded-md">
                    {rem.timeSlots[0]?.time}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-light)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${rem.currentStock < 5 ? 'bg-danger' : 'bg-success'}`} />
                  <span className="text-xs text-secondary">{rem.currentStock} pills left</span>
                </div>
                {rem.currentStock < 5 && (
                  <button className="text-xs font-bold text-danger flex items-center gap-1" onClick={() => navigate('/pharmacy')}>
                    <Info size={12} /> Refill Now
                  </button>
                )}
              </div>

              {/* Dev Test Button */}
              <button 
                className="mt-3 w-full py-2 bg-white/5 rounded text-xs text-secondary hover:text-white"
                onClick={() => triggerAlarm(rem, rem.timeSlots[0]?.time || '08:00')}
              >
                Test Alarm Overlay
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineRemindersPage;
