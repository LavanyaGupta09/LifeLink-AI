import React, { useState } from 'react';
import { Pill, Search, Filter, Plus, ChevronDown, PackagePlus, Trash2 } from 'lucide-react';
import { usePartnerStore } from '../../../store/partnerStore';

const PharmacyInventoryPage: React.FC = () => {
  const { inventory, updateInventoryStock } = usePartnerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(0);

  const pharmacyItems = inventory.filter(i => i.category === 'pharmacy');
  
  const filteredItems = pharmacyItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemId && stockDelta !== 0) {
      updateInventoryStock(selectedItemId, stockDelta);
      setIsStockModalOpen(false);
      setSelectedItemId(null);
      setStockDelta(0);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Pill className="text-[#3D91FF]" /> Pharmacy Inventory
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage medicines, supplies, and stock levels</p>
        </div>
        <button 
          className="bg-gradient-to-r from-[#3D91FF] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B1221] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search medicine name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto bg-[#131B2F] border border-slate-700 text-slate-300 text-sm rounded-xl py-2 pl-9 pr-8 focus:outline-none focus:border-[#3D91FF] appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        
        {/* Desktop Table */}
        <div className="hidden md:block bg-[#0B1221] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131B2F] border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Item Name</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Current Stock</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Min Stock</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No items found.</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[#131B2F]/50 transition-colors group">
                  <td className="p-4 font-bold text-white text-sm">{item.name}</td>
                  <td className="p-4 font-medium text-slate-300 text-sm">{item.quantity} {item.unit}</td>
                  <td className="p-4 text-slate-500 text-sm">{item.minQuantity} {item.unit}</td>
                  <td className="p-4">
                    <div className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      item.status === 'Low Stock' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedItemId(item.id); setStockDelta(10); setIsStockModalOpen(true); }} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Update Stock">
                        <PackagePlus size={16} />
                      </button>
                      <button className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
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
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-[#0B1221] rounded-2xl border border-slate-800">No items found.</div>
          ) : filteredItems.map(item => (
            <div key={item.id} className="bg-[#0B1221] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <p className="font-bold text-white text-base">{item.name}</p>
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                  item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  item.status === 'Low Stock' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {item.status}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-xs text-slate-500">Current Stock</p>
                  <p className="font-medium text-slate-300">{item.quantity} {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Min. Required</p>
                  <p className="text-slate-400">{item.minQuantity} {item.unit}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800/50">
                <button onClick={() => { setSelectedItemId(item.id); setStockDelta(10); setIsStockModalOpen(true); }} className="flex-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"><PackagePlus size={14}/> Update</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsStockModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#0B1221] border border-slate-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Update Stock</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-white"><Plus className="rotate-45" size={20}/></button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-5 flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Quantity Change (+ or -) <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="number" 
                  value={stockDelta} 
                  onChange={e=>setStockDelta(Number(e.target.value))} 
                  className="w-full bg-[#131B2F] border border-slate-700 focus:border-[#3D91FF] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white" 
                />
                <p className="text-[10px] text-slate-500 mt-1">Use negative values to reduce stock.</p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-bold text-slate-300 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3D91FF] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacyInventoryPage;
