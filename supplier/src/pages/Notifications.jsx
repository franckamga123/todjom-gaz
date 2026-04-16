import { useState, useEffect } from 'react';
import { notifAPI } from '../services/api';
import {
  HiOutlineBell, HiOutlineShoppingCart, HiOutlineTruck,
  HiOutlineExclamationTriangle, HiOutlineCheckCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const typeIcons = {
  order: HiOutlineShoppingCart,
  delivery: HiOutlineTruck,
  alert: HiOutlineExclamationTriangle,
  system: HiOutlineBell,
};
const typeColors = {
  order: 'text-brand-400 bg-brand-500/10',
  delivery: 'text-emerald-400 bg-emerald-500/10',
  alert: 'text-amber-400 bg-amber-500/10',
  system: 'text-gray-400 bg-gray-500/10',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notifAPI.getNotifications();
      setNotifications(res.data?.notifications || []);
    } catch {
      setNotifications(getDemoNotifications());
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await notifAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notifAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getType = (n) => {
    if (n.title?.toLowerCase().includes('commande')) return 'order';
    if (n.title?.toLowerCase().includes('livr')) return 'delivery';
    if (n.title?.toLowerCase().includes('alerte') || n.title?.toLowerCase().includes('stock')) return 'alert';
    return 'system';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes les notifications sont lues'} — {notifications.length} total
        </p>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
            <HiOutlineCheckCircle className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <HiOutlineBell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const type = getType(n);
            const Icon = typeIcons[type] || HiOutlineBell;
            return (
              <div
                key={n.id || i}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`card flex items-start gap-4 cursor-pointer animate-slide-in ${
                  !n.is_read ? 'border-brand-500/20 bg-brand-500/[0.02]' : 'opacity-70'
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-semibold ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{n.body}</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {new Date(n.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getDemoNotifications() {
  return [
    { id: '1', title: '🔔 Nouvelle commande reçue', body: 'Fatima Abdou a commandé 2x Bouteille 6 kg. Total: 7 000 CFA. Acceptez la commande.', is_read: false, created_at: '2026-04-13T10:30:00' },
    { id: '2', title: '⚠ Alerte stock critique', body: 'Le stock de Bouteille 12 kg est descendu à 3 unités. Seuil d\'alerte: 5.', is_read: false, created_at: '2026-04-13T09:00:00' },
    { id: '3', title: '✅ Livraison confirmée', body: 'La commande TDG-20260413-3333 a été livrée avec succès par Moussa Ibrahim.', is_read: false, created_at: '2026-04-13T08:45:00' },
    { id: '4', title: '🔔 Nouvelle commande reçue', body: 'Hassia Adamou a commandé 1x Bouteille 12 kg. Total: 6 500 CFA.', is_read: true, created_at: '2026-04-12T15:30:00' },
    { id: '5', title: '💰 Paiement reçu', body: 'Vous avez reçu 6 650 CFA (net) pour la commande TDG-20260412-2222.', is_read: true, created_at: '2026-04-12T14:00:00' },
    { id: '6', title: '📦 Commande annulée', body: 'La commande TDG-20260411-5555 a été annulée par le client. Aucun frais appliqué.', is_read: true, created_at: '2026-04-11T09:30:00' },
    { id: '7', title: '🔧 Maintenance système', body: 'TODJOM GAZ sera en maintenance le 15 avril de 02h à 04h. Impact: aucune interruption de service.', is_read: true, created_at: '2026-04-10T08:00:00' },
  ];
}
