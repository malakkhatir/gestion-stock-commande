import { UsersIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';

const role = (item) => item.administrateur ? 'Administrateur' : item.directeur_ventes || item.directeurVentes ? 'Directeur ventes' : item.responsable_stock || item.responsableStock ? 'Responsable stock' : item.vendeur ? 'Vendeur' : 'Sans rôle';
const normalizeUsers = (data) => (data.data || []).map((item) => ({
  ...item,
  role: item.administrateur ? 'admin' : item.directeur_ventes || item.directeurVentes ? 'directeur_ventes' : item.responsable_stock || item.responsableStock ? 'responsable_stock' : item.vendeur ? 'vendeur' : '',
}));
const Utilisateurs = () => <AdminResourcePage title="Utilisateurs" description="Visualisez les comptes internes et leurs rôles d’accès." endpoint="/users" icon={UsersIcon} normalize={normalizeUsers}
  fields={[
    { name: 'name', label: 'Nom' },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'password', label: 'Mot de passe', type: 'password', optional: true },
    { name: 'role', label: 'Rôle', type: 'select', options: [
      { value: 'admin', label: 'Administrateur' },
      { value: 'directeur_ventes', label: 'Directeur ventes' },
      { value: 'responsable_stock', label: 'Responsable stock' },
      { value: 'vendeur', label: 'Vendeur' },
    ], optional: true },
  ]}
  getSearchText={(item) => `${item.name} ${item.email} ${role(item)}`}
  getMetrics={(items) => [{ label: 'Utilisateurs', value: items.length, hint: 'comptes visibles' }, { label: 'Administrateurs', value: items.filter((item) => item.administrateur).length, hint: 'accès complet' }, { label: 'Vendeurs', value: items.filter((item) => item.vendeur).length, hint: 'comptes de vente' }]}
  columns={[{ label: 'Utilisateur', render: (item) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{item.name?.[0]?.toUpperCase() || '?'}</span><div><p className="font-semibold text-gray-900">{item.name}</p><p className="text-xs text-gray-400">{item.email}</p></div></div> }, { label: 'Rôle', render: (item) => <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{role(item)}</span> }, { label: 'Créé le', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '—' }]} />;
export default Utilisateurs;
