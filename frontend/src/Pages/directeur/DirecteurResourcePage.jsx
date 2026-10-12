import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const DirecteurResourcePage = ({
  title,
  description,
  endpoint,
  icon: Icon,
  columns,
  getSearchText,
  getMetrics,
  actions = [],
  normalize = (data) => data,
  onRowClick = null,
  reloadToken,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Références stables pour éviter les recréations
  const normalizeRef = useRef(normalize);
  const loadingRef = useRef(false);
  const endpointRef = useRef(endpoint);

  // Met à jour les refs si les props changent
  useEffect(() => {
    normalizeRef.current = normalize;
  }, [normalize]);

  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  // Fonction de chargement stable (pas de dépendances)
  const load = useCallback(async () => {
    if (loadingRef.current) return; // évite les appels simultanés
    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(endpointRef.current, { params: { per_page: 100 } });
      // Extraction robuste : si response.data.data existe, on le prend, sinon response.data
      const rawData = response.data?.data ?? response.data;
      const dataArray = Array.isArray(rawData) ? rawData : [];
      setItems(normalizeRef.current(dataArray));
    } catch (err) {
      setItems([]);
      setError(err.response?.data?.message || 'Impossible de charger les données.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // aucune dépendance → fonction stable

  // Chargement initial, et rechargement si endpoint change
  useEffect(() => {
    load();
  }, [load, endpoint]);

  // Rechargement déclenché par le parent (ex: après une action réussie)
  const isFirstReloadToken = useRef(true);
  useEffect(() => {
    if (isFirstReloadToken.current) {
      isFirstReloadToken.current = false;
      return;
    }
    load();
  }, [reloadToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rafraîchissement manuel
  const handleRefresh = useCallback(() => {
    load();
  }, [load]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? items.filter((item) =>
          getSearchText(item).toLocaleLowerCase().includes(query)
        )
      : items;
  }, [items, search, getSearchText]);

  const metrics = getMetrics ? getMetrics(items) : [];

  return (
    <div className="space-y-6">
      {/* ... le reste du JSX (identique à celui fourni précédemment) ... */}
      {/* Je le réécris rapidement pour être complet : */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-600">Directeur</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
              <p className="mt-1 text-xs text-gray-400">{metric.hint}</p>
            </div>
          ))}
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>
          <span className="text-sm text-gray-500">{filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                {columns.map((col) => (
                  <th key={col.label} className={`whitespace-nowrap px-5 py-3 font-semibold ${col.className || ''}`}>
                    {col.label}
                  </th>
                ))}
                {actions.length > 0 && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-5 py-14 text-center text-gray-400">
                    Chargement des données…
                  </td>
                </tr>
              ) : filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition hover:bg-indigo-50/40 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.label} className={`px-5 py-4 text-gray-600 ${col.className || ''}`}>
                        {col.render(item)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-5 py-4 text-right space-x-2">
                        {actions
                          .filter((action) => !action.show || action.show(item))
                          .map((action, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${action.className || 'text-indigo-700 hover:bg-indigo-50'}`}
                            title={action.label}
                          >
                            {action.icon && <action.icon className="h-4 w-4" />}
                            {action.label}
                          </button>
                        ))}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-5 py-14 text-center text-gray-400">
                    Aucune donnée à afficher.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DirecteurResourcePage;