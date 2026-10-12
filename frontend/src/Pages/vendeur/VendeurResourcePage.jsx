import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const VendeurResourcePage = ({
  title,
  description,
  endpoint,
  icon: Icon,
  columns,
  getSearchText,
  getMetrics,
  actions = [],
  normalize = (data) => data,
  createFields = null,
  onCreated = null,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const normalizeRef = useRef(normalize);
  const loadingRef = useRef(false);
  const endpointRef = useRef(endpoint);

  useEffect(() => {
    normalizeRef.current = normalize;
  }, [normalize]);

  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(endpointRef.current);
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
  }, []);

  useEffect(() => {
    load();
  }, [load, endpoint]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query ? items.filter((item) => getSearchText(item).toLocaleLowerCase().includes(query)) : items;
  }, [items, search, getSearchText]);

  const metrics = getMetrics ? getMetrics(items) : [];

  const openCreate = () => {
    setForm(Object.fromEntries(createFields.map((field) => [field.name, field.defaultValue ?? ''])));
    setFormError('');
    setCreating(true);
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = onCreated ? onCreated(form) : form;
      await api.post(endpoint, payload);
      setCreating(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-500 p-3 text-white shadow-lg shadow-amber-200">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600">Vendeur</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {createFields && (
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </button>
          )}
          <button
            onClick={load}
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-50"
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
                  <tr key={item.id} className="transition hover:bg-amber-50/40">
                    {columns.map((col) => (
                      <td key={col.label} className={`px-5 py-4 text-gray-600 ${col.className || ''}`}>
                        {col.render(item)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-5 py-4 text-right space-x-2">
                        {actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => action.onClick(item)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${action.className || 'text-amber-700 hover:bg-amber-50'}`}
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

      {creating && createFields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={submitCreate} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Ajouter — {title}</h2>
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {createFields.map((field) => (
                <label key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {field.label}
                    {!field.optional && ' *'}
                  </span>
                  <input
                    required={!field.optional}
                    type={field.type || 'text'}
                    value={form[field.name] ?? ''}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
                  />
                </label>
              ))}
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setCreating(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button disabled={saving} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VendeurResourcePage;
