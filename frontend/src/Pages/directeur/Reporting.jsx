import { useEffect, useState } from 'react';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const Reporting = () => {
  const [data, setData] = useState({
    ventesParMois: [],
    repartitionCategorie: [],
    caTotal: 0,
    caChange: 0,
    nbCommandes: 0,
    nbCommandesChange: 0,
    margeMoyenne: 0,
    margeChange: 0,
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

        // Fonction d'extraction
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
        const coutParMateriel = new Map(materiels.map(m => [m.id, Number(m.prixAchat || 0)]));

        const now = new Date();
        const anneeActuelle = now.getFullYear();
        const moisActuel = now.getMonth();
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
        const margeDe = (liste) => {
          const revenu = liste.reduce((s, c) => s + Number(c.prixHT || 0), 0);
          const cout = liste.reduce((s, c) => s + (c.lignes || []).reduce(
            (ls, l) => ls + (coutParMateriel.get(l.materiel_id) || 0) * Number(l.quantite || 0), 0
          ), 0);
          return revenu > 0 ? Math.round(((revenu - cout) / revenu) * 100) : 0;
        };

        // Ventes par mois (sur 12 mois de l'année en cours)
        const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const ventesParMois = mois.map((m, i) => {
          const total = commandes
            .filter(c => {
              const d = new Date(c.created_at);
              return d.getFullYear() === anneeActuelle && d.getMonth() === i;
            })
            .reduce((s, c) => s + Number(c.prixTTC || 0), 0);
          return { mois: m, total };
        });

        // Répartition par catégorie (type de matériel)
        const catCount = {};
        commandes.forEach(c => {
          (c.lignes || []).forEach(l => {
            const cat = l.materiel?.type?.libelle || 'Autre';
            catCount[cat] = (catCount[cat] || 0) + Number(l.quantite || 0);
          });
        });
        const totalQuantite = Object.values(catCount).reduce((a, b) => a + b, 0) || 1;
        const repartition = Object.entries(catCount)
          .map(([nom, quantite]) => ({
            nom,
            pourcentage: Math.round((quantite / totalQuantite) * 100),
          }))
          .sort((a, b) => b.pourcentage - a.pourcentage);

        // CA total (à partir des factures) + évolution réelle vs mois dernier
        const caTotal = factures.reduce((s, f) => s + Number(f.commande?.prixTTC || 0), 0);
        const caMoisActuel = commandes.filter(c => estMoisActuel(c.created_at)).reduce((s, c) => s + Number(c.prixTTC || 0), 0);
        const caMoisPrecedent = commandes.filter(c => estMoisPrecedent(c.created_at)).reduce((s, c) => s + Number(c.prixTTC || 0), 0);

        const nbCommandes = commandes.length;
        const commandesMoisActuel = commandes.filter(c => estMoisActuel(c.created_at));
        const commandesMoisPrecedent = commandes.filter(c => estMoisPrecedent(c.created_at));

        const margeMoyenne = margeDe(commandes);

        setData({
          ventesParMois,
          repartitionCategorie: repartition,
          caTotal,
          caChange: pctChange(caMoisActuel, caMoisPrecedent),
          nbCommandes,
          nbCommandesChange: pctChange(commandesMoisActuel.length, commandesMoisPrecedent.length),
          margeMoyenne,
          margeChange: margeMoyenne - margeDe(commandesMoisPrecedent),
        });
      } catch (error) {
        console.error('Erreur reporting:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Chargement du reporting…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200">
          <DocumentChartBarIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-600">Directeur</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Reporting des ventes</h1>
          <p className="mt-1 text-sm text-gray-500">Analyse des performances commerciales</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">CA total</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.caTotal.toLocaleString('fr-MA')} DH</p>
          <p className={`mt-1 text-xs ${data.caChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.caChange >= 0 ? '+' : ''}{data.caChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Commandes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.nbCommandes}</p>
          <p className={`mt-1 text-xs ${data.nbCommandesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.nbCommandesChange >= 0 ? '+' : ''}{data.nbCommandesChange}% vs mois dernier
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Marge moyenne</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.margeMoyenne}%</p>
          <p className={`mt-1 text-xs ${data.margeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.margeChange >= 0 ? '+' : ''}{data.margeChange} pts vs mois dernier
          </p>
        </div>
      </div>

      {/* Graphique ventes par mois */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Ventes par mois ({new Date().getFullYear()})</h2>
        <div className="mt-4 flex items-end gap-4 h-40">
          {data.ventesParMois.map((item, idx) => {
            const max = Math.max(...data.ventesParMois.map(i => i.total), 1);
            const height = (item.total / max) * 100;
            return (
              <div key={idx} className="flex-1 flex h-full flex-col items-center">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full bg-indigo-100 rounded-t-lg" style={{ height: `${height}%`, minHeight: '4px' }} />
                </div>
                <span className="mt-1 text-xs text-gray-500">{item.mois}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Répartition par catégorie */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Répartition des ventes par catégorie</h2>
        <div className="mt-4 space-y-2">
          {data.repartitionCategorie.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium text-gray-700">{cat.nom}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${cat.pourcentage}%` }} />
              </div>
              <span className="text-sm text-gray-500">{cat.pourcentage}%</span>
            </div>
          ))}
          {data.repartitionCategorie.length === 0 && <p className="text-gray-400">Aucune donnée.</p>}
        </div>
      </div>
    </div>
  );
};

export default Reporting;