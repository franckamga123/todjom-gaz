import { HiOutlineFunnel, HiOutlineCalendar, HiOutlineArrowDownTray, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

const statusLabels = {
  delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée', failed: 'Échouée'
};
const statusColor = {
  delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-neutral', failed: 'badge-danger'
};

export default function History() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('delivered');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ count: 0, revenue: 0, commission: 0, supplierAmount: 0 });

  useEffect(() => { loadHistory(); }, [page, filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrders({ page, limit: 15, status: filter || undefined });
      const list = res.data?.orders || [];
      setOrders(list);
      setTotal(res.data?.pagination?.total || 0);

      const rev = list.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
      const com = list.reduce((s, o) => s + (parseFloat(o.commission_amount) || 0), 0);
      setSummary({ count: list.length, revenue: rev, commission: com, supplierAmount: rev - com });
    } catch {
      const demo = getDemoHistory();
      setOrders(demo);
      setTotal(demo.length);
      setSummary({ count: demo.length, revenue: 56000, commission: 2800, supplierAmount: 53200 });
    }
    setLoading(false);
  };

  const generateInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(order.created_at).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const html = `
      <html>
        <head>
          <title>Facture ${order.order_number}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #ef4444; }
            .invoice-title { font-size: 24px; color: #666; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info-block h3 { margin-top: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; background: #f8f8f8; padding: 12px; border-bottom: 1px solid #eee; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .totals { float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.grand-total { border-top: 2px solid #ef4444; margin-top: 10px; padding-top: 15px; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 100px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TODJOM GAZ</div>
            <div class="invoice-title">FACTURE</div>
          </div>
          
          <div class="details">
            <div class="info-block">
              <h3>Fournisseur</h3>
              <strong>NIGER GAZ</strong><br>
              Zone Industrielle, Niamey<br>
              Niger
            </div>
            <div class="info-block" style="text-align: right;">
              <h3>Détails Facture</h3>
              N°: ${order.order_number}<br>
              Date: ${dateStr}<br>
              Statut: ${statusLabels[order.status] || order.status}
            </div>
          </div>

          <div class="info-block" style="margin-bottom: 30px;">
            <h3>Client</h3>
            <strong>${order.client?.full_name || 'Client Passager'}</strong><br>
            ${order.delivery_address || 'Livraison à domicile'}<br>
            Tél: ${order.client?.phone || '-'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix Unitaire</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Recharge Gaz - ${order.product?.gas_type || 'Bouteille Standard'}</td>
                <td style="text-align: center;">${order.quantity}</td>
                <td style="text-align: right;">${formatCFA(order.total_amount / order.quantity)} CFA</td>
                <td style="text-align: right;">${formatCFA(order.total_amount)} CFA</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Sous-total</span>
              <span>${formatCFA(order.total_amount)} CFA</span>
            </div>
            <div class="total-row">
              <span>TVA (0%)</span>
              <span>0 CFA</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL</span>
              <span>${formatCFA(order.total_amount)} CFA</span>
            </div>
          </div>

          <div style="clear: both;"></div>

          <div class="footer">
            Merci de votre confiance. Document généré automatiquement par TODJOM GAZ.<br>
            Niger Gaz - RC 123456 - NIF 987654321
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };


  const exportToCSV = () => {
    if (orders.length === 0) return toast.error('Aucune donnée à exporter');
    
    const headers = ['N° Commande', 'Client', 'Produit', 'Quantité', 'Total (CFA)', 'Commission', 'Net', 'Date', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...orders.map(o => [
        o.order_number,
        `"${o.client?.full_name || ''}"`,
        `"${o.product?.gas_type || ''}"`,
        o.quantity,
        o.total_amount,
        o.commission_amount,
        o.supplier_amount,
        new Date(o.created_at).toLocaleDateString('fr-FR'),
        o.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Historique_Ventes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV réussi !');
  };

  const formatCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Commandes affichées</p>
          <p className="text-2xl font-bold text-white">{summary.count}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Chiffre d'affaires</p>
          <p className="text-2xl font-bold text-brand-400">{formatCFA(summary.revenue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Commission Todjom</p>
          <p className="text-2xl font-bold text-amber-400">- {formatCFA(summary.commission)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Votre part nette</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCFA(summary.supplierAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <HiOutlineFunnel className="w-4 h-4 text-gray-500" />
          {['delivered', 'cancelled', 'refunded', ''].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}>
              {s ? statusLabels[s] || s : 'Toutes'}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700" onClick={exportToCSV}>
          <HiOutlineArrowDownTray className="w-3.5 h-3.5" /> Exporter CSV
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Produit</th>
              <th>Qté</th>
              <th>Total</th>
              <th>Commission</th>
              <th>Net</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="text-center py-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-8 text-gray-500">Aucune vente trouvée</td></tr>
            ) : orders.map((o, i) => (
              <tr key={o.id || i} className="animate-fade-in">
                <td className="font-mono text-brand-400 text-xs">{o.order_number}</td>
                <td className="text-gray-300 text-sm">{o.client?.full_name || '-'}</td>
                <td className="text-gray-400 text-xs">{o.product?.gas_type || '-'}</td>
                <td className="text-gray-300">{o.quantity || 1}</td>
                <td className="font-semibold text-white">{formatCFA(o.total_amount)}</td>
                <td className="text-amber-400 text-xs">-{formatCFA(o.commission_amount)}</td>
                <td className="font-semibold text-emerald-400">{formatCFA(o.supplier_amount)}</td>
                <td><span className={statusColor[o.status] || 'badge-neutral'}>{statusLabels[o.status] || o.status}</span></td>
                <td className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  <button onClick={() => generateInvoice(o)} className="p-2 text-gray-400 hover:text-brand-400 transition-colors" title="Télécharger Facture">
                    <HiOutlineDocumentText className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{total} entrée(s)</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 disabled:opacity-50">← Préc.</button>
            <span className="px-3 py-1.5 text-xs text-gray-400">{page}/{totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 disabled:opacity-50">Suiv. →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function getDemoHistory() {
  return [
    { id: '1', order_number: 'TDG-20260413-1111', quantity: 2, product: { gas_type: 'Bouteille 6 kg' }, client: { full_name: 'Fatima Abdou' }, total_amount: 7000, commission_amount: 350, supplier_amount: 6650, status: 'delivered', created_at: '2026-04-13T08:30:00' },
    { id: '2', order_number: 'TDG-20260412-2222', quantity: 1, product: { gas_type: 'Bouteille 12 kg' }, client: { full_name: 'Mariama Issoufou' }, total_amount: 6500, commission_amount: 325, supplier_amount: 6175, status: 'delivered', created_at: '2026-04-12T14:00:00' },
    { id: '3', order_number: 'TDG-20260412-3333', quantity: 1, product: { gas_type: 'Bouteille 15 kg' }, client: { full_name: 'Aïcha Boubacar' }, total_amount: 8500, commission_amount: 425, supplier_amount: 8075, status: 'delivered', created_at: '2026-04-12T10:00:00' },
    { id: '4', order_number: 'TDG-20260411-4444', quantity: 3, product: { gas_type: 'Bouteille 6 kg' }, client: { full_name: 'Ibrahim Moussa' }, total_amount: 10500, commission_amount: 525, supplier_amount: 9975, status: 'delivered', created_at: '2026-04-11T16:00:00' },
    { id: '5', order_number: 'TDG-20260411-5555', quantity: 1, product: { gas_type: 'Bouteille 12 kg' }, client: { full_name: 'Hassia Adamou' }, total_amount: 6500, commission_amount: 325, supplier_amount: 6175, status: 'cancelled', created_at: '2026-04-11T09:00:00' },
    { id: '6', order_number: 'TDG-20260410-6666', quantity: 2, product: { gas_type: 'Bouteille 15 kg' }, client: { full_name: 'Ramatou Seydou' }, total_amount: 17000, commission_amount: 850, supplier_amount: 16150, status: 'delivered', created_at: '2026-04-10T11:00:00' },
  ];
}
