import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineChartBarSquare, HiOutlineCube, HiOutlineShoppingCart,
  HiOutlineTruck, HiOutlineClock, HiOutlineBell,
  HiOutlineArrowRightOnRectangle, HiOutlineBars3, HiOutlineXMark,
  HiOutlineCog8Tooth, HiOutlineBanknotes
} from 'react-icons/hi2';
import { BiGasPump } from 'react-icons/bi';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: HiOutlineChartBarSquare },
  { path: '/products', label: 'Mes Produits', icon: HiOutlineCube },
  { path: '/orders', label: 'Commandes', icon: HiOutlineShoppingCart },
  { path: '/distributors', label: 'Distributeurs', icon: HiOutlineTruck },
  { path: '/history', label: 'Historique ventes', icon: HiOutlineClock },
  { path: '/withdrawals', label: 'Mon Portefeuille', icon: HiOutlineBanknotes },
  { path: '/notifications', label: 'Notifications', icon: HiOutlineBell },
  { path: '/settings', label: 'Paramètres', icon: HiOutlineCog8Tooth },
];

export default function Layout({ children, user, supplier, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Espace Fournisseur';

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800
        flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
            {supplier?.logo_url ? (
               <img 
                 src={(import.meta.env.VITE_API_URL || '').replace('/api', '') + supplier.logo_url} 
                 alt="Logo" 
                 className="w-full h-full object-contain"
               />
            ) : (
               <BiGasPump className="w-6 h-6 text-brand-500" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">TODJOM GAZ</h1>
            <p className="text-[10px] text-brand-400 font-medium uppercase tracking-widest">
              {user?.role === 'distributor' ? 'Livreur / Distr.' : 'Fournisseur'}
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Supplier info card */}
        {supplier && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
            <p className="text-sm font-semibold text-brand-300">{supplier.company_name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{supplier.registration_number}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={supplier.is_validated ? 'badge-success' : 'badge-warning'}>
                {supplier.is_validated ? '✓ Validé' : '⏳ En attente'}
              </span>
              <span className="text-[11px] text-gray-500">Commission: {supplier.commission_rate}%</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems
            .filter(item => {
              if (user?.role === 'distributor') {
                return ['/', '/orders', '/history', '/notifications', '/settings'].includes(item.path);
              }
              return true;
            })
            .map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-800/60">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0) || 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.full_name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={onLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Déconnexion">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/60 flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <HiOutlineBars3 className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-100">{currentPage}</h2>
          <div className="flex-1" />
          <span className="hidden md:block text-xs text-gray-500">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
