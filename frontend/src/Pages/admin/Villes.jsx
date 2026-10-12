import { GlobeAltIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';

const Villes = () => (
  <AdminResourcePage
    title="Villes"
    description="Gérez le référentiel des villes utilisé par les adresses de stock, partenaires et points de vente."
    endpoint="/villes"
    icon={GlobeAltIcon}
    canDelete
    fields={[
      { name: 'code', label: 'Code' },
      { name: 'libelle', label: 'Libellé' },
    ]}
    getSearchText={(item) => `${item.code} ${item.libelle}`}
    getMetrics={(items) => [
      { label: 'Villes', value: items.length, hint: 'référencées au total' },
    ]}
    columns={[
      {
        label: 'Code',
        render: (item) => <span className="font-mono text-xs text-gray-500">{item.code}</span>,
      },
      {
        label: 'Libellé',
        render: (item) => <span className="font-semibold text-gray-900">{item.libelle}</span>,
      },
    ]}
  />
);

export default Villes;
