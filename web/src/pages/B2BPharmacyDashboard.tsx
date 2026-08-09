import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, DollarSign, PackageCheck, TrendingUp, LogOut, Upload, AlertTriangle, Clock, Check, FileSpreadsheet, AlertCircle, IndianRupee, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type TabId = 'orders' | 'inventory' | 'expiry' | 'revenue';

interface InventoryItem { name: string; qty: number; price: string; batch: string; }
interface ExpiryAlert { id: string; name: string; batch: string; expiry: string; daysLeft: number; qty: number; }
interface LowStockAlert { id: string; name: string; current: number; threshold: number; }
interface LedgerEntry { id: string; date: string; orderId: string; medicine: string; qty: number; fee: string; status: 'Paid' | 'Pending'; }

const MOCK_EXPIRY: ExpiryAlert[] = [
  { id: 'e1', name: 'Amoxicillin 500mg', batch: 'AMX-2024-B12', expiry: 'Sep 5, 2024', daysLeft: 27, qty: 120 },
  { id: 'e2', name: 'Cetirizine 10mg', batch: 'CET-2024-A09', expiry: 'Sep 2, 2024', daysLeft: 24, qty: 45 },
  { id: 'e3', name: 'Ranitidine 150mg', batch: 'RAN-2024-C03', expiry: 'Aug 18, 2024', daysLeft: 9, qty: 200 },
];

const MOCK_LOWSTOCK: LowStockAlert[] = [
  { id: 'l1', name: 'Metformin 500mg', current: 12, threshold: 50 },
  { id: 'l2', name: 'Insulin Glargine', current: 3, threshold: 10 },
  { id: 'l3', name: 'Aspirin 75mg', current: 18, threshold: 30 },
];

const MOCK_LEDGER: LedgerEntry[] = [
  { id: 'le1', date: 'Aug 9', orderId: 'ORD-4521', medicine: 'Atorva 20mg (Generic)', qty: 1, fee: '₹25.00', status: 'Paid' },
  { id: 'le2', date: 'Aug 9', orderId: 'ORD-4520', medicine: 'Paracetamol 500mg', qty: 2, fee: '₹12.50', status: 'Paid' },
  { id: 'le3', date: 'Aug 8', orderId: 'ORD-4518', medicine: 'Azithromycin 500mg', qty: 1, fee: '₹35.00', status: 'Pending' },
  { id: 'le4', date: 'Aug 8', orderId: 'ORD-4515', medicine: 'Metformin 500mg', qty: 3, fee: '₹18.00', status: 'Paid' },
  { id: 'le5', date: 'Aug 7', orderId: 'ORD-4510', medicine: 'Omeprazole 20mg', qty: 1, fee: '₹22.00', status: 'Paid' },
  { id: 'le6', date: 'Aug 7', orderId: 'ORD-4508', medicine: 'Amlodipine 5mg', qty: 2, fee: '₹15.00', status: 'Pending' },
  { id: 'le7', date: 'Aug 6', orderId: 'ORD-4502', medicine: 'Losartan 50mg', qty: 1, fee: '₹28.00', status: 'Paid' },
];

const WEEKLY_REVENUE = [320, 480, 390, 550, 620, 410, 280];

