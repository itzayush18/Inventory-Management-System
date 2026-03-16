'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Tag, Edit2, Trash2, Plus, Tags, Search } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', formData);
      setIsModalOpen(false);
      fetchCategories();
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs mb-2 uppercase tracking-widest">
               <Tags size={14} /> <span>TAXONOMY LOGS</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">Catalog Categories</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">Systematic organization of your inventory assets.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </motion.header>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Classification">
          <form onSubmit={handleAddCategory} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Label Name</label>
              <input 
                required
                className="input-field" 
                placeholder="e.g. Critical Hardware"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Strategic Description</label>
              <textarea 
                rows={4}
                className="input-field" 
                placeholder="Define the scope of this category..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all mt-4">
              CONFIRM CLASSIFICATION
            </button>
          </form>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-4">
                 <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                 <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Classes...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No classifications recorded.</div>
            ) : (
              categories.map((c: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={c.id} 
                  className="glass-card p-8 flex flex-col gap-6 group hover:border-blue-500/50 transition-all shadow-xl hover:shadow-blue-500/5"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                      <Tag size={28} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 border-none text-slate-400 hover:text-white transition-all shadow-lg">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-rose-600 border-none text-slate-400 hover:text-white transition-all shadow-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{c.name}</h3>
                    <p className="text-slate-400 text-sm mt-3 font-medium leading-relaxed line-clamp-3 italic">
                      {c.description || 'No descriptive protocol established for this group.'}
                    </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Records Attached</span>
                     <span className="text-sm font-black text-white bg-white/5 px-3 py-1 rounded-full border border-white/10">--</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
