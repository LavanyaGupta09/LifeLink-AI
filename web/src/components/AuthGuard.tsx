import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isOnboarded, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/role-select" state={{ from: location }} replace />;
  }

  // Redirect standard patients/users to onboarding if not done yet
  const isB2BOrAdmin = user?.role && [
    'super_admin', 'hospital_admin', 'doctor', 'pharmacy_manager', 
    'lab_tech', 'driver', 'equipment', 'first_responder'
  ].includes(user.role);

  if (!isOnboarded && !isB2BOrAdmin && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;

