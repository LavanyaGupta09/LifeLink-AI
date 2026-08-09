import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Pill, Save, RefreshCw, CheckCircle2, Clock
} from 'lucide-react';
import { MOCK_HOSPITALS, MOCK_PHARMACIES } from '../data/mockData';

const VendorPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hospital' | 'pharmacy'>('hospital');
  const [selectedHospital, setSelectedHospital] = useState(MOCK_HOSPITALS[0].id);
  const [selectedPharmacy, setSelectedPharmacy] = useState(MOCK_PHARMACIES[0].id);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const hosp = MOCK_HOSPITALS.find(h => h.id === selectedHospital)!;
  const pharm = MOCK_PHARMACIES.find(p => p.id === selectedPharmacy)!;

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header border-b border-[var(--border)] pb-3">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title flex items-center gap-2">
            Vendor Portal <span className="badge badge-primary text-[0.6rem]">B2B</span>
          </h2>
          <p className="text-xs text-secondary">Manual data sync override</p>
        </div>
      </div>

      <div className="flex px-4 pt-4 gap-2">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'hospital' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}
          onClick={() => setActiveTab('hospital')}
        >
          <Building2 size={16} /> Hospital ER
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'pharmacy' ? 'bg-[#2ED573] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}
          onClick={() => setActiveTab('pharmacy')}
        >
          <Pill size={16} /> Pharmacy
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'hospital' && (
          <div className="animate-fade-in">
            <label className="text-xs text-tertiary uppercase font-semibold mb-2 block">Select Facility</label>
            <select 
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 text-white mb-6"
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              {MOCK_HOSPITALS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>

            <div className="card mb-4">
              <h3 className="font-semibold text-sm mb-4 border-b border-[var(--border)] pb-2">ER & Bed Capacity</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-secondary mb-1 block">ER Beds Available</label>
                  <input type="number" defaultValue={hosp.erBedsAvailable} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-md p-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-1 block">Total ER Beds</label>
                  <input type="number" defaultValue={hosp.erBedsTotal} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-md p-2 text-white opacity-70" disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-secondary mb-1 block">ICU Beds Available</label>
                  <input type="number" defaultValue={hosp.icuBedsAvailable} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-md p-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-1 block">Total ICU Beds</label>
                  <input type="number" defaultValue={hosp.icuBedsTotal} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-md p-2 text-white opacity-70" disabled />
                </div>
              </div>

              <div>
                <label className="text-xs text-secondary mb-1 block">Current ER Wait Time (mins)</label>
                <input type="number" defaultValue={hosp.erWaitMinutes} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-md p-2 text-white text-lg font-bold text-[var(--danger)]" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pharmacy' && (
          <div className="animate-fade-in">
            <label className="text-xs text-tertiary uppercase font-semibold mb-2 block">Select Pharmacy</label>
            <select 
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 text-white mb-6"
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
            >
              {MOCK_PHARMACIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <div className="card mb-4">
              <h3 className="font-semibold text-sm mb-4 border-b border-[var(--border)] pb-2 flex justify-between items-center">
                Inventory Status
                <span className="text-[10px] bg-[rgba(46,213,115,0.1)] text-[#2ED573] px-2 py-1 rounded">Live Sync On</span>
              </h3>

              {pharm.medicines.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.available} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2ED573] relative"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-secondary">
          <Clock size={14} /> Last sync: just now
        </div>
        <button 
          className="btn btn-primary"
          style={{ background: activeTab === 'pharmacy' ? '#2ED573' : 'var(--primary)' }}
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saving ? <><RefreshCw size={16} className="spin" /> Syncing</> : 
           saved  ? <><CheckCircle2 size={16} /> Saved</> : 
                    <><Save size={16} /> Publish Update</>}
        </button>
      </div>
    </div>
  );
};

export default VendorPortalPage;
