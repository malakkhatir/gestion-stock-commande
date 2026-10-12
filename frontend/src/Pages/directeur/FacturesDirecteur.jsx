import { useState } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DirecteurResourcePage from './DirecteurResourcePage';
import api from '../../api/axios';

const FacturesDirecteur = () => {
  const [selected, setSelected] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const normalize = (data) =>
    data.map(item => ({
      ...item,
      commande_ref: item.commande ? `CMD-${item.commande.id}` : '—',
      client_nom: item.commande?.client?.nom || 'NR',
      montant: item.commande?.prixTTC || 0,
    }));

  const closeModal = () => {
    setSelected(null);
    setDownloadError('');
  };

  const downloadPdf = async (facture) => {
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await api.get(`/factures/${facture.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${facture.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError('Impossible de générer le PDF pour le moment.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <DirecteurResourcePage
        title="Factures générées"
        description="Suivi des factures et montants."
        endpoint="/factures"
        icon={DocumentTextIcon}
        normalize={normalize}
        getSearchText={(item) => `${item.reference} ${item.client_nom}`}
        getMetrics={(items) => [
          { label: 'Total factures', value: items.length, hint: 'documents générés' },
          {
            label: 'Montant total',
            value: `${items.reduce((s, i) => s + Number(i.montant || 0), 0).toLocaleString('fr-MA')} DH`,
            hint: 'cumulé',
          },
          {
            label: 'Ce mois',
            value: items.filter(i => new Date(i.created_at).getMonth() === new Date().getMonth()).length,
            hint: new Date().toLocaleString('fr', { month: 'long' }),
          },
        ]}
        columns={[
          { label: 'Référence', render: (item) => <span className="font-mono font-semibold text-indigo-700">{item.reference}</span> },
          { label: 'Commande', render: (item) => item.commande_ref },
          { label: 'Client', render: (item) => item.client_nom },
          {
            label: 'Montant',
            render: (item) => `${Number(item.montant || 0).toLocaleString('fr-MA')} DH`,
            className: 'text-right font-semibold'
          },
          {
            label: 'Date',
            render: (item) => item.date_generation ? new Date(item.date_generation).toLocaleDateString('fr-FR') : '—'
          },
        ]}
        actions={[
          {
            label: 'Voir',
            icon: EyeIcon,
            onClick: (item) => setSelected(item),
            className: 'text-indigo-700 hover:bg-indigo-50'
          }
        ]}
      />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Facture {selected.reference}</h2>
                  <p className="mt-1 text-sm text-gray-500">Détails du document généré.</p>
                </div>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Commande</dt>
                <dd className="font-semibold text-gray-900">{selected.commande_ref}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Client</dt>
                <dd className="font-semibold text-gray-900">{selected.client_nom}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Montant</dt>
                <dd className="font-semibold text-gray-900">{Number(selected.montant || 0).toLocaleString('fr-MA')} DH</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-gray-500">Date de génération</dt>
                <dd className="font-semibold text-gray-900">
                  {selected.date_generation ? new Date(selected.date_generation).toLocaleDateString('fr-FR') : '—'}
                </dd>
              </div>
            </dl>

            {downloadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{downloadError}</div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                Fermer
              </button>
              <button
                type="button"
                disabled={downloading}
                onClick={() => downloadPdf(selected)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                {downloading ? 'Téléchargement…' : 'Télécharger le PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacturesDirecteur;
