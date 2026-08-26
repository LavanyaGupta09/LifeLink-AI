import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../../store/adminStore';
import type { UserStatus } from '../../store/adminStore';
import { Search, Filter, ShieldCheck, XCircle, Clock, MoreVertical, ShieldAlert } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { users, updateUserStatus } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState<UserStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<{ id: string, name: string, action: 'suspended' | 'active' } | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesTab = activeTab === 'all' || u.status === activeTab;
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  const handleStatusChange = () => {
    if (showConfirmModal) {
      updateUserStatus(showConfirmModal.id, showConfirmModal.action);
      setShowConfirmModal(null);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md">Active</span>;
      case 'inactive':
        return <span className="px-2.5 py-1 bg-slate-500/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-md">Inactive</span>;
      case 'suspended':
        return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md">Suspended</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded-md">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 md:pb-0 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage patient and system user accounts.</p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex overflow-x-auto custom-scrollbar gap-2 border-b border-slate-800 pb-px w-full md:w-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'suspended', label: 'Suspended' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as UserStatus | 'all')}
              className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0B1221] border border-slate-800 rounded-xl overflow-hidden">
        
        {/* Desktop Table (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#060b14]/50 border-b border-slate-800/50">
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Details</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role & ID</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Registration</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email} • {user.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-300 font-medium">{user.role}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{user.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-300">{new Date(user.registrationDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {user.status === 'suspended' ? (
                      <button 
                        onClick={() => setShowConfirmModal({ id: user.id, name: user.name, action: 'active' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-lg transition-colors"
                      >
                        <ShieldCheck size={14} /> Reactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowConfirmModal({ id: user.id, name: user.name, action: 'suspended' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-lg transition-colors"
                      >
                        <XCircle size={14} /> Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Hidden on md+ screens) */}
        <div className="md:hidden flex flex-col divide-y divide-slate-800/50">
          {filteredUsers.map(user => (
            <div key={user.id} className="p-4 flex flex-col gap-3 hover:bg-slate-800/20 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{user.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">{user.role}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </div>
                {getStatusBadge(user.status)}
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                <div className="text-[10px] text-slate-500">
                  ID: <span className="text-slate-400 font-mono">{user.id}</span>
                </div>
                {user.status === 'suspended' ? (
                  <button 
                    onClick={() => setShowConfirmModal({ id: user.id, name: user.name, action: 'active' })}
                    className="flex items-center gap-1 text-sm font-bold text-emerald-400"
                  >
                    Reactivate
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowConfirmModal({ id: user.id, name: user.name, action: 'suspended' })}
                    className="flex items-center gap-1 text-sm font-bold text-red-400"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white">No Users Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              We couldn't find any users matching your current filters and search query.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirmModal(null)} />
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-md w-full relative z-10 animate-scale-up shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className={showConfirmModal.action === 'suspended' ? 'text-red-500' : 'text-emerald-500'} size={24} />
              Confirm Action
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to {showConfirmModal.action === 'suspended' ? 'suspend' : 'reactivate'} the account for <strong className="text-white">{showConfirmModal.name}</strong>?
              {showConfirmModal.action === 'suspended' && " They will immediately lose access to the LifeLink AI platform."}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusChange}
                className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-colors ${
                  showConfirmModal.action === 'suspended' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {showConfirmModal.action === 'suspended' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
