import { UserGroupIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';

const Clients = () => <AdminResourcePage title="Clients" description="Centralisez les coordonnées et l’historique de vos clients." endpoint="/clients" icon={UserGroupIcon} canDelete
  fields={[
    { name: 'CIN', label: 'CIN' },
    { name: 'nom', label: 'Nom' },
    { name: 'telephone', label: 'Téléphone' },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'motDePasse', label: 'Mot de passe', type: 'password', optional: true },
  ]}
  getSearchText={(item) => `${item.CIN} ${item.nom} ${item.email} ${item.telephone}`}
  getMetrics={(items) => [{ label: 'Clients', value: items.length, hint: 'enregistrés au total' }, { label: 'Avec e-mail', value: items.filter((item) => item.email).length, hint: 'contacts joignables' }, { label: 'Nouveaux ce mois', value: items.filter((item) => item.dateCreation?.startsWith(new Date().toISOString().slice(0, 7))).length, hint: 'créés ce mois' }]}
  columns={[{ label: 'Client', render: (item) => <div><p className="font-semibold text-gray-900">{item.nom}</p><p className="text-xs text-gray-400">CIN : {item.CIN}</p></div> }, { label: 'E-mail', render: (item) => item.email || '—' }, { label: 'Téléphone', render: (item) => item.telephone || '—' }, { label: 'Inscription', render: (item) => item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '—' }]} />;
export default Clients;
