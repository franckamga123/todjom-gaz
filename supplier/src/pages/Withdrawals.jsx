import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { HiOutlineBanknotes, HiOutlinePlus, HiOutlineClock, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_method: 'Mobile Money', payment_details: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        userAPI.getWithdrawals(),
        userAPI.getStats()
      ]);
      setWithdrawals(wRes.data);
      setStats(sRes.data);
    } catch {
      toast.error('Erreur chargement données');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(form.amount) > stats?.myRevenue) return toast.error('Solde insuffisant');
    
    setSaving(true);
    try {
      await userAPI.requestWithdrawal(form);
      toast.success('Demande envoyée !');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'APPROVED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">FINANCE & REVENUS</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Gérez vos paiements et votre solde</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Demander un retrait
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-brand-500/20 to-transparent border-brand-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Revenu Net (Après Commission)</p>
          <p className="text-3xl font-black text-white mt-1">{stats?.myRevenue?.toLocaleString() || 0} <span className="text-sm">FCFA</span></p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Commission site : {stats?.commission}%
          </div>
        </div>
        <div className="card">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Ventes Brutes</p>
          <p className="text-3xl font-black text-white mt-1">{stats?.totalRevenue?.toLocaleString() || 0} <span className="text-sm">FCFA</span></p>
          <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">{stats?.completedOrders} Commandes livrées</p>
        </div>
        <div className="card">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retraits effectués</p>
          <p className="text-3xl font-black text-white mt-1">
            {withdrawals.filter(w => w.status === 'COMPLETED').reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString()} <span className="text-sm">FCFA</span>
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">{withdrawals.filter(w => w.status === 'PENDING').length} en attente</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h3 className="p-6 text-sm font-black text-white uppercase tracking-widest border-b border-gray-800/50">Historique des retraits</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/40 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">ID Demande</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Méthode</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-gray-500">Aucun retrait enregistré</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">#{w.id.split('-')[0]}</td>
                  <td className="px-6 py-4 font-black text-white">{parseFloat(w.amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">{w.payment_method}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/50">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Nouvelle Demande</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Montant à retirer (MIN 5000 FCFA)</label>
                <div className="relative">
                   <HiOutlineBanknotes className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                   <input required type="number" min="5000" step="500" placeholder="0" className="input w-full pl-12 py-4 text-xl font-black" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold text-right">Solde disponible : {stats?.myRevenue?.toLocaleString()} FCFA</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Méthode de paiement</label>
                <select className="input w-full" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                   <option>Mobile Money (Orange/MTN)</option>
                   <option>Virement Bancaire</option>
                   <option>Espèces (Siège)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Détails de paiement (N°, IBAN, etc.)</label>
                <textarea required rows="3" placeholder="Saisissez vos informations de paiement ici..." className="input w-full" value={form.payment_details} onChange={e => setForm({ ...form, payment_details: e.target.value })}></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl hover:bg-gray-700 transition-all active:scale-95">Annuler</button>
                <button type="submit" disabled={saving || !form.amount} className="flex-1 btn-primary font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl shadow-brand-500/20 active:scale-95 disabled:opacity-50">
                   {saving ? 'ENVOI...' : 'DEMANDER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
