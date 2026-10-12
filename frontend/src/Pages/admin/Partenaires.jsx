import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';
import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

const Partenaires = () => {
  const [villesMap, setVillesMap] = useState({});
  const [villesLoaded, setVillesLoaded] = useState(false);
  const adminRef = useRef(null);

  // Chargement des villes pour le normalize (affichage dans le tableau)
  useEffect(() => {
    api.get('/villes')
      .then(response => {
        const map = {};
        response.data.forEach(v => {
          map[v.id] = v.libelle; // selon votre colonne "libelle" ou "nom"
        });
        setVillesMap(map);
        setVillesLoaded(true);
      })
      .catch(() => setVillesLoaded(true));
  }, []);

  // Recharger les partenaires une fois les villes chargées pour appliquer le normalize
  useEffect(() => {
    if (villesLoaded && adminRef.current) {
      adminRef.current.reload();
    }
  }, [villesLoaded]);

  // Normalize : enrichir les données avec le nom de la ville
  const normalize = (data) => {
    return data.map(item => ({
      ...item,
      ville: item.ville_id ? { id: item.ville_id, libelle: villesMap[item.ville_id] || '—' } : null
    }));
  };

  // 🔁 Fonction fetchOptions pour alimenter le select du formulaire
  const fetchOptions = async () => {
    const response = await api.get('/villes');
    const options = response.data.map(v => ({
      value: v.id,
      label: v.libelle, // ou v.nom selon votre colonne
    }));
    return { ville_id: options }; // clé correspondant au name du champ
  };

  return (
    <AdminResourcePage
      ref={adminRef}
      title="Partenaires"
      description="Gérez les fournisseurs et fabricants de votre catalogue."
      endpoint="/partenaires"
      icon={BuildingOffice2Icon}
      canDelete
      normalize={normalize}
      fetchOptions={fetchOptions}  // ⬅️ AJOUT OBLIGATOIRE
      fields={[
        { name: 'code', label: 'Code' },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          options: [
            { value: 'fournisseur', label: 'Fournisseur' },
            { value: 'fabricant', label: 'Fabricant' }
          ]
        },
        { name: 'nom', label: 'Nom' },
        { name: 'contact', label: 'Contact', optional: true },
        { name: 'telephone1', label: 'Téléphone principal' },
        { name: 'telephone2', label: 'Téléphone secondaire', optional: true },
        { name: 'email', label: 'E-mail', type: 'email', optional: true },
        { name: 'pays', label: 'Pays' },
        { name: 'ville_id', label: 'Ville', type: 'select' }, // sera dynamique
        { name: 'adresse', label: 'Adresse' },
      ]}
      getSearchText={(item) =>
        `${item.code} ${item.nom} ${item.type} ${item.contact || ''} ${item.email || ''} ${item.pays}`
      }
      getMetrics={(items) => [
        { label: 'Partenaires', value: items.length, hint: 'référencés au total' },
        {
          label: 'Fournisseurs',
          value: items.filter((item) => item.type === 'fournisseur').length,
          hint: 'pour les approvisionnements'
        },
        {
          label: 'Fabricants',
          value: items.filter((item) => item.type === 'fabricant').length,
          hint: 'marques partenaires'
        },
      ]}
      columns={[
        {
          label: 'Partenaire',
          render: (item) => (
            <div>
              <p className="font-semibold text-gray-900">{item.nom}</p>
              <p className="font-mono text-xs text-gray-400">{item.code}</p>
            </div>
          )
        },
        {
          label: 'Type',
          render: (item) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                item.type === 'fournisseur'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-violet-50 text-violet-700'
              }`}
            >
              {item.type}
            </span>
          )
        },
        {
          label: 'Contact',
          render: (item) => (
            <div>
              <p>{item.contact || '—'}</p>
              <p className="text-xs text-gray-400">{item.telephone1}</p>
            </div>
          )
        },
        {
          label: 'Ville / Pays',
          render: (item) => `${item.ville?.libelle || '—'} · ${item.pays}`
        },
        {
          label: 'E-mail',
          render: (item) => item.email || '—'
        }
      ]}
    />
  );
};

export default Partenaires;