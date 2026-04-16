import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineTruck, HiOutlineMapPin, HiOutlineMagnifyingGlass, HiOutlineWrench } from 'react-icons/hi2';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await adminAPI.getVehicles();
      setVehicles(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement de la flotte');
    }
    setLoading(false);
  };

  const filtered = vehicles.filter(v => 
    v.plate_number?.toLowerCase().includes(search.toLowerCase()) || 
    v.brand_model?.toLowerCase().includes(search.toLowerCase()) ||
    v.distributor?.user?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineTruck className="text-emerald-400" />
          Suivi de la Flotte
        </h2>
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" placeholder="Rechercher (plaque, modèle, livreur)..."
            className="bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-white text-sm w-full md:w-80 focus:border-brand-500 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div key={v.id} className="card group hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-800 rounded-lg">
                <HiOutlineTruck className={`w-8 h-8 ${v.status === 'active' ? 'text-emerald-400' : v.status === 'maintenance' ? 'text-amber-500' : 'text-gray-500'}`} />
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                ${v.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                  v.status === 'maintenance' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-red-500/10 text-red-500'}`}>
                {v.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight uppercase">{v.plate_number}</h3>
            <p className="text-xs text-gray-400 mb-4">{v.brand_model || 'Modèle inconnu'}</p>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                  {v.distributor?.user?.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Assigné à</p>
                  <p className="text-xs text-white">{v.distributor?.user?.full_name || 'Non assigné'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-gray-500">
                  <HiOutlineWrench />
                  Dernier service: {v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <HiOutlineMapPin />
                  En circulation
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
