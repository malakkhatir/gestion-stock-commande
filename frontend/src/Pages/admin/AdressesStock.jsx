import { MapPinIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';
import api from '../../api/axios';

const AdressesStock = () => {
  const fetchOptions = async () => {
    const options = {};
    try {
      const villesRes = await api.get('/villes');
      options.ville_id = villesRes.data.map((v) => ({ value: v.id, label: v.libelle }));
    } catch {
      console.warn('⚠️ Endpoint /villes non trouvé, le select sera vide');
      options.ville_id = [];
    }
    return options;
  };

  return (
    <AdminResourcePage
      title="Adresses de stock"
      description="Gérez les entrepôts et emplacements de stockage."
      endpoint="/adresses-stock"
      icon={MapPinIcon}
      canDelete
      fetchOptions={fetchOptions}
      normalize={(data) =>
        data.map((item) => ({
          ...item,
          ville_id: item.ville?.id ?? '',
        }))
      }
      fields={[
        { name: 'code', label: 'Code' },
        { name: 'nom', label: 'Nom' },
        { name: 'ville_id', label: 'Ville', type: 'select' },
        { name: 'adresse', label: 'Adresse', fullWidth: true },
      ]}
      getSearchText={(item) =>
        `${item.code} ${item.nom} ${item.ville?.libelle || ''} ${item.adresse}`
      }
      getMetrics={(items) => [
        { label: 'Adresses', value: items.length, hint: 'emplacements de stockage' },
        {
          label: 'Villes couvertes',
          value: new Set(items.map((item) => item.ville?.id).filter(Boolean)).size,
          hint: 'villes distinctes',
        },
      ]}
      columns={[
        {
          label: 'Code',
          render: (item) => <span className="font-mono text-xs text-gray-500">{item.code}</span>,
        },
        {
          label: 'Nom',
          render: (item) => <span className="font-semibold text-gray-900">{item.nom}</span>,
        },
        {
          label: 'Ville',
          render: (item) => item.ville?.libelle || '—',
        },
        {
          label: 'Adresse',
          render: (item) => item.adresse,
        },
      ]}
    />
  );
};

export default AdressesStock;
