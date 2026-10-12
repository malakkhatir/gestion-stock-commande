import { TagIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';

const TypesMateriel = () => (
  <AdminResourcePage
    title="Types de matériel"
    description="Gérez les types d'articles utilisés lors de l'ajout de nouveau stock."
    endpoint="/types"
    icon={TagIcon}
    canDelete
    fields={[
      { name: 'code', label: 'Code' },
      { name: 'libelle', label: 'Nom' },
    ]}
    getSearchText={(item) => `${item.code} ${item.libelle}`}
    getMetrics={(items) => [
      { label: 'Types', value: items.length, hint: 'référencés au total' },
    ]}
    columns={[
      {
        label: 'Code',
        render: (item) => <span className="font-mono text-xs text-gray-500">{item.code}</span>,
      },
      {
        label: 'Nom',
        render: (item) => <span className="font-semibold text-gray-900">{item.libelle}</span>,
      },
    ]}
  />
);

export default TypesMateriel;
