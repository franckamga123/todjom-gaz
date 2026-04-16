import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  HiOutlineChartBarSquare, HiOutlineArrowPath, HiOutlineExclamationTriangle,
  HiOutlineArrowDownTray, HiOutlineBuildingStorefront, HiOutlineCube,
  HiOutlineCalendarDays
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getReportStats(params || {});
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Erreur de chargement des rapports');
    }
    setLoading(false);
  };

  const applyFilter = () => {
    if (dateRange.from && dateRange.to) {
      loadStats(dateRange);
    } else {
      loadStats();
    }
  };

  const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const headers = Object.keys(data[0]);
    const flatData = data.map(row => {
      const flat = {};
      headers.forEach(h => {
        const val = row[h];
        flat[h] = typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
      });
      return flat;
    });
    const csvHeaders = Object.keys(flatData[0]).join(';');
    const csvRows = flatData.map(r => Object.values(r).join(';'));
    const csv = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-16 border-red-500/20">
        <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 font-medium mb-2">Erreur de chargement</p>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button onClick={() => loadStats()} className="btn-primary text-sm inline-flex items-center gap-2">
          <HiOutlineArrowPath className="w-4 h-4" /> Réessayer
        </button>
      </div>
    );
  }

  const months = stats?.performance_by_month || [];
  const suppliers = stats?.supplier_performance || [];
  const products = stats?.product_distribution || [];

  // Calculer les totaux globaux
  const totalRevenue = months.reduce((s, m) => s + parseFloat(m.revenue || 0), 0);
  const totalOrders = months.reduce((s, m) => s + parseInt(m.order_count || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <HiOutlineChartBarSquare className="text-brand-500 w-8 h-8" />
            Rapports & Analytics
          </h2>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble détaillée des performances de la plateforme.</p>
        </div>
        <button onClick={() => loadStats()} className="btn-secondary text-xs inline-flex items-center gap-2 self-start">
          <HiOutlineArrowPath className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card flex flex-wrap items-end gap-4">
        <HiOutlineCalendarDays className="w-5 h-5 text-gray-500" />
        <div>
          <label className="label text-xs">Du</label>
          <input type="date" className="input text-sm" value={dateRange.from}
            onChange={e => setDateRange({...dateRange, from: e.target.value})} />
        </div>
        <div>
          <label className="label text-xs">Au</label>
          <input type="date" className="input text-sm" value={dateRange.to}
            onChange={e => setDateRange({...dateRange, to: e.target.value})} />
        </div>
        <button onClick={applyFilter} className="btn-primary text-xs px-4 py-2">Filtrer</button>
        {(dateRange.from || dateRange.to) && (
          <button onClick={() => { setDateRange({ from: '', to: '' }); loadStats(); }}
            className="btn-secondary text-xs px-4 py-2">Réinitialiser</button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-black text-white">{formatCFA(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Chiffre d'affaires (CFA)</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-black text-brand-400">{totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Commandes livrées</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-black text-emerald-400">{suppliers.length}</p>
          <p className="text-xs text-gray-500 mt-1">Fournisseurs actifs</p>
        </div>
      </div>

      {/* Ventes par mois */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineChartBarSquare className="w-4 h-4" /> Performance Mensuelle
          </h3>
          <button onClick={() => exportCSV(months, 'ventes_mensuelles')}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <HiOutlineArrowDownTray className="w-4 h-4" /> Export CSV
          </button>
        </div>
        {months.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Aucune donnée de vente disponible.</p>
        ) : (
          <>
            {/* Visual bars */}
            <div className="space-y-3 mb-6">
              {months.map((m, i) => {
                const maxRev = Math.max(...months.map(x => parseFloat(x.revenue || 0)));
                const pct = maxRev > 0 ? (parseFloat(m.revenue || 0) / maxRev) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-20 shrink-0 font-mono">{m.month}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-orange-500 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 5)}%` }}>
                        <span className="text-[10px] font-bold text-white whitespace-nowrap">{formatCFA(m.revenue)} F</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{m.order_count} cmd</span>
                  </div>
                );
              })}
            </div>
            {/* Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Commandes</th>
                    <th>Chiffre d'affaires</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((m, i) => (
                    <tr key={i}>
                      <td className="font-mono text-gray-300">{m.month}</td>
                      <td className="text-brand-400 font-bold">{m.order_count}</td>
                      <td className="text-white font-semibold">{formatCFA(m.revenue)} F CFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Performance Fournisseurs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineBuildingStorefront className="w-4 h-4" /> Performance Fournisseurs
          </h3>
          <button onClick={() => exportCSV(suppliers.map(s => ({
            fournisseur: s.supplier?.company_name || '-',
            commandes: s.count,
            revenue: s.revenue,
            temps_moyen_min: Math.round(s.avg_delivery_time || 0)
          })), 'performance_fournisseurs')}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <HiOutlineArrowDownTray className="w-4 h-4" /> Export CSV
          </button>
        </div>
        {suppliers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Aucun fournisseur avec des livraisons.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fournisseur</th>
                  <th>Commandes</th>
                  <th>CA (CFA)</th>
                  <th>Temps moyen (min)</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s, i) => (
                  <tr key={i}>
                    <td className="font-medium text-white">{s.supplier?.company_name || '-'}</td>
                    <td className="text-brand-400 font-bold">{s.count}</td>
                    <td className="text-white font-semibold">{formatCFA(s.revenue)} F</td>
                    <td className="text-gray-400">{Math.round(s.avg_delivery_time || 0)} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Répartition par Produit */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineCube className="w-4 h-4" /> Répartition par Produit
          </h3>
          <button onClick={() => exportCSV(products.map(p => ({
            type: p.product?.gas_type || '-',
            poids_kg: p.product?.weight_kg || '-',
            vendus: p.sold_count,
            revenue: p.revenue
          })), 'repartition_produits')}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <HiOutlineArrowDownTray className="w-4 h-4" /> Export CSV
          </button>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Aucune donnée produit.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p, i) => {
              const totalSold = products.reduce((s, x) => s + parseInt(x.sold_count || 0), 0);
              const pct = totalSold > 0 ? Math.round((parseInt(p.sold_count || 0) / totalSold) * 100) : 0;
              return (
                <div key={i} className="card bg-gray-800/50 border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{p.product?.gas_type || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{p.product?.weight_kg || '?'} kg</p>
                    </div>
                    <span className="text-2xl font-black text-brand-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-orange-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{p.sold_count} vendus</span>
                    <span>{formatCFA(p.revenue)} F</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
