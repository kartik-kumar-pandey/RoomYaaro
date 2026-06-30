import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const redirect = {
      OWNER: '/owner/dashboard',
      TENANT: '/tenant/dashboard',
      ADMIN: '/admin/dashboard',
    }[user.role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
