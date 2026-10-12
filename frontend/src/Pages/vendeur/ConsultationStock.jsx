import { CubeIcon } from '@heroicons/react/24/outline';
import VendeurResourcePage from './VendeurResourcePage';

const ConsultationStock = () => (
  <VendeurResourcePage
    title="Consultation du stock"
    description="Vérifiez la disponibilité des articles avant de valider une vente."
    endpoint="/materiels"
    icon={CubeIcon}
    getSearchText={(item) => `${item.reference} ${item.nom} ${item.type?.libelle || ''}`}
    getMetrics={(items) => [
      { label: 'Articles', value: items.length, hint: 'références en catalogue' },
      { label: 'Disponibles', value: items.filter((i) => i.quantiteDisponible > Number(i.seuil_securite ?? 5)).length, hint: 'stock suffisant' },
      { label: 'Faible stock', value: items.filter((i) => i.quantiteDisponible > 0 && i.quantiteDisponible <= Number(i.seuil_securite ?? 5)).length, hint: 'sous le seuil de sécurité' },
      { label: 'Rupture', value: items.filter((i) => i.quantiteDisponible === 0).length, hint: 'indisponibles' },
    ]}
    columns={[
      { label: 'Référence', render: (item) => <span className="font-mono text-xs text-gray-500">{item.reference}</span> },
      {
        label: 'Article',
        render: (item) => (
          <div>
            <p className="font-semibold text-gray-900">{item.nom}</p>
            <p className="mt-0.5 text-xs text-gray-400">{item.type?.libelle || 'Sans type'}</p>
          </div>
        ),
      },
      {
        label: 'Disponibilité',
        className: 'text-center',
        render: (item) => {
          const seuil = Number(item.seuil_securite ?? 5);
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                item.quantiteDisponible > seuil
                  ? 'bg-emerald-50 text-emerald-700'
                  : item.quantiteDisponible > 0
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {item.quantiteDisponible > seuil ? `${item.quantiteDisponible} en stock` : item.quantiteDisponible > 0 ? `${item.quantiteDisponible} restants` : 'Rupture'}
            </span>
          );
        },
      },
      {
        label: 'Prix de vente',
        className: 'text-right font-semibold text-gray-900',
        render: (item) => `${Number(item.prixVente || 0).toLocaleString('fr-MA')} DH`,
      },
    ]}
  />
);

export default ConsultationStock;
