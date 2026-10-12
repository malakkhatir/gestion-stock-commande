import { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, MagnifyingGlassIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const PER_PAGE = 8;
const money = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });
const labels = { en_attente: 'En attente', retiree: 'Validée', annulee: 'Annulée' };
const colors = {
  en_attente: 'bg-amber-50 text-amber-700',
  retiree: 'bg-emerald-50 text-emerald-700', annulee: 'bg-red-50 text-red-700',
};

const Commandes = () => {
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

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/commandes', { params: { page, per_page: PER_PAGE, search, statut } });
      setCommandes(data.data || []);
      setMeta({ current_page: data.current_page || 1, last_page: data.last_page || 1, total: data.total || 0, from: data.from || 0, to: data.to || 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les commandes.');
      setCommandes([]);
    } finally { setLoading(false); }
  }, [page, search, statut]);

  useEffect(() => { load(); }, [load]);

  const submitSearch = (event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); };
  const produitLabel = (commande) => {
    const lignes = commande.lignes || [];
    if (!lignes.length) return 'Produit supprimé';
    const premier = lignes[0]?.materiel?.nom || 'Article supprimé';
    return lignes.length > 1 ? `${premier} +${lignes.length - 1}` : premier;
  };
  const quantiteTotale = (commande) => (commande.lignes || []).reduce((sum, l) => sum + (l.quantite || 0), 0);
  const askConfirm = (commande, action) => setConfirmState({ commande, action });
  const runAction = async () => {
    if (!confirmState) return;
    const { commande, action } = confirmState;
    setConfirmState(null);
    setActionId(`${action}-${commande.id}`); setMessage(''); setError('');
    try {
      const { data } = await api.post(`/commandes/${commande.id}/${action}`);
      setMessage(data.message); await load();
    } catch (err) { setError(err.response?.data?.message || "L'action a échoué."); }
    finally { setActionId(null); }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-medium text-blue-600">Administration</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Gestion des commandes</h1><p className="mt-1 text-sm text-gray-500">Consultez, validez ou annulez les commandes.</p></div>
      <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualiser</button>
    </div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
    <form onSubmit={submitSearch} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
      <div className="relative flex-1"><MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="N° de commande, client ou produit" className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
      <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"><option value="">Tous les statuts</option><option value="en_attente">En attente</option><option value="retiree">Validée</option><option value="annulee">Annulée</option></select>
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Rechercher</button>
    </form>
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500">{meta.total} commande{meta.total !== 1 ? 's' : ''} trouvée{meta.total !== 1 ? 's' : ''}</div>
      <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Commande</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Produit</th><th className="px-5 py-3 text-center">Qté</th><th className="px-5 py-3 text-right">Montant TTC</th><th className="px-5 py-3 text-center">Statut</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan="7" className="px-5 py-12 text-center text-gray-400">Chargement…</td></tr> : commandes.length ? commandes.map((commande) => <tr key={commande.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-mono text-gray-600">#{commande.id}</td><td className="px-5 py-4 font-medium text-gray-800">{commande.client?.nom || commande.client_nom || 'Client non renseigné'}</td><td className="px-5 py-4 text-gray-600">{produitLabel(commande)}</td><td className="px-5 py-4 text-center text-gray-600">{quantiteTotale(commande)}</td><td className="px-5 py-4 text-right font-medium text-gray-800">{money.format(commande.prixTTC || 0)}</td><td className="px-5 py-4 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[commande.statut] || 'bg-gray-100 text-gray-700'}`}>{labels[commande.statut] || commande.statut}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{!['retiree', 'annulee'].includes(commande.statut) && (() => { const isValidating = actionId === `valider-${commande.id}`; const isCancelling = actionId === `annuler-${commande.id}`; const rowBusy = isValidating || isCancelling; return <><button disabled={rowBusy} onClick={() => askConfirm(commande, 'valider')} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white transition-all duration-150 active:scale-90 disabled:cursor-not-allowed ${isValidating ? 'bg-emerald-700 ring-2 ring-emerald-300 ring-offset-1' : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'}`}>{isValidating ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}{isValidating ? 'Validation…' : 'Valider'}</button><button disabled={rowBusy} onClick={() => askConfirm(commande, 'annuler')} className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-90 disabled:cursor-not-allowed ${isCancelling ? 'border-red-300 bg-red-100 text-red-800 ring-2 ring-red-300 ring-offset-1' : 'border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50'}`}>{isCancelling ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <NoSymbolIcon className="h-4 w-4" />}{isCancelling ? 'Annulation…' : 'Annuler'}</button></>; })()}</div></td></tr>) : <tr><td colSpan="7" className="px-5 py-12 text-center text-gray-400">Aucune commande ne correspond à votre recherche.</td></tr>}</tbody>
      </table></div>
    </section>
    {meta.last_page > 1 && <div className="flex items-center justify-between text-sm"><span className="text-gray-500">{meta.from}–{meta.to} sur {meta.total}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-50">Précédent</button><span className="px-3 py-2 text-gray-600">Page {meta.current_page} / {meta.last_page}</span><button disabled={page === meta.last_page} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-50">Suivant</button></div></div>}
    {confirmState && (() => {
      const isValider = confirmState.action === 'valider';
      const text = isValider ? 'valider cette commande et générer sa facture' : 'annuler cette commande et remettre le stock à jour';
      return <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4" onClick={() => setConfirmState(null)}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isValider ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {isValider ? <CheckCircleIcon className="h-6 w-6" /> : <NoSymbolIcon className="h-6 w-6" />}
          </div>
          <h3 className="mt-4 text-center text-base font-semibold text-gray-900">{isValider ? 'Valider la commande' : 'Annuler la commande'} #{confirmState.commande.id}</h3>
          <p className="mt-2 text-center text-sm text-gray-500">Voulez-vous {text} ?</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setConfirmState(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all active:scale-95 hover:bg-gray-50">Non</button>
            <button onClick={runAction} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all active:scale-95 ${isValider ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Oui, {isValider ? 'valider' : 'annuler'}</button>
          </div>
        </div>
      </div>;
    })()}
  </div>;
};

export default Commandes;
