import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PrivateRoute = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  if (!user) return <Navigate to={redirectTo} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleMap = {
      admin: '/admin',
      directeur_ventes: '/directeur',
      responsable_stock: '/stock',
      vendeur: '/vendeur',
      client: '/client'
    };
    return <Navigate to={roleMap[user.role] || '/'} />;
  }
  return children;
};

export default PrivateRoute;