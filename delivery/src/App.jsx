import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Search, Plus, CheckCircle2, Loader2, Navigation, ChevronRight, User as UserIcon, LogOut, ArrowLeft, Clock, ShieldAlert, Package, Phone, LayoutGrid, Power, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [orders, setOrders] = useState([]);
  
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

    if (localStorage.getItem('token')) fetchDeliveries();
  }, [isLoggedIn]);

  const fetchDeliveries = async () => {
     try {
       const token = localStorage.getItem('token');
       const res = await axios.get('http://localhost:3000/api/orders/delivery/pending', {
         headers: { Authorization: `Bearer ${token}` }
       });
       setOrders(res.data.data || []);
     } catch (e) {}
  };

  const toggleStatus = () => {
    setOnline(!online);
    toast.success(online ? "Vous êtes hors-ligne" : "Vous êtes en ligne !");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
  };

  // Auth View can reuse the portal login logic
  if (!isLoggedIn) {
     return <LoginView setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white font-outfit relative overflow-hidden flex flex-col">
      <Toaster position="top-center" />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
         <div className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-1000 ${online ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
      </div>

      {/* Top Header Stitch */}
      <header className="px-6 pt-10 pb-6 flex justify-between items-center z-10">
         <div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Terminal Livreur</p>
            <h1 className="text-2xl font-black tracking-tighter">TODJOM<span className="text-brand-500">.</span> DELIVERY</h1>
         </div>
         <button onClick={toggleStatus} className={`w-14 h-14 rounded-[2rem] flex items-center justify-center transition-all shadow-xl shadow-black/20 border ${online ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
            <Power size={24} />
         </button>
      </header>

      {/* Summary Stats */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-10 z-10">
         <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-3xl">
            <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Gains Jour</p>
            <h3 className="text-2xl font-black text-brand-500">12 400F</h3>
         </div>
         <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-3xl">
            <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Trajets</p>
            <h3 className="text-2xl font-black text-white">8 <span className="text-[10px] text-gray-600">Total</span></h3>
         </div>
      </div>

      {/* Mission List */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 z-10 no-scrollbar">
         <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Missions Disponibles</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
               <span className="text-[10px] font-bold text-brand-500 uppercase tracking-tighter">Live Access</span>
            </div>
         </div>

         <div className="space-y-4">
            {orders.length === 0 ? (
               <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
                     <Clock className="text-gray-700" size={32} />
                  </div>
                  <p className="text-gray-500 font-bold text-sm tracking-tight px-10">En attente de nouvelles commandes dans votre périmètre...</p>
               </div>
            ) : (
               orders.map(order => (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={order.id} className="bg-white/5 border border-white/5 p-6 rounded-[3rem] backdrop-blur-3xl flex flex-col gap-6 relative overflow-hidden group">
                     {/* Delivery Badge */}
                     <div className="absolute top-0 right-0 px-6 py-2 bg-brand-500 text-black font-black text-[9px] uppercase rounded-bl-[1.5rem] tracking-widest">
                        Course +800F
                     </div>

                     <div className="flex items-start gap-5 pt-4">
                        <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center border border-white/10">
                           <Package className="text-gray-600" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-white">Gaz {order.weight_kg}kg</h3>
                           <p className="text-[10px] font-black uppercase text-brand-500 tracking-tighter">Client: {order.user?.full_name}</p>
                        </div>
                     </div>

                     <div className="space-y-4 border-l-2 border-white/5 ml-7 pl-6 py-2">
                        <div className="relative">
                           <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full border-2 border-[#050508]" />
                           <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Point A (Récupération)</p>
                           <p className="text-xs font-bold text-white truncate">{order.distributor?.shop_name || 'Dépôt'}</p>
                        </div>
                        <div className="relative">
                           <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-500 rounded-full border-2 border-[#050508]" />
                           <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Point B (Livraison)</p>
                           <p className="text-xs font-bold text-white truncate lowercase opacity-80">{order.delivery_latitude}, {order.delivery_longitude}</p>
                        </div>
                     </div>

                     <button className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-brand-500 transition-all flex items-center justify-center gap-2">
                        Accepter la Mission <ChevronRight size={18} />
                     </button>
                  </motion.div>
               ))
            )}
         </div>
      </main>

      {/* Bottom Nav Stitch */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-8 z-50">
         <div className="p-4 text-brand-500"><TrendingUp size={24}/></div>
         <div className="p-4 text-gray-700 bg-white/5 rounded-full"><LayoutGrid size={24}/></div>
         <div onClick={handleLogout} className="p-4 text-gray-700 hover:text-red-500"><Power size={24}/></div>
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
      toast.success("Terminal Livreur Activé");
    } catch (e) {
      toast.error("Accès refusé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center p-8 font-outfit relative">
       <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px]" />
       <div className="max-w-sm mx-auto w-full relative z-10">
          <div className="w-24 h-24 bg-brand-500 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-brand-500/20 rotate-6">
             <Truck size={48} className="text-black -rotate-6" />
          </div>
          <h1 className="text-4xl font-black mb-2 text-white">LIVREUR<span className="text-brand-500">.</span></h1>
          <p className="text-gray-500 font-bold mb-10 text-sm uppercase tracking-widest">Connectez-vous à la grille de livraison</p>
          <form onSubmit={handleLogin} className="space-y-4">
             <input type="text" placeholder="Mobile ID" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-brand-500 transition-all font-bold"/>
             <input type="password" placeholder="Passcode" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-brand-500 transition-all font-bold"/>
             <button disabled={loading} className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl mt-4">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : "ACTIVER TERMINAL"}
             </button>
          </form>
       </div>
    </div>
  );
}
