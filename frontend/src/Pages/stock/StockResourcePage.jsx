import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const StockResourcePage = forwardRef(
  (
    {
      title,
      description,
      endpoint,
      icon: Icon,
      columns,
      getSearchText,
      getMetrics,
      canDelete = false,
      canCreate = true,
      fields = [],
      normalize = (data) => data,
      fetchOptions = null,
    },
    ref
  ) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [confirmItem, setConfirmItem] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState({});

    useEffect(() => {
      if (fetchOptions) {
        fetchOptions()
          .then((opts) => setDynamicOptions(opts))
          .catch((err) => console.error('Erreur chargement options:', err));
      }
    }, [fetchOptions]);

    const load = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(endpoint);
        const rawData = Array.isArray(data) ? data : data?.data ?? [];
        setItems(normalize(Array.isArray(rawData) ? rawData : []));
      } catch (err) {
        setItems([]);
        setError(err.response?.data?.message || `Impossible de charger les données ${title.toLowerCase()}.`);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, title]);

    useImperativeHandle(ref, () => ({ reload: load }));

    useEffect(() => {
      load();
    }, [load]);

    const filteredItems = useMemo(() => {
      const query = search.trim().toLocaleLowerCase();
      return query ? items.filter((item) => getSearchText(item).toLocaleLowerCase().includes(query)) : items;
    }, [items, search, getSearchText]);

    const metrics = getMetrics ? getMetrics(items) : [];

    const askDelete = (item) => {
      setDeleteError('');
      setConfirmItem(item);
    };

    const confirmDelete = async () => {
      if (!confirmItem) return;
      setDeletingId(confirmItem.id);
      setDeleteError('');
      try {
        await api.delete(`${endpoint}/${confirmItem.id}`);
        setItems((current) => current.filter((entry) => entry.id !== confirmItem.id));
        setConfirmItem(null);
      } catch (err) {
        setDeleteError(err.response?.data?.message || 'Suppression impossible.');
      } finally {
        setDeletingId(null);
      }
    };

    const openForm = (item = null) => {
      if (item) {
        setEditing(item);
        setForm(Object.fromEntries(fields.map((field) => [field.name, item[field.name] ?? ''])));
      } else {
        setEditing({});
        setForm(Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ''])));
      }
      setFormError('');
    };

    const submit = async (event) => {
      event.preventDefault();
      setSaving(true);
      setFormError('');
      const payload = Object.fromEntries(
        Object.entries(form).filter(([key, value]) => value !== '' || !fields.find((field) => field.name === key)?.optional)
      );
      try {
        if (editing.id) {
          await api.put(`${endpoint}/${editing.id}`, payload);
        } else {
          await api.post(endpoint, payload);
        }
        setEditing(null);
        await load();
      } catch (err) {
        setFormError(err.response?.data?.message || 'Enregistrement impossible.');
      } finally {
        setSaving(false);
      }
    };

    const getFieldOptions = (field) => dynamicOptions[field.name] || field.options || [];

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-teal-600 p-3 text-white shadow-lg shadow-teal-200">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-teal-600">Responsable Stock</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canCreate && (
              <button
                onClick={() => openForm()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-50"
              />
            </div>
            <span className="text-sm text-gray-500">
              {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {columns.map((column) => (
                    <th key={column.label} className={`whitespace-nowrap px-5 py-3 font-semibold ${column.className || ''}`}>
                      {column.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-5 py-14 text-center text-gray-400">
                      Chargement des données…
                    </td>
                  </tr>
                ) : filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="transition hover:bg-teal-50/40">
                      {columns.map((column) => (
                        <td key={column.label} className={`px-5 py-4 text-gray-600 ${column.className || ''}`}>
                          {column.render(item)}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openForm(item)}
                          className="mr-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Modifier
                        </button>
                        {canDelete && (
                          <button
                            disabled={deletingId !== null}
                            onClick={() => askDelete(item)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-5 py-14 text-center text-gray-400">
                      Aucune donnée à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {editing !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editing?.id ? 'Modifier' : 'Ajouter'} — {title}
                  </h2>
                  <p className="text-sm text-gray-500">Les champs marqués * sont obligatoires.</p>
                </div>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {formError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
              )}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fields.map((field) => {
                  const options = getFieldOptions(field);
                  return (
                    <label key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
                        {field.label}
                        {!field.optional && ' *'}
                      </span>
                      {field.type === 'select' || options.length > 0 ? (
                        <select
                          required={!field.optional}
                          value={form[field.name] ?? ''}
                          onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm"
                        >
                          <option value="">Sélectionner…</option>
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          required={!field.optional}
                          type={field.type || 'text'}
                          step={field.type === 'number' ? 'any' : undefined}
                          value={form[field.name] ?? ''}
                          onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="mt-7 flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                  Annuler
                </button>
                <button disabled={saving} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {confirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-red-50 p-3 text-red-600">
                  <TrashIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Supprimer cet article ?</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    « {confirmItem.nom || confirmItem.reference || confirmItem.code} » sera définitivement supprimé. Cette action est irréversible.
                  </p>
                </div>
              </div>
              {deleteError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={() => setConfirmItem(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={confirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId !== null ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default StockResourcePage;
