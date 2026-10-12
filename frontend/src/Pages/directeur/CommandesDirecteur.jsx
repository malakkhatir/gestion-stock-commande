import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, NoSymbolIcon, ShoppingBagIcon, CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import DirecteurResourcePage from './DirecteurResourcePage';
import api from '../../api/axios';

const statutStyles = {
  retiree: 'bg-green-100 text-green-700',
  en_attente: 'bg-yellow-100 text-yellow-700',
  annulee: 'bg-red-100 text-red-700',
};
const statutLabels = { retiree: 'Validée', en_attente: 'En attente', annulee: 'Annulée' };

const CommandesDirecteur = () => {
  const [selected, setSelected] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const normalize = (data) =>
    data.map(item => ({
      ...item,
      client_nom: item.client?.nom || item.client_nom || 'NR',
    }));

  const runAction = async () => {
    if (!confirmState) return;
    const { item, action } = confirmState;
    setActionLoading(true);
    try {
      await api.post(`/commandes/${item.id}/${action}`);
      setToast({
        type: 'success',
        message: action === 'valider' ? `Commande #${item.id} validée avec succès.` : `Commande #${item.id} annulée.`,
      });
      setConfirmState(null);
      setReloadToken((t) => t + 1);
    } catch (e) {
      setToast({
        type: 'error',
        message: action === 'valider' ? 'Erreur lors de la validation.' : "Erreur lors de l'annulation.",
      });
      setConfirmState(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <DirecteurResourcePage
      reloadToken={reloadToken}
      title="Suivi des commandes"
      description="Validation et suivi des commandes."
      endpoint="/commandes"
      icon={ShoppingBagIcon}
      normalize={normalize}
      getSearchText={(item) => `${item.id} ${item.client_nom}`}
      getMetrics={(items) => [
        { label: 'Total commandes', value: items.length, hint: 'enregistrées' },
        { label: 'En attente', value: items.filter(i => i.statut === 'en_attente').length, hint: 'à valider' },
        { label: 'Validées', value: items.filter(i => i.statut === 'retiree').length, hint: 'terminées' },
      ]}
      columns={[
        { label: 'Commande', render: (item) => `#${item.id}` },
        { label: 'Client', render: (item) => item.client_nom },
        { label: 'Montant', render: (item) => `${Number(item.prixTTC || 0).toLocaleString('fr-MA')} DH` },
        {
          label: 'Statut',
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statutStyles[item.statut] || 'bg-gray-100 text-gray-700'}`}>
              {statutLabels[item.statut] || item.statut}
            </span>
          )
        },
      ]}
      actions={[
        {
          label: 'Voir',
          icon: EyeIcon,
          onClick: (item) => setSelected(item),
          className: 'text-indigo-700 hover:bg-indigo-50'
        },
        {
          label: 'Valider',
          icon: CheckIcon,
          show: (item) => item.statut === 'en_attente',
          onClick: (item) => setConfirmState({ item, action: 'valider' }),
          className: 'text-green-700 hover:bg-green-50'
        },
        {
          label: 'Annuler',
          icon: XMarkIcon,
          show: (item) => item.statut === 'en_attente',
          onClick: (item) => setConfirmState({ item, action: 'annuler' }),
          className: 'text-red-700 hover:bg-red-50'
        },
      ]}
      />

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
                  <ShoppingBagIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Commande #{selected.id}</h2>
                  <p className="mt-1 text-sm text-gray-500">Détails de la commande.</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Client</dt>
                <dd className="font-semibold text-gray-900">{selected.client_nom}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Montant TTC</dt>
                <dd className="font-semibold text-gray-900">{Number(selected.prixTTC || 0).toLocaleString('fr-MA')} DH</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Statut</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statutStyles[selected.statut] || 'bg-gray-100 text-gray-700'}`}>
                    {statutLabels[selected.statut] || selected.statut}
                  </span>
                </dd>
              </div>
              {selected.vendeur?.name && (
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <dt className="text-gray-500">Vendeur</dt>
                  <dd className="font-semibold text-gray-900">{selected.vendeur.name}</dd>
                </div>
              )}
              {selected.created_at && (
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <dt className="text-gray-500">Date</dt>
                  <dd className="font-semibold text-gray-900">{new Date(selected.created_at).toLocaleDateString('fr-FR')}</dd>
                </div>
              )}
            </dl>

            {selected.lignes?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Articles</p>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                  {selected.lignes.map((ligne) => (
                    <li key={ligne.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-gray-700">{ligne.materiel?.nom || 'Article supprimé'}</span>
                      <span className="font-medium text-gray-500">×{ligne.quantite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmState && (() => {
        const isValider = confirmState.action === 'valider';
        const text = isValider
          ? 'valider cette commande et générer sa facture'
          : 'annuler cette commande et remettre le stock à jour';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onClick={() => !actionLoading && setConfirmState(null)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isValider ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {isValider ? <CheckCircleIcon className="h-6 w-6" /> : <NoSymbolIcon className="h-6 w-6" />}
              </div>
              <h3 className="mt-4 text-center text-base font-semibold text-gray-900">
                {isValider ? 'Valider la commande' : 'Annuler la commande'} #{confirmState.item.id}
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500">Voulez-vous {text} ?</p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setConfirmState(null)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Non
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={runAction}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${isValider ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {actionLoading ? 'Patientez…' : `Oui, ${isValider ? 'valider' : 'annuler'}`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="ml-1 rounded-md p-1 hover:bg-white/20">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CommandesDirecteur;