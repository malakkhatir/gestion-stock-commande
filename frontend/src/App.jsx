import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import ClientLayout from './components/ClientLayout';
import Unauthorized from './components/Unauthorized';
import Login from './Pages/Login';
import ClientReservation from './Pages/client/ClientReservation';
import ClientFactures from './Pages/client/ClientFactures';
import ClientProfil from './Pages/client/ClientProfil';
import AdminDashboard from './Pages/admin/AdminDashboard';
import ResponsableStockDashboard from './Pages/stock/ResponsableStockDashboard';
import GestionStock from './Pages/stock/GestionStock';
import Alertes from './Pages/stock/Alertes';
import VendeurDashboard from './Pages/vendeur/VendeurDashboard';
import ConsultationStock from './Pages/vendeur/ConsultationStock';
import CommandesVendeur from './Pages/vendeur/CommandesVendeur';
import ClientsVendeur from './Pages/vendeur/ClientsVendeur';
import FacturesVendeur from './Pages/vendeur/FacturesVendeur';
import ClientDashboard from './Pages/client/ClientDashboard';
import Commandes from './Pages/admin/Commandes';
import Stock from './Pages/admin/Stock';
import Clients from './Pages/admin/Clients';
import Factures from './Pages/admin/Factures';
import Partenaires from './Pages/admin/Partenaires';
import Utilisateurs from './Pages/admin/Utilisateurs';
import AdressesStock from './Pages/admin/AdressesStock';
import Villes from './Pages/admin/Villes';
import TypesMateriel from './Pages/admin/TypesMateriel';
import Reporting from './Pages/directeur/Reporting';
import StockDirecteur from './Pages/directeur/StockDirecteur';
import CommandesDirecteur from './Pages/directeur/CommandesDirecteur';
import FacturesDirecteur from './Pages/directeur/FacturesDirecteur';
import DirecteurDashboard from './Pages/directeur/DirecteurDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Routes protégées avec Layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
            <Route path="admin/commandes" element={<RoleRoute allowedRoles={['admin']}><Commandes /></RoleRoute>} />
            <Route path="admin/stock" element={<RoleRoute allowedRoles={['admin']}><Stock /></RoleRoute>} />
            <Route path="admin/adresses-stock" element={<RoleRoute allowedRoles={['admin']}><AdressesStock /></RoleRoute>} />
            <Route path="admin/villes" element={<RoleRoute allowedRoles={['admin']}><Villes /></RoleRoute>} />
            <Route path="admin/types-materiel" element={<RoleRoute allowedRoles={['admin']}><TypesMateriel /></RoleRoute>} />
            <Route path="admin/clients" element={<RoleRoute allowedRoles={['admin']}><Clients /></RoleRoute>} />
            <Route path="admin/factures" element={<RoleRoute allowedRoles={['admin']}><Factures /></RoleRoute>} />
            <Route path="admin/partenaires" element={<RoleRoute allowedRoles={['admin']}><Partenaires /></RoleRoute>} />
            <Route path="admin/users" element={<RoleRoute allowedRoles={['admin']}><Utilisateurs /></RoleRoute>} />
            <Route path="/directeur" element={<RoleRoute allowedRoles={['directeur_ventes']}><DirecteurDashboard /></RoleRoute>} />
            <Route path="/directeur/reporting" element={<RoleRoute allowedRoles={['directeur_ventes']}><Reporting /></RoleRoute>} />
            <Route path="/directeur/stock" element={<RoleRoute allowedRoles={['directeur_ventes']}><StockDirecteur /></RoleRoute>} />
            <Route path="/directeur/commandes" element={<RoleRoute allowedRoles={['directeur_ventes']}><CommandesDirecteur /></RoleRoute>} />
            <Route path="/directeur/factures" element={<RoleRoute allowedRoles={['directeur_ventes']}><FacturesDirecteur /></RoleRoute>} />
            <Route path="/stock" element={<RoleRoute allowedRoles={['responsable_stock']}><ResponsableStockDashboard /></RoleRoute>} />
            <Route path="stock/stock" element={<RoleRoute allowedRoles={['responsable_stock']}><GestionStock /></RoleRoute>} />
            <Route path="stock/alertes" element={<RoleRoute allowedRoles={['responsable_stock']}><Alertes /></RoleRoute>} />
            <Route path="/vendeur" element={<RoleRoute allowedRoles={['vendeur']}><VendeurDashboard /></RoleRoute>} />
            <Route path="vendeur/stock" element={<RoleRoute allowedRoles={['vendeur']}><ConsultationStock /></RoleRoute>} />
            <Route path="vendeur/commandes" element={<RoleRoute allowedRoles={['vendeur']}><CommandesVendeur /></RoleRoute>} />
            <Route path="vendeur/clients" element={<RoleRoute allowedRoles={['vendeur']}><ClientsVendeur /></RoleRoute>} />
            <Route path="vendeur/factures" element={<RoleRoute allowedRoles={['vendeur']}><FacturesVendeur /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/unauthorized" replace />} />
          </Route>

          {/* Routes protégées avec ClientLayout */}
          <Route element={<PrivateRoute><ClientLayout /></PrivateRoute>}>
            <Route path="/client" element={<RoleRoute allowedRoles={['client']}><ClientDashboard /></RoleRoute>} />
            <Route path="/client/reservation" element={<RoleRoute allowedRoles={['client']}><ClientReservation /></RoleRoute>} />
            <Route path="/client/factures" element={<RoleRoute allowedRoles={['client']}><ClientFactures /></RoleRoute>} />
            <Route path="/client/profil" element={<RoleRoute allowedRoles={['client']}><ClientProfil /></RoleRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
