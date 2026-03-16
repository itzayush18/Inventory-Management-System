'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { History as ActivityHistory, ArrowUpRight, ArrowDownRight, User, Calendar, ShieldCheck, Search } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs mb-2 uppercase tracking-widest">
             <ShieldCheck size={14} /> <span>Audit Protocol</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Stock Ledger</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Complete immutable history of every inventory movement.</p>
        </motion.header>

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
                placeholder="Filter ledger by asset or user..."
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-5">Transaction ID & Type</th>
                  <th className="px-8 py-5">Asset</th>
                  <th className="px-8 py-5">Volume</th>
                  <th className="px-8 py-5">Authority</th>
                  <th className="px-8 py-5">Execution Date</th>
                  <th className="px-8 py-5">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Ledger...</span>
                         </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No transaction records found.</td>
                    </tr>
                  ) : (
                    transactions.map((t: any, idx: number) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={t.id} 
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${t.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500 shadow-inner' : 'bg-rose-500/10 text-rose-500 shadow-inner'}`}>
                               {t.type === 'IN' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                               <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">TRX-{t.id}</div>
                               <div className={`font-black text-sm ${t.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'IN' ? 'RECEIPT' : 'DISPATCH'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-extrabold text-white text-base group-hover:text-blue-400 transition-colors uppercase tracking-tight">{t.product_name}</td>
                        <td className="px-8 py-5">
                          <span className="font-black text-lg font-mono">{t.type === 'IN' ? '+' : '-'}{t.quantity}</span>
                          <span className="ml-1 text-[10px] font-bold text-slate-600">UNITS</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3 text-slate-300 font-bold">
                             <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                <User size={14} className="text-blue-500" />
                             </div>
                             {t.username}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col text-slate-500 font-bold">
                            <div className="flex items-center gap-2 text-white/80 text-xs">
                              <Calendar size={12} className="text-blue-500" />
                              {new Date(t.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] mt-1 ml-5 tracking-tighter opacity-60">
                              {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-slate-400 font-medium italic border-l-2 border-white/5 pl-4 max-w-xs truncate">
                            {t.reason || 'Operational adjustment'}
                          </p>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
