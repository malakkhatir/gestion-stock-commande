import { CubeIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';
import api from '../../api/axios';

const Stock = () => {
  const fetchOptions = async () => {
    const options = {};
    // On essaie chaque endpoint, si 404 on ignore (on met un tableau vide)
    try {
      const typesRes = await api.get('/type-materiels');
      options.type_materiel_id = typesRes.data.map(t => ({ value: t.id, label: t.libelle || t.nom }));
    } catch {
      console.warn('⚠️ Endpoint /type-materiels non trouvé, le select sera vide');
      options.type_materiel_id = [];
    }

    try {
      const fournisseursRes = await api.get('/partenaires?type=fournisseur');
      options.fournisseur_id = fournisseursRes.data.map(f => ({ value: f.id, label: f.nom }));
    } catch {
      console.warn('⚠️ Endpoint /partenaires?type=fournisseur non trouvé');
      options.fournisseur_id = [];
    }

    try {
      const fabricantsRes = await api.get('/partenaires?type=fabricant');
      options.fabricant_id = fabricantsRes.data.map(f => ({ value: f.id, label: f.nom }));
    } catch {
      console.warn('⚠️ Endpoint /partenaires?type=fabricant non trouvé');
      options.fabricant_id = [];
    }

    try {
      const adressesRes = await api.get('/adresse-stocks');
      options.adresse_stock_id = adressesRes.data.map(a => ({ value: a.id, label: a.nom || a.code }));
    } catch {
      console.warn('⚠️ Endpoint /adresse-stocks non trouvé');
      options.adresse_stock_id = [];
    }

    return options;
  };

  return (
    <AdminResourcePage
      title="Stock"
      description="Suivez les articles, emplacements et niveaux disponibles."
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
        { name: 'description', label: 'Description', optional: true },
        { name: 'type_materiel_id', label: 'Type de matériel', type: 'select' },
        { name: 'fournisseur_id', label: 'Fournisseur', type: 'select' },
        { name: 'fabricant_id', label: 'Fabricant', type: 'select', optional: true },
        { name: 'prixAchat', label: 'Prix achat', type: 'number' },
        { name: 'prixVente', label: 'Prix vente', type: 'number' },
        {
          name: 'prixPromotionnel',
          label: 'Prix promotionnel (≥ 130% du prix achat, < prix vente)',
          type: 'number',
          optional: true,
        },
        { name: 'quantiteDisponible', label: 'Quantité disponible', type: 'number' },
        { name: 'seuil_securite', label: 'Stock de sécurité', type: 'number' },
        { name: 'adresse_stock_id', label: 'Adresse stock', type: 'select' },
      ]}
      getSearchText={(item) =>
        `${item.reference} ${item.nom} ${item.type?.libelle || item.type?.nom || ''} ${item.fournisseur?.nom || ''}`
      }
      getMetrics={(items) => [
        { label: 'Articles', value: items.length, hint: 'références en stock' },
        {
          label: 'Unités disponibles',
          value: items.reduce((sum, item) => sum + Number(item.quantiteDisponible || 0), 0),
          hint: 'quantité totale',
        },
        {
          label: 'Stock faible',
          value: items.filter((item) => Number(item.quantiteDisponible) <= Number(item.seuil_securite ?? 5)).length,
          hint: 'sous le seuil de sécurité',
        },
      ]}
      columns={[
        {
          label: 'Référence',
          render: (item) => <span className="font-mono text-xs text-gray-500">{item.reference}</span>,
        },
        {
          label: 'Article',
          render: (item) => (
            <div>
              <p className="font-semibold text-gray-900">{item.nom}</p>
              <p className="mt-0.5 text-xs text-gray-400">{item.type?.libelle || item.type?.nom || 'Sans type'}</p>
            </div>
          ),
        },
        {
          label: 'Fournisseur',
          render: (item) => item.fournisseur?.nom || '—',
        },
        {
          label: 'code stock',
          render: (item) => item.adresse_stock?.code || item.adresseStock?.code || '—',
        },
        {
          label: 'Disponible',
          className: 'text-center',
          render: (item) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                Number(item.quantiteDisponible) <= Number(item.seuil_securite ?? 5)
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-700'
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
          label: 'Prix vente',
          className: 'text-right',
          render: (item) =>
            `${Number(item.prixVente || 0).toLocaleString('fr-MA')} DH`,
        },
        {
          label: 'Prix promotionnel',
          className: 'text-right',
          render: (item) =>
            item.prixPromotionnel
              ? `${Number(item.prixPromotionnel).toLocaleString('fr-MA')} DH`
              : '—',
        },
      ]}
    />
  );
};

export default Stock;