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
    <div className="flex bg-[#f8fafc] min-h-screen text-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] mb-1 uppercase tracking-widest">
              <ShieldCheck size={14} /> <span>AUDIT PROTOCOL</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Ledger</h1>
          <p className="text-slate-600 mt-1 text-base font-medium">Complete immutable history of every inventory movement.</p>
        </motion.header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Filter ledger by asset or user..."
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 py-4">Transaction ID & Type</th>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4">Authority</th>
                  <th className="px-6 py-4">Execution Date</th>
                  <th className="px-6 py-4">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${t.transaction_type === 'IN' || t.transaction_type === 'RETURN' ? 'bg-emerald-500/10 text-emerald-500 shadow-inner' : 'bg-rose-500/10 text-rose-500 shadow-inner'}`}>
                               {t.transaction_type === 'IN' || t.transaction_type === 'RETURN' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                               <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">TRX-{t.id}</div>
                               <div className={`font-black text-xs ${t.transaction_type === 'IN' || t.transaction_type === 'RETURN' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.transaction_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{t.product_name}</td>
                        <td className="px-6 py-4">
                          <span className="font-black text-base font-mono">{t.transaction_type === 'IN' || t.transaction_type === 'RETURN' ? '+' : '-'}{t.quantity}</span>
                          <span className="ml-1 text-[9px] font-bold text-slate-600">UNITS</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                             <div className="w-6 h-6 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                <User size={12} className="text-blue-500" />
                             </div>
                             {t.username}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-slate-500 font-bold">
                            <div className="flex items-center gap-2 text-slate-700 text-[10px]">
                              <Calendar size={10} className="text-blue-500" />
                              {new Date(t.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-[9px] mt-0.5 ml-4 tracking-tighter opacity-60">
                              {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 font-medium italic border-l border-slate-300 pl-3 max-w-xs truncate text-[11px]">
                            {t.notes || (t.reference_id ? `Ref: ${t.reference_id}` : 'Operational adjustment')}
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
