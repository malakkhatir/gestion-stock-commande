import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
  '/admin': 'Tableau de bord',
  '/admin/users': 'Utilisateurs',
  '/admin/partenaires': 'Partenaires',
  '/admin/stock': 'Stock',
  '/admin/clients': 'Clients',
  '/admin/commandes': 'Commandes',
  '/admin/factures': 'Factures',

  '/directeur': 'Tableau de bord',
  '/directeur/reporting': 'Reporting',
  '/directeur/stock': 'Stock',
  '/directeur/commandes': 'Commandes',
  '/directeur/factures': 'Factures',

  '/stock': 'Tableau de bord',
  '/stock/stock': 'Stock',
  '/stock/alertes': 'Alertes',

  '/vendeur': 'Tableau de bord',
  '/vendeur/stock': 'Consultation stock',
  '/vendeur/commandes': 'Commandes',
  '/vendeur/clients': 'Clients',
  '/vendeur/factures': 'Factures',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Tableau de bord';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={user?.role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {pageTitle}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircle2 className="text-blue-600" size={28} />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.role === 'admin' ? 'Administrateur' : user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;