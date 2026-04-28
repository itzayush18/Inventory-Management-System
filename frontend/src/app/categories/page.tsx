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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', parent_id: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, formData);
      } else {
        await api.post('/categories', {
          name: formData.name,
          parent_id: formData.parent_id || null
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchCategories();
      setFormData({ name: '', parent_id: '' });
    } catch (err) {
      console.error('Failed to save category', err);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      parent_id: category.parent_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this category? Products will lose this classification.')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error('Failed to delete category', err);
      }
    }
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-screen text-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] mb-1 uppercase tracking-widest">
               <Tags size={14} /> <span>TAXONOMY LOGS</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catalog Categories</h1>
            <p className="text-slate-400 mt-1 text-base font-medium">Systematic organization of your inventory assets.</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', parent_id: '' });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </motion.header>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modify Classification" : "New Classification"}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-1">Label Name</label>
              <input 
                required
                className="input-field" 
                placeholder="e.g. Critical Hardware"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-1">Parent Category</label>
              <select 
                className="input-field"
                value={formData.parent_id}
                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
              >
                <option value="" className="bg-white text-slate-900">None (Top Level)</option>
                {categories.map((c: any) => <option key={c.id} value={c.id} className="bg-white text-slate-900">{c.name}</option>)}
              </select>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all mt-4">
              {editingId ? "UPDATE CLASSIFICATION" : "CONFIRM CLASSIFICATION"}
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
                    <div className="p-3 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                      <Tag size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="p-2 rounded-lg bg-blue-100 border border-blue-300 hover:bg-blue-600 border-none text-blue-700 hover:text-white transition-all shadow-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg bg-rose-100 border border-rose-300 hover:bg-rose-600 border-none text-rose-700 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.name}</h3>
                    <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                       <Tags size={10} className="text-blue-500" />
                       <span>{c.parent_name ? `Subcategory of ${c.parent_name}` : 'Root Classification'}</span>
                    </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Record ID</span>
                     <span className="text-sm font-black text-slate-900 bg-slate-200 px-3 py-1 rounded-full border border-slate-300">{c.id}</span>
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
