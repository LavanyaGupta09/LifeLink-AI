import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminderStore } from '../store/reminderStore';
import { Pill, Camera, Plus, CheckCircle, AlertTriangle, ChevronLeft, Loader2, BellRing, Activity, Droplets, GlassWater, X, Sparkles, Trash2, Edit3, Sun, Sunset, Moon, CloudSun } from 'lucide-react';
import type { MedicineReminder } from '../types/health.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ─── Editable medicine from OCR scan ─── */
interface EditableMedicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  whenToTake: string;
  time: string;
  is_critical: boolean;
  selected: boolean; // user can deselect medicines they don't want
}

interface TimelineItem {
  id: string;
  type: 'pill' | 'water';
  time: string;
  title: string;
  subtitle: string;
  completed: boolean;
  data?: any;
}

/* ─── Helpers ─── */
const WHEN_OPTIONS = [
  { value: 'Morning', label: 'Morning', icon: Sun, time: '08:00' },
  { value: 'Afternoon', label: 'Afternoon', icon: CloudSun, time: '13:00' },
  { value: 'Evening', label: 'Evening', icon: Sunset, time: '18:00' },
  { value: 'Night', label: 'Night', icon: Moon, time: '22:00' },
];

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Weekly',
  'As needed',
];

const whenToTime = (when: string): string => {
  return WHEN_OPTIONS.find(w => w.value === when)?.time || '08:00';
};

const MedicineRemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const { reminders, logs, addReminder, removeReminder, getAdherenceRate, triggerAlarm } = useReminderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Scan RX State ─── */
  const [isUploading, setIsUploading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedMedicines, setScannedMedicines] = useState<EditableMedicine[] | null>(null);
  const [scanConfirmed, setScanConfirmed] = useState(false);

  /* ─── Manual Form State ─── */
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Once daily',
    whenToTake: 'Morning',
    reminderTime: '08:00',
    isCritical: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    ringtone: '',
  });

  /* ─── Hydration State ─── */
  const [waterIntake, setWaterIntake] = useState(1250);
  const waterGoal = 2500;
  const waterPercentage = Math.round(Math.min((waterIntake / waterGoal) * 100, 100));
  const [isAddingWater, setIsAddingWater] = useState(false);

  // ═══════════════════════════════════════
  //  SCAN RX HANDLERS
  // ═══════════════════════════════════════

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setScanError(null);
    setScannedMedicines(null);
    setScanConfirmed(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/v1/reminders/parse-prescription`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to parse prescription' }));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.medicines && data.medicines.length > 0) {
        // Convert to editable list — do NOT auto-add yet
        const editable: EditableMedicine[] = data.medicines.map((med: any) => {
          const firstSlot = med.time_slots?.[0];
          const inferredWhen = inferWhenFromTime(firstSlot?.time || '08:00');
          return {
            medicine_name: med.medicine_name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || 'Once daily',
            whenToTake: inferredWhen,
            time: firstSlot?.time || whenToTime(inferredWhen),
            is_critical: med.is_critical ?? false,
            selected: true,
          };
        });
        setScannedMedicines(editable);
      } else {
        setScanError('No medicines could be detected. Please try a clearer photo of your prescription.');
      }
    } catch (err: any) {
      console.error('Scan RX error:', err);
      setScanError(err.message || 'Failed to scan prescription. Please ensure the backend is running and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const inferWhenFromTime = (time: string): string => {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) return 'Morning';
    if (hour < 16) return 'Afternoon';
    if (hour < 20) return 'Evening';
    return 'Night';
  };

  const handleEditScanned = (index: number, field: keyof EditableMedicine, value: any) => {
    setScannedMedicines(prev => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // If "whenToTake" changes, also update time
      if (field === 'whenToTake') {
        updated[index].time = whenToTime(value as string);
      }
      return updated;
    });
  };

  const handleRemoveScanned = (index: number) => {
    setScannedMedicines(prev => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleConfirmScanned = () => {
    if (!scannedMedicines) return;

    const selected = scannedMedicines.filter(m => m.selected);
    selected.forEach((med, index) => {
      const timing = med.whenToTake === 'Morning' || med.whenToTake === 'Afternoon' ? 'After Food' : 'After Food';
      const reminder: MedicineReminder = {
        id: `rem_${Date.now()}_${index}`,
        userId: 'u1',
        medicineName: med.medicine_name,
        dosage: med.dosage,
        frequency: med.frequency,
        timeSlots: [{ time: med.time, timing: timing as 'Before Food' | 'After Food' | 'Anytime' }],
        isCritical: med.is_critical,
        currentStock: 30,
        active: true,
      };
      addReminder(reminder);
    });

    setScanConfirmed(true);
    setTimeout(() => {
      setScannedMedicines(null);
      setScanConfirmed(false);
    }, 2000);
  };

  // ═══════════════════════════════════════
  //  MANUAL FORM HANDLERS
  // ═══════════════════════════════════════

  const handleOpenManualForm = () => {
    setManualForm({
      medicineName: '',
      dosage: '',
      frequency: 'Once daily',
      whenToTake: 'Morning',
      reminderTime: '08:00',
      isCritical: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      ringtone: '',
    });
    setShowManualForm(true);
  };

  const handleWhenChange = (when: string) => {
    const time = whenToTime(when);
    setManualForm(prev => ({ ...prev, whenToTake: when, reminderTime: time }));
  };

  const handleManualSubmit = () => {
    if (!manualForm.medicineName.trim() || !manualForm.dosage.trim()) return;

    const reminder: MedicineReminder = {
      id: `rem_${Date.now()}`,
      userId: 'u1',
      medicineName: manualForm.medicineName.trim(),
      dosage: manualForm.dosage.trim(),
      frequency: manualForm.frequency,
      timeSlots: [{
        time: manualForm.reminderTime,
        timing: 'After Food' as 'Before Food' | 'After Food' | 'Anytime',
      }],
      isCritical: manualForm.isCritical,
      currentStock: 30,
      active: true,
      startDate: manualForm.startDate,
      endDate: manualForm.endDate,
      ringtone: manualForm.ringtone,
    };
    addReminder(reminder);

    // Reset form for adding another medicine
    setManualForm({
      medicineName: '',
      dosage: '',
      frequency: 'Once daily',
      whenToTake: 'Morning',
      reminderTime: '08:00',
      isCritical: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      ringtone: '',
    });
  };

  // ═══════════════════════════════════════
  //  WATER / MISC
  // ═══════════════════════════════════════

  const handleAddWater = (amount: number) => {
    setIsAddingWater(true);
    setWaterIntake(prev => Math.min(prev + amount, waterGoal));
    setTimeout(() => setIsAddingWater(false), 500);
  };

  const adherence = getAdherenceRate();

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    const today = new Date().toISOString().split('T')[0];
    
    reminders.forEach(rem => {
      rem.timeSlots.forEach((slot, index) => {
        const log = logs.find(l => l.reminderId === rem.id && l.scheduledTime === slot.time && l.loggedAt.startsWith(today));
        const isTaken = log?.status === 'taken';

        items.push({
          id: `${rem.id}_${index}`,
          type: 'pill',
          time: slot.time,
          title: rem.medicineName,
          subtitle: `${rem.dosage} • ${slot.timing}`,
          completed: isTaken,
          data: rem,
        });
      });
    });

    const waterTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    waterTimes.forEach((time, index) => {
      items.push({
        id: `water_${index}`,
        type: 'water',
        time,
        title: 'Hydration Checkpoint',
        subtitle: 'Drink 250ml to stay on track',
        completed: waterIntake >= (index + 1) * 250,
      });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [reminders, waterIntake]);

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════

  return (
    <div className="w-full bg-background text-textPrimary font-sans flex flex-col pb-[120px] md:pb-12 md:pl-28 relative min-h-screen px-6 py-6 ">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#3D91FF]/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#3D91FF]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="w-full flex items-center gap-4 p-6 lg:px-10 lg:py-8 relative z-10">
        <button 
          className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full hover:bg-surface transition-all active:scale-95 shadow-lg" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} className="text-textSecondary" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
            <Activity size={32} className="text-[#00C9A7]" />
            Daily Wellness Tracker
          </h1>
          <p className="text-textSecondary text-sm lg:text-base font-medium mt-1">Smart Pills & Hydration Schedule</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full px-6 flex-1 relative z-10 flex flex-col gap-8">
        
        {/* WIDGET 1: UNIFIED DAILY ADHERENCE & WATER GOAL HEADER */}
        <div className="bg-gradient-to-br from-[#131B2F] to-background border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00C9A7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="grid grid-cols-2 gap-8 relative z-10">
            {/* Pill Adherence */}
            <div className="flex flex-col items-center text-center border-r border-border pr-4">
              <div className="flex items-center gap-2 mb-4">
                <Pill size={16} className="text-[#3D91FF]" />
                <p className="text-xs font-bold text-[#3D91FF] uppercase tracking-widest">Pill Adherence</p>
              </div>
              <div className="relative flex items-center justify-center w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={`${adherence > 80 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${adherence}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-textPrimary">{adherence}%</span>
                </div>
              </div>
              <p className="text-textSecondary text-xs font-medium">{adherence > 80 ? 'Excellent! Keep it up.' : 'You missed a few doses.'}</p>
            </div>

            {/* Hydration Goal */}
            <div className="flex flex-col items-center text-center pl-4">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={16} className="text-[#00C9A7]" />
                <p className="text-xs font-bold text-[#00C9A7] uppercase tracking-widest">Hydration</p>
              </div>
              <div className="relative flex items-center justify-center w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#00C9A7] transition-all duration-1000 ease-out" strokeDasharray={`${waterPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-textPrimary">{waterIntake}</span>
                  <span className="text-[10px] text-textSecondary font-bold uppercase">/ {waterGoal} ml</span>
                </div>
              </div>
              <p className="text-textSecondary text-xs font-medium">{waterPercentage >= 100 ? 'Goal reached!' : 'Keep drinking water.'}</p>
            </div>
          </div>
        </div>

        {/* Action Controls: Rx and Water Logging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Action Buttons (Scan Rx & Manual) */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xl flex gap-4">
            <button 
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3D91FF] to-blue-600 rounded-2xl p-4 shadow-[0_0_30px_rgba(61,145,255,0.3)] hover:shadow-[0_0_40px_rgba(61,145,255,0.5)] transition-all active:scale-95 text-white" 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
              <span className="text-xs font-bold uppercase tracking-wider">Scan Rx</span>
            </button>
            <button 
              className="flex-1 flex flex-col items-center justify-center gap-3 bg-background border-2 border-dashed border-border hover:border-[#3D91FF] rounded-2xl p-4 transition-all active:scale-95 text-textSecondary hover:text-textPrimary"
              onClick={handleOpenManualForm}
            >
              <Plus size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Manual</span>
            </button>
          </div>

          {/* WIDGET 2: INTERACTIVE WATER INTAKE LOGGING */}
          <div className={`bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col justify-center transition-all duration-300 ${isAddingWater ? 'scale-[1.02] border-[#00C9A7]/50 shadow-[0_0_30px_rgba(0,201,167,0.2)]' : ''}`}>
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-textPrimary flex items-center gap-2 text-sm"><Droplets size={16} className="text-[#00C9A7]"/> Log Water</h3>
               <span className="bg-[#00C9A7]/10 text-[#00C9A7] text-[10px] font-bold px-2 py-1 rounded-md uppercase">1-2 hr intervals</span>
             </div>
             <div className="flex gap-4">
               <button 
                 className="flex-1 flex items-center justify-center gap-2 bg-[#00C9A7]/10 border border-[#00C9A7]/30 hover:bg-[#00C9A7]/20 rounded-2xl py-3 text-[#00C9A7] transition-all active:scale-95"
                 onClick={() => handleAddWater(250)}
               >
                 <GlassWater size={18} />
                 <span className="text-xs font-bold uppercase">+ 250 ml</span>
               </button>
               <button 
                 className="flex-1 flex items-center justify-center gap-2 bg-[#00C9A7]/10 border border-[#00C9A7]/30 hover:bg-[#00C9A7]/20 rounded-2xl py-3 text-[#00C9A7] transition-all active:scale-95"
                 onClick={() => handleAddWater(500)}
               >
                 <Droplets size={18} />
                 <span className="text-xs font-bold uppercase">+ 500 ml</span>
               </button>
             </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

        {/* ─── Scan Error ─── */}
        {scanError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-400 font-medium flex-1">{scanError}</p>
            <button onClick={() => setScanError(null)} className="text-rose-500 hover:text-rose-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ─── Uploading Status ─── */}
        {isUploading && (
          <div className="bg-[#3D91FF]/10 border border-[#3D91FF]/30 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
            <Loader2 size={24} className="text-[#3D91FF] animate-spin" />
            <div>
              <p className="text-sm font-bold text-textPrimary">Scanning your prescription…</p>
              <p className="text-xs text-textSecondary mt-1">AI is analyzing the image with Groq Vision. This may take a few seconds.</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SCAN RX — EDITABLE RESULTS (user can edit / confirm)
            ═══════════════════════════════════════════════════ */}
        {scannedMedicines && !scanConfirmed && (
          <div className="bg-card border border-[#3D91FF]/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(61,145,255,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#3D91FF]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3D91FF]/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-[#3D91FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-textPrimary">Detected Medicines</h3>
                  <p className="text-xs text-textSecondary">Review and edit before adding reminders</p>
                </div>
              </div>
              <button
                onClick={() => setScannedMedicines(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-border transition-colors"
              >
                <X size={16} className="text-textSecondary" />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {scannedMedicines.map((med, index) => (
                <div key={index} className={`bg-surface border rounded-2xl p-4 transition-all ${med.selected ? 'border-[#3D91FF]/30' : 'border-border opacity-50'}`}>
                  <div className="flex items-start gap-3">
                    {/* Select checkbox */}
                    <button
                      className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${med.selected ? 'bg-[#3D91FF] border-[#3D91FF]' : 'border-border'}`}
                      onClick={() => handleEditScanned(index, 'selected', !med.selected)}
                    >
                      {med.selected && <CheckCircle size={12} className="text-white" />}
                    </button>

                    <div className="flex-1 space-y-3">
                      {/* Row 1: Name + Dosage */}
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={med.medicine_name}
                          onChange={e => handleEditScanned(index, 'medicine_name', e.target.value)}
                          placeholder="Medicine name"
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-[#3D91FF] transition-all"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={e => handleEditScanned(index, 'dosage', e.target.value)}
                          placeholder="Dosage"
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-[#3D91FF] transition-all"
                        />
                      </div>

                      {/* Row 2: When + Frequency */}
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={med.whenToTake}
                          onChange={e => handleEditScanned(index, 'whenToTake', e.target.value)}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] transition-all appearance-none cursor-pointer"
                        >
                          {WHEN_OPTIONS.map(w => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                          ))}
                        </select>
                        <select
                          value={med.frequency}
                          onChange={e => handleEditScanned(index, 'frequency', e.target.value)}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] transition-all appearance-none cursor-pointer"
                        >
                          {FREQUENCY_OPTIONS.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      {/* Row 3: Reminder time */}
                      <div className="flex items-center gap-3">
                        <BellRing size={14} className="text-textSecondary shrink-0" />
                        <input
                          type="time"
                          value={med.time}
                          onChange={e => handleEditScanned(index, 'time', e.target.value)}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] transition-all"
                        />
                        <span className="text-xs text-textSecondary">Reminder time</span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemoveScanned(index)}
                      className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm / Cancel buttons */}
            <div className="flex gap-3 mt-6 relative z-10">
              <button
                onClick={() => setScannedMedicines(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest bg-surface text-textSecondary hover:text-textPrimary hover:bg-border transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmScanned}
                disabled={!scannedMedicines.some(m => m.selected)}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  scannedMedicines.some(m => m.selected)
                    ? 'bg-gradient-to-r from-[#3D91FF] to-blue-600 text-white shadow-[0_0_30px_rgba(61,145,255,0.3)] hover:shadow-[0_0_40px_rgba(61,145,255,0.5)] active:scale-[0.98]'
                    : 'bg-surface text-textTertiary cursor-not-allowed'
                }`}
              >
                <CheckCircle size={16} />
                Confirm & Add ({scannedMedicines.filter(m => m.selected).length})
              </button>
            </div>
          </div>
        )}

        {/* Scan Confirmed Success */}
        {scanConfirmed && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4">
            <CheckCircle size={24} className="text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-textPrimary">Medicines added successfully!</p>
              <p className="text-xs text-textSecondary mt-0.5">Your pill reminders have been saved.</p>
            </div>
          </div>
        )}

        {/* WIDGET 3: COMBINED NOTIFICATION & TIMELINE STREAM */}
        <div className="pb-10">
          <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
            <h3 className="text-xl font-bold text-textPrimary flex items-center gap-2">
              <Activity size={20} className="text-textSecondary" /> Daily Schedule
            </h3>
            <span className="bg-surface text-textSecondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{timelineItems.length} Events</span>
          </div>
          
          {timelineItems.length === 0 ? (
            <div className="w-full bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-inner">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
                <Activity size={48} className="text-textTertiary" />
              </div>
              <h3 className="text-xl font-bold text-textSecondary mb-2">Your schedule is clear</h3>
              <p className="text-textTertiary max-w-sm">No pills or water checkpoints scheduled yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-border ml-4 pl-8 flex flex-col gap-6">
              {timelineItems.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-border flex items-center justify-center shadow-lg ${item.type === 'pill' ? (item.completed ? 'bg-emerald-500' : 'bg-[#3D91FF]') : (item.completed ? 'bg-emerald-500' : 'bg-[#00C9A7]')}`} />
                  
                  {/* Item Card */}
                  <div className={`bg-card border border-border rounded-3xl p-5 transition-all hover:shadow-xl group-hover:border-border relative overflow-hidden ${item.completed ? 'opacity-75' : ''}`}>
                    
                    {/* Subtle Background Glow for Critical Pills */}
                    {item.type === 'pill' && item.data?.isCritical && !item.completed && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${item.type === 'pill' ? (item.data?.isCritical ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-[#3D91FF]/20 text-[#3D91FF] border border-[#3D91FF]/30') : 'bg-[#00C9A7]/20 text-[#00C9A7] border border-[#00C9A7]/30'}`}>
                          {item.type === 'pill' ? <Pill size={24} /> : <Droplets size={24} />}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-textPrimary flex items-center gap-2 tracking-tight">
                            {item.title}
                            {item.type === 'pill' && item.data?.isCritical && !item.completed && <AlertTriangle size={16} className="text-rose-500 animate-pulse" />}
                          </h4>
                          <p className="text-xs font-medium text-textSecondary mt-1">{item.subtitle}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-surface border border-border px-3 py-1 rounded-lg flex items-center gap-2">
                          <BellRing size={12} className="text-textSecondary" />
                          <span className="text-xs font-black tracking-widest text-textPrimary">{item.time}</span>
                        </div>
                        {item.type === 'pill' && !item.completed && (
                          <div className="flex items-center gap-1">
                            <button 
                              className="text-[10px] font-bold text-[#3D91FF] hover:text-white uppercase tracking-widest transition-colors bg-[#3D91FF]/10 px-2 py-1 rounded"
                              onClick={() => triggerAlarm(item.data!, item.time)}
                            >
                              Test Alarm
                            </button>
                            <button 
                              className="text-[10px] font-bold text-rose-500 hover:text-white uppercase tracking-widest transition-colors bg-rose-500/10 px-2 py-1 rounded"
                              onClick={() => removeReminder(item.data!.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        {item.type === 'water' && item.completed && (
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle size={12}/> Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════
          MANUAL ADD PILL MODAL
          ═══════════════════════════════════════════════════ */}
      {showManualForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowManualForm(false)} />
          
          {/* Modal */}
          <div className="relative bg-card border border-border rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#3D91FF]/10 to-transparent pointer-events-none rounded-t-3xl" />
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3D91FF]/20 rounded-xl flex items-center justify-center">
                  <Pill size={20} className="text-[#3D91FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-textPrimary">Add Medicine</h3>
                  <p className="text-xs text-textSecondary">Manually add a pill reminder</p>
                </div>
              </div>
              <button 
                onClick={() => setShowManualForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-border transition-colors"
              >
                <X size={16} className="text-textSecondary" />
              </button>
            </div>

            {/* Already-added medicines in this session */}
            {reminders.length > 0 && (
              <div className="relative z-10 px-6 pb-2">
                <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-2">Your Medicines ({reminders.length})</p>
                <div className="flex flex-wrap gap-2">
                  {reminders.map(r => (
                    <span key={r.id} className="inline-flex items-center gap-1.5 bg-[#3D91FF]/10 text-[#3D91FF] text-xs font-semibold px-2.5 py-1 rounded-lg">
                      <Pill size={10} />
                      {r.medicineName} {r.dosage}
                      <button 
                        onClick={() => removeReminder(r.id)}
                        className="hover:text-rose-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="relative z-10 px-6 pb-6 pt-3 space-y-5">
              
              {/* Medicine Name */}
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Medicine / Pill Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. Amlodipine, Metformin, Paracetamol…"
                  value={manualForm.medicineName}
                  onChange={e => setManualForm(prev => ({ ...prev, medicineName: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all"
                  autoFocus
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Dosage *</label>
                <input 
                  type="text"
                  placeholder="e.g. 5mg, 500mg, 10ml"
                  value={manualForm.dosage}
                  onChange={e => setManualForm(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all"
                />
              </div>

              {/* When to Take — Visual Buttons */}
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-3 block">When to Take</label>
                <div className="grid grid-cols-4 gap-2">
                  {WHEN_OPTIONS.map(w => {
                    const Icon = w.icon;
                    const isActive = manualForm.whenToTake === w.value;
                    return (
                      <button
                        key={w.value}
                        onClick={() => handleWhenChange(w.value)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-bold ${
                          isActive
                            ? 'border-[#3D91FF] bg-[#3D91FF]/10 text-[#3D91FF]'
                            : 'border-border bg-surface text-textSecondary hover:border-[#3D91FF]/50 hover:text-textPrimary'
                        }`}
                      >
                        <Icon size={18} />
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Frequency</label>
                <select 
                  value={manualForm.frequency}
                  onChange={e => setManualForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all appearance-none cursor-pointer"
                >
                  {FREQUENCY_OPTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Reminder Time */}
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Reminder Time</label>
                <div className="flex items-center gap-3">
                  <BellRing size={16} className="text-[#3D91FF] shrink-0" />
                  <input 
                    type="time"
                    value={manualForm.reminderTime}
                    onChange={e => setManualForm(prev => ({ ...prev, reminderTime: e.target.value }))}
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all"
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Start Date</label>
                  <input 
                    type="date"
                    value={manualForm.startDate}
                    onChange={e => setManualForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">End Date (Optional)</label>
                  <input 
                    type="date"
                    value={manualForm.endDate}
                    onChange={e => setManualForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all"
                  />
                </div>
              </div>

              {/* Ringtone Selection */}
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 block">Custom Alarm Ringtone</label>
                <div className="flex items-center gap-3">
                  <select 
                    value={manualForm.ringtone}
                    onChange={e => setManualForm(prev => ({ ...prev, ringtone: e.target.value }))}
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF] focus:ring-1 focus:ring-[#3D91FF]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Default (Speech Synthesis)</option>
                    <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Gentle Bell</option>
                    <option value="https://assets.mixkit.co/active_storage/sfx/2311/2311-preview.mp3">Digital Chime</option>
                    <option value="https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3">Urgent Alert</option>
                  </select>
                  <button 
                    onClick={() => { if (manualForm.ringtone) new Audio(manualForm.ringtone).play(); }}
                    disabled={!manualForm.ringtone}
                    className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center text-[#3D91FF] hover:bg-[#3D91FF]/10 transition-colors disabled:opacity-50"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Critical Toggle */}
              <div 
                className={`flex items-center justify-between bg-surface border rounded-xl p-4 cursor-pointer transition-all ${
                  manualForm.isCritical ? 'border-rose-500/50 bg-rose-500/5' : 'border-border hover:border-border'
                }`}
                onClick={() => setManualForm(prev => ({ ...prev, isCritical: !prev.isCritical }))}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className={manualForm.isCritical ? 'text-rose-500' : 'text-textTertiary'} />
                  <div>
                    <p className="text-sm font-bold text-textPrimary">Critical Medicine</p>
                    <p className="text-xs text-textSecondary">For heart, BP, diabetes, seizures, etc.</p>
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                  manualForm.isCritical ? 'bg-rose-500' : 'bg-slate-600'
                }`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                    manualForm.isCritical ? 'left-[22px]' : 'left-0.5'
                  }`} />
                </div>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleManualSubmit}
                disabled={!manualForm.medicineName.trim() || !manualForm.dosage.trim()}
                className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  manualForm.medicineName.trim() && manualForm.dosage.trim()
                    ? 'bg-gradient-to-r from-[#3D91FF] to-blue-600 text-white shadow-[0_0_30px_rgba(61,145,255,0.3)] hover:shadow-[0_0_40px_rgba(61,145,255,0.5)]'
                    : 'bg-surface text-textTertiary cursor-not-allowed'
                }`}
              >
                <Plus size={18} />
                Add Medicine & Continue
              </button>

              {/* Done button to close modal */}
              <button 
                onClick={() => setShowManualForm(false)}
                className="w-full py-3 rounded-2xl text-sm font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Done — Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineRemindersPage;
