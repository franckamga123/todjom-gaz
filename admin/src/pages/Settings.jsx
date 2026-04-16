import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { HiOutlineCog8Tooth, HiOutlineArrowPath, HiOutlineCurrencyDollar, HiOutlineTruck, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const settingLabels = {
  commission_rate: { label: 'Protocole Commission (%)', type: 'number', icon: HiOutlineCurrencyDollar },
  max_delivery_time: { label: 'Limite Livraison (min)', type: 'number', icon: HiOutlineClock },
  reassign_delay: { label: 'Relais Réassignation (min)', type: 'number', icon: HiOutlineArrowPath },
  client_wait_time: { label: 'Tolérance Attente (min)', type: 'number', icon: HiOutlineUser },
  refund_delay_hours: { label: 'Cycle Remboursement (h)', type: 'number', icon: HiOutlineArrowPath },
  app_name: { label: 'Identité Système', type: 'text', icon: HiOutlineIdentification },
  currency: { label: 'Unité Monétaire', type: 'text', icon: HiOutlineCurrencyDollar },
  country: { label: 'Juridiction Opérationnelle', type: 'text', icon: HiOutlineGlobeAlt }
};

// Simplified icon component proxy for local usage since some icons weren't imported
const HiOutlineClock = (props) => <div {...props}>🕒</div>;
const HiOutlineUser = (props) => <div {...props}>👤</div>;
const HiOutlineIdentification = (props) => <div {...props}>🆔</div>;
const HiOutlineGlobeAlt = (props) => <div {...props}>🌍</div>;

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await adminAPI.getSettings();
      const raw = res.data?.settings;
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        setSettings(raw);
      } else if (Array.isArray(raw)) {
        const map = {};
        raw.forEach(s => { map[s.key] = s.value; });
        setSettings(map);
      }
    } catch {
      setSettings({
        commission_rate: 5, max_delivery_time: 180, reassign_delay: 60,
        client_wait_time: 15, refund_delay_hours: 48, app_name: 'TODJOM GAZ',
        currency: 'CFA', country: 'Niger'
      });
    }
    setLoading(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings({ settings });
      toast.success('Configuration système synchronisée');
    } catch (err) {
      toast.error(err.message || 'Échec de la synchronisation');
    }
    setSaving(false);
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Lecture des Variables...</p>
        </div>
    );
  }

  const groups = [
    {
      title: 'Flux Financier',
      icon: HiOutlineCurrencyDollar,
      keys: ['commission_rate', 'refund_delay_hours', 'currency']
    },
    {
      title: 'Paramètres Logistiques',
      icon: HiOutlineTruck,
      keys: ['max_delivery_time', 'reassign_delay', 'client_wait_time']
    },
    {
      title: 'Configuration Globale',
      icon: HiOutlineAdjustmentsHorizontal,
      keys: ['app_name', 'country']
    }
  ];

  return (
    <div className="max-w-4xl space-y-12 pb-20 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
                  <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">System Control</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuration Centrale</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Variables du <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 font-outline-2">Système</span></h1>
         </div>
         <button onClick={saveSettings} disabled={saving} className="bg-brand-500 hover:scale-105 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-500/30 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineCog8Tooth className="w-5 h-5" />}
            Déployer Configuration
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {groups.map((group, i) => (
          <div key={i} className="bg-gray-900/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
                  <group.icon className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{group.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Module de Régulation ID-{i+1}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {group.keys.map(key => {
                const meta = settingLabels[key] || { label: key, type: 'text', icon: HiOutlineAdjustmentsHorizontal };
                return (
                  <div key={key} className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <meta.icon className="w-3.5 h-3.5" /> {meta.label}
                    </label>
                    <input
                      type={meta.type}
                      value={settings[key] ?? ''}
                      onChange={e => handleChange(key, meta.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 outline-none font-bold transition-all placeholder:text-gray-800"
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="bg-brand-500/10 border border-brand-500/20 p-8 rounded-[32px] flex items-center gap-6">
         <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-2xl animate-pulse">⚡</div>
         <div>
            <p className="text-white font-black text-sm uppercase tracking-tight">Direct Systématique</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Toute modification appliquée à ces variables impactera immédiatement l'ensemble des protocoles transactionnels et logistiques de la plateforme TODJOM GAZ.</p>
         </div>
      </div>
    </div>
  );
}
