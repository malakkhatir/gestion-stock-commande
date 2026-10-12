import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, ChartBarIcon, CubeIcon, DocumentTextIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const money = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });

const VendeurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ventesMois: 0,
    ventesMoisChange: 0,
    commandesMois: 0,
    commandesMoisChange: 0,
    facturesMois: 0,
    stockFaible: 0,
    recentCommandes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [commandesRes, facturesRes, materielsRes] = await Promise.all([
          api.get('/commandes', { params: { per_page: 100 } }),
          api.get('/factures'),
          api.get('/materiels'),
        ]);

        const commandes = Array.isArray(commandesRes.data?.data) ? commandesRes.data.data : [];
        const factures = Array.isArray(facturesRes.data) ? facturesRes.data : [];
        const materiels = Array.isArray(materielsRes.data) ? materielsRes.data : [];

        const now = new Date();
        const moisActuel = now.getMonth();
        const anneeActuelle = now.getFullYear();
        const moisPrecedentDate = new Date(anneeActuelle, moisActuel - 1, 1);
        const moisPrecedent = moisPrecedentDate.getMonth();
        const anneeMoisPrecedent = moisPrecedentDate.getFullYear();

        const estMoisActuel = (dateStr) => {
          const d = new Date(dateStr);
          return d.getMonth() === moisActuel && d.getFullYear() === anneeActuelle;
        };
        const estMoisPrecedent = (dateStr) => {
          const d = new Date(dateStr);
          return d.getMonth() === moisPrecedent && d.getFullYear() === anneeMoisPrecedent;
        };
        const pctChange = (actuel, precedent) => {
          if (precedent === 0) return actuel > 0 ? 100 : 0;
          return Math.round(((actuel - precedent) / precedent) * 100);
        };

        const commandesMoisActuel = commandes.filter((c) => estMoisActuel(c.created_at));
        const commandesMoisPrecedent = commandes.filter((c) => estMoisPrecedent(c.created_at));

        const ventesMois = commandesMoisActuel.reduce((s, c) => s + Number(c.prixTTC || 0), 0);
        const ventesMoisPrecedent = commandesMoisPrecedent.reduce((s, c) => s + Number(c.prixTTC || 0), 0);

        const facturesMois = factures.filter((f) => estMoisActuel(f.date_generation)).length;
        const stockFaible = materiels.filter((m) => Number(m.quantiteDisponible) < Number(m.seuil_securite ?? 5)).length;

        const recentCommandes = commandes
          .slice()
          .sort((a, b) => new Date(b.dateCommande || b.created_at) - new Date(a.dateCommande || a.created_at))
          .slice(0, 5);

        setStats({
          ventesMois,
          ventesMoisChange: pctChange(ventesMois, ventesMoisPrecedent),
          commandesMois: commandesMoisActuel.length,
          commandesMoisChange: pctChange(commandesMoisActuel.length, commandesMoisPrecedent.length),
          facturesMois,
          stockFaible,
          recentCommandes,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500"><ArrowPathIcon className="mr-3 h-6 w-6 animate-spin" />Chargement du tableau de bord…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-amber-500 p-3 text-white shadow-lg shadow-amber-200">
          <ChartBarIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-600">Vendeur</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Bonjour {user?.name || ''}</h1>
          <p className="mt-1 text-sm text-gray-500">Voici un aperçu de votre activité.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Mes ventes du mois</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{money.format(stats.ventesMois)}</p>
          <p className={`mt-1 text-xs ${stats.ventesMoisChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.ventesMoisChange >= 0 ? '+' : ''}{stats.ventesMoisChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Mes commandes du mois</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.commandesMois}</p>
          <p className={`mt-1 text-xs ${stats.commandesMoisChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.commandesMoisChange >= 0 ? '+' : ''}{stats.commandesMoisChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Mes factures du mois</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.facturesMois}</p>
          <p className="mt-1 text-xs text-gray-400">documents générés</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Articles en stock faible</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.stockFaible}</p>
          <p className="mt-1 text-xs text-gray-400">sous le stock de sécurité</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Mes dernières commandes</h2>
            <button onClick={() => navigate('/vendeur/commandes')} className="text-sm font-medium text-amber-600 hover:text-amber-800">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  
                  <th className="px-5 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentCommandes.length ? stats.recentCommandes.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-gray-800">{c.client?.nom || c.client_nom || 'NR'}</td>
                   
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{money.format(c.prixTTC || 0)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Aucune commande pour le moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><ShoppingCartIcon className="h-5 w-5 text-amber-600" /><h2 className="font-semibold text-gray-900">Accès rapide</h2></div>
          <div className="mt-4 space-y-2">
            <button onClick={() => navigate('/vendeur/commandes')} className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 hover:bg-amber-50">
              <ShoppingCartIcon className="h-4 w-4 text-amber-600" /> Nouvelle commande
            </button>
            <button onClick={() => navigate('/vendeur/stock')} className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 hover:bg-amber-50">
              <CubeIcon className="h-4 w-4 text-amber-600" /> Consulter le stock
            </button>
            <button onClick={() => navigate('/vendeur/factures')} className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 hover:bg-amber-50">
              <DocumentTextIcon className="h-4 w-4 text-amber-600" /> Mes factures
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendeurDashboard;
