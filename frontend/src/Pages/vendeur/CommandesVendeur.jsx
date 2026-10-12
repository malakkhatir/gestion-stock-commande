import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PlusIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const PER_PAGE = 8;
const money = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });
const labels = { en_attente: 'En attente', retiree: 'Validée', annulee: 'Annulée' };
const colors = {
  en_attente: 'bg-amber-50 text-amber-700',
  retiree: 'bg-emerald-50 text-emerald-700',
  annulee: 'bg-red-50 text-red-700',
};

const CommandesVendeur = () => {
  const [commandes, setCommandes] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmState, setConfirmState] = useState(null);

  const [creating, setCreating] = useState(false);
  const [materiels, setMateriels] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({});
  const [lignes, setLignes] = useState([]);
  const [isNr, setIsNr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/commandes', { params: { page, per_page: PER_PAGE, search, statut } });
      setCommandes(data.data || []);
      setMeta({ current_page: data.current_page || 1, last_page: data.last_page || 1, total: data.total || 0, from: data.from || 0, to: data.to || 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger vos commandes.');
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statut]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateStatus = (commande, action) => {
    setConfirmState({ commande, action });
  };

  const runAction = async () => {
    if (!confirmState) return;
    const { commande, action } = confirmState;
    setConfirmState(null);
    setActionId(`${action}-${commande.id}`);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post(`/commandes/${commande.id}/${action}`);
      setMessage(data.message);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "L'action a échoué.");
    } finally {
      setActionId(null);
    }
  };

  const emptyLigne = () => ({ materiel_id: '', quantite: 1, prixHT: '', promo: false });

  const prixUnitaire = (materiel, promo) => {
    if (!materiel) return 0;
    if (promo && materiel.prixPromotionnel) return Number(materiel.prixPromotionnel);
    return Number(materiel.prixVente || 0);
  };

  const openCreate = async () => {
    setCreating(true);
    setFormError('');
    setIsNr(false);
    setForm({
      client_id: '',
      client_nom: '',
      dateCommande: new Date().toISOString().slice(0, 10),
    });
    setLignes([emptyLigne()]);
    try {
      const [materielsRes, clientsRes] = await Promise.all([
        api.get('/materiels'),
        api.get('/clients'),
      ]);
      setMateriels(Array.isArray(materielsRes.data) ? materielsRes.data : []);
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
    } catch (err) {
      setFormError("Impossible de charger les données nécessaires à la création.");
    }
  };

  const addLigne = () => setLignes((current) => [...current, emptyLigne()]);

  const removeLigne = (index) => setLignes((current) => current.filter((_, i) => i !== index));

  const updateLigneMateriel = (index, materielId) => {
    const materiel = materiels.find((m) => String(m.id) === String(materielId));
    setLignes((current) => current.map((ligne, i) => i === index ? {
      ...ligne,
      materiel_id: materielId,
      promo: false,
      prixHT: materiel ? (prixUnitaire(materiel, false) * Number(ligne.quantite || 1)).toFixed(2) : ligne.prixHT,
    } : ligne));
  };

  const updateLigneQuantite = (index, quantite) => {
    setLignes((current) => current.map((ligne, i) => {
      if (i !== index) return ligne;
      const materiel = materiels.find((m) => String(m.id) === String(ligne.materiel_id));
      return {
        ...ligne,
        quantite,
        prixHT: materiel ? (prixUnitaire(materiel, ligne.promo) * Number(quantite || 0)).toFixed(2) : ligne.prixHT,
      };
    }));
  };

  const toggleLignePromo = (index, promo) => {
    setLignes((current) => current.map((ligne, i) => {
      if (i !== index) return ligne;
      const materiel = materiels.find((m) => String(m.id) === String(ligne.materiel_id));
      return {
        ...ligne,
        promo,
        prixHT: materiel ? (prixUnitaire(materiel, promo) * Number(ligne.quantite || 0)).toFixed(2) : ligne.prixHT,
      };
    }));
  };

  const totalHT = useMemo(
    () => lignes.reduce((sum, ligne) => sum + Number(ligne.prixHT || 0), 0),
    [lignes]
  );

  const validateForm = () => {
    if (isNr) {
      if (!form.client_nom || !form.client_nom.trim()) {
        return 'Veuillez remplir le nom du client.';
      }
    } else if (!form.client_id) {
      return 'Veuillez sélectionner un client.';
    }
    for (const ligne of lignes) {
      if (!ligne.materiel_id) {
        return 'Veuillez sélectionner un article pour chaque ligne.';
      }
      if (!ligne.quantite || Number(ligne.quantite) < 1) {
        return 'Veuillez remplir la quantité pour chaque article.';
      }
      if (!ligne.prixHT || Number(ligne.prixHT) <= 0) {
        return 'Le prix HT est manquant pour un article, veuillez le resélectionner.';
      }
    }
    return '';
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setFormError('');
    const missingFieldError = validateForm();
    if (missingFieldError) {
      setFormError(missingFieldError);
      return;
    }
    setSaving(true);
    try {
      await api.post('/commandes', {
        client_id: isNr ? null : form.client_id || null,
        is_nr: isNr,
        client_nom: isNr ? form.client_nom : null,
        dateCommande: form.dateCommande,
        lignes: lignes.map((ligne) => ({
          materiel_id: ligne.materiel_id,
          quantite: Number(ligne.quantite),
          prixHT: Number(ligne.prixHT),
        })),
      });
      setCreating(false);
      setPage(1);
      setMessage('Commande créée avec succès.');
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'La création a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-500 p-3 text-white shadow-lg shadow-amber-200">
            <ShoppingCartIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600">Vendeur</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Mes commandes</h1>
            <p className="mt-1 text-sm text-gray-500">Créez de nouvelles ventes et suivez leur statut.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle commande
          </button>
          <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <form onSubmit={submitSearch} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="N° de commande, client ou produit"
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="retiree">Validée</option>
          <option value="annulee">Annulée</option>
        </select>
        <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">Rechercher</button>
      </form>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500">
          {meta.total} commande{meta.total !== 1 ? 's' : ''} trouvée{meta.total !== 1 ? 's' : ''}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Commande</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3 text-right">Montant TTC</th>
                <th className="px-5 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400">Chargement…</td></tr>
              ) : commandes.length ? commandes.map((commande) => (
                <tr key={commande.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-gray-600">#{commande.id}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{commande.client?.nom || commande.client_nom || 'Client non renseigné'}</td>
                  <td className="px-5 py-4 text-right font-medium text-gray-800">{money.format(commande.prixTTC || 0)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[commande.statut] || 'bg-gray-100 text-gray-700'}`}>
                      {labels[commande.statut] || commande.statut}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {commande.statut === 'en_attente' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={actionId === `valider-${commande.id}`}
                          onClick={() => updateStatus(commande, 'valider')}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Valider
                        </button>
                        <button
                          disabled={actionId === `annuler-${commande.id}`}
                          onClick={() => updateStatus(commande, 'annuler')}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <NoSymbolIcon className="h-4 w-4" />
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <span className="block text-center text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400">Aucune commande ne correspond à votre recherche.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{meta.from}–{meta.to} sur {meta.total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-50">Précédent</button>
            <span className="px-3 py-2 text-gray-600">Page {meta.current_page} / {meta.last_page}</span>
            <button disabled={page === meta.last_page} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-50">Suivant</button>
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={submitCreate} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle commande</h2>
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Articles *</span>
                <button
                  type="button"
                  onClick={addLigne}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                >
                  <PlusIcon className="h-4 w-4" />
                  Ajouter un article
                </button>
              </div>

              {lignes.map((ligne, index) => {
                const materiel = materiels.find((m) => String(m.id) === String(ligne.materiel_id));
                const hasPromo = Boolean(materiel?.prixPromotionnel);
                return (
                  <div key={index} className="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-gray-600">Article</span>
                      <select
                        required
                        value={ligne.materiel_id}
                        onChange={(e) => updateLigneMateriel(index, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">Sélectionner un article…</option>
                        {materiels.map((m) => (
                          <option key={m.id} value={m.id} disabled={m.quantiteDisponible === 0}>
                            {m.nom} — {Number(m.prixVente || 0).toLocaleString('fr-MA')} DH ({m.quantiteDisponible} dispo)
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-gray-600">Quantité</span>
                      <input
                        required
                        type="number"
                        min="1"
                        max={materiel?.quantiteDisponible || undefined}
                        value={ligne.quantite}
                        onChange={(e) => updateLigneQuantite(index, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-gray-600">Prix HT</span>
                      <input
                        disabled
                        type="text"
                        value={ligne.prixHT ? `${Number(ligne.prixHT).toLocaleString('fr-MA')} DH` : '—'}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={lignes.length === 1}
                      onClick={() => removeLigne(index)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Retirer cet article"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>

                    <label className={`sm:col-span-2 flex items-center gap-2 text-sm ${hasPromo ? 'text-gray-700' : 'text-gray-400'}`}>
                      <input
                        type="checkbox"
                        disabled={!hasPromo}
                        checked={ligne.promo}
                        onChange={(e) => toggleLignePromo(index, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 disabled:cursor-not-allowed"
                      />
                      Prix promotionnel
                      {hasPromo
                        ? ` (${Number(materiel.prixPromotionnel).toLocaleString('fr-MA')} DH / unité)`
                        : materiel ? ' (non disponible pour cet article)' : ''}
                    </label>
                  </div>
                );
              })}

              <div className="text-right text-sm text-gray-600">
                Total HT : <span className="font-semibold text-gray-900">{totalHT.toLocaleString('fr-MA')} DH</span>
              </div>
            </div>

            {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <button
                  type="button"
                  onClick={() => setIsNr(false)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${!isNr ? 'bg-amber-500 text-white' : 'text-gray-600'}`}
                >
                  Client enregistré
                </button>
                <button
                  type="button"
                  onClick={() => setIsNr(true)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${isNr ? 'bg-amber-500 text-white' : 'text-gray-600'}`}
                >
                  Client non enregistré
                </button>
              </div>

              {isNr ? (
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Nom du client *</span>
                  <input
                    required
                    value={form.client_nom}
                    onChange={(e) => setForm({ ...form, client_nom: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
                  />
                </label>
              ) : (
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Client *</span>
                  <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm">
                    <option value="">Sélectionner…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom} — {c.telephone}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

           <div>
  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
    <h3 className="mb-3 text-base font-semibold text-gray-800">
      Détails de la commande
    </h3>

    <div className="space-y-2 text-sm">
      {lignes.map((ligne, index) => {
        const materiel = materiels.find(
          (m) => String(m.id) === String(ligne.materiel_id)
        );

        return (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0"
          >
            <div>
              <p className="font-medium text-gray-800">
                {materiel?.nom || "Article non sélectionné"}
              </p>
              <p className="text-xs text-gray-500">
                Quantité : {ligne.quantite}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-800">
                {Number(ligne.prixHT || 0).toLocaleString("fr-MA")} DH
              </p>
            </div>
          </div>
        );
      })}

      <div className="mt-4 flex justify-between border-t border-gray-300 pt-3 text-base font-bold">
        <span>Total HT</span>
        <span>{totalHT.toLocaleString("fr-MA")} DH</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>TVA (20%)</span>
        <span>{(totalHT * 0.2).toLocaleString("fr-MA")} DH</span>
      </div>

      <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-bold text-amber-600">
        <span>Total TTC</span>
        <span>{(totalHT * 1.2).toLocaleString("fr-MA")} DH</span>
      </div>
    </div>
  </div>
</div>

            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setCreating(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button disabled={saving} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Création…' : 'Créer la commande'}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmState && (() => {
        const isValider = confirmState.action === 'valider';
        const text = isValider
          ? 'valider cette commande et générer sa facture'
          : 'annuler cette commande et remettre le stock à jour';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4"
            onClick={() => setConfirmState(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all"
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isValider ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {isValider ? <CheckCircleIcon className="h-6 w-6" /> : <NoSymbolIcon className="h-6 w-6" />}
              </div>
              <h3 className="mt-4 text-center text-base font-semibold text-gray-900">
                {isValider ? 'Valider la commande' : 'Annuler la commande'} #{confirmState.commande.id}
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500">Voulez-vous {text} ?</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmState(null)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all active:scale-95 hover:bg-gray-50"
                >
                  Non
                </button>
                <button
                  onClick={runAction}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all active:scale-95 ${isValider ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Oui, {isValider ? 'valider' : 'annuler'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CommandesVendeur;
