'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Box, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Minus, Layers, Users, History as ActivityHistory } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    blue: 'from-blue-600/20 to-blue-600/5 text-blue-500 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-600/5 text-emerald-500 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-600/5 text-amber-500 border-amber-500/20',
    purple: 'from-purple-600/20 to-purple-600/5 text-purple-500 border-purple-500/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`glass-card p-6 flex flex-col gap-4 bg-gradient-to-br ${colorMap[color]} group`}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{title}</p>
        <h3 className="text-4xl font-black mt-2 text-white">{value}</h3>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAction, setStockAction] = useState<'IN' | 'OUT'>('IN');
  const [stockFormData, setStockFormData] = useState({
    productId: '',
    quantity: '',
    reason: ''
  });

  const fetchStats = async () => {
    try {
      const [statsRes, prodRes] = await Promise.all([
        api.get('/dashboard-stats'),
        api.get('/products')
      ]);
      setStats(statsRes.data);
      setProducts(prodRes.data);
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
    fetchStats();
  }, []);

  const handleStockAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stock-transactions', {
        productId: stockFormData.productId,
        type: stockAction,
        quantity: Number(stockFormData.quantity),
        reason: stockFormData.reason
      });
      setIsStockModalOpen(false);
      fetchStats();
      setStockFormData({ productId: '', quantity: '', reason: '' });
    } catch (err) {
      alert('Failed to update stock. Check if quantity is valid.');
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <motion.header 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-blue-500 font-bold text-sm mb-2 px-1">
             <Layers size={14} /> <span>PLATFORM OVERVIEW</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Stock Command Center</h1>
          <p className="text-slate-400 mt-3 text-lg font-medium max-w-2xl">Monitor real-time inventory flow and manage your catalog with precision.</p>
        </motion.header>

        {/* Stock Action Modal */}
        <Modal 
          isOpen={isStockModalOpen} 
          onClose={() => setIsStockModalOpen(false)} 
          title={`Stock ${stockAction === 'IN' ? 'Inward Movement' : 'Outward Movement'}`}
        >
          <form onSubmit={handleStockAction} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Target Product</label>
              <select 
                required
                className="input-field"
                value={stockFormData.productId}
                onChange={(e) => setStockFormData({...stockFormData, productId: e.target.value})}
              >
                <option value="" className="bg-[#0f172a]">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Quantity to Adjust</label>
              <input 
                required type="number" min="1"
                className="input-field"
                placeholder="Enter amount..."
                value={stockFormData.quantity}
                onChange={(e) => setStockFormData({...stockFormData, quantity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Transaction Note</label>
              <input 
                className="input-field"
                placeholder="Why is this stock moving?"
                value={stockFormData.reason}
                onChange={(e) => setStockFormData({...stockFormData, reason: e.target.value})}
              />
            </div>
            <button className={`w-full py-4 rounded-xl font-black text-white shadow-2xl transition-all active:scale-[0.98] mt-4 ${stockAction === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'}`}>
              EXECUTE STOCK {stockAction === 'IN' ? 'RECEIPT' : 'REMOVAL'}
            </button>
          </form>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Assets" value={stats.totalProducts} icon={Box} color="blue" />
          <StatCard title="Inventory Value" value={`$${Number(stats.totalValue).toLocaleString()}`} icon={TrendingUp} color="emerald" />
          <StatCard title="Critical Stock" value={stats.lowStock} icon={AlertTriangle} color="amber" />
          <StatCard title="Operations" value={stats.recentActivities.length} icon={Users} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 glass-card p-8 group"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <ActivityHistory className="text-blue-500" />
                Live Feed
              </h2>
              <Link href="/transactions" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">View Archives</Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing data...</p>
                </div>
              ) : stats.recentActivities.length === 0 ? (
                <p className="text-slate-500 text-center py-20 font-medium">No movements recorded yet.</p>
              ) : (
                stats.recentActivities.map((activity: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={activity.id} 
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all group/item"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-xl ${activity.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500 shadow-inner' : 'bg-rose-500/10 text-rose-500 shadow-inner'}`}>
                        {activity.type === 'IN' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-black text-white group-hover/item:text-blue-400 transition-colors">{activity.product_name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-tighter">
                          {activity.type === 'IN' ? 'Inbound' : 'Outbound'} • {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${activity.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {activity.type === 'IN' ? '+' : '-'}{activity.quantity}
                      </span>
                      <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Units</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="glass-card p-8 border-t-4 border-t-blue-500 shadow-blue-500/5"
            >
              <h2 className="text-2xl font-black text-white mb-8">Stock Ops</h2>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setStockAction('IN'); setIsStockModalOpen(true); }}
                  className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 font-black group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-white/20">
                       <Plus size={24} />
                    </div>
                    <span>STOCK IN</span>
                  </div>
                  <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button 
                  onClick={() => { setStockAction('OUT'); setIsStockModalOpen(true); }}
                  className="flex items-center justify-between p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 font-black group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-rose-500/20 group-hover:bg-white/20">
                      <Minus size={24} />
                    </div>
                    <span>STOCK OUT</span>
                  </div>
                  <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <Link href="/products" className="btn-primary w-full inline-block text-center text-sm uppercase tracking-widest">
                  Add Catalog Item
                </Link>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="glass-card p-8"
            >
               <h3 className="font-black text-white mb-4 flex items-center gap-2">
                 <AlertTriangle className="text-amber-500" size={18} />
                 Inventory Health
               </h3>
               <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage Capacity</span>
                    <span className="text-sm font-black text-white">72%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '72%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                    />
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-4">
                    Automatic alerts will be sent when products hit their specified minimum stock levels.
                 </p>
               </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
