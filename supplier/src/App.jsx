import React, { useState, useEffect } from 'react';
import { LayoutGrid, Package, ChevronRight, User as UserIcon, Power, TrendingUp, BarChart3, Users, Box, Bell, ShieldCheck, Truck, Activity, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [stats, setStats] = useState({ total_sales: 0, active_depots: 0, stock_alert: 0 });

  useEffect(() => {
    // Intercepter les paramètres du portail
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');

    if (urlToken && urlUser) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(urlUser));
        if (decodedUser) {
          localStorage.setItem('token', urlToken);
          localStorage.setItem('user', JSON.stringify(decodedUser));
          setUser(decodedUser);
          setIsLoggedIn(true);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Erreur décodage utilisateur portail', e);
      }
    }

    if (localStorage.getItem('token')) fetchStats();
  }, [isLoggedIn]);

  const fetchStats = async () => {
    // Simulating stats for the brand
    setStats({ total_sales: '2.4M', active_depots: 12, stock_alert: 3 });
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginView setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;

  return (
    <div className="min-h-screen bg-[#050508] text-white font-outfit relative overflow-hidden flex flex-col">
      <Toaster position="top-center" />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Hub Sidebar Stitch */}
        <aside className="w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col p-8 z-30">
           <div className="mb-16">
              <h1 className="text-2xl font-black tracking-tighter text-white">HUB<span className="text-brand-500">.</span>FOURNISSEUR</h1>
              <p className="text-[10px] font-black text-gray-500 tracking-[0.4em] mt-1 uppercase">Corporate Terminal</p>
           </div>

           <nav className="flex-1 space-y-2">
              {[
                { label: 'Tableau de Bord', icon: BarChart3, active: true },
                { label: 'Réseau Dépôts', icon: Truck },
                { label: 'Catalogue Produits', icon: Package },
                { label: 'Rapports Ventes', icon: DollarSign },
                { label: 'Paramètres Marque', icon: ShieldCheck }
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all ${item.active ? 'bg-white/5 text-brand-500 border border-white/10' : 'text-gray-500 hover:text-white'}`}>
                   <item.icon size={20} />
                   <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
           </nav>

           <div className="mt-auto pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/5">
                 <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-black font-black text-xs">
                    {user?.full_name?.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white truncate uppercase">{user?.full_name}</p>
                    <p className="text-[9px] font-bold text-gray-500">Brand Executive</p>
                 </div>
                 <button onClick={handleLogout} className="text-gray-600 hover:text-red-500"><Power size={18}/></button>
              </div>
           </div>
        </aside>

        {/* Main Hub Area */}
        <main className="flex-1 overflow-y-auto px-12 py-12 no-scrollbar z-20">
           
           {/* Top Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                { label: 'Volume d\'Affaires', value: stats.total_sales + ' F', icon: TrendingUp, color: 'text-brand-500' },
                { label: 'Points de Vente', value: stats.active_depots, icon: Users, color: 'text-blue-500' },
                { label: 'Alertes Stocks', value: stats.stock_alert, icon: Activity, color: 'text-red-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.03] border border-white/5 p-8 rounded-[3.5rem] backdrop-blur-3xl group hover:border-white/10 transition-all">
                   <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                         <stat.icon size={24} />
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Total 30 Jours</span>
                   </div>
                   <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{stat.value}</h3>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
           </div>

           {/* Content Sections */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Distribution Map / List */}
              <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-10">
                 <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-black tracking-tight uppercase text-xs opacity-50">Flux Distribution</h2>
                    <button className="text-brand-500 text-[10px] font-black uppercase tracking-widest hover:underline">Voir Tout</button>
                 </div>
                 
                 <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between border-b border-white/5 pb-6 last:border-0">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-white/10">
                               <Truck className="text-gray-600" />
                            </div>
                            <div>
                               <p className="text-sm font-black text-white">Dépôt Amadou Niamey</p>
                               <p className="text-[10px] font-bold text-gray-600 uppercase">Livraison prévue: 14:00</p>
                            </div>
                         </div>
                         <span className="text-xs font-black text-brand-500 text-right">+150 Unités</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Stock Performance Chart Placeholder */}
              <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-10 flex flex-col">
                 <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-black tracking-tight uppercase text-xs opacity-50">Performance Catalogue</h2>
                 </div>
                 <div className="flex-1 flex flex-col justify-end gap-4 px-4 pb-2">
                    {[
                      { l: '3kg', h: 'h-32', v: '45%' },
                      { l: '6kg', h: 'h-52', v: '78%' },
                      { l: '12kg', h: 'h-40', v: '62%' }
                    ].map(bar => (
                      <div key={bar.l} className="flex items-center gap-6">
                         <span className="text-[10px] font-black text-gray-500 w-10 uppercase">{bar.l}</span>
                         <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: bar.v }} className="h-full brand-gradient shadow-lg" />
                         </div>
                         <span className="text-[10px] font-black text-white w-10 text-right">{bar.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

        </main>
      </div>
    </div>
  );
}

function LoginView({ setIsLoggedIn, setUser }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { login: e.target[0].value, password: e.target[1].value };
      const res = await axios.post('http://localhost:3000/api/auth/login', data);
      localStorage.setItem('token', res.data.data.tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setUser(res.data.data.user);
      setIsLoggedIn(true);
      toast.success("Authentification Corporate Réussie");
    } catch (e) {
      toast.error("Vérification échouée");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col justify-center p-8 font-outfit relative">
       <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px]" />
       <div className="max-w-[450px] mx-auto w-full relative z-10">
          <div className="w-24 h-24 bg-black border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-brand-500 opacity-20 group-hover:opacity-40 transition-opacity" />
             <BarChart3 size={40} className="text-brand-500" />
          </div>
          <h1 className="text-5xl font-black mb-2 text-white tracking-tighter italic">HUB<span className="text-brand-500">.</span>CORP</h1>
          <p className="text-gray-500 font-bold mb-12 text-sm uppercase tracking-[0.3em]">Accès sécurisé réservé aux marques</p>
          <form onSubmit={handleLogin} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Corporate Email</label>
                <input type="email" placeholder="executive@brand.com" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-brand-500 transition-all font-bold"/>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Access Key</label>
                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-brand-500 transition-all font-bold"/>
             </div>
             <button disabled={loading} className="w-full brand-gradient text-white py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl mt-4">
                {loading ? <Activity className="animate-spin mx-auto"/> : "INITIALISER SESSION HUB"}
             </button>
          </form>
       </div>
    </div>
  );
}
