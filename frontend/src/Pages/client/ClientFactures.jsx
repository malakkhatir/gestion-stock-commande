import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const money = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });

const downloadPdf = async (facture) => {
  try {
    const response = await api.get(`/client/factures/${facture.id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${facture.reference}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Impossible de générer le PDF pour le moment.');
  }
};

const produitLabel = (commande) => {
  const lignes = commande?.lignes || [];
  if (!lignes.length) return '—';
  const premier = lignes[0]?.materiel?.nom || 'Article supprimé';
  return lignes.length > 1 ? `${premier} +${lignes.length - 1}` : premier;
};

const ClientFactures = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/client/factures')
      .then(res => setFactures(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger vos factures.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const montantTotal = factures.reduce((sum, f) => sum + Number(f.commande?.prixTTC || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
            <DocumentTextIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Espace client</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Mes factures</h1>
            <p className="mt-1 text-sm text-gray-500">Factures émises pour vos commandes validées.</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total factures</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{factures.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Montant cumulé</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{money.format(montantTotal)}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Référence</th>
                <th className="px-5 py-3 font-semibold">Produit</th>
                <th className="px-5 py-3 text-right font-semibold">Montant</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 text-center font-semibold">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-14 text-center text-gray-400">Chargement…</td></tr>
              ) : factures.length ? factures.map((f) => (
                <tr key={f.id} className="transition hover:bg-emerald-50/40">
                  <td className="px-5 py-4 font-mono font-semibold text-emerald-700">{f.reference}</td>
                  <td className="px-5 py-4 text-gray-700">{produitLabel(f.commande)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-900">{money.format(f.commande?.prixTTC || 0)}</td>
                  <td className="px-5 py-4 text-gray-600">{f.date_generation ? new Date(f.date_generation).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => downloadPdf(f)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Télécharger
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-5 py-14 text-center text-gray-400">Aucune facture pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ClientFactures;
