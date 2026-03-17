'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Search, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, Package, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    description: '',
    price: '',
    stock_quantity: '0',
    min_stock_level: '5'
  });

  const fetchInitialData = async () => {
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/suppliers')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      }
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setIsModalOpen(false);
      fetchInitialData();
      setFormData({
        name: '', sku: '', category_id: '', supplier_id: '',
        description: '', price: '', stock_quantity: '0', min_stock_level: '5'
      });
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs mb-2 uppercase tracking-widest">
               <Package size={14} /> <span>Warehouse Management</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">Products Catalog</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">Detailed oversight of your inventory assets and stock thresholds.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add New Item</span>
          </button>
        </motion.header>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Asset">
          <form onSubmit={handleAddProduct} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Asset Name</label>
                <input 
                  required
                  className="input-field" 
                  placeholder="e.g. MacBook Pro M3"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Serial SKU</label>
                <input 
                  required
                  className="input-field" 
                  placeholder="e.g. LAP-MBP-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Classification</label>
                <select 
                  className="input-field"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="" className="bg-[#0f172a]">Select Category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Primary Supplier</label>
                <select 
                  className="input-field"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                >
                  <option value="" className="bg-[#0f172a]">Select Supplier</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id} className="bg-[#0f172a]">{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Unit Price (₹)</label>
                <input 
                  required type="number" step="0.01"
                  className="input-field" 
                  placeholder="1299.99"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Opening Volume</label>
                <input 
                  required type="number"
                  className="input-field" 
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Technical Specifications</label>
              <textarea 
                rows={3}
                className="input-field" 
                placeholder="Describe the product features..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all mt-4">
              CONFIRM REGISTRATION
            </button>
          </form>
        </Modal>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.02]">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-semibold"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-black hover:bg-white/10 transition-all uppercase tracking-widest">
                <Filter size={18} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-5">Asset Information</th>
                  <th className="px-8 py-5">Serial SKU</th>
                  <th className="px-8 py-5">Classification</th>
                  <th className="px-8 py-5">Value</th>
                  <th className="px-8 py-5">Supply Status</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-slate-500 font-bold tracking-widest uppercase text-xs">Cataloging...</span>
                         </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No matching assets found.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p: any, idx: number) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={p.id} 
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-all">
                               <ShoppingBag className="text-slate-500 group-hover:text-blue-500" size={20} />
                            </div>
                            <div>
                              <div className="font-extrabold text-white group-hover:text-blue-400 transition-colors text-base">{p.name}</div>
                              <div className="text-xs text-slate-500 font-medium truncate max-w-[200px] mt-0.5">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-mono font-bold tracking-tighter">{p.sku}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-wider">{p.category_name || 'General'}</span>
                        </td>
                        <td className="px-8 py-5 font-black text-white text-lg">₹{Number(p.price).toFixed(2)}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className={`w-2.5 h-2.5 rounded-full ${p.stock_quantity <= p.min_stock_level ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'}`}></div>
                             <span className={`font-black text-base ${p.stock_quantity <= p.min_stock_level ? 'text-rose-500' : 'text-slate-200'}`}>{p.stock_quantity}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 border-none transition-all text-slate-400 hover:text-white shadow-lg">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-rose-600 border-none transition-all text-slate-400 hover:text-white shadow-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-white/5 flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <span>Active Record: {filteredProducts.length} Items</span>
            <div className="flex gap-3">
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <ChevronLeft size={18} />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
