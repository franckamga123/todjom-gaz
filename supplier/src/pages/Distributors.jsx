import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { HiOutlineBuildingStorefront, HiOutlineMapPin, HiOutlinePhone, HiOutlineCube, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Distributors() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDistributors(); }, []);

  const loadDistributors = async () => {
    try {
      const res = await userAPI.getAffiliatedDistributors();
      setDistributors(res.data || []);
    } catch (error) {
      toast.error("Impossible de charger les distributeurs");
      // Fallback for demo if needed
      setDistributors(getDemoDistributors());
    }
    setLoading(false);
  };

  const getStockStatus = (inventory) => {
    if (!inventory || inventory.length === 0) return { label: 'Aucun stock', color: 'text-red-400' };
    const lowStock = inventory.some(item => item.quantity < 5);
    if (lowStock) return { label: 'Stock faible', color: 'text-amber-400' };
    return { label: 'En stock', color: 'text-emerald-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Réseau de Distribution</h1>
        <button onClick={loadDistributors} className="text-sm text-brand-400 hover:underline">
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distributors.map((d, i) => (
            <div key={d.id} className="group bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[32px] overflow-hidden hover:border-brand-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-6 border-b border-gray-800/50 flex justify-between items-start bg-gradient-to-br from-gray-950/0 to-gray-950/40">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                    <HiOutlineBuildingStorefront className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg tracking-tight leading-tight">{d.shop_name || d.user?.full_name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                      <HiOutlineMapPin className="w-3 h-3 text-brand-500" />
                      <span>{d.user?.address || 'Niamey, Niger'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Inventory Status Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">Capacité & Stocks</p>
                     <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${getStockStatus(d.inventory).color} bg-gray-950/50 border border-current opacity-80`}>
                        {getStockStatus(d.inventory).label}
                     </span>
                  </div>
                  
                  <div className="grid gap-2">
                    {d.inventory && d.inventory.length > 0 ? (
                      d.inventory.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-950/40 p-3 rounded-2xl border border-gray-800/80 group/item hover:border-brand-500/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.quantity < 5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                            <span className="text-xs font-bold text-gray-300">
                              {item.product?.gas_type} {item.product?.weight_kg}kg
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-black ${item.quantity < 5 ? 'text-red-400' : 'text-white'}`}>
                              {item.quantity}
                            </span>
                            <span className="text-[9px] font-black text-gray-500 uppercase">Unités</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-gray-950/20 rounded-[24px] border border-dashed border-gray-800">
                        <HiOutlineCube className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Inventaire vide</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Intelligent Actions */}
                <div className="pt-4 flex gap-3">
                  <button 
                    className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 text-white py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                    onClick={() => toast.success("Plan de ravitaillement généré et envoyé")}
                  >
                    Ravitaillement
                  </button>
                  <a 
                    href={`tel:${d.user?.phone || d.contact_number}`}
                    className="w-12 h-12 flex items-center justify-center bg-gray-800 text-gray-400 rounded-[18px] hover:bg-gray-700 border border-gray-700 transition-colors active:scale-90"
                    title="Contacter le distributeur"
                  >
                    <HiOutlinePhone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && distributors.length === 0 && (
        <div className="card text-center py-20 bg-gray-950/50 border-dashed">
          <HiOutlineExclamationTriangle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">Vous n'avez aucun distributeur affilié pour le moment.</p>
        </div>
      )}
    </div>
  );
}

function getDemoDistributors() {
  return [
    { 
      id: '1', 
      shop_name: 'Station NigerGaz Recasement', 
      user: { address: 'Niamey, Quartier Recasement', phone: '+227 90 00 11 22' },
      inventory: [
        { id: 'i1', quantity: 12, product: { gas_type: 'NigerGaz', weight_kg: 6 } },
        { id: 'i2', quantity: 3, product: { gas_type: 'NigerGaz', weight_kg: 12 } }
      ]
    },
    { 
      id: '2', 
      shop_name: 'Dépôt Gani Gaz Talladjé', 
      user: { address: 'Niamey, Boulevard Talladjé', phone: '+227 96 44 55 66' },
      inventory: [
        { id: 'i3', quantity: 45, product: { gas_type: 'Gani Gaz', weight_kg: 6 } },
        { id: 'i4', quantity: 22, product: { gas_type: 'Gani Gaz', weight_kg: 12 } }
      ]
    }
  ];
}
