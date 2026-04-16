import { useState, useEffect } from 'react';
import { supplierAPI, adminAPI } from '../services/api';
import { HiOutlineCheck, HiOutlineStar, HiOutlineShoppingBag, HiOutlinePhone } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      const res = await supplierAPI.getSuppliers();
      setSuppliers(res.data?.suppliers || []);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du chargement des fournisseurs');
      setSuppliers([]);
    }
    setLoading(false);
  };

  const validateSupplier = async (id) => {
    try {
      await adminAPI.validateSupplier(id);
      toast.success('Fournisseur validé !');
      loadSuppliers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suppliers.map((s, i) => (
          <div key={s.id || i} className="card-hover animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {s.company_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{s.company_name}</h3>
                <p className="text-xs text-gray-400 truncate">{s.registration_number}</p>
              </div>
              <span className={s.is_validated ? 'badge-success' : 'badge-warning'}>
                {s.is_validated ? 'Validé' : 'En attente'}
              </span>
            </div>

            {/* Description */}
            {s.description && (
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{s.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                <HiOutlineStar className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{s.avg_rating || '-'}</p>
                <p className="text-[10px] text-gray-500">Note</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                <HiOutlineShoppingBag className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{s.total_orders || 0}</p>
                <p className="text-[10px] text-gray-500">Commandes</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                <HiOutlinePhone className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{s.commission_rate}%</p>
                <p className="text-[10px] text-gray-500">Commission</p>
              </div>
            </div>

            {/* Contact */}
            <div className="text-xs text-gray-500 mb-3 space-y-1">
              <p>📱 {s.mobile_money_number || s.user?.phone || '-'}</p>
              <p>📧 {s.user?.email || '-'}</p>
            </div>

            {/* Actions */}
            {!s.is_validated && (
              <button onClick={() => validateSupplier(s.id)} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                <HiOutlineCheck className="w-4 h-4" /> Valider ce fournisseur
              </button>
            )}
          </div>
        ))}
      </div>

      {!loading && suppliers.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">Aucun fournisseur enregistré</p>
        </div>
      )}
    </div>
  );
}


