import { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const Alertes = () => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/stock/alertes');
      setAlertes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les alertes.');
      setAlertes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ruptures = alertes.filter((a) => Number(a.quantiteDisponible) === 0);
  const faibles = alertes.filter((a) => Number(a.quantiteDisponible) > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-teal-600 p-3 text-white shadow-lg shadow-teal-200">
            <ExclamationTriangleIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-600">Responsable Stock</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Alertes de stock</h1>
            <p className="mt-1 text-sm text-gray-500">Articles en rupture ou sous leur stock de sécurité.</p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">En rupture</p>
          <p className="mt-2 text-3xl font-bold text-red-800">{ruptures.length}</p>
          <p className="mt-1 text-xs text-red-500">quantité disponible = 0</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Stock faible</p>
          <p className="mt-2 text-3xl font-bold text-amber-800">{faibles.length}</p>
          <p className="mt-1 text-xs text-amber-500">sous le stock de sécurité</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500">
          {alertes.length} article{alertes.length !== 1 ? 's' : ''} à surveiller
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Référence</th>
                <th className="px-5 py-3 font-semibold">Article</th>
                <th className="px-5 py-3 text-center font-semibold">Quantité disponible</th>
                <th className="px-5 py-3 text-center font-semibold">Stock de sécurité</th>
                <th className="px-5 py-3 text-center font-semibold">Niveau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-gray-400">Chargement…</td>
                </tr>
              ) : alertes.length ? (
                alertes
                  .slice()
                  .sort((a, b) => Number(a.quantiteDisponible) - Number(b.quantiteDisponible))
                  .map((item) => (
                    <tr key={item.id} className="transition hover:bg-teal-50/40">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{item.reference}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{item.nom}</td>
                      <td className="px-5 py-4 text-center font-semibold text-gray-700">{item.quantiteDisponible}</td>
                      <td className="px-5 py-4 text-center text-gray-500">{item.seuil_securite}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            Number(item.quantiteDisponible) === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {Number(item.quantiteDisponible) === 0 ? 'Rupture' : 'Faible'}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-emerald-700">✓ Aucun article en stock faible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Alertes;
