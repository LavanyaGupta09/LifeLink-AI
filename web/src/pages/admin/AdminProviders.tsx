import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import type { ProviderStatus, ProviderType } from '../../store/adminStore';
import { Search, Filter, ShieldCheck, XCircle, Clock, AlertTriangle, Eye, ArrowRight } from 'lucide-react';

const AdminProviders: React.FC = () => {
  const navigate = useNavigate();
  const { providers } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState<ProviderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProviderType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      const matchesTab = activeTab === 'all' || p.status === activeTab;
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.registrationId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesType && matchesSearch;
    });
  }, [providers, activeTab, typeFilter, searchQuery]);

  const tabs: { id: ProviderStatus | 'all', label: string }[] = [
    { id: 'all', label: 'All Providers' },
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
    { id: 'action_required', label: 'Action Required' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const types: (ProviderType | 'All')[] = [
    'All', 'Doctor', 'Hospital', 'Lab', 'Pharmacy', 'Ambulance', 'Blood Partner', 'Physiotherapy', 'Home Healthcare', 'Medical Equipment'
  ];

  const getStatusBadge = (status: ProviderStatus) => {
    switch (status) {
      case 'verified':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-md"><ShieldCheck size={14} /> Verified</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-md"><Clock size={14} /> Pending</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-md"><XCircle size={14} /> Rejected</span>;
      case 'suspended':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-500/20 text-textSecondary text-xs font-bold rounded-md"><XCircle size={14} /> Suspended</span>;
      case 'action_required':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-md"><AlertTriangle size={14} /> Needs Info</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 md:pb-0">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight">Provider Management</h1>
        <p className="text-textSecondary mt-1 text-sm">Review, verify and manage LifeLink healthcare providers.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 border-b border-border pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-textSecondary hover:text-textSecondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        
        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto pb-2 md:pb-0">
          <Filter size={16} className="text-textTertiary shrink-0" />
          {types.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg border transition-colors ${
                typeFilter === type 
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                  : 'bg-background border-border text-textSecondary hover:border-border'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" size={16} />
          <input 
            type="text" 
            placeholder="Search provider name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border focus:border-indigo-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-sm text-textPrimary placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Provider List */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        
        {/* Desktop Table (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#060b14]/50 border-b border-border">
                <th className="px-5 py-4 text-xs font-bold text-textSecondary uppercase tracking-wider">Provider</th>
                <th className="px-5 py-4 text-xs font-bold text-textSecondary uppercase tracking-wider">Type & Location</th>
                <th className="px-5 py-4 text-xs font-bold text-textSecondary uppercase tracking-wider">Submitted</th>
                <th className="px-5 py-4 text-xs font-bold text-textSecondary uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-bold text-textSecondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProviders.map(provider => (
                <tr key={provider.id} className="hover:bg-surface transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-textPrimary">{provider.name}</p>
                    <p className="text-xs text-textSecondary mt-0.5">{provider.registrationId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-textSecondary font-medium">{provider.type}</p>
                    <p className="text-xs text-textTertiary">{provider.location}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-textSecondary">
                    {new Date(provider.submittedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(provider.status)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/admin/providers/${provider.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-textSecondary hover:bg-indigo-500 hover:text-textPrimary text-xs font-bold rounded-lg transition-colors"
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Hidden on md+ screens) */}
        <div className="md:hidden flex flex-col divide-y divide-slate-800/50">
          {filteredProviders.map(provider => (
            <div key={provider.id} className="p-4 flex flex-col gap-3 hover:bg-surface transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-base font-bold text-textPrimary">{provider.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-textSecondary bg-surface px-2 py-0.5 rounded-md">{provider.type}</span>
                    <span className="text-xs text-textTertiary">{provider.location}</span>
                  </div>
                </div>
                {getStatusBadge(provider.status)}
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <div className="text-xs text-textTertiary">
                  ID: <span className="text-textSecondary">{provider.registrationId}</span>
                </div>
                <button 
                  onClick={() => navigate(`/admin/providers/${provider.id}`)}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-400"
                >
                  Review <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
              <Building2 size={24} className="text-textTertiary" />
            </div>
            <h3 className="text-lg font-bold text-textPrimary">No Providers Found</h3>
            <p className="text-textSecondary text-sm mt-1 max-w-sm">
              We couldn't find any providers matching your current filters and search query.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 bg-surface text-textPrimary text-sm font-bold rounded-lg hover:bg-surface transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminProviders;
