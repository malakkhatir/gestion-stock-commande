import { useEffect, useState } from 'react';
import { ArrowPathIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const money = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });
const labels = { en_attente: 'En attente', retiree: 'Validée', annulee: 'Annulée' };
const colors = {
  en_attente: 'bg-amber-50 text-amber-700',
  retiree: 'bg-emerald-50 text-emerald-700',
  annulee: 'bg-red-50 text-red-700',
};

const ClientDashboard = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/client/commandes')
      .then(res => setCommandes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger vos commandes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const total = commandes.length;
  const enAttente = commandes.filter((c) => c.statut === 'en_attente').length;
  const validees = commandes.filter((c) => c.statut === 'retiree').length;
  const montantTotal = commandes.reduce((sum, c) => sum + Number(c.prixTTC || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
            <ShoppingBagIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Espace client</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Mes commandes</h1>
            <p className="mt-1 text-sm text-gray-500">Suivez l'état de vos commandes et réservations.</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total commandes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">En attente</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{enAttente}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Validées</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{validees}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Montant total</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{money.format(montantTotal)}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500">
          {total} commande{total !== 1 ? 's' : ''}
        </div>
        {loading ? (
          <div className="px-5 py-14 text-center text-gray-400">Chargement…</div>
        ) : commandes.length === 0 ? (
          <div className="px-5 py-14 text-center text-gray-400">Aucune commande pour le moment.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {commandes.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4 transition hover:bg-emerald-50/40">
                <div>
                  <p className="font-semibold text-gray-900">Commande #{c.id}</p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {(c.lignes || []).map((l) => l.materiel?.nom).filter(Boolean).join(', ') || 'Produit supprimé'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {c.dateCommande ? new Date(c.dateCommande).toLocaleDateString('fr-FR') : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{money.format(c.prixTTC || 0)}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[c.statut] || 'bg-gray-100 text-gray-700'}`}>
                    {labels[c.statut] || c.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientDashboard;
