import React, { useState, useEffect } from 'react';
import { LayoutGrid, Package, ChevronRight, User as UserIcon, LogOut, Clock, ArrowLeft, Phone, ShoppingCart, Box, AlertTriangle, CheckCircle, Search, RefreshCw, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [stocks, setStocks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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

    if (localStorage.getItem('token')) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [stockRes, orderRes] = await Promise.all([
        axios.get('http://localhost:3000/api/inventory/me', { headers: { Authorization: `Bearer ${token}` }}),
        axios.get('http://localhost:3000/api/orders/for-distributor', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setStocks(stockRes.data.data || []);
      setOrders(orderRes.data.data || []);
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginView setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;

  return (
    <div className="min-h-screen bg-[#050508] text-white font-outfit relative overflow-hidden flex flex-col">
      <Toaster position="top-center" />
      
      {/* Background Neon Orbs */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Top POS Header */}
      <header className="px-8 pt-12 pb-8 flex justify-between items-center z-20 sticky top-0 bg-[#050508]/80 backdrop-blur-2xl border-b border-white/5">
        <div>
           <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">TODJOM<span className="text-brand-500">.</span>POS</h1>
           <p className="text-[10px] font-black text-gray-500 tracking-[0.4em] mt-1">Terminal de Dépôt v4.2</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white uppercase">{user?.full_name}</p>
              <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest">{user?.neighborhood || 'Secteur Niamey'}</p>
           </div>
           <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all">
              <Power size={20} />
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar space-y-12 pb-32">
        
        {/* Monitoring Section (Stocks) */}
        <section>
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
                <Box size={16} className="text-brand-500" /> État des Stocks
             </h2>
             <button onClick={fetchData} className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><RefreshCw size={14}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {stocks.map(item => (
                <div key={item.id} className="bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group">
                   {item.quantity < 5 && (
                      <div className="absolute top-0 right-0 p-4">
                         <AlertTriangle className="text-orange-500 animate-pulse" size={24} />
                      </div>
                   )}
                   <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter mb-1">Bouteilles {item.product?.weight_kg}kg</p>
                   <h3 className="text-3xl font-black mb-6">{item.product?.brand?.name || 'Niger Gaz'}</h3>
                   
                   <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                         <span className="text-5xl font-black text-white">{item.quantity}</span>
                         <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest mt-1">Disponibles</span>
                      </div>
                      <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                         <Package className="text-brand-500" size={24} />
                      </div>
                   </div>
                </div>
             ))}
             {/* Add/Order Card */}
             <div className="bg-brand-500/5 border-2 border-dashed border-brand-500/20 p-8 rounded-[3rem] flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-brand-500/10 transition-all">
                <Plus className="text-brand-500 mb-4 group-hover:scale-125 transition-transform" size={40} />
                <p className="text-[10px] font-black uppercase text-brand-500 tracking-widest">Ravitailler Stock</p>
             </div>
          </div>
        </section>

        {/* Live Operations (Orders for pickup) */}
        <section>
           <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8 flex items-center gap-3">
              <ShoppingCart size={16} className="text-brand-500" /> File des Retraits
           </h2>

           <div className="space-y-4">
              {orders.length === 0 ? (
                 <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-20 text-center flex flex-col items-center">
                    <Clock className="text-gray-800 mb-6" size={48} />
                    <p className="text-gray-500 font-bold max-w-xs uppercase text-[10px] tracking-widest leading-loose">Aucune demande de retrait active pour ce terminal.</p>
                 </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white/[0.04] transition-all">
                     <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center relative shadow-2xl">
                           <div className="absolute inset-0 bg-brand-500 opacity-10 animate-pulse rounded-3xl" />
                           <UserIcon className="text-gray-600" size={32} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Code Retrait: #{order.id.split('-')[0]}</p>
                           <h3 className="text-2xl font-black text-white">{order.user?.full_name}</h3>
                           <div className="flex items-center gap-2 mt-2">
                              <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">Payé</span>
                              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{order.weight_kg}kg • {order.brand?.name}</span>
                           </div>
                        </div>
                     </div>
                     <button className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-brand-500 transition-all flex items-center justify-center gap-3">
                        <CheckCircle size={18} /> Valider la Sortie
                     </button>
                  </div>
                ))
              )}
           </div>
        </section>

      </main>

      {/* Global POS Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-8 z-50">
         <div className="p-4 text-brand-500 scale-110"><LayoutGrid size={28}/></div>
         <div className="p-4 text-gray-700 bg-white/5 rounded-3xl"><Box size={24}/></div>
         <div className="p-4 text-gray-700"><Phone size={24}/></div>
      </nav>
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
      toast.success("POS Dépôt Connecté");
    } catch (e) {
      toast.error("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col justify-center p-8 font-outfit relative">
       <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px]" />
       <div className="max-w-sm mx-auto w-full relative z-10">
          <div className="w-24 h-24 bg-brand-500 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-brand-500/20 rotate-12 transition-transform hover:rotate-0">
             <Package size={48} className="text-black" />
          </div>
          <h1 className="text-4xl font-black mb-2 text-white">DEPOT<span className="text-brand-500">.</span>POS</h1>
          <p className="text-gray-500 font-bold mb-10 text-sm uppercase tracking-widest">Accès au terminal de distribution</p>
          <form onSubmit={handleLogin} className="space-y-4">
             <input type="text" placeholder="ID Boutique" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-brand-500 transition-all font-bold"/>
             <input type="password" placeholder="Clé d'accès" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-brand-500 transition-all font-bold"/>
             <button disabled={loading} className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl mt-4">
                {loading ? <RefreshCw className="animate-spin mx-auto"/> : "OUVRIR TERMINAL"}
             </button>
          </form>
       </div>
    </div>
  );
}
