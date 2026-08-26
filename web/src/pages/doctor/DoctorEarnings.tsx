import React from 'react';
import { DollarSign, TrendingUp, Download, ArrowUpRight } from 'lucide-react';

export default function DoctorEarnings() {
  const transactions = [
    { id: 'TXN-001', date: 'Aug 19, 2026', type: 'Consultation', amount: '₹ 800', status: 'Completed' },
    { id: 'TXN-002', date: 'Aug 19, 2026', type: 'Consultation', amount: '₹ 800', status: 'Completed' },
    { id: 'TXN-003', date: 'Aug 18, 2026', type: 'Payout', amount: '₹ 15,000', status: 'Processing' },
    { id: 'TXN-004', date: 'Aug 17, 2026', type: 'Consultation', amount: '₹ 1,200', status: 'Completed' },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-emerald-400" /> Revenue & Earnings
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Track your consultation revenue and payouts.</p>
        </div>
        <button className="w-full md:w-auto justify-center px-5 py-2.5 bg-[#131F35] border border-slate-700 hover:border-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
          <Download size={18} /> Download Statement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <p className="text-sm text-slate-400 font-medium mb-2">Total Earnings (This Month)</p>
          <h3 className="text-4xl font-black text-white mb-2">₹ 42,850</h3>
          <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} /> +12.5% from last month
          </span>
        </div>
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <p className="text-sm text-slate-400 font-medium mb-2">Pending Payout</p>
          <h3 className="text-4xl font-black text-white mb-2">₹ 15,000</h3>
          <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
            Processing... expected by Aug 21
          </span>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-[#009E83] rounded-2xl p-6 flex flex-col justify-center items-start text-white shadow-lg shadow-emerald-500/20">
          <h3 className="text-lg font-bold mb-2">Available for Withdrawal</h3>
          <p className="text-3xl font-black mb-4">₹ 8,450</p>
          <button className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors w-full">
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="bg-[#131F35] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white">Transaction History</h3>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1121] border-b border-slate-800">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 pl-6">Transaction ID</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 pl-6 text-slate-300 font-mono text-sm">{tx.id}</td>
                  <td className="p-4 text-slate-400 text-sm">{tx.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-white">
                      {tx.type === 'Payout' ? <ArrowUpRight size={14} className="text-rose-400" /> : <DollarSign size={14} className="text-emerald-400" />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{tx.amount}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-800/50">
          {transactions.map((tx, i) => (
            <div key={i} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-sm text-white font-bold mb-1">
                    {tx.type === 'Payout' ? <ArrowUpRight size={14} className="text-rose-400" /> : <DollarSign size={14} className="text-emerald-400" />}
                    {tx.type}
                  </div>
                  <p className="text-slate-400 text-xs">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white mb-1">{tx.amount}</p>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <div className="text-slate-500 font-mono text-[10px]">ID: {tx.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
