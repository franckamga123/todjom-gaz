import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import {
  HiOutlineShoppingCart, HiOutlineBanknotes, HiOutlineCube,
  HiOutlineTruck, HiOutlineStar, HiOutlineExclamationTriangle,
  HiOutlineClock, HiOutlineArrowTrendingUp
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' CFA';

export default function Dashboard({ supplier }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, orderRes, statsRes, metricsRes] = await Promise.all([
        productAPI.getMyProducts().catch(() => ({ data: { products: [] } })),
        orderAPI.getOrders({ limit: 10 }).catch(() => ({ data: { orders: [], pagination: { total: 0 } } })),
        userAPI.getStats().catch(() => ({ data: getDemoStats() })),
        userAPI.getSalesMetrics().catch(() => ({ data: { salesByProduct: [] } }))
      ]);

      setProducts(prodRes.data?.products || []);
      setRecentOrders(orderRes.data?.orders || []);
      
      const s = statsRes.data;
      setStats({
        ...s,
        total_products: (prodRes.data?.products || []).length,
        low_stock: (prodRes.data?.products || []).filter(p => p.stock_quantity <= (p.min_stock_alert || 5)).length,
        salesMetrics: metricsRes.data?.salesByProduct || []
      });
    } catch {
      setStats(getDemoStats());
      setProducts(getDemoProducts());
      setRecentOrders(getDemoOrders());
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats || getDemoStats();

  const kpis = [
    { label: 'Commandes totales', value: s.total_orders, icon: HiOutlineShoppingCart, color: 'from-brand-500 to-brand-700' },
    { label: 'Chiffre d\'affaires', value: formatCFA(s.revenue), icon: HiOutlineBanknotes, color: 'from-emerald-500 to-emerald-700' },
    { label: 'En attente', value: s.pending, icon: HiOutlineClock, color: 'from-amber-500 to-amber-700' },
    { label: 'Livrées', value: s.delivered, icon: HiOutlineTruck, color: 'from-teal-500 to-teal-700' },
    { label: 'Produits actifs', value: s.total_products, icon: HiOutlineCube, color: 'from-purple-500 to-purple-700' },
    { label: 'Stock faible', value: s.low_stock, icon: HiOutlineExclamationTriangle, color: s.low_stock > 0 ? 'from-red-500 to-red-700' : 'from-gray-600 to-gray-700' },
    { label: 'Note moyenne', value: `${s.avg_rating} ⭐`, icon: HiOutlineStar, color: 'from-yellow-500 to-yellow-700' },
    { label: 'Commission Todjom', value: `${s.commission}%`, icon: HiOutlineArrowTrendingUp, color: 'from-cyan-500 to-cyan-700' },
  ];

  // Stock chart data
  const stockChartData = {
    labels: products.map(p => p.gas_type || `${p.weight_kg}kg`),
    datasets: [{
      label: 'Stock (unités)',
      data: products.map(p => p.stock_quantity || 0),
      backgroundColor: products.map(p => (p.stock_quantity || 0) <= (p.min_stock_alert || 5) ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.6)'),
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // Revenue by type
  const revenueByType = {
    labels: [...new Set(recentOrders.map(o => o.product?.gas_type || 'N/A'))],
    datasets: [{
      data: [...new Set(recentOrders.map(o => o.product?.gas_type || 'N/A'))].map(type =>
        recentOrders.filter(o => (o.product?.gas_type || 'N/A') === type)
          .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
      ),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
      borderWidth: 0
    }]
  };

  const statusLabels = {
    pending_payment: 'En attente', paid: 'Payée', accepted: 'Acceptée',
    assigned: 'Assignée', picked_up: 'Récupérée', in_delivery: 'En livraison',
    delivered: 'Livrée', cancelled: 'Annulée'
  };
  const statusColor = {
    pending_payment: 'badge-neutral', paid: 'badge-info', accepted: 'badge-info',
    assigned: 'badge-warning', in_delivery: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger'
  };

  return (
    <div className="space-y-8">
      {/* Header with quick stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Bonjour, {supplier?.company_name || 'Partenaire'}</h1>
          <p className="text-gray-400 text-sm">Voici l'état de votre réseau de distribution aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-400 bg-brand-500/5 px-3 py-1.5 rounded-lg border border-brand-500/10">
           <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
           Mise à jour en temps réel
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div 
            key={i} 
            className="group relative bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-5 rounded-[24px] hover:border-brand-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 animate-fade-in" 
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${k.color} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <div className="w-full h-full bg-gray-950/40 rounded-[14px] flex items-center justify-center">
                <k.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{k.label}</p>
              <h3 className="text-2xl font-black text-white">{k.value}</h3>
            </div>
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <k.icon className="w-12 h-12 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Primary Row: Analytics & Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[32px] p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
               <HiOutlineArrowTrendingUp className="text-brand-500" />
               Niveaux de stock au Niger
            </h3>
            <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">VOIR TOUT →</button>
          </div>
          <div className="h-64">
            <Bar data={stockChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#4b5563', font: { size: 10, weight: 'bold' } } },
                y: { grid: { color: 'rgba(75, 85, 99, 0.1)' }, ticks: { color: '#4b5563' }, beginAtZero: true }
              }
            }} />
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[32px] p-6 flex flex-col">
          <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-8">Part de Marché par Type</h3>
          <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
            <Doughnut data={revenueByType} options={{
              responsive: true, maintainAspectRatio: false,
              cutout: '75%',
              plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 20, font: { size: 10, weight: 'bold' } } } }
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-40px]">
               <span className="text-[10px] font-black text-gray-500 uppercase">Total CA</span>
               <span className="text-lg font-black text-white">{formatCFA(s.revenue).split(' ')[0]}K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">🕐 Commandes récentes</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune commande récente</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((o, i) => (
              <div key={o.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold">
                  {o.quantity || 1}x
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">{o.product?.gas_type || 'Gaz'} — {o.client?.full_name || 'Client'}</p>
                  <p className="text-xs text-gray-500">{o.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCFA(o.total_amount)}</p>
                  <span className={statusColor[o.status] || 'badge-neutral'}>{statusLabels[o.status] || o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getDemoStats() {
  return { total_orders: 1250, delivered: 1180, revenue: 7850000, pending: 12, total_products: 3, low_stock: 1, avg_rating: 4.5, commission: 5 };
}
function getDemoProducts() {
  return [
    { id: '1', gas_type: 'Bouteille 6 kg', weight_kg: 6, stock_quantity: 45, min_stock_alert: 5 },
    { id: '2', gas_type: 'Bouteille 12 kg', weight_kg: 12, stock_quantity: 3, min_stock_alert: 5 },
    { id: '3', gas_type: 'Bouteille 15 kg', weight_kg: 15, stock_quantity: 22, min_stock_alert: 5 },
  ];
}
function getDemoOrders() {
  return [
    { id: '1', order_number: 'TDG-20260413-1111', quantity: 2, product: { gas_type: 'Bouteille 6 kg' }, client: { full_name: 'Fatima Abdou' }, total_amount: 7000, status: 'paid' },
    { id: '2', order_number: 'TDG-20260413-2222', quantity: 1, product: { gas_type: 'Bouteille 12 kg' }, client: { full_name: 'Mariama Issoufou' }, total_amount: 6500, status: 'in_delivery' },
    { id: '3', order_number: 'TDG-20260412-3333', quantity: 1, product: { gas_type: 'Bouteille 15 kg' }, client: { full_name: 'Aïcha Boubacar' }, total_amount: 8500, status: 'delivered' },
  ];
}
