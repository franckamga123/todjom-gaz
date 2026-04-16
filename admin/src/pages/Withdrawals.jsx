import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { HiOutlineBanknotes, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineArrowPath, HiOutlineUserCircle, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadWithdrawals(); }, []);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getWithdrawals();
      setWithdrawals(res.data);
    } catch {
      toast.error('Échec de synchronisation des flux');
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const notes = prompt('Annotation de l\'opération (optionnel) :');
    try {
      await adminAPI.updateWithdrawalStatus(id, { status, admin_notes: notes });
      toast.success('Protocole de paiement validé');
      loadWithdrawals();
    } catch (err) {
      toast.error(err.message || 'Échec de la transaction administrative');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING': return { label: 'En attente', color: 'amber', icon: HiOutlineClock };
      case 'APPROVED': return { label: 'Audit Terminé', color: 'blue', icon: HiOutlineCheckCircle };
      case 'COMPLETED': return { label: 'Flux Déboursé', color: 'emerald', icon: HiOutlineCheckCircle };
      case 'REJECTED': return { label: 'Transaction Bloquée', color: 'red', icon: HiOutlineXCircle };
      default: return { label: status, color: 'gray', icon: HiOutlineClock };
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
                  <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Financial Oversight</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Registre des Débours</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Reversements <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 font-outline-2">Partenaires</span></h1>
         </div>
      </div>

      {/* Financial KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-3xl relative overflow-hidden group">
          <div className="text-brand-500 mb-4 transition-transform group-hover:scale-110 duration-500">
            <HiOutlineBanknotes className="w-8 h-8" />
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Payouts Partenaires</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">1,245,600 <span className="text-sm text-brand-500">F</span></h3>
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-brand-500/10 transition-colors" />
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[40px] backdrop-blur-3xl relative overflow-hidden group">
          <div className="text-emerald-500 mb-4 transition-transform group-hover:scale-110 duration-500">
            <HiOutlineCheckCircle className="w-8 h-8" />
          </div>
          <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mb-1">Gains Livrateurs (75%)</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">934,200 <span className="text-sm text-emerald-500">F</span></h3>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[40px] backdrop-blur-3xl relative overflow-hidden group text-right">
          <div className="text-blue-500 mb-4 transition-transform group-hover:scale-110 duration-500 flex justify-end">
            <HiOutlineShieldCheck className="w-8 h-8" />
          </div>
          <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-widest mb-1">Coordination Todjom (25%)</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">311,400 <span className="text-sm text-blue-500">F</span></h3>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
        </div>
      </div>

      {/* Grid Display */}
      <div className="bg-gray-900/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                <th className="px-10 py-8">Bénéficiaire x ID</th>
                <th className="px-10 py-8">Volume Finance (Net)</th>
                <th className="px-10 py-8 text-center">Protocol de Transfert</th>
                <th className="px-10 py-8 text-center">État du Flux</th>
                <th className="px-10 py-8 text-right">Outils de Régulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-gray-600 font-black uppercase tracking-widest text-xs">Aucune demande de retrait dans la file</td></tr>
              ) : withdrawals.map(w => {
                 const config = getStatusConfig(w.status);
                 return (
                <tr key={w.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 border border-white/10 flex items-center justify-center text-gray-500 shadow-xl transition-transform group-hover:rotate-6">
                        <HiOutlineUserCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-black text-white text-base tracking-tight leading-tight uppercase tracking-wider">{w.supplier?.user?.full_name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Ref: {w.id.split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex flex-col">
                       <p className="font-black text-white text-lg tracking-tighter">{parseFloat(w.amount).toLocaleString()} <span className="text-[10px] text-brand-500 ml-0.5">F</span></p>
                       <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{w.created_at ? new Date(w.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
                       {w.payment_method}
                    </span>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-${config.color}-500/30 bg-${config.color}-500/10 text-${config.color}-500`}>
                       <config.icon className="w-3.5 h-3.5" />
                       <span className="text-[9px] font-black uppercase tracking-widest">{config.label}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex justify-end gap-3">
                      {w.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(w.id, 'APPROVED')} className="p-4 bg-blue-500 text-white rounded-3xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <HiOutlineCheckCircle className="w-5 h-5" /> Autoriser
                          </button>
                          <button onClick={() => updateStatus(w.id, 'REJECTED')} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-3xl hover:bg-red-500 hover:text-white transition-all active:scale-95">
                            <HiOutlineXCircle className="w-6 h-6" />
                          </button>
                        </>
                      )}
                      {w.status === 'APPROVED' && (
                        <button onClick={() => updateStatus(w.id, 'COMPLETED')} className="p-4 bg-emerald-500 text-white rounded-3xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <HiOutlineCurrencyDollar className="w-5 h-5" /> Décaisser
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
