import { UserGroupIcon } from '@heroicons/react/24/outline';
import VendeurResourcePage from './VendeurResourcePage';

const genererMotDePasse = () => Math.random().toString(36).slice(-10);

const ClientsVendeur = () => (
  <VendeurResourcePage
    title="Clients"
    description="Recherchez un client existant ou enregistrez-en un nouveau."
    endpoint="/clients"
    icon={UserGroupIcon}
    getSearchText={(item) => `${item.CIN} ${item.nom} ${item.email} ${item.telephone}`}
    getMetrics={(items) => [
      { label: 'Clients', value: items.length, hint: 'enregistrés au total' },
      {
        label: 'Nouveaux ce mois',
        value: items.filter((item) => item.dateCreation?.startsWith(new Date().toISOString().slice(0, 7))).length,
        hint: 'créés ce mois',
      },
    ]}
    columns={[
      {
        label: 'Client',
        render: (item) => (
          <div>
            <p className="font-semibold text-gray-900">{item.nom}</p>
            <p className="text-xs text-gray-400">CIN : {item.CIN}</p>
          </div>
        ),
      },
      { label: 'Téléphone', render: (item) => item.telephone || '—' },
      { label: 'E-mail', render: (item) => item.email || '—' },
      {
        label: 'Client depuis',
        render: (item) => (item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '—'),
      },
    ]}
    createFields={[
      { name: 'CIN', label: 'CIN' },
      { name: 'nom', label: 'Nom complet' },
      { name: 'telephone', label: 'Téléphone' },
      { name: 'email', label: 'E-mail', type: 'email' },
    ]}
    onCreated={(form) => ({
      ...form,
      dateCreation: new Date().toISOString().slice(0, 10),
      motDePasse: genererMotDePasse(),
    })}
  />
);

export default ClientsVendeur;
