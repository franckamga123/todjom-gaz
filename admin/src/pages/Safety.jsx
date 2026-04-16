import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  HiOutlineShieldExclamation, HiOutlinePlus, HiOutlineTrash,
  HiOutlineMapPin, HiOutlineExclamationTriangle, HiOutlineArrowPath,
  HiOutlineXMark, HiOutlineShieldCheck, HiOutlineExclamationCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Safety() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newCenter, setNewCenter] = useState({ name: '', reason: '', risk_level: 'MODÉRÉ', address: '' });

  useEffect(() => { loadCenters(); }, []);

  const loadCenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getSafetyCenters();
      setCenters(res.data || []);
    } catch (err) {
      setError(err.message || 'Échec de synchronisation du flux de sécurité');
    }
    setLoading(false);
  };

  const addCenter = async (e) => {
    e.preventDefault();
    if (!newCenter.name || !newCenter.reason) {
      toast.error('Identification et Motif requis pour diffusion');
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminAPI.createSafetyCenter(newCenter);
      setCenters([res.data, ...centers]);
      setNewCenter({ name: '', reason: '', risk_level: 'MODÉRÉ', address: '' });
      toast.success('Signalement propagé sur le réseau');
    } catch (err) {
      toast.error(err.message || 'Échec de l\'émission du signal');
    }
    setSubmitting(false);
  };

  const removeCenter = async (id) => {
    try {
      await adminAPI.deleteSafetyCenter(id);
      setCenters(centers.filter(c => c.id !== id));
      toast.success('Signal neutralisé');
    } catch (err) {
      toast.error(err.message || 'Échec de la neutralisation');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (error && centers.length === 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-16 text-center animate-fade-in max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/40 mx-auto mb-8 animate-pulse text-3xl">🛡️</div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Zone d'Ombre Détectée</h2>
        <p className="text-gray-500 text-sm mb-8">{error}</p>
        <button onClick={loadCenters} className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-95">
          Restaurer Vigilance
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
               <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Protocol Compliance</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vérification des Entités</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Sécurité & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 font-outline-2">Vigilance</span></h1>
         </div>
         <button onClick={loadCenters} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-white active:scale-95 group">
            <HiOutlineArrowPath className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Signal Entry Section */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-gray-900/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] -mr-16 -mt-16" />
              
              <h3 className="text-xl font-black text-white tracking-tight mb-8 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-red-500 border border-red-400 flex items-center justify-center text-white shadow-xl">
                    <HiOutlineExclamationCircle className="w-6 h-6" />
                 </div>
                 Émission d'Alerte
              </h3>

              <form onSubmit={addCenter} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Désignation</label>
                   <input
                     type="text" className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 outline-none font-bold transition-all placeholder:text-gray-800" placeholder="Ex: Dépôt Clandestin X"
                     value={newCenter.name} onChange={e => setNewCenter({...newCenter, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Coordonnées / Secteur</label>
                   <input
                     type="text" className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 outline-none font-bold transition-all placeholder:text-gray-800" placeholder="Ex: Niamey 2000, Axe Goudel"
                     value={newCenter.address} onChange={e => setNewCenter({...newCenter, address: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Indice de Danger</label>
                   <select
                     className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 outline-none font-black text-[10px] uppercase tracking-widest appearance-none transition-all cursor-pointer"
                     value={newCenter.risk_level}
                     onChange={e => setNewCenter({...newCenter, risk_level: e.target.value})}
                   >
                     <option value="MODÉRÉ" className="bg-gray-900">NIVEAU: MODÉRÉ</option>
                     <option value="ÉLEVÉ" className="bg-gray-900">NIVEAU: ÉLEVÉ</option>
                     <option value="CRITIQUE" className="bg-gray-900">NIVEAU: CRITIQUE</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Rapport de Motif</label>
                   <textarea
                     className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 outline-none font-bold transition-all placeholder:text-gray-800 min-h-[120px] resize-none" placeholder="Anomalies détectées..."
                     value={newCenter.reason} onChange={e => setNewCenter({...newCenter, reason: e.target.value})}
                   />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-red-500 hover:scale-[1.02] py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-red-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineShieldExclamation className="w-5 h-5" />}
                  Diffuser Alerte Réseau
                </button>
              </form>
           </div>

           <div className="p-8 border border-white/5 bg-white/[0.02] rounded-[32px]">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                 * Les entités signalées seront marquées comme "NON-CONFORMES" sur les interfaces clients et livreurs pour prévenir tout risque d'accident ou de fraude.
              </p>
           </div>
        </div>

        {/* Alerts List Section */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                Signaux Actifs <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
             </h3>
             <span className="text-[10px] font-black text-gray-600 ml-auto">{loading ? '--' : centers.length} Unitées sous Surveillance</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {loading ? (
                <div className="py-20 text-center">
                   <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
             ) : centers.length === 0 ? (
                <div className="py-20 text-center bg-gray-900/40 border border-white/5 border-dashed rounded-[40px]">
                   <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">🛡️</div>
                   <p className="text-emerald-500 font-black text-xs uppercase tracking-widest">Réseau Intègre</p>
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">Aucun risque critique répertorié</p>
                </div>
             ) : centers.map((c, i) => (
                <div key={c.id} className="group relative bg-gray-900/40 border border-white/5 p-8 rounded-[32px] hover:bg-white/[0.03] transition-all overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                     c.risk_level === 'CRITIQUE' ? 'bg-red-500' :
                     c.risk_level === 'ÉLEVÉ' ? 'bg-orange-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="flex items-start justify-between gap-6 relative z-10">
                    <div className="flex gap-6">
                      <div className={`w-16 h-16 rounded-3xl shrink-0 flex items-center justify-center text-2xl shadow-2xl transition-transform group-hover:scale-110 ${
                         c.risk_level === 'CRITIQUE' ? 'bg-red-500/10 text-red-500 shadow-red-500/10 border border-red-500/20' :
                         c.risk_level === 'ÉLEVÉ' ? 'bg-orange-500/10 text-orange-500 shadow-orange-500/10 border border-orange-500/20' : 'bg-amber-500/10 text-amber-500 shadow-amber-500/10 border border-amber-500/20'
                      }`}>
                         <HiOutlineExclamationTriangle className="w-8 h-8" />
                      </div>
                      <div className="space-y-3">
                         <div className="flex flex-wrap items-center gap-4">
                            <h4 className="text-2xl font-black text-white tracking-tighter leading-none">{c.name}</h4>
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                               c.risk_level === 'CRITIQUE' ? 'bg-red-500 text-white' :
                               c.risk_level === 'ÉLEVÉ' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                               {c.risk_level}
                            </span>
                         </div>
                         <p className="text-gray-400 text-sm font-bold leading-relaxed max-w-2xl">{c.reason}</p>
                         <div className="flex flex-wrap items-center gap-8 pt-2">
                            {c.address && (
                               <div className="flex items-center gap-2">
                                  <HiOutlineMapPin className="w-4 h-4 text-gray-600" />
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{c.address}</span>
                               </div>
                            )}
                            <div className="flex items-center gap-2">
                               <HiOutlineArrowPath className="w-4 h-4 text-gray-600" />
                               <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Signalé {formatDate(c.created_at)}</span>
                            </div>
                         </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeCenter(c.id)}
                      className="p-4 bg-white/5 hover:bg-red-500/20 text-gray-600 hover:text-red-500 rounded-[20px] transition-all flex items-center justify-center group/btn"
                    >
                      <HiOutlineTrash className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Aesthetic backgrounds */}
                  <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-opacity group-hover:opacity-10 ${
                     c.risk_level === 'CRITIQUE' ? 'bg-red-500' :
                     c.risk_level === 'ÉLEVÉ' ? 'bg-orange-500' : 'bg-amber-500'
                  }`} />
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
