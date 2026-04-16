import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import {
  HiOutlineFunnel, HiOutlineEye, HiOutlineArrowPath,
  HiOutlineExclamationTriangle, HiOutlineShoppingCart,
  HiOutlineUser, HiOutlineBuildingStorefront, HiOutlineCurrencyDollar,
  HiOutlineClock, HiOutlineMapPin, HiOutlineTruck, HiOutlineXMark
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const statusLabels = {
  pending_payment: 'Initialisation', paid: 'Payée', accepted: 'Certifiée', refused: 'Refusée',
  assigned: 'Logistique', picked_up: 'En Transit', in_delivery: 'Livraison',
  delivered: 'Terminée', cancelled: 'Annulée', failed: 'Échec', refunded: 'Remboursée'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => { loadOrders(); }, [page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderAPI.getOrders({ page, limit: 15, status: statusFilter || undefined });
      setOrders(res.data.orders || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Erreur du Flux Commercial');
      setOrders([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const viewDetail = async (id) => {
    try {
      const res = await orderAPI.getOrder(id);
      setDetail(res.data.order);
    } catch {
      toast.error('Échec de synchronisation du détail');
    }
  };

  const updateStatus = async (id, status, note = '') => {
    try {
      await orderAPI.updateStatus(id, { status, note });
      toast.success('Protocole de statut mis à jour');
      setDetail(null);
      loadOrders();
    } catch (err) {
      toast.error(err.message || 'Échec de la transaction administrative');
    }
  };

  const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
  const totalPages = Math.ceil(total / 15);

  if (error && orders.length === 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-16 text-center animate-fade-in max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/40 mx-auto mb-8 animate-pulse text-3xl">📡</div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Perte de Synchronisation</h2>
        <p className="text-gray-500 text-sm mb-8">{error}</p>
        <button onClick={loadOrders} className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-95">
          Restaurer la Connexion
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
                  <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Transaction Monitor</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Flux en Temps Réel</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Gestion <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 font-outline-2">Commandes</span></h1>
         </div>
         <button onClick={loadOrders} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-white active:scale-95 group">
            <HiOutlineArrowPath className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
         </button>
      </div>

      {/* Tabs / Filters */}
      <div className="bg-gray-900/40 border border-white/10 p-4 rounded-[32px] flex flex-wrap gap-2 items-center backdrop-blur-xl">
        {[
          { key: '', label: 'Tout Le Flux' },
          { key: 'paid', label: 'Payées' },
          { key: 'accepted', label: 'Confirmées' },
          { key: 'in_delivery', label: 'En Livraison' },
          { key: 'delivered', label: 'Terminées' },
          { key: 'cancelled', label: 'Annulations' },
        ].map(f => (
          <button key={f.key} onClick={() => { setStatusFilter(f.key); setPage(1); }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
              ${statusFilter === f.key 
                ? 'bg-brand-500 text-white border-brand-500 shadow-xl shadow-brand-500/20' 
                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'
              }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      <div className="bg-gray-900/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                <th className="px-10 py-8">N° de Bordereau</th>
                <th className="px-10 py-8">Entités Concernées</th>
                <th className="px-10 py-8 text-center">Volume Finance</th>
                <th className="px-10 py-8 text-center">État Critique</th>
                <th className="px-10 py-8 text-right">Outils</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-gray-600 font-black uppercase tracking-widest text-xs">Aucune donnée transactionnelle détectée</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-10 py-8">
                    <p className="font-mono text-brand-500 font-black text-sm tracking-widest">#{o.order_number}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{o.created_at ? new Date(o.created_at).toLocaleString() : 'Date Indéterminée'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-white font-bold text-sm">{o.client?.full_name || 'Client Anonyme'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineBuildingStorefront className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{o.supplier?.company_name || 'Protocol N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <p className="font-black text-white text-lg tracking-tighter">{formatCFA(o.total_amount)} <span className="text-[10px] text-gray-500 ml-0.5">F</span></p>
                    <p className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest">+ {formatCFA(o.commission_amount)} F Commission</p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-current bg-current/10
                      ${o.status === 'delivered' ? 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                        ['cancelled', 'failed', 'refused'].includes(o.status) ? 'text-red-500' :
                        ['paid', 'accepted'].includes(o.status) ? 'text-blue-500' : 'text-amber-500 animate-pulse'}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-end">
                      <button onClick={() => viewDetail(o.id)} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-3xl text-gray-400 hover:text-white transition-all active:scale-95 group">
                        <HiOutlineEye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)}
              className={`w-12 h-12 rounded-2xl text-xs font-black transition-all border
                ${page === i + 1 
                  ? 'bg-brand-500 text-white border-brand-500 shadow-xl shadow-brand-500/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modern Detail Panel / Overlay */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-[40px] w-full max-w-3xl my-auto animate-slide-up shadow-3xl overflow-hidden relative">
            
            <button onClick={() => setDetail(null)} className="absolute top-6 right-6 p-4 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-2xl transition-all z-10">
              <HiOutlineXMark className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-5 h-full">
              {/* Sidebar Info */}
              <div className="md:col-span-2 bg-white/5 p-10 border-r border-white/5 space-y-10">
                <div>
                   <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest mb-1">Indexation</p>
                   <h3 className="text-3xl font-black text-white tracking-tighter">#{detail.order_number}</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                         <HiOutlineCurrencyDollar className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Valeur Marchande</p>
                         <p className="text-xl font-black text-white">{formatCFA(detail.total_amount)} <span className="text-xs text-brand-500">F</span></p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                         <HiOutlineClock className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Temps de Réponse</p>
                         <p className="text-sm font-bold text-white">{detail.created_at ? new Date(detail.created_at).toLocaleString() : 'N/A'}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-4">
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-2">Acteurs du Flux</p>
                   <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                      <p className="text-xs font-black text-white">{detail.client?.full_name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{detail.client?.phone}</p>
                   </div>
                   <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                      <p className="text-xs font-black text-white">{detail.supplier?.company_name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Supplier Origin</p>
                   </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-3 p-10 space-y-10">
                 <div>
                    <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">Inventaire & Logistique</h4>
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 text-2xl font-black">🔥</div>
                          <div>
                             <p className="text-xl font-black text-white">{detail.product?.gas_type}</p>
                             <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest">Quantité: {detail.quantity} Unit{detail.quantity > 1 ? 's' : ''}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {detail.delivery_address && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <HiOutlineMapPin className="w-5 h-5 text-gray-500" />
                          <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Coordonnées de Livraison</h4>
                       </div>
                       <p className="text-white font-bold text-sm bg-white/5 p-6 rounded-[24px] border border-white/5">{detail.delivery_address}</p>
                    </div>
                 )}

                 {/* Mission Timeline */}
                 <div className="space-y-6">
                    <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Séquence Logistique</h4>
                    <div className="flex justify-between items-center relative px-2 py-4">
                      <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0" />
                      {[
                        { label: 'Match (300F)', icon: HiOutlineMapPin, done: ['paid', 'accepted', 'assigned', 'picked_up', 'in_delivery', 'delivered'].includes(detail.status) },
                        { label: 'Distributeur', icon: HiOutlineBuildingStorefront, done: ['accepted', 'assigned', 'picked_up', 'in_delivery', 'delivered'].includes(detail.status) },
                        { label: 'Livreur', icon: HiOutlineTruck, done: ['assigned', 'picked_up', 'in_delivery', 'delivered'].includes(detail.status) },
                        { label: 'Terminé', icon: HiOutlineShoppingCart, done: detail.status === 'delivered' },
                      ].map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${step.done ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-gray-950 border-white/10 text-gray-700'}`}>
                              <step.icon className="w-5 h-5" />
                           </div>
                           <span className={`text-[8px] font-black uppercase tracking-widest ${step.done ? 'text-brand-500' : 'text-gray-600'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Status Control Panel */}
                 <div className="pt-10 border-t border-white/10">
                    <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">Protocole de Régulation</h4>
                    <div className="flex flex-wrap gap-4">
                       {['paid', 'accepted'].includes(detail.status) && (
                          <button onClick={() => updateStatus(detail.id, 'cancelled', 'Annulé par régulation centrale')} className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">Rupture Transactionnelle</button>
                       )}
                       {detail.status === 'paid' && (
                          <button onClick={() => updateStatus(detail.id, 'accepted', 'Autorisé par centre de contrôle')} className="px-8 py-4 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-500/20 active:scale-95 transition-all">Valider Autorisation</button>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