const B2BPharmacyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('orders');

  const handleLogout = async () => {
    await logout();
    navigate('/role-select', { replace: true });
  };

  // ── Orders ──
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const orders = [
    { id: 'ord_1', patient: 'Ravi Sharma', prescribed: 'Lipitor (Atorvastatin 20mg)', prescribedPrice: '₹450.00', status: 'Pending Match', fee: '₹25.00' },
    { id: 'ord_2', patient: 'Aisha Khan', prescribed: 'Crocin Advance (Paracetamol 500mg)', prescribedPrice: '₹35.00', status: 'Fulfilled', fee: '₹12.50' },
  ];

  // ── CSV Inventory ──
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<InventoryItem[] | null>(null);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [lastSync, setLastSync] = useState('Aug 9, 2:15 PM');

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate CSV parse
    setTimeout(() => {
      setCsvPreview([
        { name: 'Paracetamol 500mg', qty: 500, price: '₹2.50', batch: 'PCM-2024-D01' },
        { name: 'Amoxicillin 500mg', qty: 200, price: '₹8.00', batch: 'AMX-2024-B15' },
        { name: 'Metformin 500mg', qty: 300, price: '₹4.50', batch: 'MET-2024-A08' },
        { name: 'Cetirizine 10mg', qty: 150, price: '₹1.80', batch: 'CET-2024-C02' },
        { name: 'Omeprazole 20mg', qty: 250, price: '₹5.00', batch: 'OMP-2024-E11' },
      ]);
    }, 800);
    if (fileRef.current) fileRef.current.value = '';
  };

  const confirmCSV = () => {
    setCsvUploaded(true);
    setLastSync(new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    setTimeout(() => { setCsvUploaded(false); setCsvPreview(null); }, 3000);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: 'Active Orders', icon: <PackageCheck size={18} /> },
    { id: 'inventory', label: 'Bulk Inventory', icon: <FileSpreadsheet size={18} /> },
    { id: 'expiry', label: 'Alerts', icon: <AlertTriangle size={18} /> },
    { id: 'revenue', label: 'Payouts', icon: <DollarSign size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      <aside className="w-64 bg-emerald-900 text-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <Pill size={24} className="text-emerald-400" />
          <h1 className="text-lg font-bold">Pharmacy Network</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-emerald-800/50 text-emerald-300' : 'text-emerald-200/50 hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <button className="flex items-center gap-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white mt-auto px-4 py-3 rounded-lg font-bold transition-colors border border-red-500/30 w-full justify-start z-50 relative shadow-lg" onClick={handleLogout}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ═══ ACTIVE ORDERS ═══ */}
        {activeTab === 'orders' && (
          <>
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Fulfillment Dashboard</h2>
                <p className="text-slate-500">Manage incoming network orders and track your B2B referral revenue.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500 uppercase">Monthly Revenue</p>
                <p className="text-3xl font-black text-emerald-600">₹4,250.00</p>
              </div>
            </header>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Order ID</th><th className="p-4 font-semibold">Patient</th><th className="p-4 font-semibold">Prescription</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Referral Fee</th><th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <React.Fragment key={order.id}>
                      <tr className={idx !== orders.length - 1 && activeOrder !== order.id ? 'border-b border-slate-100' : ''}>
                        <td className="p-4 text-slate-500 font-mono text-sm">{order.id}</td>
                        <td className="p-4 font-semibold text-slate-900">{order.patient}</td>
                        <td className="p-4 text-slate-700"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs mr-2 border border-slate-200">BRAND</span>{order.prescribed}</td>
                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span></td>
                        <td className="p-4 text-right font-bold text-emerald-600">{order.fee}</td>
                        <td className="p-4 text-right">
                          {order.status === 'Pending Match' && (
                            <button onClick={() => setActiveOrder(activeOrder === order.id ? null : order.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Find Generic Match</button>
                          )}
                        </td>
                      </tr>
                      {activeOrder === order.id && (
                        <tr className="bg-indigo-50 border-b-2 border-indigo-100">
                          <td colSpan={6} className="p-6">
                            <div className="flex flex-col gap-4">
                              <h4 className="font-bold text-indigo-900 flex items-center gap-2"><Pill size={18} /> AI Generic Medicine Matching Engine</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Prescribed (Brand)</p><p className="text-lg font-bold text-slate-800">{order.prescribed}</p><p className="text-rose-500 font-bold">{order.prescribedPrice}</p></div>
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm relative"><div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 border border-indigo-200">vs</div><p className="text-xs font-bold text-emerald-600 uppercase mb-1">Bio-Equivalent Generic Match</p><p className="text-lg font-bold text-slate-800">Atorva 20mg (Zydus)</p><p className="text-emerald-600 font-bold flex items-center gap-2">₹120.00 <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">Save 73%</span></p></div>
                              </div>
                              <div className="flex justify-end mt-2"><button onClick={() => setActiveOrder(null)} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-emerald-700 transition-colors">Substitute & Fulfill Order</button></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ BULK INVENTORY ═══ */}
        {activeTab === 'inventory' && (
          <>
            <header className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Bulk Inventory Manager</h2>
                <p className="text-slate-500">Upload a CSV/Excel file to update stock levels and pricing.</p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> Last sync: {lastSync}</div>
            </header>

            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleCSV} />

            {csvUploaded ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-emerald-600" /></div>
                <h3 className="text-xl font-bold text-emerald-800 mb-1">Inventory Updated Successfully</h3>
                <p className="text-emerald-600 text-sm">5 items synced to your live stock database.</p>
              </div>
            ) : !csvPreview ? (
              <div onClick={() => fileRef.current?.click()} className="border-4 border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"><Upload size={28} className="text-emerald-600" /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Drop CSV / Excel File Here</h3>
                <p className="text-slate-500 text-sm mb-1">Columns: Medicine Name, Quantity, Unit Price, Batch Number</p>
                <p className="text-slate-400 text-xs">Supports .csv, .xlsx, .xls</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><FileSpreadsheet size={16} className="text-emerald-600" /> Preview ({csvPreview.length} items)</h3>
                    <button onClick={() => setCsvPreview(null)} className="text-xs text-slate-400 hover:text-red-500 font-bold">Cancel</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-slate-100 text-xs text-slate-400 uppercase"><th className="px-6 py-3 font-semibold">Medicine</th><th className="px-6 py-3 font-semibold">Batch</th><th className="px-6 py-3 font-semibold text-right">Qty</th><th className="px-6 py-3 font-semibold text-right">Unit Price</th></tr></thead>
                    <tbody>
                      {csvPreview.map((item, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50"><td className="px-6 py-3 font-semibold text-slate-800">{item.name}</td><td className="px-6 py-3 text-slate-500 font-mono text-xs">{item.batch}</td><td className="px-6 py-3 text-right font-bold">{item.qty}</td><td className="px-6 py-3 text-right text-emerald-600 font-bold">{item.price}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={confirmCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"><Check size={18} /> Confirm & Update Stock</button>
              </>
            )}
          </>
        )}

        {/* ═══ EXPIRY & LOW-STOCK ALERTS ═══ */}
        {activeTab === 'expiry' && (
          <>
            <header className="mb-8 border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-bold text-slate-900">Expiry & Low-Stock Alerts</h2>
              <p className="text-slate-500">Automated monitoring for at-risk inventory items.</p>
            </header>
            <div className="grid grid-cols-2 gap-6">
              {/* Expiring Soon */}
              <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h3 className="font-bold text-red-800 text-sm">Expiring Within 30 Days ({MOCK_EXPIRY.length})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {MOCK_EXPIRY.map(item => (
                    <div key={item.id} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400">Batch: {item.batch} • Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black px-2 py-1 rounded ${item.daysLeft <= 14 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {item.daysLeft} days
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{item.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Low Stock */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <h3 className="font-bold text-amber-800 text-sm">Below Minimum Stock ({MOCK_LOWSTOCK.length})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {MOCK_LOWSTOCK.map(item => (
                    <div key={item.id} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400">Current: <span className="text-red-500 font-bold">{item.current}</span> / Min: {item.threshold}</p>
                        <div className="w-32 bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((item.current / item.threshold) * 100, 100)}%` }} />
                        </div>
                      </div>
                      <button className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">Reorder</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ PAYOUTS & REVENUE ═══ */}
        {activeTab === 'revenue' && (
          <>
            <header className="mb-8 border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-bold text-slate-900">Payouts & Revenue Tracker</h2>
              <p className="text-slate-500">Track your B2B fulfillment earnings and pending settlements.</p>
            </header>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Today's Earnings</p>
                <p className="text-2xl font-black text-emerald-600 flex items-center gap-1"><IndianRupee size={18} />37.50</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1"><ArrowUpRight size={12} /> +15% vs yesterday</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">This Week</p>
                <p className="text-2xl font-black text-slate-900 flex items-center gap-1"><IndianRupee size={18} />155.50</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1"><ArrowUpRight size={12} /> +8% vs last week</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pending Settlement</p>
                <p className="text-2xl font-black text-amber-600 flex items-center gap-1"><IndianRupee size={18} />53.00</p>
                <p className="text-xs text-slate-400 mt-1">Next payout: Aug 12</p>
              </div>
            </div>
            {/* Weekly Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-4">Weekly Revenue Trend</p>
              <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
                {WEEKLY_REVENUE.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">₹{val}</span>
                    <div className="w-full rounded-t-md bg-emerald-500 transition-all" style={{ height: `${(val / Math.max(...WEEKLY_REVENUE)) * 80}px`, opacity: i === WEEKLY_REVENUE.length - 1 ? 0.5 : 1 }} />
                    <span className="text-[10px] text-slate-400">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Ledger */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-700 text-sm">Transaction Ledger</h3></div>
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs text-slate-400 uppercase"><th className="px-6 py-3 font-semibold">Date</th><th className="px-6 py-3 font-semibold">Order</th><th className="px-6 py-3 font-semibold">Medicine</th><th className="px-6 py-3 font-semibold text-right">Qty</th><th className="px-6 py-3 font-semibold text-right">Fee</th><th className="px-6 py-3 font-semibold">Status</th></tr></thead>
                <tbody>
                  {MOCK_LEDGER.map(entry => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="px-6 py-3 text-slate-500">{entry.date}</td><td className="px-6 py-3 font-mono text-xs text-slate-500">{entry.orderId}</td><td className="px-6 py-3 font-medium text-slate-800">{entry.medicine}</td><td className="px-6 py-3 text-right">{entry.qty}</td><td className="px-6 py-3 text-right font-bold text-emerald-600">{entry.fee}</td><td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${entry.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{entry.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default B2BPharmacyDashboard;
