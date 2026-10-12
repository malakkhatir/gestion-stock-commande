import { useState } from 'react';
import { CubeIcon, EyeIcon, MapPinIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DirecteurResourcePage from './DirecteurResourcePage';

const StockDirecteur = () => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <DirecteurResourcePage
        title="Consultation du stock"
        description="Vue globale des matériels disponibles."
        endpoint="/materiels"
        icon={CubeIcon}
        getSearchText={(item) => `${item.reference} ${item.nom}`}
        getMetrics={(items) => [
          { label: 'Total articles', value: items.length, hint: 'références en stock' },
          { label: 'Disponibles', value: items.filter(i => i.quantiteDisponible > (i.seuil_securite ?? 5)).length, hint: 'stock suffisant' },
          { label: 'Faible stock', value: items.filter(i => i.quantiteDisponible > 0 && i.quantiteDisponible <= (i.seuil_securite ?? 5)).length, hint: 'sous le stock de sécurité' },
          { label: 'Rupture', value: items.filter(i => i.quantiteDisponible === 0).length, hint: 'à réapprovisionner' },
        ]}
        columns={[
          { label: 'Référence', render: (item) => <span className="font-mono text-xs">{item.reference}</span> },
          { label: 'Nom', render: (item) => item.nom },
          { label: 'Quantité', render: (item) => item.quantiteDisponible },
          { label: 'Stock de sécurité', render: (item) => item.seuil_securite ?? '—' },
          {
            label: 'Statut',
            render: (item) => {
              const seuil = item.seuil_securite ?? 5;
              return (
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.quantiteDisponible > seuil ? 'bg-emerald-50 text-emerald-700' :
                  item.quantiteDisponible > 0 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {item.quantiteDisponible > seuil ? 'Disponible' :
                   item.quantiteDisponible > 0 ? 'Faible' : 'Rupture'}
                </span>
              );
            }
          },
          { label: 'Prix vente', render: (item) => `${Number(item.prixVente || 0).toLocaleString('fr-MA')} DH` },
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

      {selected && (() => {
        const seuil = selected.seuil_securite ?? 5;
        const statut = selected.quantiteDisponible > seuil ? 'Disponible' : selected.quantiteDisponible > 0 ? 'Faible' : 'Rupture';
        const statutClass = selected.quantiteDisponible > seuil ? 'bg-emerald-50 text-emerald-700' : selected.quantiteDisponible > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4"
            onClick={() => setSelected(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-200">
                    <CubeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-gray-400">{selected.reference}</p>
                    <h3 className="text-lg font-bold text-gray-900">{selected.nom}</h3>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statutClass}`}>
                {statut}
              </span>

              {selected.description && (
                <p className="mt-3 text-sm text-gray-600">{selected.description}</p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Quantité disponible</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{selected.quantiteDisponible}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Stock de sécurité</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{selected.seuil_securite ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Prix de vente</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">{Number(selected.prixVente || 0).toLocaleString('fr-MA')} DH</p>
                </div>
                {selected.prixAchat != null && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Prix d'achat</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{Number(selected.prixAchat || 0).toLocaleString('fr-MA')} DH</p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {selected.type?.libelle && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <TagIcon className="h-4 w-4 text-gray-400" />
                    {selected.type.libelle}
                  </div>
                )}
                {selected.adresseStock?.nom && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    {selected.adresseStock.nom}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Fermer
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default StockDirecteur;
