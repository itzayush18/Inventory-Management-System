'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, Tags, Truck, History, LogOut, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Products', icon: Box, href: '/products' },
    { name: 'Categories', icon: Tags, href: '/categories' },
    { name: 'Suppliers', icon: Truck, href: '/suppliers' },
    { name: 'Transactions', icon: History, href: '/transactions' },
    { name: 'Reports', icon: PieChart, href: '/reports' },
  ];

  return (
    <div className="w-72 h-screen bg-white/50 backdrop-blur-xl border-r border-slate-200 p-8 flex flex-col sticky top-0">
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Box className="text-slate-900" size={24} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Stock<span className="text-blue-600">Flux</span></h1>
      </div>
      
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                />
              )}
              <item.icon size={20} className={isActive ? 'text-blue-600' : 'group-hover:text-slate-900 transition-colors'} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-200">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-all group font-semibold text-sm"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
