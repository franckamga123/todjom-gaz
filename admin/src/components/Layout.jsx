import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineChartBarSquare, HiOutlineUsers, HiOutlineShoppingCart,
  HiOutlineBuildingStorefront, HiOutlineExclamationTriangle,
  HiOutlineCog8Tooth, HiOutlineDocumentText,
  HiOutlineArrowRightOnRectangle, HiOutlineBars3, HiOutlineXMark,
  HiOutlineFire, HiOutlineBellAlert,
  HiOutlineBanknotes, HiOutlineCube, HiOutlineShieldCheck,
  HiOutlinePaintBrush, HiOutlineTag
} from 'react-icons/hi2';

const navItems = [
  { path: '/', label: 'Overview', icon: HiOutlineChartBarSquare },
  { path: '/users', label: 'Utilisateurs', icon: HiOutlineUsers },
  { path: '/orders', label: 'Commandes', icon: HiOutlineShoppingCart },
  { path: '/withdrawals', label: 'Finances', icon: HiOutlineBanknotes },
  { path: '/brands', label: 'Marques & Prix', icon: HiOutlineTag },
  { path: '/branding', label: 'Design STITCH', icon: HiOutlinePaintBrush },
  { path: '/suppliers', label: 'Fournisseurs', icon: HiOutlineBuildingStorefront },
  { path: '/products', label: 'Catalogue', icon: HiOutlineCube },
  { path: '/disputes', label: 'Litiges', icon: HiOutlineExclamationTriangle },
  { path: '/emergencies', label: 'Urgences', icon: HiOutlineBellAlert },
  { path: '/safety', label: 'Sécurité', icon: HiOutlineShieldCheck },
  { path: '/settings', label: 'Configuration', icon: HiOutlineCog8Tooth },
  { path: '/logs', label: 'Rapports Logs', icon: HiOutlineDocumentText },
];

export default function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Console Centrale';

  return (
    <div className="flex h-screen overflow-hidden bg-[#050508] font-outfit selection:bg-brand-500 selection:text-black">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/5 rounded-full blur-[120px] opacity-40 animate-pulse" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Sidebar STITCH style */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5
        flex flex-col transform transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo STITCH */}
        <div className="flex items-center gap-4 px-8 py-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center border border-white/10 shadow-2xl">
               <HiOutlineFire className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-2xl text-white tracking-tighter leading-none">TODJOM<span className="text-brand-500">.</span></h1>
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-1">Stitch Engine v4</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-4 px-4 overflow-y-auto space-y-1 no-scrollbar">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl text-[12px] font-black
                transition-all duration-500 relative group uppercase tracking-widest
                ${isActive
                  ? 'bg-white/5 text-white border border-white/10'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-brand-500' : 'text-gray-600'}`} />
                  <span className="opacity-80 group-hover:opacity-100">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Info */}
        <div className="p-6 border-t border-white/10 bg-black/40">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-brand-500">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase text-white truncate">{user?.full_name || 'Admin'}</p>
                 <p className="text-[9px] font-bold uppercase text-brand-500">Super User</p>
              </div>
              <button onClick={onLogout} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                 <HiOutlineArrowRightOnRectangle size={20} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050508] relative">
        {/* Header STITCH */}
        <header className="h-24 bg-black/20 backdrop-blur-2xl border-b border-white/5 flex items-center px-12 gap-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white bg-white/5 p-3 rounded-2xl border border-white/10">
            <HiOutlineBars3 size={24} />
          </button>

          <div className="flex flex-col">
             <h2 className="text-2xl font-black text-white tracking-widest uppercase text-xs opacity-50 mb-1">Système Opérationnel</h2>
             <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-white tracking-tighter leading-none">{currentPage}</h3>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse mt-1" />
             </div>
          </div>

          <div className="flex-1" />

          {/* Time & Alerts */}
          <div className="hidden md:flex items-center gap-8">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date())}</p>
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{new Date().toLocaleDateString()}</p>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <button className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-500 transition-all">
                <HiOutlineXMark size={24} className="hidden lg:block opacity-0 group-hover:opacity-100" />
                <HiOutlineBellAlert size={24} />
             </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-12 py-10 no-scrollbar">
           <div className="max-w-7xl mx-auto">
             {children}
           </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
