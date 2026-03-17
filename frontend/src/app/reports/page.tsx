'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Database, TrendingUp, AlertTriangle, RefreshCw, Zap, Table as TableIcon, Activity, CheckCircle} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [criticalStock, setCriticalStock] = useState([]);
  const [premiumProducts, setPremiumProducts] = useState([]);
  const [comprehensiveView, setComprehensiveView] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procLoading, setProcLoading] = useState(false);
  const [procLogs, setProcLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, critRes, premRes, compRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/critical-stock'),
        api.get('/reports/premium-products'),
        api.get('/reports/comprehensive-view')
      ]);
      setStats(statsRes.data);
      setCriticalStock(critRes.data);
      setPremiumProducts(premRes.data);
      setComprehensiveView(compRes.data);
    } catch (err) {
      console.error('Failed to fetch reports data', err);
    } finally {
      setLoading(false);
    }
  };

  const runProcedure = async () => {
    setProcLoading(true);
    try {
      const res = await api.post('/reports/process-stock');
      setProcLogs(res.data.alerts);
      fetchData(); // Refresh other data
    } catch (err) {
      console.error('Failed to run procedure', err);
    } finally {
      setProcLoading(false);
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs mb-2 uppercase tracking-widest">
               <Database size={14} /> <span>System Reports</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">System Intelligence</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">Comprehensive insights and automated diagnostics for your inventory.</p>
          </div>
        </motion.header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            <span className="text-slate-500 mt-6 font-bold tracking-widest uppercase text-sm">Aggregating Data...</span>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            
            {/* Section 1: Aggregate Functions & Views */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-3">
                 <TrendingUp className="text-emerald-500" size={24}/>
                 Overall Inventory Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors border-emerald-500/20 w-full">
                  <div className="text-emerald-500/80 uppercase text-xs font-black tracking-widest mb-2">Total Assets</div>
                  <div className="text-xl lg:text-2xl font-black text-white break-words">{stats?.overall?.total_products || 0}</div>
                </div>
                <div className="glass-card p-6 bg-blue-500/5 hover:bg-blue-500/10 transition-colors border-blue-500/20 w-full">
                  <div className="text-blue-500/80 uppercase text-xs font-black tracking-widest mb-2">Total Stock</div>
                  <div className="text-xl lg:text-2xl font-black text-white break-words">{stats?.overall?.total_stock || 0}</div>
                </div>
                <div className="glass-card p-6 bg-amber-500/5 hover:bg-amber-500/10 transition-colors border-amber-500/20 w-full">
                  <div className="text-amber-500/80 uppercase text-xs font-black tracking-widest mb-2">Avg Price</div>
                  <div className="text-xl lg:text-2xl font-black text-white break-words">₹{Number(stats?.overall?.average_price || 0).toFixed(2)}</div>
                </div>
                <div className="glass-card p-6 bg-purple-500/5 hover:bg-purple-500/10 transition-colors border-purple-500/20 w-full">
                  <div className="text-purple-500/80 uppercase text-xs font-black tracking-widest mb-2">Total Value</div>
                  <div className="text-xl lg:text-2xl font-black text-white break-words">₹{Number(stats?.overall?.total_inventory_value || 0).toFixed(2)}</div>
                </div>
              </div>
            </section>

            {/* Section 2: Set Operations (UNION) */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-3">
                 <AlertTriangle className="text-rose-500" size={24}/>
                 Critical Stock Alerts
              </h2>
              <div className="glass-card p-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-rose-500 text-[10px] uppercase tracking-[0.2em] font-black">
                      <th className="px-6 py-4">Alert Type</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Min. Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {criticalStock.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 flex items-center gap-2 text-emerald-500 font-bold"><CheckCircle size={18}/> No critical items found!</td></tr>
                    ) : (
                      criticalStock.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4">
                             <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 text-[10px] font-black">{item.alert_type}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                          <td className="px-6 py-4 font-mono text-rose-400">{item.stock_quantity}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{item.min_stock_level}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Subqueries */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-3">
                 <Zap className="text-amber-500" size={24}/>
                 Premium Products (Above Average Price)
              </h2>
              <div className="flex flex-wrap gap-4">
                 {premiumProducts.map((p: any) => (
                   <div key={p.id} className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 min-w-[250px] flex-1">
                      <div className="text-amber-500 uppercase text-[10px] font-black tracking-widest mb-1">Premium Item</div>
                      <div className="text-lg font-black text-white">{p.name}</div>
                      <div className="text-2xl font-black text-white mt-3">₹{Number(p.price).toFixed(2)}</div>
                   </div>
                 ))}
                 {premiumProducts.length === 0 && <div className="text-slate-500 font-bold">No items match the premium conditions.</div>}
              </div>
            </section>

            {/* Section 4: Views */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-3">
                 <TableIcon className="text-blue-500" size={24}/>
                 Comprehensive Product Directory
              </h2>
              <div className="glass-card p-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-900/80 text-blue-500 text-[10px] uppercase tracking-[0.2em] font-black">
                      <th className="px-6 py-4">ID / SKU</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {comprehensiveView.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-mono text-slate-500 max-w-[100px] truncate">{item.sku}</td>
                        <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{item.product_name}</td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">{item.category_name || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 max-w-[150px] truncate">{item.supplier_name || 'N/A'}</td>
                        <td className="px-6 py-4 font-black">₹{Number(item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5: Procedures */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-3">
                 <Activity className="text-purple-500" size={24}/>
                 Automated Stock Processing
              </h2>
              <div className="glass-card p-8 bg-purple-500/5 border-purple-500/20 text-center md:text-left flex flex-col md:flex-row gap-8 items-center justify-between">
                 <div className="max-w-xl">
                    <h3 className="text-2xl font-black text-white mb-2">Process Low Stock Diagnostics</h3>
                    <p className="text-slate-400 font-medium">Automatically iterates over low stock items, generating necessary diagnostic logs and alerts for seamless inventory management.</p>
                 </div>
                 <button 
                    className="btn-primary bg-purple-600 hover:bg-purple-500 shadow-purple-900/40 px-8 py-4 whitespace-nowrap flex items-center gap-3"
                    onClick={runProcedure}
                    disabled={procLoading}
                 >
                    {procLoading ? <RefreshCw className="animate-spin" size={20}/> : <Zap size={20}/>}
                    <span className="font-black tracking-widest uppercase text-sm">{procLoading ? 'Executing...' : 'Trigger Procedure'}</span>
                 </button>
              </div>

              {procLogs.length > 0 && (
                <div className="mt-6 glass-card p-6 border-slate-700 bg-slate-900">
                    <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Latest Automated Stock Logs</h4>
                    <div className="space-y-3">
                       {procLogs.map((log: any, i) => (
                          <div key={i} className="flex gap-4 items-center bg-black/20 p-3 flex-wrap rounded-lg">
                             <div className="text-[10px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleString()}</div>
                             <div className="font-mono text-sm text-purple-400">{log.action}</div>
                          </div>
                       ))}
                    </div>
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
