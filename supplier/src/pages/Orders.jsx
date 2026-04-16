import { useState, useEffect } from 'react';
import { orderAPI, distributorAPI } from '../services/api';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineTruck, HiOutlineEye, HiOutlineFunnel } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const statusLabels = {
  pending_payment: 'En attente paiement', paid: 'Payée ✓', accepted: 'Acceptée',
  refused: 'Refusée', assigned: 'Assignée', picked_up: 'Récupérée',
  in_delivery: 'En livraison', delivered: 'Livrée ✓', cancelled: 'Annulée', failed: 'Échouée'
};
const statusColor = {
  pending_payment: 'badge-neutral', paid: 'badge-info', accepted: 'badge-success',
  refused: 'badge-danger', assigned: 'badge-warning', picked_up: 'badge-warning',
  in_delivery: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger', failed: 'badge-danger'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [userRole] = useState(() => JSON.parse(localStorage.getItem('sup_user') || '{}')?.role);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [loadingDistributors, setLoadingDistributors] = useState(false);

  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [page, filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrders({ page, limit: 12, status: filter || undefined });
      setOrders(res.data?.orders || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch {
      setOrders(getDemoOrders());
      setTotal(6);
    }
    setLoading(false);
  };

  const loadDistributors = async (order) => {
    setLoadingDistributors(true);
    try {
      // On cherche les livreurs proches du point de livraison de la commande (ou de Niamey par défaut)
      const params = {
        latitude: order.delivery_latitude || 13.5116,
        longitude: order.delivery_longitude || 2.1254,
        radius: 50 // Rayon large pour être sûr d'en trouver en dev
      };
      const res = await distributorAPI.getNearby(params);
      setDistributors(res.data?.distributors || []);
    } catch (err) {
      console.error("Erreur chargement distributeurs", err);
      // On garde une démo si l'API échoue en dev
      if (import.meta.env.DEV) {
        setDistributors([
          { id: 'dist-1', user: { full_name: 'Moussa Delivery' }, distance_km: 1.2 },
          { id: 'dist-2', user: { full_name: 'Abdou Express' }, distance_km: 3.5 }
        ]);
      } else {
        toast.error('Impossible de charger les livreurs');
      }
    }
    setLoadingDistributors(false);
  };

  const handleAction = async (id, status, extra = {}) => {
    setActionLoading(id);
    try {
      await orderAPI.updateStatus(id, { status, ...extra });
      toast.success(`Commande ${statusLabels[status] || status}`);
      loadOrders();
      setDetail(null);
      setAssigningOrder(null);
    } catch (err) {
      toast.error(err.message);
    }
    setActionLoading(null);
  };

  const startAssigning = (order) => {
    setAssigningOrder(order);
    loadDistributors(order);
  };

  const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
  const totalPages = Math.ceil(total / 12);

  // Count by status for quick badges
  // Stats computed from loaded orders
  const stats = {
    new: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => ['accepted', 'assigned', 'picked_up', 'in_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    earnings: orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + parseFloat(o.supplier_amount || 0), 0)
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) || 
    (o.client?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Nouvelles', value: stats.new, color: 'text-brand-400', bg: 'bg-brand-500/5', icon: '🔔' },
          { label: 'En cours', value: stats.processing, color: 'text-amber-400', bg: 'bg-amber-500/5', icon: '🚚' },
          { label: 'Livrées', value: stats.delivered, color: 'text-emerald-400', bg: 'bg-emerald-500/5', icon: '✅' },
          { label: 'Revenus (NET)', value: `${formatCFA(stats.earnings)} CFA`, color: 'text-white', bg: 'bg-white/5', icon: '💰' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-3xl border border-white/5 ${s.bg} backdrop-blur-sm shadow-xl`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-2xl font-black ${s.color} tabular-nums`}>{s.value}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <input 
            type="text" 
            placeholder="Rechercher par N° ou Client..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-3.5 px-12 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600"
          />
          <HiOutlineFunnel className="absolute left-4 top-4 text-gray-600 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
        </div>
        <div className="flex bg-gray-900 border border-gray-800 rounded-2xl p-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar shadow-inner">
          {['', 'paid', 'accepted', 'assigned', 'picked_up', 'in_delivery', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest ${filter === f ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {f === '' ? 'Tous' : statusLabels[f].replace(' ✓', '')}
              {f === 'paid' && stats.new > 0 && (
                 <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">{stats.new}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm animate-pulse">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card text-center py-16 border-dashed border-2 border-gray-800">
            <div className="text-4xl mb-3 opacity-20">📦</div>
            <p className="text-gray-500 font-medium">Aucune commande trouvée</p>
            <p className="text-gray-600 text-xs mt-1">Essayez de changer les filtres ou la recherche</p>
          </div>
        ) : filteredOrders.map((o, i) => (
          <div key={o.id || i} className={`card group relative animate-slide-in flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-gray-600 ${
            o.status === 'paid' ? 'border-brand-500/40 bg-brand-500/[0.03] ring-1 ring-brand-500/20' : ''
          }`} style={{ animationDelay: `${i * 40}ms` }}>
            {/* Status vertical line for paid orders */}
            {o.status === 'paid' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-l-2xl shadow-[0_0_10px_rgba(234,88,12,0.5)]" />}

            {/* Order info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-xs text-brand-400 font-bold tracking-wider">{o.order_number}</span>
                <span className={`${statusColor[o.status]} text-[10px] px-2 py-0.5 font-bold uppercase tracking-tighter`}>{statusLabels[o.status]}</span>
              </div>
              <p className="text-sm text-gray-100 font-semibold truncate">
                {o.quantity || 1}x {o.product?.gas_type || 'Gaz (Type inconnu)'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                <span className="flex items-center gap-1"><span className="opacity-70">👤</span> {o.client?.full_name || 'Client anonyme'}</span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1 truncate"><span className="opacity-70">📍</span> {o.delivery_address || 'Niamey'}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-lg font-black text-white">{formatCFA(o.total_amount)} <span className="text-[10px] text-gray-500 font-normal">CFA</span></p>
              <p className="text-[10px] text-gray-500 font-medium opacity-80 uppercase tracking-widest mt-0.5">
                {new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              {/* Supplier Actions */}
              {userRole === 'supplier' && (
                <>
                  {o.status === 'paid' && (
                    <div className="flex gap-2 w-full">
                      <button onClick={() => handleAction(o.id, 'accepted')}
                        disabled={actionLoading === o.id}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50">
                        <HiOutlineCheck className="w-4 h-4" /> Accepter
                      </button>
                      <button onClick={() => handleAction(o.id, 'refused', { refuse_reason: 'Rupture de stock' })}
                        disabled={actionLoading === o.id}
                        className="flex items-center justify-center p-2.5 rounded-xl bg-gray-800 text-red-400 border border-gray-700 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-50">
                        <HiOutlineXMark className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {o.status === 'accepted' && (
                    <button onClick={() => startAssigning(o)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                      <HiOutlineTruck className="w-4 h-4" /> Assigner
                    </button>
                  )}
                </>
              )}

              {/* Distributor (Livreur) Actions */}
              {userRole === 'distributor' && (
                <>
                  {o.status === 'assigned' && (
                    <button onClick={() => handleAction(o.id, 'picked_up')}
                      disabled={actionLoading === o.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                      <HiOutlineCheck className="w-4 h-4" /> Récupérer
                    </button>
                  )}
                  {o.status === 'picked_up' && (
                    <button onClick={() => handleAction(o.id, 'in_delivery')}
                      disabled={actionLoading === o.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                      <HiOutlineTruck className="w-4 h-4" /> Partir
                    </button>
                  )}
                  {o.status === 'in_delivery' && (
                    <button onClick={() => handleAction(o.id, 'delivered')}
                      disabled={actionLoading === o.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                      <HiOutlineCheck className="w-4 h-4" /> Livré
                    </button>
                  )}
                </>
              )}

              <button onClick={() => setDetail(o)}
                className="flex-none p-2.5 rounded-xl bg-gray-800/50 text-gray-400 border border-transparent hover:border-gray-700 hover:text-white transition-all">
                <HiOutlineEye className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <p className="text-xs text-gray-500 font-medium">{total} commande(s) au total</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-400 disabled:opacity-30 border border-gray-700 hover:bg-gray-700 text-xs transition-all font-bold">←</button>
            <div className="flex items-center px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-xs text-gray-400 font-mono">
              {page} <span className="mx-1 opacity-30">/</span> {totalPages}
            </div>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-400 disabled:opacity-30 border border-gray-700 hover:bg-gray-700 text-xs transition-all font-bold">→</button>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN DISTRIBUTOR */}
      {assigningOrder && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={() => setAssigningOrder(null)}>
          <div className="bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-gray-800 shadow-2xl p-6 h-[80vh] sm:h-auto overflow-hidden flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-white">Assigner un livreur</h3>
                <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-widest">{assigningOrder.order_number}</p>
              </div>
              <button onClick={() => setAssigningOrder(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><HiOutlineXMark className="w-6 h-6 text-gray-500" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {loadingDistributors ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 animate-pulse">Recherche des livreurs disponibles...</p>
                </div>
              ) : distributors.length === 0 ? (
                <div className="text-center py-10 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                  <p className="text-gray-400 text-sm font-medium">Aucun livreur disponible 🚫</p>
                  <p className="text-[10px] text-gray-600 mt-1">Désolé, personne n'est en ligne pour le moment.</p>
                </div>
              ) : distributors.map(d => (
                <button key={d.id} 
                  onClick={() => handleAction(assigningOrder.id, 'assigned', { distributor_id: d.id })}
                  className="w-full card flex items-center gap-4 hover:border-amber-500/50 hover:bg-amber-500/[0.03] transition-all group text-left border border-gray-800">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">🚚</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{d.user?.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">📍 À environ {d.distance_km} km de la cible</p>
                  </div>
                  <div className="text-xs font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">CHOISIR →</div>
                </button>
              ))}
            </div>
            
            <button onClick={() => setAssigningOrder(null)} className="mt-6 w-full py-3 rounded-2xl bg-gray-800 text-gray-400 font-bold hover:bg-gray-700 transition-colors text-sm border border-gray-700">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL MODAL */}
      {detail && (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDetail(null)}>
          <div className="bg-gray-900 w-full max-w-2xl rounded-[2.5rem] border border-gray-800 shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative animate-zoom-in" onClick={e => e.stopPropagation()}>
            {/* Header with status badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Détails de la Commande</h3>
                <p className="text-brand-400 font-mono text-sm font-bold tracking-widest mt-1 opacity-80">{detail.order_number}</p>
              </div>
              <div className={`${statusColor[detail.status]} px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl ring-2 ring-white/5`}>
                {statusLabels[detail.status]}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Product & Financial Section */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-gray-800/40 border border-gray-700/50">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">🛒 Produit</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-2xl shadow-inner">🔥</div>
                    <div>
                      <p className="text-lg font-bold text-white">{detail.product?.gas_type}</p>
                      <p className="text-sm text-gray-500">{detail.quantity} unité(s)</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-500/[0.02] border border-emerald-500/10">
                  <h4 className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-4">💰 Récapitulatif financier</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Chiffre d'Affaire</span> <span className="text-white font-mono">{formatCFA(detail.total_amount)} CFA</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Commission Todjom ({detail.commission_rate}%)</span> <span className="text-red-400 font-mono">-{formatCFA(detail.commission_amount)} CFA</span></div>
                    <div className="h-px bg-gray-800 my-2" />
                    <div className="flex justify-between font-black"><span className="text-emerald-400">VOTRE PART NETTE</span> <span className="text-emerald-400 text-xl font-mono">{formatCFA(detail.supplier_amount)} CFA</span></div>
                  </div>
                </div>
              </div>

              {/* Delivery & Client Section */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-gray-800/40 border border-gray-700/50">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">👤 Client</h4>
                  <p className="text-white font-bold text-lg">{detail.client?.full_name}</p>
                  <p className="text-gray-400 text-sm mt-1">{detail.client?.phone}</p>
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <h5 className="text-[10px] font-bold text-gray-600 uppercase mb-2">📍 Adresse de Livraison</h5>
                    <p className="text-gray-300 text-sm leading-relaxed">{detail.delivery_address || 'Non spécifiée'}</p>
                  </div>
                </div>

                {detail.distributor && (
                  <div className="p-6 rounded-3xl bg-amber-500/[0.03] border border-amber-500/10">
                    <h4 className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-3">🚚 Livreur assigné</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">🏍️</div>
                      <div>
                        <p className="text-white font-bold text-sm">{detail.distributor?.user?.full_name}</p>
                        <p className="text-xs text-gray-500">{detail.distributor?.user?.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800/50">
              {/* Supplier Detail Actions */}
              {userRole === 'supplier' && (
                <>
                  {detail.status === 'paid' && (
                    <>
                      <button onClick={() => handleAction(detail.id, 'accepted')} className="flex-1 py-4 rounded-[1.25rem] bg-brand-500 text-white font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 active:scale-95">✓ Accepter la Commande</button>
                      <button onClick={() => handleAction(detail.id, 'refused', { refuse_reason: 'Refusé' })} className="py-4 px-6 rounded-[1.25rem] bg-gray-800 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-all border border-gray-700">✕ Refuser</button>
                    </>
                  )}
                  {detail.status === 'accepted' && (
                    <button onClick={() => { setDetail(null); startAssigning(detail); }} className="flex-1 py-4 rounded-[1.25rem] bg-amber-500 text-white font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95">🚚 Choisir un Livreur</button>
                  )}
                </>
              )}

              {/* Distributor Detail Actions */}
              {userRole === 'distributor' && (
                <>
                  {detail.status === 'assigned' && (
                    <button onClick={() => handleAction(detail.id, 'picked_up')} className="flex-1 py-4 rounded-[1.25rem] bg-blue-500 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95">📦 Confirmer la Récupération</button>
                  )}
                  {detail.status === 'picked_up' && (
                    <button onClick={() => handleAction(detail.id, 'in_delivery')} className="flex-1 py-4 rounded-[1.25rem] bg-amber-500 text-white font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95">🚚 Démarrer la Livraison</button>
                  )}
                  {detail.status === 'in_delivery' && (
                    <button onClick={() => handleAction(detail.id, 'delivered')} className="flex-1 py-4 rounded-[1.25rem] bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">✅ Confirmer la Livraison</button>
                  )}
                </>
              )}
              
              <button onClick={() => setDetail(null)} className="py-4 px-8 rounded-[1.25rem] bg-gray-800 text-gray-400 font-bold text-sm hover:bg-gray-700 transition-all text-center ml-auto">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDemoOrders() {
  return [
    { id: '1', order_number: 'TDG-20260413-1111', quantity: 2, product: { gas_type: 'Bouteille 6 kg' }, client: { full_name: 'Fatima Abdou', phone: '+22790300001' }, total_amount: 7000, commission_amount: 350, supplier_amount: 6650, status: 'paid', delivery_address: 'Quartier Plateau, Niamey', created_at: '2026-04-13T08:30:00' },
    { id: '2', order_number: 'TDG-20260413-2222', quantity: 1, product: { gas_type: 'Bouteille 12 kg' }, client: { full_name: 'Mariama Issoufou', phone: '+22790300002' }, total_amount: 6500, commission_amount: 325, supplier_amount: 6175, status: 'accepted', delivery_address: 'Ancien Aéroport, Niamey', created_at: '2026-04-13T09:15:00' },
    { id: '3', order_number: 'TDG-20260413-3333', quantity: 1, product: { gas_type: 'Bouteille 15 kg' }, client: { full_name: 'Aïcha Boubacar', phone: '+22790300003' }, total_amount: 8500, commission_amount: 425, supplier_amount: 8075, status: 'in_delivery', delivery_address: 'Yantala, Niamey', created_at: '2026-04-13T07:00:00' },
    { id: '4', order_number: 'TDG-20260412-4444', quantity: 3, product: { gas_type: 'Bouteille 6 kg' }, client: { full_name: 'Ibrahim Moussa', phone: '+22790300004' }, total_amount: 10500, commission_amount: 525, supplier_amount: 9975, status: 'delivered', delivery_address: 'Talladjé, Niamey', created_at: '2026-04-12T14:00:00' },
    { id: '5', order_number: 'TDG-20260412-5555', quantity: 1, product: { gas_type: 'Bouteille 12 kg' }, client: { full_name: 'Hassia Adamou', phone: '+22790300005' }, total_amount: 6500, commission_amount: 325, supplier_amount: 6175, status: 'paid', delivery_address: 'Gamkalé, Niamey', created_at: '2026-04-13T10:00:00' },
    { id: '6', order_number: 'TDG-20260411-6666', quantity: 1, product: { gas_type: 'Bouteille 6 kg' }, client: { full_name: 'Ramatou Seydou', phone: '+22790300006' }, total_amount: 3500, commission_amount: 175, supplier_amount: 3325, status: 'cancelled', delivery_address: 'Dan Gao, Niamey', created_at: '2026-04-11T11:00:00' },
  ];
}
