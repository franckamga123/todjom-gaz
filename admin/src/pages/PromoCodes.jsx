import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineTicket, HiOutlinePlus, HiOutlineTrash, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';

export default function PromoCodes() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    expiry_date: '',
    usage_limit: ''
  });

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const res = await adminAPI.getPromoCodes();
      setPromos(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des codes promo');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createPromoCode(formData);
      toast.success('Code promo créé !');
      setShowModal(false);
      loadPromos();
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', expiry_date: '', usage_limit: '' });
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await adminAPI.togglePromoCode(id);
      toast.success('Statut mis à jour');
      loadPromos();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineTicket className="text-brand-400" />
          Codes Promo & Marketing
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-brand-500/20"
        >
          <HiOutlinePlus /> CRÉER UN CODE
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {promos.length === 0 ? (
          <div className="card text-center py-12 text-gray-400 italic">Aucun code promo actif</div>
        ) : (
          promos.map((p) => (
            <div key={p.id} className="card group hover:border-brand-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-brand-400 font-bold text-xl border border-gray-700">
                    %
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white tracking-widest uppercase">{p.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {p.is_active ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {p.discount_type === 'percentage' ? `${p.discount_value}%` : `${p.discount_value} CFA`} de réduction • Min. {p.min_order_amount} CFA
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] text-gray-500">Utilisés: <span className="text-gray-300">{p.usage_count}</span> / {p.usage_limit || '∞'}</p>
                      <p className="text-[10px] text-gray-500">Expire: <span className="text-gray-300">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'Jamais'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(p.id)}
                    className={`p-2 rounded-lg transition-all ${p.is_active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                  >
                    {p.is_active ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineCheck className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-6">Nouveau Code Promo</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code (ex: TODJOM20)</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none uppercase font-mono tracking-widest"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none"
                    value={formData.discount_type}
                    onChange={e => setFormData({...formData, discount_type: e.target.value})}
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant Fixe (CFA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valeur</label>
                  <input 
                    type="number" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none"
                    value={formData.discount_value}
                    onChange={e => setFormData({...formData, discount_value: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Minimum Achat</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none"
                    value={formData.min_order_amount}
                    onChange={e => setFormData({...formData, min_order_amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Limite Usage</label>
                  <input 
                    type="number" placeholder="Illimité"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none"
                    value={formData.usage_limit}
                    onChange={e => setFormData({...formData, usage_limit: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date d'expiration</label>
                <input 
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none"
                  value={formData.expiry_date}
                  onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700">ANNULER</button>
                <button type="submit" className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/20">CONFIRMER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
