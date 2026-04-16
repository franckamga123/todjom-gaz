import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  HiOutlineCheck, HiOutlineXMark, HiOutlineMagnifyingGlass, 
  HiOutlineFunnel, HiOutlineEye, HiOutlineCamera,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const statusBadge = { 
  open: 'badge-warning', 
  investigating: 'badge-info', 
  resolved: 'badge-success', 
  closed: 'badge-danger' 
};

const statusLabel = { 
  open: 'Ouvert', 
  investigating: 'En cours', 
  resolved: 'Résolu', 
  closed: 'Fermé/Rejeté' 
};

const typeLabels = {
  quantity: 'Problème Quantité',
  quality: 'Problème Qualité',
  delay: 'Retard de Livraison',
  non_delivery: 'Non Livraison',
  other: 'Autre'
};

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState('resolved');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadDisputes(); }, [page, statusFilter]);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDisputes({ page, limit: 15, status: statusFilter || undefined });
      setDisputes(res.data?.disputes || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Erreur de chargement des litiges');
      setDisputes([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolution.trim()) { toast.error('Saisissez une résolution'); return; }
    
    setActionLoading(true);
    try {
      await adminAPI.resolveDispute(selected.id, { 
        status: resolveStatus, 
        resolution: resolution 
      });
      toast.success('Litige mis à jour');
      setSelected(null);
      setResolution('');
      loadDisputes();
    } catch (err) {
      toast.error(err.message);
    }
    setActionLoading(false);
  };

  const markAsInvestigating = async (id) => {
    try {
      await adminAPI.resolveDispute(id, { status: 'investigating', resolution: 'Investigation en cours...' });
      toast.success('Statut mis à jour : En cours');
      loadDisputes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-4">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gestion des Litiges</h1>
          <p className="text-sm text-gray-500">{total} litiges signalés au total</p>
        </div>
        <button onClick={loadDisputes} className="btn-secondary flex items-center gap-2 text-sm self-start">
          <HiOutlineArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="w-4 h-4 text-gray-500" />
          {['', 'open', 'investigating', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}>
              {s ? statusLabel[s] : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Date</th>
              <th>Client</th>
              <th>Type</th>
              <th>Description</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-20">
                <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 text-sm mt-4">Chargement des litiges...</p>
              </td></tr>
            ) : disputes.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-16">
                <p className="text-4xl mb-4">🎉</p>
                <p className="text-gray-400 font-medium text-lg">Aucun litige en attente</p>
                <p className="text-gray-500 text-sm">Tout semble fonctionner correctement !</p>
              </td></tr>
            ) : disputes.map((d, i) => (
              <tr key={d.id || i} className="animate-fade-in group" style={{ animationDelay: `${i * 30}ms` }}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-mono text-brand-400 font-bold text-xs">{d.order?.order_number || '-'}</span>
                    {d.order?.status && <span className="text-[10px] text-gray-500 uppercase">{d.order.status}</span>}
                  </div>
                </td>
                <td className="text-xs text-gray-500 whitespace-nowrap">
                  {d.created_at ? (
                    <>
                      {new Date(d.created_at).toLocaleDateString('fr-FR')}
                      <br />
                      {new Date(d.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </>
                  ) : '-'}
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-gray-200 text-sm font-medium">{d.raisedByUser?.full_name || '-'}</span>
                    <span className="text-[10px] text-gray-500">{d.raisedByUser?.phone || '-'}</span>
                  </div>
                </td>
                <td>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded-md text-gray-400 border border-gray-700">
                    {typeLabels[d.type] || d.type}
                  </span>
                </td>
                <td>
                  <p className="text-gray-300 text-xs max-w-[200px] truncate group-hover:block group-hover:whitespace-normal" title={d.description}>
                    {d.description}
                  </p>
                </td>
                <td><span className={statusBadge[d.status]}>{statusLabel[d.status]}</span></td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setSelected(d)} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white border border-transparent hover:border-gray-700 transition-all">
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    {d.status === 'open' && (
                      <button onClick={() => markAsInvestigating(d.id)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" title="Marquer comme en cours">
                        <HiOutlineArrowPath className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <p className="text-xs text-gray-500">{total} litige(s) au total</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 disabled:opacity-30">Précédent</button>
            <div className="flex items-center px-4 bg-gray-800/50 rounded-lg border border-gray-700 text-xs text-gray-400">
              {page} / {totalPages}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 disabled:opacity-30">Suivant</button>
          </div>
        </div>
      )}

      {/* Detail & Resolve modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-800 max-w-lg w-full rounded-2xl shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-white">Détails du litige</h3>
                <p className="text-xs text-brand-400 font-mono mt-1">N° Commande: {selected.order?.order_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors">
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Rapporté par</p>
                  <p className="text-sm text-gray-200 font-medium">{selected.raisedByUser?.full_name}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Type de litige</p>
                  <p className="text-sm text-gray-200 font-medium">{typeLabels[selected.type] || selected.type}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Description</p>
                <div className="p-4 bg-gray-800/80 rounded-xl text-sm text-gray-300 border border-gray-800 leading-relaxed shadow-inner">
                  {selected.description}
                </div>
              </div>

              {/* Photo Proof */}
              {selected.proof_photo_url && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Preuve Photo</p>
                  <div className="relative group rounded-xl overflow-hidden border border-gray-800 bg-black/20">
                    <img 
                      src={selected.proof_photo_url ? (selected.proof_photo_url.startsWith('http') ? selected.proof_photo_url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${selected.proof_photo_url}`) : ''} 
                      alt="Preuve" 
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiOutlineCamera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Form or Display */}
              {selected.status !== 'resolved' && selected.status !== 'closed' ? (
                <form onSubmit={handleResolve} className="space-y-4 pt-4 border-t border-gray-800">
                  <p className="text-xs font-bold text-gray-200 uppercase tracking-widest">Résolution</p>
                  
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setResolveStatus('resolved')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${resolveStatus === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                      <HiOutlineCheck className="w-4 h-4" /> Résoudre
                    </button>
                    <button type="button" onClick={() => setResolveStatus('closed')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${resolveStatus === 'closed' ? 'bg-red-500/10 text-red-400 border border-red-500/30 ring-1 ring-red-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                      <HiOutlineXMark className="w-4 h-4" /> Rejeter
                    </button>
                  </div>

                  <textarea 
                    value={resolution} onChange={e => setResolution(e.target.value)}
                    placeholder="Saisissez la décision administrative..."
                    className="input w-full h-28 resize-none text-sm" 
                    required
                  />

                  <button type="submit" disabled={actionLoading}
                    className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                    {actionLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Enregistrer la décision'}
                  </button>
                </form>
              ) : (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Résolution Administrative</p>
                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <p className="text-sm text-gray-300 italic">"{selected.resolution || 'Aucun détail fourni'}"</p>
                    {selected.resolvedByUser && (
                      <p className="text-[10px] text-gray-500 mt-2">Résolu par: {selected.resolvedByUser.full_name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



