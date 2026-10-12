import { useEffect, useState } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const DirecteurDashboard = () => {
  const [stats, setStats] = useState({
    ventesMois: 0,
    ventesMoisChange: 0,
    commandes: 0,
    commandesChange: 0,
    factures: 0,
    facturesChange: 0,
    produitsVendus: 0,
    produitsVendusChange: 0,
    evolutionVentes: [],
    topProduits: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commandesRes, facturesRes, materielsRes] = await Promise.all([
          api.get('/commandes'),
          api.get('/factures'),
          api.get('/materiels'),
        ]);

        // Fonction pour extraire un tableau quelle que soit la structure
        const extractArray = (response) => {
          const data = response?.data;
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.data?.data)) return data.data.data;
          return [];
        };

        const commandes = extractArray(commandesRes);
        const factures = extractArray(facturesRes);
        const materiels = extractArray(materielsRes);

        // Ventes du mois en cours vs mois précédent
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

        const commandesMoisActuel = commandes.filter(c => estMoisActuel(c.created_at));
        const commandesMoisPrecedent = commandes.filter(c => estMoisPrecedent(c.created_at));

        const ventesMois = commandesMoisActuel.reduce((sum, c) => sum + Number(c.prixTTC || 0), 0);
        const ventesMoisPrecedentTotal = commandesMoisPrecedent.reduce((sum, c) => sum + Number(c.prixTTC || 0), 0);

        const commandesMois = commandesMoisActuel.length;

        const facturesMois = factures.filter(f => estMoisActuel(f.created_at)).length;
        const facturesMoisPrecedent = factures.filter(f => estMoisPrecedent(f.created_at)).length;

        const quantiteCommande = (c) => (c.lignes || []).reduce((s, l) => s + Number(l.quantite || 0), 0);

        const produitsVendus = commandesMoisActuel.reduce((sum, c) => sum + quantiteCommande(c), 0);
        const produitsVendusPrecedent = commandesMoisPrecedent.reduce((sum, c) => sum + quantiteCommande(c), 0);

        // Évolution des ventes (6 derniers mois)
        const evolution = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const moisKey = d.toISOString().slice(0, 7);
          const total = commandes
            .filter(c => c.created_at?.startsWith(moisKey))
            .reduce((s, c) => s + Number(c.prixTTC || 0), 0);
          evolution.push({
            mois: d.toLocaleString('fr', { month: 'short' }),
            total,
          });
        }

        // Top 3 produits
        const produitCounts = {};
        commandes.forEach(c => {
          (c.lignes || []).forEach(l => {
            const nom = l.materiel?.nom || 'Produit inconnu';
            produitCounts[nom] = (produitCounts[nom] || 0) + Number(l.quantite || 0);
          });
        });
        const top = Object.entries(produitCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([nom, quantite]) => ({ nom, quantite }));

        setStats({
          ventesMois,
          ventesMoisChange: pctChange(ventesMois, ventesMoisPrecedentTotal),
          commandes: commandesMois,
          commandesChange: pctChange(commandesMois, commandesMoisPrecedent.length),
          factures: facturesMois,
          facturesChange: pctChange(facturesMois, facturesMoisPrecedent),
          produitsVendus,
          produitsVendusChange: pctChange(produitsVendus, produitsVendusPrecedent),
          evolutionVentes: evolution,
          topProduits: top,
        });
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Chargement du tableau de bord…</div>;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200">
          <ChartBarIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-600">Directeur</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Dashboard Directeur</h1>
          <p className="mt-1 text-sm text-gray-500">Vue globale des ventes et performances</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Ventes du mois</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.ventesMois.toLocaleString('fr-MA')} DH</p>
          <p className={`mt-1 text-xs ${stats.ventesMoisChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.ventesMoisChange >= 0 ? '+' : ''}{stats.ventesMoisChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Commandes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.commandes}</p>
          <p className={`mt-1 text-xs ${stats.commandesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.commandesChange >= 0 ? '+' : ''}{stats.commandesChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Factures</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.factures}</p>
          <p className={`mt-1 text-xs ${stats.facturesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.facturesChange >= 0 ? '+' : ''}{stats.facturesChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Produits vendus</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.produitsVendus}</p>
          <p className={`mt-1 text-xs ${stats.produitsVendusChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.produitsVendusChange >= 0 ? '+' : ''}{stats.produitsVendusChange}% vs mois dernier
          </p>
        </div>
      </div>

      {/* Graphique evolution */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Évolution des ventes</h2>
        <div className="mt-4 flex items-end gap-4 h-40">
          {stats.evolutionVentes.map((item, idx) => {
            const max = Math.max(...stats.evolutionVentes.map(i => i.total), 1);
            const height = (item.total / max) * 100;
            return (
              <div key={idx} className="flex-1 flex h-full flex-col items-center">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full bg-indigo-100 rounded-t-lg" style={{ height: `${height}%`, minHeight: '4px' }} />
                </div>
                <span className="mt-1 text-xs text-gray-500">{item.mois}</span>
                <span className="text-xs font-semibold">{item.total.toFixed(0)} DH</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top produits */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Top produits</h2>
        <div className="mt-4 space-y-2">
          {stats.topProduits.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-gray-100 py-2">
              <span className="font-medium text-gray-700">{idx+1}. {p.nom}</span>
              <span className="text-sm text-gray-500">{p.quantite} vendus</span>
            </div>
          ))}
          {stats.topProduits.length === 0 && <p className="text-gray-400">Aucune vente enregistrée.</p>}
        </div>
      </div>
    </div>
  );
};

export default DirecteurDashboard;