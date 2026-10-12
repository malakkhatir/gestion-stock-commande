import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Boxes,
  ShoppingCart,
  FileText,
  Database,
  AlertTriangle,
  Eye,
  BarChart3,
  UserCircle2,
  MapPin,
  Globe2,
} from 'lucide-react';

// Icône associée à chaque route (par défaut : LayoutDashboard)
const ICONS = {
  '/admin': LayoutDashboard,
  '/admin/users': Users,
  '/admin/partenaires': Database,
  '/admin/stock': Boxes,
  '/admin/adresses-stock': MapPin,
  '/admin/villes': Globe2,
  '/admin/clients': UserCircle2,
  '/admin/commandes': ShoppingCart,
  '/admin/factures': FileText,

  '/directeur': LayoutDashboard,
  '/directeur/reporting': BarChart3,
  '/directeur/stock': Boxes,
  '/directeur/commandes': ShoppingCart,
  '/directeur/factures': FileText,

  '/stock': LayoutDashboard,
  '/stock/stock': Boxes,
  '/stock/alertes': AlertTriangle,

  '/vendeur': LayoutDashboard,
  '/vendeur/stock': Eye,
  '/vendeur/commandes': ShoppingCart,
  '/vendeur/clients': UserCircle2,
  '/vendeur/factures': FileText,
};

const Sidebar = ({ role }) => {
  const getMenu = () => {
    const items = {
      admin: [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Utilisateurs', path: '/admin/users' },
        { label: 'Partenaires', path: '/admin/partenaires' },
        { label: 'Stock', path: '/admin/stock' },
        { label: 'Types de matériel', path: '/admin/types-materiel' },
        { label: 'Villes', path: '/admin/villes' },
        { label: 'Adresses de stock', path: '/admin/adresses-stock' },
        { label: 'Clients', path: '/admin/clients' },
        { label: 'Commandes', path: '/admin/commandes' },
        
        { label: 'Factures', path: '/admin/factures' },
      ],
      directeur_ventes: [
        { label: 'Dashboard', path: '/directeur' },
        { label: 'Reporting', path: '/directeur/reporting' },
        { label: 'Stock', path: '/directeur/stock' },
        { label: 'Commandes', path: '/directeur/commandes' },
        { label: 'Factures', path: '/directeur/factures' },
      ],
      responsable_stock: [
        { label: 'Dashboard', path: '/stock' },
        { label: 'Stock', path: '/stock/stock' },
        { label: 'Alertes', path: '/stock/alertes' },
      ],
      vendeur: [
        { label: 'Dashboard', path: '/vendeur' },
        { label: 'Consultation stock', path: '/vendeur/stock' },
        { label: 'Commandes', path: '/vendeur/commandes' },
        { label: 'Clients', path: '/vendeur/clients' },
        { label: 'Factures', path: '/vendeur/factures' },
      ],
    };
    return items[role] || [];
  };

  const menu = getMenu();

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* En-tête */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            Gestion Stock
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Administration</p>
        </div>
        <span className="text-[10px] font-bold tracking-wide bg-blue-600 text-white px-2 py-1 rounded-md">
          PRO
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Menu principal
        </p>
        <ul className="space-y-1">
          {menu.map((item, index) => {
            const Icon = ICONS[item.path] || LayoutDashboard;
            return (
              <li key={index}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-700 text-white font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pied de page : statut système */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-700">Système</p>
          <p className="text-[11px] text-gray-400">
            Tous les services opérationnels
          </p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          En ligne
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;