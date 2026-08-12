import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, user, isOnboarded, setOnboarded } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const verifyOnboarding = async () => {
      if (!isAuthenticated) {
        setIsVerifying(false);
        return;
      }

      // If already onboarded in store, fast path
      if (isOnboarded) {
        setIsVerifying(false);
        return;
      }

      // We need a real user ID to check the DB. 
      // If we are in demo mode, the user id might be 'usr_demo'
      const userId = user?.id || 'usr_demo';

      try {
        const { supabase } = await import('../lib/supabase');
        // Actually check the user_profiles table in Supabase
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_onboarded')
          .eq('id', userId)
          .single();

        if (mounted) {
          if (profile?.is_onboarded === true) {
            setOnboarded(); // Update store
          } else {
            // Not onboarded!
            if (location.pathname !== '/onboarding') {
              navigate('/onboarding', { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Failed to verify onboarding status:', err);
        // Fallback for demo if Supabase fails: force onboarding
        if (mounted && location.pathname !== '/onboarding') {
          navigate('/onboarding', { replace: true });
        }
      } finally {
        if (mounted) setIsVerifying(false);
      }
    };

    verifyOnboarding();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.id, isOnboarded, location.pathname, navigate, setOnboarded]);

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/role-select" state={{ from: location }} replace />;
  }

  // Still verifying DB state
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-base)]">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  // If authenticated but not onboarded, block access to protected routes
  if (!isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
