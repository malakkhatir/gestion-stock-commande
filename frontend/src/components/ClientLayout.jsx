import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle2, ShoppingBag, ClipboardList, Receipt, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Mes commandes', path: '/client', icon: ShoppingBag },
  { label: 'Réservation', path: '/client/reservation', icon: ClipboardList },
  { label: 'Mes factures', path: '/client/factures', icon: Receipt },
  { label: 'Mon profil', path: '/client/profil', icon: UserCog },
];

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-lg shadow-emerald-200">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-gray-900">Gestion Stock</p>
              <p className="text-xs font-medium text-emerald-600">Espace client</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <UserCircle2 className="text-emerald-600" size={26} />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
        <nav className="w-full px-6 flex justify-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
