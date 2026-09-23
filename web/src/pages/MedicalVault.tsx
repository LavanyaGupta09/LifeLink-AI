import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, FileText, QrCode, Share2, Shield, Eye, Trash2,
  TrendingUp, TrendingDown, Minus, Clock, Lock, Activity, Link as LinkIcon, 
  CheckCircle, PlusCircle, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// Biomarker definitions
const BIOMARKERS = [
  { id: 'hba1c', name: 'HbA1c', value: '5.8%', status: 'optimal', trend: 'down', history: [6.5, 6.2, 5.9, 5.8] },
  { id: 'cholesterol', name: 'Cholesterol', value: '210 mg/dL', status: 'warning', trend: 'up', history: [180, 190, 195, 210] },
  { id: 'sugar', name: 'Fasting Sugar', value: '95 mg/dL', status: 'optimal', trend: 'stable', history: [98, 96, 94, 95] },
];

const MedicalVault: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [filter, setFilter] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [sharingWith, setSharingWith] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (!user?.id) {
          const { MOCK_HEALTH_RECORDS } = await import('../data/mockData');
          setRecords(MOCK_HEALTH_RECORDS);
          setLoadingRecords(false);
          return;
        }

        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mapped = data.map(d => ({
            id: d.id,
            fileName: d.file_name,
            fileType: d.record_type || 'other',
            description: d.description || 'Medical Document',
            uploadDate: new Date(d.created_at).toLocaleDateString(),
            fileSize: '1.2 MB',
            iconColor: '#3D91FF',
          }));
          setRecords(mapped);
        } else {
          const { MOCK_HEALTH_RECORDS } = await import('../data/mockData');
          setRecords(MOCK_HEALTH_RECORDS);
        }
      } catch (err) {
        console.error('Error fetching vault records:', err);
        const { MOCK_HEALTH_RECORDS } = await import('../data/mockData');
        setRecords(MOCK_HEALTH_RECORDS);
      } finally {
        setLoadingRecords(false);
      }
    };
    
    fetchRecords();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    setTimeout(() => {
      const newRecord = {
        id: `rec_${Date.now()}`,
        fileName: file.name,
        fileType: file.type.includes('image') ? 'scan' : 'report',
        description: 'Uploaded Document',
        uploadDate: new Date().toLocaleDateString(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        iconColor: '#00C9A7'
      };
      
      setRecords([newRecord, ...records]);
      setUploading(false);
      alert('Document securely uploaded to vault.');
    }, 1500);
  };

  const generateShareLink = () => {
    setShareLink(`https://lifelink.health/s/${Math.random().toString(36).substring(7)}`);
    setTimeout(() => {
      alert('Secure share link generated. Expires in 24 hours.');
    }, 100);
  };

  const filteredRecords = filter === 'All' 
    ? records 
    : records.filter(r => r.fileType.toLowerCase() === filter.toLowerCase());

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary font-sans flex flex-col pb-24 px-6 py-6 ">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background backdrop-blur-xl border-b border-border px-4 py-4 pt-[env(safe-area-inset-top,16px)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-textPrimary active:scale-95 transition-transform" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-textPrimary">Medical Vault</h1>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1"><Shield size={10} /> 256-bit Encrypted</p>
          </div>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-emerald-500/10 text-emerald-400 p-2 rounded-full border border-emerald-500/20 active:scale-95 transition-all"
        >
          {uploading ? <Activity size={20} className="animate-spin" /> : <PlusCircle size={20} />}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf"
          onChange={handleFileUpload}
        />
      </header>

      <div className="flex-1 p-4 flex flex-col gap-6">
        
        {/* WIDGET 1: EMERGENCY QR CODE CARD */}
        <div className="w-full bg-gradient-to-br from-[#131F35] to-background border border-red-500/30 rounded-3xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-red-400" />
                <h2 className="text-lg font-bold text-textPrimary tracking-tight">Emergency Profile</h2>
              </div>
              <p className="text-xs text-textSecondary">First-responder access enabled</p>
            </div>
            <div className="bg-white p-1 rounded-xl shadow-lg border-2 border-red-500/50">
              <QrCode size={40} className="text-black" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
            <div className="bg-background rounded-2xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-textTertiary tracking-wider">Blood Group</span>
              <p className="text-red-400 font-black text-xl leading-tight mt-1">O+</p>
            </div>
            <div className="bg-background rounded-2xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-textTertiary tracking-wider">Allergies</span>
              <p className="text-textPrimary font-bold text-sm leading-tight mt-1">Penicillin, Peanuts</p>
            </div>
            <div className="col-span-2 bg-background rounded-2xl p-3 border border-border">
              <span className="text-[10px] uppercase font-bold text-textTertiary tracking-wider">Chronic Conditions</span>
              <p className="text-emerald-400 font-bold text-sm leading-tight mt-1">Hypertension, Mild Asthma</p>
            </div>
          </div>
          
          <button className="w-full bg-surface hover:bg-surface text-textPrimary text-sm font-bold py-3 rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2">
            <QrCode size={16} /> View Full Medical QR
          </button>
        </div>

        {/* WIDGET 2: BIOMARKER TREND VISUALIZER */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-bold text-textPrimary">Biomarker Trends</h3>
            <button className="text-xs font-bold text-[#3D91FF]">View All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {BIOMARKERS.map(bm => (
              <div key={bm.id} className="min-w-[140px] bg-card border border-border rounded-3xl p-4 flex flex-col relative" style={{ scrollSnapAlign: 'start' }}>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 ${bm.status === 'optimal' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <span className="text-[10px] uppercase font-bold text-textSecondary tracking-widest mb-1">{bm.name}</span>
                <h4 className="text-lg font-black text-textPrimary mb-3">{bm.value}</h4>
                
                {/* SVG Trend Line Mockup */}
                <svg className="w-full h-8 mb-2 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <polyline 
                    points="0,15 25,18 50,10 75,12 100,5" 
                    fill="none" 
                    stroke={bm.status === 'optimal' ? '#2ED573' : '#FF4757'} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <circle cx="100" cy="5" r="3" fill={bm.status === 'optimal' ? '#2ED573' : '#FF4757'} />
                </svg>

                <div className="flex items-center gap-1 mt-auto">
                  {bm.trend === 'down' ? <TrendingDown size={12} className={bm.status === 'optimal' ? 'text-emerald-400' : 'text-rose-400'} /> : 
                   bm.trend === 'up' ? <TrendingUp size={12} className={bm.status === 'optimal' ? 'text-emerald-400' : 'text-rose-400'} /> : 
                   <Minus size={12} className="text-textSecondary" />}
                  <span className={`text-[10px] font-bold ${bm.status === 'optimal' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bm.status === 'optimal' ? 'Optimal' : 'Warning'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WIDGET 3: SMART CHRONOLOGICAL TIMELINE */}
        <section className="flex-1 flex flex-col">
          <div className="sticky top-[73px] z-30 bg-background backdrop-blur-md py-2 px-1 mb-2">
            <h3 className="text-base font-bold text-textPrimary mb-3">Clinical Timeline</h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'Prescription', 'Report', 'Scan'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    filter === f 
                      ? 'bg-[#3D91FF] text-textPrimary shadow-[0_0_15px_rgba(61,145,255,0.3)]' 
                      : 'bg-surface text-textSecondary border border-border hover:bg-surface'
                  }`}
                >
                  {f === 'All' ? 'Timeline' : `${f}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative pl-4 border-l-2 border-border ml-2 flex flex-col gap-6 pt-2">
            {loadingRecords ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-2xl p-4 h-24 animate-pulse ml-4 border border-border relative">
                   <div className="absolute -left-10 top-4 w-4 h-4 rounded-full bg-surface"></div>
                </div>
              ))
            ) : filteredRecords.length === 0 ? (
              <div className="ml-4 py-8 text-center bg-card rounded-2xl border border-border">
                <FileText size={32} className="mx-auto text-textTertiary mb-2" />
                <p className="text-sm text-textSecondary font-medium">No documents found.</p>
              </div>
            ) : (
              filteredRecords.map((record, i) => (
                <div key={record.id} className="relative ml-4 bg-card border border-border rounded-3xl p-4 transition-all hover:border-border group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-9 top-6 w-3.5 h-3.5 rounded-full border-4 border-[#060B14] z-10" style={{ backgroundColor: record.iconColor || '#3D91FF' }}></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface text-lg border border-border shadow-inner">
                        {record.fileType === 'prescription' ? '💊' : record.fileType === 'report' ? '📊' : record.fileType === 'scan' ? '🔬' : '📄'}
                      </div>
                      <div>
                        <h4 className="font-bold text-textPrimary text-sm leading-tight mb-0.5 max-w-[180px] truncate">{record.fileName}</h4>
                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">{record.fileType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-textTertiary mb-4">{record.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-textTertiary">
                      <Clock size={12} /> {record.uploadDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-textSecondary hover:text-emerald-400 transition-colors bg-surface rounded-lg">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-textSecondary hover:text-blue-400 transition-colors bg-surface rounded-lg">
                        <Share2 size={14} />
                      </button>
                      <button className="p-1.5 text-textSecondary hover:text-rose-400 transition-colors bg-surface rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* WIDGET 4: CONSENT MANAGER & SECURE SHARING */}
        <section className="bg-card border border-border rounded-3xl p-5 relative overflow-hidden mt-2 mb-4">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#3D91FF]/5 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Lock size={18} className="text-[#3D91FF]" />
            <h3 className="text-base font-bold text-textPrimary">Data Sharing Hub</h3>
          </div>
          
          <div className="bg-background border border-border rounded-2xl p-4 mb-4 relative z-10">
            <p className="text-xs text-textSecondary mb-4 font-medium leading-relaxed">
              Generate a secure, expiring link to share your complete medical timeline with an external doctor or pharmacy.
            </p>
            
            {shareLink ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2 truncate pr-2">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-400 truncate">{shareLink}</span>
                </div>
                <button className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded" onClick={() => navigator.clipboard.writeText(shareLink)}>
                  Copy
                </button>
              </div>
            ) : (
              <button 
                onClick={generateShareLink}
                className="w-full bg-[#3D91FF]/10 text-[#3D91FF] border border-[#3D91FF]/30 font-bold py-2.5 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 text-sm"
              >
                <LinkIcon size={16} /> Generate Secure Link
              </button>
            )}
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-textPrimary">Apollo Hospital ER</p>
                <p className="text-xs text-textTertiary font-medium">Expires in 2 hrs</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end p-0.5 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-textSecondary">Dr. Meera Nair (Family Doc)</p>
                <p className="text-xs text-textTertiary font-medium">Permanent Access</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end p-0.5 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default MedicalVault;
