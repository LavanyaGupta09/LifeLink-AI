import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, CheckCircle, ExternalLink, Filter } from 'lucide-react';

const govSchemes = [
  {
    id: 1,
    name: 'Ayushman Bharat PM-JAY',
    description: 'World\'s largest health insurance scheme fully financed by the government.',
    benefits: ['₹5 Lakhs per family per year', 'Cashless access to healthcare services', 'Covers pre-existing diseases from day one'],
    eligibility: ['Deprived rural families', 'Identified occupational categories of urban workers'],
    coverage: '₹5,000,000 / family / year',
    documents: ['Aadhaar Card', 'Ration Card', 'Mobile Number'],
    applyLink: 'https://pmjay.gov.in/',
    tags: ['Central', 'All States', 'Low Income'],
  },
  {
    id: 2,
    name: 'Central Government Health Scheme (CGHS)',
    description: 'Comprehensive medical care to the Central Government employees and pensioners.',
    benefits: ['OPD treatment at CGHS dispensaries', 'Specialist consultation', 'Hospitalization at empanelled hospitals'],
    eligibility: ['Central Govt employees', 'Pensioners', 'Sitting and ex-Members of Parliament'],
    coverage: 'Comprehensive (varies by pay scale)',
    documents: ['CGHS Card', 'Govt ID Proof', 'Pay Slip / Pension Payment Order'],
    applyLink: 'https://cghs.nic.in/',
    tags: ['Central', 'Govt Employees'],
  },
  {
    id: 3,
    name: 'Employees\' State Insurance Scheme (ESIC)',
    description: 'Social security and health insurance scheme for Indian workers.',
    benefits: ['Full medical care during sickness', 'Maternity benefit', 'Disablement benefit'],
    eligibility: ['Employees earning up to ₹21,000/month', 'Working in factories/establishments with 10+ employees'],
    coverage: 'Complete medical care',
    documents: ['Pehchan Card', 'Aadhaar Card', 'Employer Certificate'],
    applyLink: 'https://www.esic.gov.in/',
    tags: ['Central', 'Private Sector', 'Low Income'],
  },
  {
    id: 4,
    name: 'Aam Aadmi Bima Yojana',
    description: 'Social security scheme for rural landless households.',
    benefits: ['Death/Disability cover', 'Scholarship for 2 children', 'Minimal premium'],
    eligibility: ['Rural landless households', 'Age 18-59 years'],
    coverage: '₹30,000 to ₹75,000 (Life/Disability)',
    documents: ['Aadhaar Card', 'BPL Card', 'Income Certificate'],
    applyLink: 'https://financialservices.gov.in/',
    tags: ['Central', 'Rural', 'Life Cover'],
  }
];

const GovSchemes: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const allTags = ['All', 'Central', 'Govt Employees', 'Low Income', 'Private Sector', 'Rural'];

  const filteredSchemes = useMemo(() => {
    return govSchemes.filter(scheme => {
      const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === 'All' || scheme.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  return (
    <div className="w-full min-h-[100dvh] bg-background text-textPrimary pb-[120px]">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-background backdrop-blur-md border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/insurance')} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">Govt Health Schemes</h1>
              <p className="text-[10px] text-textSecondary">Discover and apply for Indian schemes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-indigo-500"
            />
            <Search size={18} className="text-textTertiary absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter size={16} className="text-textSecondary shrink-0 mr-1" />
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                  selectedTag === tag 
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' 
                    : 'bg-background text-textSecondary border-border hover:border-slate-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-card border border-indigo-500/30 rounded-2xl p-6 flex flex-col gap-4 shadow-lg hover:border-indigo-500/60 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {scheme.tags.map(tag => (
                      <span key={tag} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-textPrimary leading-tight">{scheme.name}</h2>
                  <p className="text-sm text-textSecondary mt-2">{scheme.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-background rounded-xl p-4 border border-border">
                  <h3 className="text-xs font-bold text-textTertiary uppercase tracking-wider mb-2">Key Benefits</h3>
                  <ul className="space-y-2">
                    {scheme.benefits.map((b, i) => (
                      <li key={i} className="text-xs text-textSecondary flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <h3 className="text-xs font-bold text-textTertiary uppercase tracking-wider mb-2">Eligibility</h3>
                  <ul className="space-y-2">
                    {scheme.eligibility.map((e, i) => (
                      <li key={i} className="text-xs text-textSecondary flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-background rounded-xl p-4 border border-border">
                <h3 className="text-xs font-bold text-textTertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={14} /> Required Documents
                </h3>
                <p className="text-xs text-textSecondary">{scheme.documents.join(', ')}</p>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">Coverage Amount</p>
                  <p className="font-bold text-lg text-textPrimary">{scheme.coverage}</p>
                </div>
                <a 
                  href={scheme.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-500 text-textPrimary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  Apply <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
          
          {filteredSchemes.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-4">🔍</span>
              <h2 className="text-xl font-bold mb-2">No schemes found</h2>
              <p className="text-textSecondary max-w-sm">Try adjusting your search terms or selecting a different filter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GovSchemes;
