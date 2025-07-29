import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'creator' | 'business' | 'admin';
  requiresVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiresVerification = false 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // BULLETPROOF ACCESS: All authenticated users can access dashboards
  if (!profile) {
    console.log('🔓 BULLETPROOF ACCESS: Authenticated user without profile granted access:', {
      userId: user.id,
      email: user.email,
      authMetadata: user.user_metadata,
      route: location.pathname
    });
  }

  // BULLETPROOF ROLE CHECKING: Only enforce if explicitly required
  if (requiredRole) {
    // Multi-layer role detection
    const profileRole = profile?.role;
    const metadataRole = user?.user_metadata?.role;
    const emailRole = user?.email?.includes('admin@') ? 'admin' : 
                     user?.email?.includes('venue@') || user?.email?.includes('business@') ? 'business' : 
                     user?.email?.includes('creator@') ? 'creator' : null;
    const userRole = profileRole || metadataRole || emailRole || 'creator';
    
    if (userRole !== requiredRole) {
      console.warn('🚫 ROLE MISMATCH: Access denied', {
        required: requiredRole,
        detected: userRole,
        hasProfile: !!profile,
        route: location.pathname
      });
      // Redirect to appropriate dashboard instead of unauthorized page
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check verification requirements (only if profile exists and is explicitly required)
  if (requiresVerification && profile && !profile.is_verified) {
    console.warn('VERIFICATION REQUIRED: Redirecting to verification');
    return <Navigate to="/verify-account" replace />;
  }

  return <>{children}</>;
};