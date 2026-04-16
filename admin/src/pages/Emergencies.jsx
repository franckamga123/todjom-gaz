import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineExclamationTriangle, HiOutlineMapPin, HiOutlinePhone, HiOutlineCheckCircle } from 'react-icons/hi2';

export default function Emergencies() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergencies();
  }, []);

  const loadEmergencies = async () => {
    try {
      const res = await adminAPI.getEmergencies();
      setEmergencies(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des urgences');
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateEmergencyStatus(id, status);
      toast.success('Statut mis à jour');
      loadEmergencies();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800 rounded-2xl" />)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineExclamationTriangle className="text-red-500" />
          Alertes d'Urgence
        </h2>
        <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          {emergencies.filter(e => e.status === 'NOUVEAU').length} NOUVELLES
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {emergencies.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✅
            </div>
            <p className="text-gray-400">Aucune alerte d'urgence en cours</p>
          </div>
        ) : (
          emergencies.map((e) => (
            <div key={e.id} className={`card border-l-4 transition-all ${e.status === 'NOUVEAU' ? 'border-red-500 bg-red-500/5' :
              e.status === 'EN_COURS' ? 'border-amber-500 bg-amber-500/5' :
                'border-emerald-500 bg-emerald-500/5 opacity-60'
              }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${e.status === 'NOUVEAU' ? 'bg-red-500 text-white animate-bounce' : 'bg-gray-800 text-gray-400'
                    }`}>
                    🚨
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-lg">{e.client?.full_name || 'Anonyme'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                        ${e.status === 'NOUVEAU' ? 'bg-red-500 text-white' :
                          e.status === 'EN_COURS' ? 'bg-amber-500 text-white' :
                            'bg-emerald-500 text-white'}`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <HiOutlinePhone className="text-gray-500" /> {e.client?.phone || 'N/A'}
                      </p>
                      <p className="text-xs text-brand-400 flex items-center gap-2 font-mono">
                        <HiOutlineMapPin className="text-gray-500" /> {e.lat}, {e.lng}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 italic">
                      Signalé le {e.created_at ? new Date(e.created_at).toLocaleString() : 'Date inconnue'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-16 md:ml-0">
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${e.lat},${e.lng}`, '_blank')}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all tooltip"
                    title="Voir sur la carte"
                  >
                    <HiOutlineMapPin className="w-5 h-5" />
                  </button>

                  {e.status === 'NOUVEAU' && (
                    <button
                      onClick={() => updateStatus(e.id, 'EN_COURS')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                    >
                      PRENDRE EN CHARGE
                    </button>
                  )}

                  {(e.status === 'NOUVEAU' || e.status === 'EN_COURS') && (
                    <button
                      onClick={() => updateStatus(e.id, 'RESOLU')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <HiOutlineCheckCircle className="w-5 h-5" /> MARQUER RÉSOLU
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
