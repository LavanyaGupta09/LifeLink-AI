import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, HeartPulse, Wind, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAshaStore } from '../../store/ashaStore';

const AshaGharJaanch: React.FC = () => {
  const navigate = useNavigate();
  const { addPatientVisit } = useAshaStore();
  const [step, setStep] = useState<'info' | 'form' | 'done'>('info');
  const [form, setForm] = useState({
    patientName: '',
    temperature: '',
    bloodPressure: '',
    breathingDifficulty: 'none' as 'none' | 'mild' | 'severe',
    heartRate: '',
    condition: '',
    notes: '',
  });

  const checkItems = [
    { emoji: '🌡', label: 'Bukhar', desc: 'Temperature', icon: Thermometer, color: '#FF4757' },
    { emoji: '🩺', label: 'BP', desc: 'Blood Pressure', icon: Activity, color: '#3B82F6' },
    { emoji: '🫁', label: 'Saans', desc: 'Breathing', icon: Wind, color: '#00C9A7' },
    { emoji: '❤️', label: 'Dhadkan', desc: 'Heart Rate', icon: HeartPulse, color: '#8B5CF6' },
  ];

  const handleSubmit = () => {
    const isCritical = 
      parseFloat(form.temperature) >= 103 || 
      form.breathingDifficulty === 'severe' ||
      parseFloat(form.heartRate) > 120;

    const visit = {
      id: `visit_${Date.now()}`,
      patientName: form.patientName || 'Patient',
      visitType: 'asha_visit' as const,
      date: new Date().toISOString().split('T')[0],
      findings: `Temp: ${form.temperature}°F, BP: ${form.bloodPressure}, HR: ${form.heartRate}`,
      advice: form.notes || 'Dawai di gayi',
      nextVisit: 'Agli din phir se dekhein',
      isCritical,
      assessment: {
        temperature: form.temperature,
        bloodPressure: form.bloodPressure,
        breathingDifficulty: form.breathingDifficulty,
        heartRate: form.heartRate,
        condition: form.condition,
        notes: form.notes,
      },
    };

    addPatientVisit(visit);
    setStep('done');

    // If critical, offer SOS option
    if (isCritical) {
      setTimeout(() => {
        if (confirm('⚠️ Halat gambhir hai! Kya Emergency SOS bhejna chahein?')) {
          navigate('/asha/emergency');
        }
      }, 1500);
    }
  };

  // ── Info Step ──
  if (step === 'info') {
    return (
      <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
        <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
          <button
            onClick={() => navigate('/asha')}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Ghar Jaakar Jaanch</h1>
            <p className="text-[10px] text-textSecondary">ASHA Visit</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          {/* Hero */}
          <div className="bg-gradient-to-br from-surface to-background border border-[#3B82F6]/20 rounded-3xl p-6 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#3B82F6]/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="w-20 h-20 mx-auto mb-4 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <Activity size={36} className="text-textPrimary" />
            </div>
            <p className="text-textSecondary text-sm leading-relaxed">
              ASHA worker aapke ghar aayegi<br />aur jaanch karegi.
            </p>
          </div>

          {/* Check Items */}
          <h3 className="text-base font-bold mb-3 text-textPrimary">Kya-kya check karegi?</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {checkItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon size={26} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-textPrimary">{item.label}</h4>
                    <p className="text-[10px] text-textTertiary">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theek hai button */}
          <button
            onClick={() => setStep('form')}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-lg font-bold py-4 rounded-2xl transition-colors active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Theek hai — Jaanch shuru karein
          </button>
        </div>
      </div>
    );
  }

  // ── Form Step ──
  if (step === 'form') {
    return (
      <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
        <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
          <button
            onClick={() => setStep('info')}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Jaanch Form</h1>
            <p className="text-[10px] text-textSecondary">Patient ki details bharein</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="flex flex-col gap-4">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">👤 Patient ka Naam</label>
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder="Naam likhein..."
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-base text-textPrimary placeholder-slate-600 focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">🌡 Bukhar / Temperature (°F)</label>
              <input
                type="number"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                placeholder="98.6"
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-base text-textPrimary placeholder-slate-600 focus:outline-none focus:border-[#FF4757] transition-colors"
              />
            </div>

            {/* BP */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">🩺 BP (Blood Pressure)</label>
              <input
                type="text"
                value={form.bloodPressure}
                onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                placeholder="120/80"
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-base text-textPrimary placeholder-slate-600 focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Breathing */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">🫁 Saans lene mein dikkat</label>
              <div className="flex gap-2">
                {(['none', 'mild', 'severe'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setForm({ ...form, breathingDifficulty: level })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      form.breathingDifficulty === level
                        ? level === 'severe'
                          ? 'bg-[#FF4757] text-textPrimary'
                          : level === 'mild'
                          ? 'bg-[#F97316] text-textPrimary'
                          : 'bg-[#2ED573] text-[#0B1221]'
                        : 'bg-background border border-border text-textSecondary'
                    }`}
                  >
                    {level === 'none' ? 'Nahi' : level === 'mild' ? 'Thodi' : 'Bahut'}
                  </button>
                ))}
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">❤️ Dhadkan (Heart Rate)</label>
              <input
                type="number"
                value={form.heartRate}
                onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                placeholder="72"
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-base text-textPrimary placeholder-slate-600 focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">📋 Patient ki halat</label>
              <input
                type="text"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                placeholder="Kya dikkat hai..."
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-base text-textPrimary placeholder-slate-600 focus:outline-none focus:border-[#00C9A7] transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-2">📝 Kya salah di?</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Dawai, salah, ya koi aur baat..."
                rows={3}
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-base text-textPrimary placeholder-slate-600 focus:outline-none focus:border-[#00C9A7] transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full bg-[#00C9A7] hover:bg-[#00B092] text-[#0B1221] text-lg font-bold py-4 rounded-2xl transition-colors active:scale-[0.98] shadow-[0_0_20px_rgba(0,201,167,0.3)] mt-2"
            >
              ✅ Jaanch Save Karein
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Done Step ──
  return (
    <div className="w-full min-h-screen bg-background text-textPrimary pb-32">
      <div className="w-full px-4 py-4 flex items-center gap-3 sticky top-0 bg-background backdrop-blur-sm z-30 border-b border-border">
        <button
          onClick={() => navigate('/asha')}
          className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-textSecondary hover:text-textPrimary hover:border-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Jaanch Ho Gayi</h1>
      </div>

      <div className="px-4 py-12 max-w-lg mx-auto text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-[#00C9A7] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,201,167,0.35)]">
          <CheckCircle size={48} className="text-textPrimary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Jaanch Save Ho Gayi! ✅</h2>
        <p className="text-textSecondary text-sm mb-2">
          <strong className="text-textPrimary">{form.patientName || 'Patient'}</strong> ki jaanch record ho gayi hai.
        </p>
        {parseFloat(form.temperature) >= 103 || form.breathingDifficulty === 'severe' ? (
          <div className="bg-[#FF4757]/10 border border-[#FF4757]/30 rounded-xl p-4 mt-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-[#FF4757]" />
              <span className="text-[#FF4757] font-bold">Gambhir Sthiti!</span>
            </div>
            <p className="text-textSecondary text-sm">Patient ki halat gambhir lag rahi hai.</p>
            <button
              onClick={() => navigate('/asha/emergency')}
              className="mt-3 w-full bg-[#FF4757] hover:bg-[#E84040] text-white font-bold py-3 rounded-xl transition-colors"
            >
              🚨 Emergency SOS Bhejein
            </button>
          </div>
        ) : (
          <p className="text-[#00C9A7] text-sm mt-1 mb-6">Halat sthir hai.</p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/asha/soochna')}
            className="w-full bg-card border border-border hover:border-slate-500 text-textPrimary font-bold py-3 rounded-xl transition-colors"
          >
            📋 Saari Soochna Dekhein
          </button>
          <button
            onClick={() => navigate('/asha')}
            className="w-full bg-background border border-border hover:border-border text-textSecondary font-medium py-3 rounded-xl transition-colors"
          >
            ← ASHA Portal par Jaayein
          </button>
        </div>
      </div>
    </div>
  );
};

export default AshaGharJaanch;
