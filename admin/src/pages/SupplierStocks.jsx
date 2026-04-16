import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api'; 
import { 
  HiOutlineCube, HiOutlineTruck, HiOutlineArrowPath, 
  HiOutlineExclamationTriangle, HiOutlineMapPin, 
  HiOutlineUserGroup, HiOutlineArchiveBoxArrowDown,
  HiOutlineCheckBadge
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function SupplierStocks() {
  const [distributors, setDistributors] = useState([]);
  const [restockRequests, setRestockRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState('GANI GAZ'); // Mocked for now

  useEffect(() => {
    loadSupplierData();
  }, []);

  const loadSupplierData = async () => {
    setLoading(true);
    try {
      // Logic would fetch data filtered by the authenticated supplier's ID
      // For now, mocking distributor stocks and restock requests
      setTimeout(() => {
        setDistributors([
          { id: 1, name: 'Dépôt Niamey 2000', stock_6kg: 45, stock_12kg: 12, status: 'Critique', address: 'Quartier Niamey 2000' },
          { id: 2, name: 'Gaz Centre Goudel', stock_6kg: 120, stock_12kg: 85, status: 'Optimal', address: 'Avenue de la Francophonie' },
          { id: 3, name: 'Point Vente Plateau', stock_6kg: 8, stock_12kg: 3, status: 'Rupture Proche', address: 'Plateau I' },
        ]);
        setRestockRequests([
          { id: 101, distributor: 'Point Vente Plateau', items: '20x 12kg, 50x 6kg', date: '2026-04-15 10:30', status: 'PENDING' },
          { id: 102, distributor: 'Dépôt Niamey 2000', items: '100x 12kg', date: '2026-04-14 16:45', status: 'SHIPPED' },
        ]);
        setLoading(false);
      }, 800);
    } catch (err) {
      toast.error('Erreur de synchronisation du réseau fournisseur');
      setLoading(false);
    }
  };

  const handleApproveRestock = (id) => {
    toast.success(`Expédition #${id} validée. Le stock sera mis à jour dès réception.`);
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in text-white">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
                  <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Supplier Portal</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Contrôle de Distribution</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Gestion des Stocks <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 font-outline-2">{supplierName}</span></h1>
         </div>
         <div className="flex gap-4">
            <button onClick={loadSupplierData} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-white active:scale-95 group">
                <HiOutlineArrowPath className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button className="bg-brand-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-500/20 active:scale-95 transition-all">
                Nouvelle Expédition
            </button>
         </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Points de Vente', value: distributors.length, icon: HiOutlineMapPin, color: 'brand' },
          { label: 'Volume Total (Bouteilles)', value: '1,420', icon: HiOutlineArchiveBoxArrowDown, color: 'blue' },
          { label: 'Demandes en Attente', value: restockRequests.filter(r => r.status === 'PENDING').length, icon: HiOutlineTruck, color: 'amber' },
          { label: 'Alertes Rupture', value: distributors.filter(d => d.status !== 'Optimal').length, icon: HiOutlineExclamationTriangle, color: 'red' },
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-900/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-3xl relative overflow-hidden group">
            <div className={`text-${kpi.color}-500 mb-4 transition-transform group-hover:scale-110 duration-500`}>
              <kpi.icon className="w-8 h-8" />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{kpi.value}</h3>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/5 rounded-full blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Restock Requests */}
        <div className="lg:col-span-1 space-y-6">
           <h3 className="text-xl font-black text-white px-4 tracking-tight flex items-center gap-2">
              <HiOutlineTruck className="text-amber-500" /> Ordres de Ravitaillement
           </h3>
           <div className="space-y-4">
              {restockRequests.map(req => (
                <div key={req.id} className="bg-gray-900/40 border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.03] transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <p className="text-sm font-black text-white">{req.distributor}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{req.date}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {req.status}
                      </span>
                   </div>
                   <p className="text-xs text-gray-400 font-medium mb-6 bg-black/40 p-4 rounded-2xl border border-white/5">{req.items}</p>
                   {req.status === 'PENDING' && (
                     <button onClick={() => handleApproveRestock(req.id)} className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-95">
                        Valider l'Expédition
                     </button>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Distributor Stock Map */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-black text-white px-4 tracking-tight flex items-center gap-2">
              <HiOutlineUserGroup className="text-brand-500" /> Réseau de Distribution Affilié
           </h3>
           <div className="bg-gray-900/40 border border-white/5 rounded-[40px] overflow-hidden">
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                         <th className="px-10 py-8">Dépôt / Point de Vente</th>
                         <th className="px-10 py-8 text-center">Stock 6kg</th>
                         <th className="px-10 py-8 text-center">Stock 12kg</th>
                         <th className="px-10 py-8 text-center">État Critique</th>
                         <th className="px-10 py-8 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.03]">
                      {distributors.map(dist => (
                        <tr key={dist.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="px-10 py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                                   <HiOutlineMapPin className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="font-black text-white text-base tracking-tight leading-none mb-1">{dist.name}</p>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{dist.address}</p>
                                </div>
                             </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <p className="text-xl font-black text-white mb-1">{dist.stock_6kg}</p>
                              <div className="w-16 h-1 mx-auto bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-brand-500" style={{ width: `${Math.min(dist.stock_6kg, 100)}%` }} />
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <p className="text-xl font-black text-white mb-1">{dist.stock_12kg}</p>
                              <div className="w-16 h-1 mx-auto bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-orange-500" style={{ width: `${Math.min(dist.stock_12kg, 100)}%` }} />
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                dist.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                dist.status === 'Critique' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {dist.status}
                              </span>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex justify-end">
                                 <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-500 hover:text-white rounded-xl transition-all">
                                    <HiOutlineTruck className="w-5 h-5" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
