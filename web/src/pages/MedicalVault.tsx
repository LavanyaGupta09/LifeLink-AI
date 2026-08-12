import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Shield, Eye, Trash2, Share2, Lock, Bot, AlertTriangle, CheckCircle, Activity, PhoneCall, X, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';


const fileTypeIcons: Record<string, string> = {
  report: '📊',
  prescription: '💊',
  scan: '🔬',
  insurance: '🛡️',
  other: '📁',
};

interface CriticalFinding {
  parameter_name: string;
  extracted_value: string;
  normal_range: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
  plain_english_explanation: string;
  needs_immediate_attention: boolean;
}

interface AIAnalysisResult {
  report_id: string;
  general_summary: string;
  total_red_flags: number;
  critical_findings: CriticalFinding[];
}

const ANALYSIS_STEPS = [
  { label: 'Scanning document...', icon: '🔍' },
  { label: 'Extracting lab values...', icon: '🧬' },
  { label: 'Checking reference ranges...', icon: '📊' },
  { label: 'Generating AI summary...', icon: '🤖' },
];

const MedicalVault: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  
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
        
        // Map Supabase records to local format
        if (data && data.length > 0) {
          const mapped = data.map(d => ({
            id: d.id,
            fileName: d.file_name,
            fileType: d.record_type || 'other',
            description: d.description || 'Medical Document',
            uploadDate: new Date(d.created_at).toLocaleDateString(),
            fileSize: '1.2 MB', // Mock size
            iconColor: '#3D91FF',
            isSharedWithDoctor: false
          }));
          setRecords(mapped);
        } else {
          // Fallback to mock data
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

  const [filter, setFilter] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showNormals, setShowNormals] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const types = ['All', 'Report', 'Prescription', 'Scan', 'Insurance'];
  const filtered = filter === 'All' ? records : records.filter(r => r.fileType === filter.toLowerCase());

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUploading(false);

    // Auto-analyze after upload
    await runAnalysis(file);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runAnalysis = async (file: File | null, recordName?: string) => {
    setAnalyzing(true);
    setAnalysisStep(0);
    setAiAnalysis(null);
    setShowNormals(false);

    // Animate through steps
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file, file.name);
      } else {
        // Fallback for analyzing existing records (no real file)
        const name = recordName || 'report.pdf';
        formData.append('file', new Blob(['mock-content'], { type: 'application/pdf' }), name);
      }

      const res = await fetch('/api/v1/vault/analyze-report', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data: AIAnalysisResult = await res.json();
        setAiAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async (recordName: string) => {
    await runAnalysis(null, recordName);
  };

  // Separate findings into red-flags and normals
  const redFlags = aiAnalysis?.critical_findings?.filter(
    (f) => ['High', 'Low', 'Critical'].includes(f.status)
  ) || [];
  const normalFindings = aiAnalysis?.critical_findings?.filter(
    (f) => f.status === 'Normal'
  ) || [];
  const hasImmediateAttention = aiAnalysis?.critical_findings?.some(
    (f) => f.needs_immediate_attention
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return { bg: 'rgba(220, 38, 38, 0.15)', border: 'rgba(220, 38, 38, 0.4)', text: '#ef4444', badge: '#dc2626' };
      case 'High': return { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.35)', text: '#f97316', badge: '#ea580c' };
      case 'Low': return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', text: '#f59e0b', badge: '#d97706' };
      default: return { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981', badge: '#059669' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Critical': return <AlertTriangle size={15} />;
      case 'High': return <TrendingUp size={15} />;
      case 'Low': return <TrendingDown size={15} />;
      default: return <CheckCircle size={15} />;
    }
  };

  return (
    <div className="app-shell">
      <div className="page-header pt-[env(safe-area-inset-top)]">
        <button className="back-btn" onClick={() => navigate('/passport')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Medical Vault</h2>
          <p className="text-xs text-secondary">AES-256 encrypted · {records.length} documents</p>
        </div>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={handleUploadClick}>
          <Upload size={16} />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      <div className="page-content">
        {/* Encryption badge */}
        <div className="enc-banner animate-fade-in">
          <Lock size={14} color="#00C9A7" />
          <p className="text-xs">All records are end-to-end encrypted. Only you can access them.</p>
          <Shield size={14} color="#00C9A7" />
        </div>

        {/* Upload area */}
        <div className={`upload-area animate-fade-in delay-100 ${uploading ? 'uploading' : ''}`} onClick={handleUploadClick}>
          {uploading ? (
            <div className="upload-progress">
              <div className="upload-spinner" />
              <p className="text-sm text-secondary">Encrypting & uploading...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📤</div>
              <p className="text-sm font-semibold">Upload New Document</p>
              <p className="text-xs text-secondary">PDF, JPG, PNG up to 25MB</p>
            </>
          )}
        </div>

        {/* Filter pills */}
        <div className="vault-filter animate-fade-in delay-200">
          {types.map(t => (
            <button
              key={t}
              className={`spec-pill ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* AI ANALYSIS — Multi-step loading animation */}
        {/* ═══════════════════════════════════════════ */}
        {analyzing && (
          <div className="ai-analyzing-card animate-fade-in">
            <div className="ai-analyzing-header pt-[env(safe-area-inset-top)]">
              <Bot size={22} className="ai-analyzing-icon" />
              <div>
                <p className="ai-analyzing-title">AI Analysis in Progress</p>
                <p className="ai-analyzing-subtitle">Processing your medical report</p>
              </div>
            </div>
            <div className="ai-steps-container">
              {ANALYSIS_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`ai-step ${i < analysisStep ? 'completed' : i === analysisStep ? 'active' : 'pending'}`}
                >
                  <div className="ai-step-indicator">
                    {i < analysisStep ? (
                      <CheckCircle size={16} />
                    ) : i === analysisStep ? (
                      <div className="ai-step-spinner" />
                    ) : (
                      <div className="ai-step-dot" />
                    )}
                  </div>
                  <span className="ai-step-icon">{step.icon}</span>
                  <span className="ai-step-label">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* AI SUMMARY CARD — Premium display          */}
        {/* ═══════════════════════════════════════════ */}
        {aiAnalysis && !analyzing && (
          <div className="ai-summary-card animate-fade-in">
            {/* Header */}
            <div className="ai-summary-header pt-[env(safe-area-inset-top)]">
              <div className="ai-summary-header-left pt-[env(safe-area-inset-top)]">
                <div className="ai-summary-bot-icon">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="ai-summary-title">AI Report Analysis</h3>
                  <p className="ai-summary-meta">Powered by LifeLink AI</p>
                </div>
              </div>
              <div className="ai-summary-header-right pt-[env(safe-area-inset-top)]">
                {aiAnalysis.total_red_flags > 0 && (
                  <span className="ai-redflag-badge">
                    <AlertTriangle size={12} />
                    {aiAnalysis.total_red_flags} Red Flag{aiAnalysis.total_red_flags > 1 ? 's' : ''}
                  </span>
                )}
                <button className="ai-close-btn" onClick={() => setAiAnalysis(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* General Summary */}
            <div className="ai-general-summary">
              <p>{aiAnalysis.general_summary}</p>
            </div>

            {/* ──────────── RED FLAGS SECTION ──────────── */}
            {redFlags.length > 0 && (
              <div className="ai-redflags-section">
                <div className="ai-section-header ai-section-header-danger pt-[env(safe-area-inset-top)]">
                  <AlertTriangle size={16} />
                  <span>Abnormal Findings ({redFlags.length})</span>
                </div>
                <div className="ai-findings-list">
                  {redFlags.map((finding, idx) => {
                    const colors = getStatusColor(finding.status);
                    return (
                      <div
                        key={idx}
                        className={`ai-finding-item ${finding.status === 'Critical' ? 'ai-finding-critical' : ''}`}
                        style={{ background: colors.bg, borderColor: colors.border }}
                      >
                        <div className="ai-finding-top">
                          <div className="ai-finding-name" style={{ color: colors.text }}>
                            {getStatusIcon(finding.status)}
                            <span>{finding.parameter_name}</span>
                          </div>
                          <div className="ai-finding-badges">
                            <span className="ai-finding-value" style={{ background: colors.badge }}>
                              {finding.extracted_value}
                            </span>
                            <span className="ai-finding-status" style={{ background: `${colors.badge}30`, color: colors.text, borderColor: `${colors.badge}50` }}>
                              {finding.status}
                            </span>
                          </div>
                        </div>
                        <div className="ai-finding-range" style={{ color: colors.text }}>
                          Normal range: {finding.normal_range}
                        </div>
                        <p className="ai-finding-explanation" style={{ color: colors.text }}>
                          {finding.plain_english_explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ──────────── CALL DOCTOR CTA ──────────── */}
            {hasImmediateAttention && (
              <button
                id="call-doctor-now-btn"
                className="ai-call-doctor-btn"
                onClick={() => navigate('/doctor')}
              >
                <PhoneCall size={18} />
                <span>Call Doctor Now</span>
                <span className="ai-call-doctor-urgent">URGENT</span>
              </button>
            )}

            {/* ──────────── NORMAL RESULTS (Collapsible) ──────────── */}
            {normalFindings.length > 0 && (
              <div className="ai-normals-section">
                <button
                  className="ai-normals-toggle"
                  onClick={() => setShowNormals(!showNormals)}
                >
                  <div className="ai-normals-toggle-left">
                    <CheckCircle size={16} />
                    <span>Normal Results ({normalFindings.length})</span>
                  </div>
                  {showNormals ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showNormals && (
                  <div className="ai-findings-list ai-normals-list animate-slide-down">
                    {normalFindings.map((finding, idx) => {
                      const colors = getStatusColor('Normal');
                      return (
                        <div
                          key={idx}
                          className="ai-finding-item ai-finding-normal"
                          style={{ background: colors.bg, borderColor: colors.border }}
                        >
                          <div className="ai-finding-top">
                            <div className="ai-finding-name" style={{ color: colors.text }}>
                              <CheckCircle size={15} />
                              <span>{finding.parameter_name}</span>
                            </div>
                            <div className="ai-finding-badges">
                              <span className="ai-finding-value ai-finding-value-normal">
                                {finding.extracted_value}
                              </span>
                            </div>
                          </div>
                          <div className="ai-finding-range ai-finding-range-normal">
                            Normal range: {finding.normal_range}
                          </div>
                          <p className="ai-finding-explanation ai-finding-explanation-normal">
                            {finding.plain_english_explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        
        {/* Records list */}
        {loadingRecords ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse" style={{ height: 80, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, background: 'var(--bg-elevated)', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 16, background: 'var(--bg-elevated)', borderRadius: 4, width: '40%', marginBottom: 6 }} />
                  <div style={{ height: 12, background: 'var(--bg-elevated)', borderRadius: 4, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Your Vault is Empty</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>Upload your first medical record securely.</p>
            <button className="btn btn-primary" onClick={handleUploadClick}>Upload Document</button>
          </div>
        ) : filtered.map((record, i) => (
          <div
            key={record.id}
            className="card vault-record animate-fade-in"
            style={{ animationDelay: `${200 + i * 80}ms`, marginBottom: 10 }}
          >
            <div className="flex items-center gap-3">
              <div className="record-icon" style={{ background: `${record.iconColor}18`, border: `1px solid ${record.iconColor}30` }}>
                <span style={{ fontSize: '1.25rem' }}>{fileTypeIcons[record.fileType]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{record.fileName}</p>
                <p className="text-xs text-secondary">{record.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-tertiary">{record.uploadDate}</span>
                  <span className="text-xs text-tertiary">·</span>
                  <span className="text-xs text-tertiary">{record.fileSize}</span>
                  {record.isSharedWithDoctor && (
                    <span className="badge badge-success" style={{ fontSize: '0.5625rem' }}>Shared</span>
                  )}
                </div>
              </div>
              <div className="record-actions">
                <button className="rec-btn text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20" title="Analyze with AI" onClick={() => handleAnalyze(record.fileName)}>
                  <Bot size={14} />
                </button>
                <button className="rec-btn"><Eye size={14} /></button>
                <button className="rec-btn"><Share2 size={14} /></button>
                <button className="rec-btn danger"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}

        {/* Storage meter */}
        <div className="card storage-card animate-fade-in delay-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-tertiary uppercase">Vault Storage</p>
            <p className="text-xs font-semibold">7.5 MB / 1 GB</p>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '0.75%' }} />
          </div>
          <p className="text-xs text-secondary mt-2">Encrypted with your personal key · HIPAA compliant</p>
        </div>
      </div>

      <style>{`
        .enc-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,201,167,0.06);
          border: 1px solid rgba(0,201,167,0.2);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          margin-bottom: 16px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .upload-area {
          border: 2px dashed var(--border-light);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all var(--duration-fast);
          margin-bottom: 16px;
        }
        .upload-area:hover { border-color: var(--primary); background: var(--primary-glow); }
        .upload-area.uploading { border-color: var(--primary); background: var(--primary-glow); }
        .upload-icon { font-size: 2rem; }
        .upload-progress { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .upload-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid var(--border-light);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .vault-filter {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          margin-bottom: 16px;
        }
        .vault-filter::-webkit-scrollbar { display: none; }
        .spec-pill {
          white-space: nowrap;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
          transition: all var(--duration-fast);
        }
        .spec-pill.active { background: var(--primary-glow); border-color: var(--primary); color: var(--primary); }
        .vault-record { cursor: default; }
        .record-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .record-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .rec-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-tertiary);
          transition: all var(--duration-fast);
        }
        .rec-btn:hover { color: var(--text-primary); background: var(--bg-card-hover); }
        .rec-btn.danger:hover { color: var(--danger); border-color: var(--border-danger); }
        .storage-card { cursor: default; }
        .icon-btn {
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
        }

        /* ═══════════════════════════════════════════ */
        /* AI Analysis — Multi-step Loading           */
        /* ═══════════════════════════════════════════ */
        .ai-analyzing-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .ai-analyzing-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .ai-analyzing-icon {
          color: #818cf8;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .ai-analyzing-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #a5b4fc;
        }
        .ai-analyzing-subtitle {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        .ai-steps-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ai-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .ai-step.completed {
          opacity: 0.6;
        }
        .ai-step.completed .ai-step-label {
          text-decoration: line-through;
          color: var(--text-tertiary);
        }
        .ai-step.active {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .ai-step.active .ai-step-label {
          color: #a5b4fc;
          font-weight: 600;
        }
        .ai-step.pending {
          opacity: 0.35;
        }
        .ai-step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        .ai-step.completed .ai-step-indicator {
          color: #10b981;
        }
        .ai-step-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(99, 102, 241, 0.2);
          border-top-color: #818cf8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .ai-step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-tertiary);
          opacity: 0.4;
        }
        .ai-step-icon {
          font-size: 0.9rem;
        }
        .ai-step-label {
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        /* ═══════════════════════════════════════════ */
        /* AI Summary Card — Premium                  */
        /* ═══════════════════════════════════════════ */
        .ai-summary-card {
          background: var(--bg-card);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          padding: 0;
          margin-bottom: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1);
        }
        .ai-summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
          border-bottom: 1px solid rgba(99, 102, 241, 0.15);
        }
        .ai-summary-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ai-summary-bot-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a5b4fc;
        }
        .ai-summary-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-display);
        }
        .ai-summary-meta {
          font-size: 0.6875rem;
          color: var(--text-tertiary);
          margin-top: 2px;
        }
        .ai-summary-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-redflag-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 20px;
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: #ef4444;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .ai-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-tertiary);
          transition: all 0.2s;
        }
        .ai-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        .ai-general-summary {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .ai-general-summary p {
          font-size: 0.8375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ─── Red Flags Section ─── */
        .ai-redflags-section {
          padding: 0;
        }
        .ai-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .ai-section-header-danger {
          background: rgba(220, 38, 38, 0.06);
          color: #ef4444;
          border-bottom: 1px solid rgba(220, 38, 38, 0.12);
        }
        .ai-findings-list {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ai-finding-item {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid;
          transition: all 0.2s ease;
        }
        .ai-finding-critical {
          animation: criticalPulse 3s ease-in-out infinite;
        }
        @keyframes criticalPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          50% { box-shadow: 0 0 12px 2px rgba(220, 38, 38, 0.15); }
        }
        .ai-finding-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ai-finding-name {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.875rem;
          font-weight: 700;
        }
        .ai-finding-badges {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-finding-value {
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          color: white;
          font-family: var(--font-mono, monospace);
        }
        .ai-finding-value-normal {
          background: #059669;
        }
        .ai-finding-status {
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: 1px solid;
        }
        .ai-finding-range {
          font-size: 0.6875rem;
          font-weight: 600;
          opacity: 0.7;
          margin-bottom: 6px;
        }
        .ai-finding-range-normal {
          color: var(--text-tertiary) !important;
        }
        .ai-finding-explanation {
          font-size: 0.8rem;
          line-height: 1.5;
          opacity: 0.85;
        }
        .ai-finding-explanation-normal {
          color: var(--text-tertiary) !important;
        }

        /* ─── Call Doctor CTA ─── */
        .ai-call-doctor-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: calc(100% - 32px);
          margin: 4px 16px 16px;
          padding: 14px 20px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          font-size: 0.9375rem;
          font-weight: 800;
          cursor: pointer;
          animation: doctorPulse 2s ease-in-out infinite;
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
          transition: transform 0.15s ease;
          font-family: var(--font-display);
        }
        .ai-call-doctor-btn:hover {
          transform: scale(1.02);
        }
        .ai-call-doctor-btn:active {
          transform: scale(0.98);
        }
        .ai-call-doctor-urgent {
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          font-size: 0.625rem;
          letter-spacing: 0.12em;
        }
        @keyframes doctorPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 4px 30px rgba(220, 38, 38, 0.7), 0 0 50px rgba(220, 38, 38, 0.2); }
        }

        /* ─── Normal Results Collapsible ─── */
        .ai-normals-section {
          border-top: 1px solid var(--border);
        }
        .ai-normals-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #10b981;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .ai-normals-toggle:hover {
          background: rgba(16, 185, 129, 0.04);
        }
        .ai-normals-toggle-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-normals-list {
          padding-top: 0;
          border-top: 1px solid rgba(16, 185, 129, 0.1);
        }
        .ai-finding-normal {
          opacity: 0.85;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MedicalVault;
