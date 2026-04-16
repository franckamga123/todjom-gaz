import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { HiOutlineDocumentText, HiOutlineFunnel } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const actionColors = {
  LOGIN: 'badge-info', REGISTER: 'badge-info',
  CREATE_ORDER: 'badge-success', CANCEL_ORDER: 'badge-warning',
  UPDATE_STATUS: 'badge-info', TOGGLE_USER: 'badge-warning',
  VALIDATE_SUPPLIER: 'badge-success', RESOLVE_DISPUTE: 'badge-success',
  UPDATE_SETTINGS: 'badge-neutral'
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, [page, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLogs({ page, limit: 20, action: actionFilter || undefined });
      setLogs(res.data?.logs || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch {
      setLogs([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card flex flex-wrap gap-2 items-center">
        <HiOutlineFunnel className="w-4 h-4 text-gray-500" />
        {['', 'LOGIN', 'CREATE_ORDER', 'CANCEL_ORDER', 'TOGGLE_USER', 'VALIDATE_SUPPLIER'].map(a => (
          <button key={a} onClick={() => { setActionFilter(a); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              actionFilter === a ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}>
            {a || 'Tous'}
          </button>
        ))}
      </div>

      {/* Logs timeline */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.map((log, i) => (
          <div key={log.id || i} className="card flex items-start gap-4 animate-slide-in" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="mt-1">
              <HiOutlineDocumentText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={actionColors[log.action] || 'badge-neutral'}>{log.action}</span>
                <span className="text-xs text-gray-500">{log.entity_type && `[${log.entity_type}]`}</span>
              </div>
              {log.details && <p className="text-sm text-gray-300 mb-1">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>{log.user?.full_name || 'Système'}</span>
                <span>•</span>
                <span>{log.ip_address || '-'}</span>
                <span>•</span>
                <span>{log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{total} entrée{total > 1 ? 's' : ''}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 disabled:opacity-50 hover:bg-gray-700">
              ← Précédent
            </button>
            <span className="px-3 py-1.5 text-xs text-gray-400">{page}/{totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 disabled:opacity-50 hover:bg-gray-700">
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



