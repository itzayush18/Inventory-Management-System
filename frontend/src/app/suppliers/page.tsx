'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Truck, Mail, Phone, MapPin, Edit2, Trash2, Globe, Plus, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone: '', address: ''
  });

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', formData);
      setIsModalOpen(false);
      fetchSuppliers();
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
    } catch (err) {
      console.error('Failed to add supplier', err);
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
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs mb-2 uppercase tracking-widest">
               <Truck size={14} /> <span>Logistics Network</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">Supply Partners</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">Manage your upstream communication and vendor protocols.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40"
          >
            <Plus size={20} />
            <span>Onboard Supplier</span>
          </button>
        </motion.header>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Vendor Onboarding">
          <form onSubmit={handleAddSupplier} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Organization Name</label>
                <input 
                  required
                  className="input-field" 
                  placeholder="e.g. Global Tech Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Lead Liaison</label>
                <input 
                  required
                  className="input-field" 
                  placeholder="e.g. John Doe"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Terminal</label>
                <input 
                  required type="email"
                  className="input-field" 
                  placeholder="liaison@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Secure Line</label>
                <input 
                  required
                  className="input-field" 
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Operational Headquarters</label>
              <textarea 
                rows={2}
                className="input-field" 
                placeholder="Full technical address..."
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black shadow-2xl shadow-emerald-900/40 active:scale-[0.98] transition-all mt-4">
              FINALIZE ONBOARDING
            </button>
          </form>
        </Modal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-4">
                 <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                 <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Phoning Partners...</span>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No partners registered in network.</div>
            ) : (
              suppliers.map((s: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={s.id} 
                  className="glass-card p-8 group relative overflow-hidden hover:border-emerald-500/50 transition-all"
                >
                  <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 border-none transition-all text-slate-400 hover:text-white shadow-lg">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-rose-600 border-none transition-all text-slate-400 hover:text-white shadow-lg">
                        <Trash2 size={16} />
                      </button>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-5 rounded-3xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                      <Truck size={36} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">{s.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                         <UserCheck size={12} className="text-emerald-500" />
                         <span>Agent: {s.contact_person || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group/item">
                        <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-blue-500/20 group-hover/item:text-blue-500 transition-all">
                           <Mail size={18} />
                        </div>
                        <span className="text-sm font-semibold text-slate-400 group-hover/item:text-white transition-colors">{s.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-4 group/item">
                        <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-emerald-500/20 group-hover/item:text-emerald-500 transition-all">
                           <Phone size={18} />
                        </div>
                        <span className="text-sm font-semibold text-slate-400 group-hover/item:text-white transition-colors">{s.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 group/item">
                        <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-amber-500/20 group-hover/item:text-amber-500 transition-all shrink-0">
                           <MapPin size={18} />
                        </div>
                        <span className="text-sm font-medium text-slate-400 leading-relaxed group-hover/item:text-white transition-colors line-clamp-2">{s.address || 'Field Headquarters Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                     <button className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/5">
                        <Globe size={16} className="text-blue-500" />
                        Network Node
                     </button>
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
