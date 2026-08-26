import React, { useState } from 'react';
import { DollarSign, Search, Filter, Plus, ChevronDown, Download, Eye, CheckCircle2 } from 'lucide-react';
import { usePartnerStore } from '../../store/partnerStore';

const BillingPage: React.FC = () => {
  const { patients } = usePartnerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Mock Bills state
  const [bills, setBills] = useState([
    { id: 'INV-001', patientName: 'Rahul Sharma', amount: 2450, date: '2026-08-21', status: 'Paid', service: 'Cardiology Consultation' },
    { id: 'INV-002', patientName: 'Priya Patel', amount: 8500, date: '2026-08-21', status: 'Pending', service: 'MRI Scan' },
    { id: 'INV-003', patientName: 'Amit Kumar', amount: 1200, date: '2026-08-20', status: 'Paid', service: 'General Checkup' },
    { id: 'INV-004', patientName: 'Neha Gupta', amount: 450, date: '2026-08-19', status: 'Pending', service: 'Blood Test' },
  ]);

  const [newBill, setNewBill] = useState({
    patientName: '',
    amount: 0,
    service: ''
  });

  const filteredBills = bills.filter(b => 
    b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBills([
      {
        id: `INV-00${bills.length + 1}`,
        patientName: newBill.patientName,
        amount: newBill.amount,
        service: newBill.service,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      },
      ...bills
    ]);
    setIsInvoiceModalOpen(false);
    setNewBill({ patientName: '', amount: 0, service: '' });
  };

  const markPaid = (id: string) => {
    setBills(bills.map(b => b.id === id ? { ...b, status: 'Paid' } : b));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="text-[#8B5CF6]" /> Billing & Invoices
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage patient invoices and payments</p>
        </div>
        <button 
          onClick={() => setIsInvoiceModalOpen(true)}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B1221] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search invoice ID or patient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#8B5CF6] focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="hidden md:block bg-[#0B1221] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131B2F] border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Invoice ID</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Patient</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Service</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredBills.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No invoices found.</td></tr>
              ) : filteredBills.map(bill => (
                <tr key={bill.id} className="hover:bg-[#131B2F]/50 transition-colors group">
                  <td className="p-4 font-bold text-slate-300 text-sm">{bill.id}</td>
                  <td className="p-4 font-bold text-white text-sm">{bill.patientName}</td>
                  <td className="p-4 text-slate-300 text-sm">{bill.service}</td>
                  <td className="p-4 text-slate-400 text-sm">{new Date(bill.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</td>
                  <td className="p-4 font-bold text-white text-sm">₹{bill.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <div className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      bill.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {bill.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bill.status === 'Pending' && (
                        <button onClick={() => markPaid(bill.id)} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors" title="Mark Paid">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button className="p-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors" title="Download">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredBills.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-[#0B1221] rounded-2xl border border-slate-800">No invoices found.</div>
          ) : filteredBills.map(bill => (
            <div key={bill.id} className="bg-[#0B1221] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-base">{bill.patientName}</p>
                  <p className="text-xs text-slate-500">{bill.id} • {bill.service}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                  bill.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                }`}>
                  {bill.status}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-slate-400">{new Date(bill.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
                <span className="font-bold text-white text-lg">₹{bill.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800/50">
                {bill.status === 'Pending' && (
                  <button onClick={() => markPaid(bill.id)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"><CheckCircle2 size={14}/> Mark Paid</button>
                )}
                <button className="flex-1 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"><Download size={14}/> Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#0B1221] border border-slate-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Create Invoice</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-white"><Plus className="rotate-45" size={20}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 flex flex-col gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Select Patient <span className="text-red-500">*</span></label>
                <select required value={newBill.patientName} onChange={e=>setNewBill({...newBill, patientName: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#8B5CF6] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white">
                  <option value="">Select a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Service Description <span className="text-red-500">*</span></label>
                <input required type="text" value={newBill.service} onChange={e=>setNewBill({...newBill, service: e.target.value})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#8B5CF6] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" placeholder="e.g. Cardiology Consultation" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Total Amount (₹) <span className="text-red-500">*</span></label>
                <input required type="number" value={newBill.amount} onChange={e=>setNewBill({...newBill, amount: Number(e.target.value)})} className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#8B5CF6] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" />
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-bold text-slate-300 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingPage;
