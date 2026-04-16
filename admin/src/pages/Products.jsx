import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  HiOutlineCube, HiOutlinePencilSquare, HiOutlineExclamationTriangle,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowPath,
  HiOutlineBolt, HiOutlineArchiveBox, HiOutlineExclamationCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getAdminProducts();
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || 'Erreur de synchronisation');
    }
    setLoading(false);
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setEditForm({
      price_cfa: p.price_cfa,
      stock_quantity: p.stock_quantity,
      min_stock_alert: p.min_stock_alert,
      is_available: p.is_available,
      description: p.description || ''
    });
  };

  const saveEdit = async (id) => {
    try {
      await adminAPI.updateAdminProduct(id, editForm);
      toast.success('Données synchronisées');
      setEditing(null);
      loadProducts();
    } catch (err) {
      toast.error(err.message || 'Échec de la mise à jour');
    }
  };

  const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

  const filtered = products.filter(p => {
    if (filter === 'available') return p.is_available;
    if (filter === 'low_stock') return p.stock_quantity <= p.min_stock_alert && p.stock_quantity > 0;
    if (filter === 'unavailable') return !p.is_available || p.stock_quantity === 0;
    return true;
  });

  const stats = {
    total: products.length,
    available: products.filter(p => p.is_available).length,
    lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_alert).length,
    outOfStock: products.filter(p => !p.is_available || p.stock_quantity === 0).length
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Scan du Catalogue...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-16 text-center animate-fade-in max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/40 mx-auto mb-8 animate-pulse text-3xl">⚠️</div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Erreur de Flux</h2>
        <p className="text-gray-500 text-sm mb-8">{error}</p>
        <button onClick={loadProducts} className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-95">
          Forcer la Reconexion
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
                  <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Inventory Management</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Catalog</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Stock & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 font-outline-2">Logistique</span></h1>
         </div>
         <button onClick={loadProducts} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-white active:scale-95 group">
            <HiOutlineArrowPath className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Unités', value: stats.total, icon: HiOutlineCube, color: 'blue' },
          { label: 'Flux Actif', value: stats.available, icon: HiOutlineBolt, color: 'emerald' },
          { label: 'Alertes Stock', value: stats.lowStock, icon: HiOutlineExclamationCircle, color: 'amber' },
          { label: 'Rupture', value: stats.outOfStock, icon: HiOutlineArchiveBox, color: 'red' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900/40 border border-white/5 p-8 rounded-[32px] relative overflow-hidden group">
            <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center mb-6`}>
               <s.icon className={`w-6 h-6 text-${s.color}-500`} />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-white tracking-tight">{s.value}</p>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.color}-500/5 rounded-full blur-3xl`} />
          </div>
        ))}
      </div>

      {/* Tabs / Filters */}
      <div className="bg-gray-900/40 border border-white/10 p-4 rounded-[32px] flex flex-wrap gap-2 items-center backdrop-blur-xl">
        {[
          { key: 'all', label: 'Dashboard Global' },
          { key: 'available', label: 'Disponibles' },
          { key: 'low_stock', label: 'Alertes Niveaux' },
          { key: 'unavailable', label: 'Zones de Rupture' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
              ${filter === f.key 
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
                <th className="px-10 py-8">Produit x Gaz</th>
                <th className="px-10 py-8">Source Fournisseur</th>
                <th className="px-10 py-8 text-center">Indice Prix</th>
                <th className="px-10 py-8 text-center">Niveau Stock</th>
                <th className="px-10 py-8 text-right">Régulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(p => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 border border-white/10 flex items-center justify-center text-brand-500 shadow-xl transition-transform group-hover:-rotate-6">
                        <HiOutlineCube className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-black text-white text-base tracking-tight leading-tight">{p.gas_type}</p>
                        <p className="text-[10px] text-brand-500 font-extrabold uppercase tracking-widest mt-1">Calibre: {p.weight_kg} KG</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                     <p className="text-white font-bold text-sm tracking-wide mb-1 uppercase tracking-wider">{p.supplier?.company_name || 'Protocol-N/A'}</p>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Partenaire Certifié</p>
                  </td>
                  <td className="px-10 py-10 text-center">
                    {editing === p.id ? (
                      <input type="number" className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 w-32 outline-none focus:border-brand-500 text-center font-black" value={editForm.price_cfa}
                        onChange={e => setEditForm({...editForm, price_cfa: e.target.value})} />
                    ) : (
                      <p className="font-black text-white text-lg tracking-tighter">{formatCFA(p.price_cfa)} <span className="text-[10px] text-gray-500 ml-1">F</span></p>
                    )}
                  </td>
                  <td className="px-10 py-10 text-center">
                    {editing === p.id ? (
                      <div className="flex flex-col items-center gap-2">
                        <input type="number" className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 w-24 outline-none focus:border-brand-500 text-center font-black" value={editForm.stock_quantity}
                             onChange={e => setEditForm({...editForm, stock_quantity: parseInt(e.target.value) || 0})} />
                        <span className="text-[8px] text-gray-600 font-black uppercase">Volume Actuel</span>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-2xl font-black ${
                          p.stock_quantity === 0 ? 'text-red-500' :
                          p.stock_quantity <= p.min_stock_alert ? 'text-amber-500' : 'text-emerald-500'
                        } tracking-tighter`}>
                          {p.stock_quantity}
                        </span>
                        <div className={`w-8 h-1 rounded-full mt-2 ${
                            p.stock_quantity === 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                            p.stock_quantity <= p.min_stock_alert ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        }`} />
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex justify-end gap-3">
                      {editing === p.id ? (
                        <>
                          <button onClick={() => saveEdit(p.id)} className="bg-emerald-500 text-white p-3 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                            <HiOutlineCheckCircle className="w-6 h-6" />
                          </button>
                          <button onClick={() => setEditing(null)} className="bg-white/5 text-gray-500 p-3 rounded-2xl hover:text-white transition-all">
                            <HiOutlineXCircle className="w-6 h-6" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(p)} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-3xl text-gray-400 hover:text-brand-500 transition-all active:scale-95">
                          <HiOutlinePencilSquare className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
