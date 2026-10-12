import { CubeIcon } from '@heroicons/react/24/outline';
import StockResourcePage from './StockResourcePage';
import api from '../../api/axios';

const GestionStock = () => {
  const fetchOptions = async () => {
    const options = {};
    try {
      const { data } = await api.get('/type-materiels');
      options.type_materiel_id = data.map((t) => ({ value: t.id, label: t.libelle || t.nom }));
    } catch {
      options.type_materiel_id = [];
    }
    try {
      const { data } = await api.get('/partenaires', { params: { type: 'fournisseur' } });
      options.fournisseur_id = data.map((f) => ({ value: f.id, label: f.nom }));
    } catch {
      options.fournisseur_id = [];
    }
    try {
      const { data } = await api.get('/partenaires', { params: { type: 'fabricant' } });
      options.fabricant_id = data.map((f) => ({ value: f.id, label: f.nom }));
    } catch {
      options.fabricant_id = [];
    }
    try {
      const { data } = await api.get('/adresse-stocks');
      options.adresse_stock_id = data.map((a) => ({ value: a.id, label: a.nom || a.code }));
    } catch {
      options.adresse_stock_id = [];
    }
    return options;
  };

  return (
    <StockResourcePage
      title="Gestion du stock"
      description="Ajoutez, modifiez et suivez les articles en stock."
      endpoint="/materiels"
      icon={CubeIcon}
      canDelete
      fetchOptions={fetchOptions}
      normalize={(data) =>
        data.map((item) => ({
          ...item,
          type_materiel_id: item.type?.id ?? '',
          fournisseur_id: item.fournisseur?.id ?? '',
          fabricant_id: item.fabricant?.id ?? '',
          adresse_stock_id: item.adresse_stock?.id || item.adresseStock?.id || '',
        }))
      }
      fields={[
        { name: 'reference', label: 'Référence' },
        { name: 'nom', label: 'Article' },
        { name: 'description', label: 'Description', optional: true, fullWidth: true },
        { name: 'type_materiel_id', label: 'Type de matériel', type: 'select' },
        { name: 'fournisseur_id', label: 'Fournisseur', type: 'select' },
        { name: 'fabricant_id', label: 'Fabricant', type: 'select', optional: true },
        { name: 'prixAchat', label: "Prix d'achat", type: 'number' },
        { name: 'prixVente', label: 'Prix de vente', type: 'number' },
        { name: 'quantiteDisponible', label: 'Quantité disponible', type: 'number' },
        { name: 'seuil_securite', label: 'Stock de sécurité', type: 'number' },
        { name: 'adresse_stock_id', label: 'Adresse de stockage', type: 'select' },
      ]}
      getSearchText={(item) => `${item.reference} ${item.nom} ${item.type?.libelle || ''} ${item.fournisseur?.nom || ''}`}
      getMetrics={(items) => [
        { label: 'Articles', value: items.length, hint: 'références en stock' },
        {
          label: 'Unités disponibles',
          value: items.reduce((sum, item) => sum + Number(item.quantiteDisponible || 0), 0),
          hint: 'quantité totale',
        },
        {
          label: 'Valeur du stock',
          value: `${items.reduce((sum, item) => sum + Number(item.quantiteDisponible || 0) * Number(item.prixAchat || 0), 0).toLocaleString('fr-MA')} DH`,
          hint: "au prix d'achat",
        },
        {
          label: 'Stock faible',
          value: items.filter((item) => Number(item.quantiteDisponible) < Number(item.seuil_securite ?? 5)).length,
          hint: 'sous le seuil de sécurité',
        },
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
        { label: 'Fournisseur', render: (item) => item.fournisseur?.nom || '—' },
        { label: 'Emplacement', render: (item) => item.adresse_stock?.code || item.adresseStock?.code || '—' },
        {
          label: 'Disponible',
          className: 'text-center',
          render: (item) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                Number(item.quantiteDisponible) < Number(item.seuil_securite ?? 5) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {item.quantiteDisponible}
            </span>
          ),
        },
        {
          label: 'Stock de sécurité',
          className: 'text-center',
          render: (item) => item.seuil_securite ?? '—',
        },
        {
          label: "Prix d'achat",
          className: 'text-right',
          render: (item) => `${Number(item.prixAchat || 0).toLocaleString('fr-MA')} DH`,
        },
        {
          label: 'Prix vente',
          className: 'text-right',
          render: (item) => `${Number(item.prixVente || 0).toLocaleString('fr-MA')} DH`,
        },
      ]}
    />
  );
};

export default GestionStock;
