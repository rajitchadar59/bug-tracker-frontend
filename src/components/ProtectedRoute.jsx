import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Agar user nahi hai, toh wapas auth (login) pe bhej do
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;