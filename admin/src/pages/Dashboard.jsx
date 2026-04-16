import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import {
  HiOutlineUsers, HiOutlineShoppingCart, HiOutlineBanknotes,
  HiOutlineTruck, HiOutlineClock, HiOutlineExclamationTriangle,
  HiOutlineBuildingStorefront, HiOutlineArrowTrendingUp, HiOutlineBolt, HiOutlineGlobeAlt
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' CFA';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erreur de chargement du dashboard');
    }
    setLoading(false);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Initialisation du Terminal...</p>
      </div>
    );
  }

  const d = data;

  const ordersChartData = {
    labels: (d.charts?.orders_per_day || []).map(i => i.date?.split('-').slice(1).join('/')),
    datasets: [{
      label: 'Volume',
      data: (d.charts?.orders_per_day || []).map(i => i.count),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249,115,22,0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#111827',
      pointBorderColor: '#f97316',
      pointBorderWidth: 2,
      borderWidth: 4
    }]
  };

  const gasChartData = {
    labels: (d.charts?.gas_by_type || []).map(g => `${g['product.weight_kg'] || g.weight_kg} kg`),
    datasets: [{
      data: (d.charts?.gas_by_type || []).map(g => g.count),
      backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#f43f5e'],
      borderWidth: 0,
      hoverOffset: 20
    }]
  };

  const stats = [
    { label: 'Flux Utilisateurs', value: d.overview?.total_users || 0, icon: HiOutlineUsers, color: 'blue' },
    { label: 'Volume/Jour', value: d.overview?.orders_today || 0, icon: HiOutlineShoppingCart, color: 'orange' },
    { label: 'Revenu Brut', value: formatCFA(d.financial?.total_revenue), icon: HiOutlineBanknotes, color: 'emerald' },
    { label: 'Commission Net', value: formatCFA(d.financial?.total_commission), icon: HiOutlineArrowTrendingUp, color: 'purple' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
                  <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Global Overview</span>
               </div>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Niger Hub</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Statistiques <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400 font-outline-2">Temps Réel</span></h1>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Connectivité</p>
               <p className="text-xs font-bold text-emerald-500">Node Cluster: Stable</p>
            </div>
            <button className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-white active:scale-95">
               <HiOutlineGlobeAlt className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* Critical Alerts Bar */}
      {d.recent_emergencies?.length > 0 && (
        <div className="animate-slide-in">
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl p-6 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/40 animate-pulse">
                <HiOutlineBolt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mb-1">Incident Prioritaire</h3>
                <p className="text-white font-black text-xl leading-tight">Emergency Protocol: {d.recent_emergencies[0].client?.full_name}</p>
                <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Zone: Niamey Centre • Localisation Active</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/emergencies')}
              className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white active:scale-95 whitespace-nowrap"
            >
              Intervenir Maintenant
            </button>
          </div>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="relative group overflow-hidden rounded-[32px] bg-gray-900/40 border border-white/5 p-8 transition-all hover:border-white/15 hover:shadow-2xl hover:shadow-black">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
               <s.icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
               <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center mb-6`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-500`} />
               </div>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
               <p className="text-2xl font-black text-white tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-900/40 border border-white/10 rounded-[40px] p-8 lg:p-10 relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Analyse du Flux</h3>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-500" /> Ventes</span>
                 <span className="flex items-center gap-2">Niamey/Maradi</span>
              </div>
            </div>
            <div className="h-80">
              <Line data={ordersChartData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false }, 
                  tooltip: { 
                    backgroundColor: '#0a0c10', titleColor: '#f97316', bodyColor: '#fff', 
                    borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 16, cornerRadius: 16,
                    titleFont: { size: 12, weight: 'bold' } 
                  } 
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#4b5563', font: { size: 10, weight: 'bold' } } },
                  y: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#4b5563', font: { size: 10 } }, beginAtZero: true }
                }
              }} />
            </div>
          </div>

          {/* Transactions Card */}
          <div className="bg-gray-900/40 border border-white/5 rounded-[40px] p-8 lg:p-10 backdrop-blur-3xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                 Mouvements Récents
              </h3>
              <button 
                onClick={() => navigate('/orders')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black text-brand-500 uppercase tracking-widest transition-all"
              >
                Explorer Tout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-gray-600 tracking-widest border-b border-white/5">
                    <th className="pb-6 pr-4">Identifiant</th>
                    <th className="pb-6 pr-4">Origine / Destination</th>
                    <th className="pb-6 pr-4">Statut</th>
                    <th className="pb-6 text-right">Montant Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {d.recent_orders?.map((o, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="py-6 font-black text-brand-500 text-sm tracking-tighter">#{o.order_number}</td>
                      <td className="py-6">
                        <p className="text-white font-bold text-sm">{o.client?.full_name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{o.supplier?.company_name}</p>
                      </td>
                      <td className="py-6">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                          ${o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                            o.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            'bg-brand-500/10 text-brand-500 border-brand-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]'}`}>
                          {o.status}
                        </div>
                      </td>
                      <td className="py-6 font-black text-right text-white text-sm">
                        {formatCFA(o.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          {/* Circular Stats */}
          <div className="bg-gray-900/40 border border-white/5 rounded-[40px] p-8 lg:p-10 relative overflow-hidden group">
            <h3 className="text-xs font-black text-white mb-10 uppercase tracking-[0.3em] flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                 Part de Marché
            </h3>
            <div className="h-64 flex items-center justify-center relative">
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-white tracking-tighter">{(d.charts?.gas_by_type || []).reduce((acc, current) => acc + current.count, 0)}</span>
                  <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">Total Gaz</span>
               </div>
              <Doughnut data={gasChartData} options={{
                responsive: true, maintainAspectRatio: false,
                cutout: '84%',
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#6b7280', padding: 25, font: { size: 9, weight: 'bold' }, boxWidth: 6, usePointStyle: true } }
                }
              }} />
            </div>
          </div>

          {/* Efficiency Card */}
          <div className="bg-brand-500 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-brand-500/20">
             <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:rotate-45 transition-transform duration-700">
                <HiOutlineBolt className="w-24 h-24" />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Taux d'Efficacité</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-6xl font-black tracking-tighter">{d.performance?.on_time_rate || 0}%</h4>
                   <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Delivered</span>
                </div>
                <div className="mt-10 pt-8 border-t border-white/10">
                   <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">Délai Moyen: <span className="font-black text-lg ml-2">{d.performance?.avg_delivery_time_minutes || 0}m</span></p>
                </div>
             </div>
          </div>

          {/* Quick Config Button */}
          <button 
             onClick={() => navigate('/settings')}
             className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[40px] flex items-center justify-between group transition-all"
           >
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-900 rounded-3xl flex items-center justify-center text-2xl shadow-xl group-hover:rotate-12 transition-transform">
                   ⚙️
                </div>
                <div className="text-left">
                   <p className="text-xs font-black text-white uppercase tracking-widest">Configuration</p>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Terminal System</p>
                </div>
             </div>
             <HiOutlineArrowTrendingUp className="text-brand-500 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
