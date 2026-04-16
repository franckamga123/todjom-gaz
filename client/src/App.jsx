import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, Search, Plus, CheckCircle2, Loader2, Navigation, ChevronRight, User as UserIcon, LogOut, ArrowLeft, Clock, ShieldAlert, Package, Phone, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, brandService, orderService, miscService } from './services/api';
import { toast, Toaster } from 'react-hot-toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  
  // App Flow Steps
  // 1: Weight Selection, 2: Brand Selection, 3: Payment Search, 4: Matching Result, 5: Delivery Choice
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  
  // Selection States
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [foundDistributor, setFoundDistributor] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mynita'); // 'mynita' or 'amana'
  
  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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

    fetchConfig();
    if (localStorage.getItem('token')) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchConfig = async () => {
    try {
      const res = await miscService.getConfig();
      if (res.data.success) setConfig(res.data.data);
    } catch (e) {}
  };

  const fetchData = async () => {
    try {
      const [brandsRes, ordersRes] = await Promise.all([
        brandService.getAll(),
        orderService.getUserOrders()
      ]);
      setBrands(brandsRes.data.data);
      setUserOrders(ordersRes.data.data.orders || []);
    } catch (e) {}
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        login: e.target[0].value,
        password: isRegistering ? e.target[4].value : e.target[1].value
      };

      if (isRegistering) {
        const regData = {
          full_name: e.target[0].value,
          first_name: e.target[1].value,
          phone: e.target[2].value,
          neighborhood: e.target[3].value,
          password: e.target[4].value,
          role: 'client'
        };
        const res = await authService.register(regData);
        toast.success("Bienvenue ! Connectez-vous maintenant.");
        setIsRegistering(false);
      } else {
        const res = await authService.login(data);
        const { user, tokens } = res.data.data;
        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsLoggedIn(true);
        toast.success(`Content de vous revoir 👋`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    setShowProfile(false);
  };

  // Step 3: Initiate Search (Pay 500 CFA)
  const handleInitiateSearch = async () => {
    setLoading(true);
    try {
      // Get GPS
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const orderData = {
        brand_id: selectedBrand.id,
        weight_kg: selectedWeight,
        delivery_latitude: pos.coords.latitude,
        delivery_longitude: pos.coords.longitude,
        payment_method: paymentMethod
      };

      const res = await orderService.initiateSearch(orderData);
      setActiveOrder(res.data.data.order);
      setStep(4); // Move to searching/matching
      
      // Simulate Payment Callback then Search
      setTimeout(async () => {
         await orderService.confirmPayment(res.data.data.order.id);
         const searchRes = await orderService.searchDistributor(res.data.data.order.id);
         setFoundDistributor(searchRes.data.data.distributor);
         setStep(5);
         toast.success("Distributeur trouvé !");
      }, 2000);

    } catch (error) {
      toast.error("Veuillez autoriser la géolocalisation");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
     return <LoginView isRegistering={isRegistering} setIsRegistering={setIsRegistering} handleAuth={handleAuth} loading={loading} config={config} />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white font-outfit relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto h-screen flex flex-col relative z-10">
        
        {/* Top Header */}
        <header className="p-6 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5">
           <div className="flex items-center gap-3">
              <div onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
                 <UserIcon className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Bonjour,</p>
                 <h2 className="text-sm font-black text-white">{user?.full_name?.split(' ')[0]}</h2>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">{config?.platform_name || 'TODJOM GAZ'}</span>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar pb-24">
           
           <AnimatePresence mode="wait">
             {/* Step 1: Weight Selection */}
             {step === 1 && (
               <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h1 className="text-3xl font-black mb-2 leading-tight">Quel poids de gaz<br/><span className="text-brand-500">cherchez-vous ?</span></h1>
                  <p className="text-gray-500 text-sm mb-10 font-medium">Sélectionnez la taille de votre bouteille</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                     {[
                       { kg: 3, label: '3 kg', desc: 'Sunkoutou', price: 'Min. 2000F' },
                       { kg: 6, label: '6 kg', desc: 'Petit format', price: 'Min. 3500F' },
                       { kg: 12, label: '12 kg', desc: 'Format standard', price: 'Min. 7500F' }
                     ].map(w => (
                       <div key={w.kg} onClick={() => { setSelectedWeight(w.kg); setStep(2); }} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer hover:bg-brand-500/5 hover:border-brand-500/50 transition-all group">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                <Package className="text-brand-500 w-8 h-8" />
                             </div>
                             <div>
                                <h3 className="text-xl font-black">{w.label}</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase">{w.desc}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-brand-500 font-black text-sm">{w.price}</p>
                             <ChevronRight className="w-4 h-4 text-gray-700 ml-auto mt-1" />
                          </div>
                       </div>
                     ))}
                  </div>
               </motion.div>
             )}

             {/* Step 2: Brand Selection */}
             {step === 2 && (
               <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-2 text-gray-500 font-bold text-xs"><ArrowLeft size={16}/> RETOUR</button>
                  <h1 className="text-3xl font-black mb-2 leading-tight">Choisissez votre<br/><span className="text-brand-500">marque habituelle</span></h1>
                  
                  <div className="grid grid-cols-2 gap-4 mt-10">
                     {brands.map(b => (
                       <div key={b.id} onClick={() => { setSelectedBrand(b); setStep(3); }} className="bg-white/5 border border-white/10 p-5 rounded-[2.5rem] flex flex-col items-center gap-4 cursor-pointer hover:bg-brand-500/5 hover:border-brand-500/50 transition-all text-center">
                          <div className="w-20 h-20 bg-black rounded-3xl p-3 flex items-center justify-center border border-white/5">
                             {b.logo_url ? <img src={b.logo_url} className="w-full object-contain" /> : <Package className="text-gray-700" />}
                          </div>
                          <h3 className="font-black text-sm uppercase tracking-wider">{b.name}</h3>
                          <div className="mt-auto">
                              <span className="text-[10px] bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full font-black">
                                {selectedWeight === 3 ? b.price_3kg : selectedWeight === 6 ? b.price_6kg : b.price_12kg}F
                              </span>
                          </div>
                       </div>
                     ))}
                  </div>
               </motion.div>
             )}

             {/* Step 3: Payment/Search Initiation */}
             {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="text-center mt-10">
                     <div className="w-24 h-24 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-20" />
                        <MapPin className="w-10 h-10 text-brand-500" />
                     </div>
                     <h1 className="text-2xl font-black mb-4">Recherche de Distributeur</h1>
                     <p className="text-gray-400 text-sm mb-12 max-w-xs mx-auto">Pour vous orienter vers le distributeur de <span className="text-brand-500 font-bold">{selectedBrand.name}</span> le plus proche, une participation de <span className="text-white font-black">500 CFA</span> est requise.</p>
                     
                     <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-6 flex justify-between items-center text-left">
                        <div>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Récapitulatif</p>
                           <p className="text-sm font-bold">{selectedBrand.name} • {selectedWeight}kg</p>
                        </div>
                        <p className="text-xl font-black text-brand-500">500 CFA</p>
                     </div>

                     <div className="space-y-3 mb-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-left ml-2">Moyen de paiement</p>
                        <div className="grid grid-cols-2 gap-4">
                           <div onClick={() => setPaymentMethod('mynita')} className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${paymentMethod === 'mynita' ? 'bg-brand-500/10 border-brand-500 shadow-lg shadow-brand-500/10' : 'bg-white/5 border-white/10 opacity-50'}`}>
                              <div className="w-8 h-8 bg-[#FFD700] rounded-lg text-black font-black flex items-center justify-center text-[8px] italic">NITA</div>
                              <span className="text-[10px] font-black uppercase tracking-tighter">My Nita</span>
                           </div>
                           <div onClick={() => setPaymentMethod('amana')} className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${paymentMethod === 'amana' ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/10 opacity-50'}`}>
                              <div className="w-8 h-8 bg-blue-600 rounded-lg text-white font-black flex items-center justify-center text-[8px] italic">AMANA</div>
                              <span className="text-[10px] font-black uppercase tracking-tighter">Amana</span>
                           </div>
                        </div>
                     </div>

                     <button onClick={handleInitiateSearch} disabled={loading} className="w-full brand-gradient py-5 rounded-3xl font-black text-white shadow-xl shadow-brand-500/20 uppercase tracking-widest flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : <>PAYER & RECHERCHER <ChevronRight size={18}/></>}
                     </button>
                  </div>
               </motion.div>
             )}

             {/* Step 4: Loading / Matching */}
             {step === 4 && (
               <div className="flex flex-col items-center justify-center h-full mt-20">
                  <div className="relative w-40 h-40">
                     <div className="absolute inset-0 border-4 border-brand-500/10 rounded-full" />
                     <div className="absolute inset-0 border-4 border-t-brand-500 rounded-full animate-spin" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-10 h-10 text-brand-500" />
                     </div>
                  </div>
                  <h2 className="text-xl font-black mt-10">Localisation en cours...</h2>
                  <p className="text-gray-500 text-sm mt-2">Nous cherchons le distributeur le plus proche avec du stock.</p>
               </div>
             )}

             {/* Step 5: Matching Result & Choice */}
             {step === 5 && (
               <motion.div key="step5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 mb-10">
                     <CheckCircle2 className="text-emerald-500" />
                     <p className="text-emerald-500 text-sm font-bold">Un distributeur a été trouvé !</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-center mb-10">
                     <div className="w-20 h-20 bg-brand-500 rounded-3xl mx-auto mb-6 flex items-center justify-center text-black">
                        <ShoppingBag size={40} />
                     </div>
                     <h2 className="text-2xl font-black text-white mb-2">{foundDistributor?.shop_name}</h2>
                     <p className="text-gray-500 text-sm font-bold flex items-center justify-center gap-1 uppercase tracking-widest">
                        <MapPin size={14}/> À {foundDistributor?.distance_km} km de vous
                     </p>
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4 mb-4 text-center">Deux options possibles :</h3>

                  <div className="grid grid-cols-1 gap-4">
                     <button className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all text-left">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center">
                              <MapPin className="text-gray-400" />
                           </div>
                           <div>
                              <p className="font-black text-white">Je vais me déplacer</p>
                              <p className="text-[10px] text-gray-500 font-bold">Payez uniquement le gaz : {selectedWeight === 3 ? selectedBrand.price_3kg : selectedWeight === 6 ? selectedBrand.price_6kg : selectedBrand.price_12kg}F</p>
                           </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-700" />
                     </button>

                     <button className="bg-brand-500/10 border border-brand-500/30 p-6 rounded-3xl flex items-center justify-between hover:bg-brand-500/20 transition-all text-left">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-black">
                              <Clock />
                           </div>
                           <div>
                              <p className="font-black text-brand-500">Me faire livrer</p>
                              <p className="text-[10px] text-brand-400 font-bold tracking-tight">Vite & en toute sécurité</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-white">+500F</p>
                           <p className="text-[8px] font-black uppercase text-brand-500">Livraison</p>
                        </div>
                     </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

        </main>

        {/* Dynamic Nav (Bottom Bar) */}
        {!activeOrder && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-10">
             <div onClick={() => setStep(1)} className={`cursor-pointer transition-all ${step === 1 ? 'text-brand-500 scale-110' : 'text-gray-600'}`}>
                <LayoutGrid size={24} />
             </div>
             <div onClick={() => setShowProfile(true)} className={`cursor-pointer transition-all ${showProfile ? 'text-brand-500 scale-110' : 'text-gray-600'}`}>
                <ShoppingBag size={24} />
             </div>
             <div onClick={() => { setStep(1); setShowProfile(true); }} className={`cursor-pointer transition-all text-gray-600`}>
                <Clock size={24} />
             </div>
          </nav>
        )}
      </div>

      {/* Profile Sidebar (Slide Right) */}
      <AnimatePresence>
        {showProfile && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#0a0a0f] z-[100] border-l border-white/5 p-8 flex flex-col">
             <button onClick={() => setShowProfile(false)} className="self-end p-4 bg-white/5 rounded-2xl mb-10"><X size={24}/></button>
             
             <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 rounded-3xl bg-brand-500 flex items-center justify-center text-black font-black text-2xl">
                   {user?.full_name?.charAt(0)}
                </div>
                <div>
                   <h2 className="text-xl font-black">{user?.full_name}</h2>
                   <p className="text-gray-500 text-sm font-bold">{user?.phone}</p>
                   <p className="text-xs text-brand-500 font-black uppercase mt-1">Quartier: {user?.neighborhood || 'N/A'}</p>
                </div>
             </div>

             <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-6">Mon Historique</h3>
             
             <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                {userOrders.map(o => (
                  <div key={o.id} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"><Package size={20} className="text-gray-600"/></div>
                        <div>
                           <p className="text-sm font-bold">Gaz {o.weight_kg}kg</p>
                           <p className="text-[10px] text-gray-500 font-bold uppercase">{o.status}</p>
                        </div>
                     </div>
                     <p className="text-sm font-black text-brand-500">{o.total_amount}F</p>
                  </div>
                ))}
             </div>

             <button onClick={handleLogout} className="mt-8 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                Se Déconnecter
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function LoginView({ isRegistering, setIsRegistering, handleAuth, loading, config }) {
   return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col justify-center p-8 font-outfit relative">
         <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px]" />
         
         <div className="max-w-sm mx-auto w-full relative z-10">
            <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-500/30 mb-10 transform rotate-6">
               <ShoppingBag size={40} className="text-white transform -rotate-6" />
            </div>

            <h1 className="text-4xl font-black mb-2">{isRegistering ? 'Commencer' : 'Bienvenue'}</h1>
            <p className="text-gray-500 font-medium mb-10">Rejoignez la révolution du gaz domestique.</p>

            <form onSubmit={handleAuth} className="space-y-4">
               {isRegistering ? (
                 <>
                  <input type="text" placeholder="Nom complet" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                  <input type="text" placeholder="Prénom" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                  <input type="text" placeholder="Téléphone" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                  <input type="text" placeholder="Quartier" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                  <input type="password" placeholder="Mot de passe" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                 </>
               ) : (
                 <>
                  <input type="text" placeholder="Téléphone ou Email" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                  <input type="password" placeholder="Mot de passe" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-500 transition-all"/>
                 </>
               )}
               <button type="submit" disabled={loading} className="w-full brand-gradient py-5 rounded-2xl font-black text-white shadow-xl shadow-brand-500/20 uppercase tracking-widest flex items-center justify-center mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'S\'INSCRIRE' : 'CONSEILS & GAZ')}
               </button>
            </form>

            <p className="text-center mt-12 text-gray-500 font-bold text-sm">
               {isRegistering ? "Déjà un compte ?" : "Pas encore de compte ?"} 
               <span onClick={() => setIsRegistering(!isRegistering)} className="text-brand-500 ml-2 cursor-pointer hover:underline">
                  {isRegistering ? "Se connecter" : "S'inscrire"}
               </span>
            </p>
         </div>
      </div>
   );
}

function X({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>; }
