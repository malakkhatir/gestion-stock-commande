import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowPathIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const emptyDashboard = {
  stats: {
    users: { current: 0, change: 0 },
    materiels: { current: 0, change: 0 },
    commandes: { current: 0, change: 0 },
    factures: { current: 0, change: 0 },
  },
  revenue: { total: 0, target: 300000, progress: 0, remaining: 300000, previous: 0 },
  recentOrders: [],
  stockAlerts: [],
};

const money = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  maximumFractionDigits: 0,
});

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/dashboard');
      // Accepte une collection Laravel simple ou une collection paginée (`data`).
      const recentOrders = Array.isArray(data.recentOrders)
        ? data.recentOrders
        : Array.isArray(data.recentOrders?.data)
          ? data.recentOrders.data
          : [];
      const stockAlerts = Array.isArray(data.stockAlerts)
        ? data.stockAlerts
        : Array.isArray(data.stockAlerts?.data)
          ? data.stockAlerts.data
          : [];

      setDashboard({
        ...emptyDashboard,
        ...data,
        recentOrders,
        stockAlerts,
        stats: { ...emptyDashboard.stats, ...(data.stats || {}) },
        revenue: { ...emptyDashboard.revenue, ...(data.revenue || {}) },
      });
    } catch (err) {
      console.error('Erreur de chargement du dashboard :', err);
      setError("Les données du tableau de bord n'ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const revenueChange = dashboard.revenue.previous === 0
    ? (dashboard.revenue.total > 0 ? 100 : 0)
    : Math.round(((dashboard.revenue.total - dashboard.revenue.previous) / dashboard.revenue.previous) * 100);
  // Protection aussi pour l'état conservé par Vite pendant un rechargement à chaud.
  const recentOrders = Array.isArray(dashboard.recentOrders)
    ? dashboard.recentOrders
    : Array.isArray(dashboard.recentOrders?.data)
      ? dashboard.recentOrders.data
      : [];
  const stockAlerts = Array.isArray(dashboard.stockAlerts)
    ? dashboard.stockAlerts
    : Array.isArray(dashboard.stockAlerts?.data)
      ? dashboard.stockAlerts.data
      : [];

  const cards = [
    { key: 'users', title: 'Utilisateurs', period: 'Ce mois', icon: UsersIcon, color: 'blue' },
    { key: 'materiels', title: 'Produits', period: 'Ce mois', icon: CubeIcon, color: 'violet' },
    { key: 'commandes', title: 'Commandes', period: 'Cette semaine', icon: ShoppingCartIcon, color: 'amber' },
    { key: 'factures', title: 'Factures', period: "Aujourd'hui", icon: DocumentTextIcon, color: 'rose' },
  ];

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500"><ArrowPathIcon className="mr-3 h-6 w-6 animate-spin" />Chargement des données…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Administration</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">Vue en temps réel de l’activité et du stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{user?.role || 'Administrateur'}</span>
          <button onClick={loadDashboard} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className="h-4 w-4" />Actualiser
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error} <button onClick={loadDashboard} className="ml-2 font-semibold underline">Réessayer</button></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, title, period, icon: Icon, color }) => {
          const stat = dashboard.stats[key];
          const positive = stat.change >= 0;
          return <div key={key} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg bg-${color}-50 p-3`}><Icon className={`h-6 w-6 text-${color}-600`} /></div>
              <span className="text-sm font-medium text-gray-500">{title}</span>
            </div>
            <p className="mt-5 text-3xl font-bold text-gray-900">{stat.current}</p>
            <p className={`mt-2 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{positive ? '↑' : '↓'} {Math.abs(stat.change)}% <span className="font-normal text-gray-400">vs période précédente</span></p>
            <p className="mt-1 text-xs text-gray-400">{period}</p>
          </div>;
        })}
      </div>

      

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-gray-900">Alertes de stock</h2></div><span className="text-sm text-gray-500">Stock de sécurité propre à chaque produit</span></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{stockAlerts.length ? stockAlerts.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4"><div><p className="font-medium text-gray-800">{item.nom}</p><p className="mt-1 text-xs text-red-600">{item.niveau === 'rupture' ? 'Rupture de stock' : 'Stock faible'} (seuil : {item.seuil})</p></div><span className="text-lg font-bold text-red-700">{item.stock}</span></div>) : <p className="py-4 text-sm text-emerald-700">✓ Aucun produit en stock faible.</p>}</div>
      </section>
    </div>
  );
};

export default AdminDashboard;
