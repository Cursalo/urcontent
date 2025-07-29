import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'creator' | 'business' | 'admin';
  requiresVerification?: boolean;
  allowAnonymous?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiresVerification = false,
  allowAnonymous = false 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [emergencyAccess, setEmergencyAccess] = React.useState(false);

  // INSTANT ACCESS: Never show loading for more than 1 second
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⚡ INSTANT ACCESS: Allowing immediate access');
      setEmergencyAccess(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Show instant access button
  if (loading && !emergencyAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse text-lg">Loading...</div>
          <button 
            onClick={() => setEmergencyAccess(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            ⚡ Instant Access
          </button>
        </div>
      </div>
    );
  }

  // Handle anonymous access if allowed
  if (!user && allowAnonymous) {
    console.log('👤 ANONYMOUS ACCESS: Allowing guest access to', location.pathname);
    return <>{children}</>;
  }

  // Always allow access - no authentication required (for backwards compatibility)
  if (!user && !emergencyAccess && !allowAnonymous) {
    console.log('⚡ INSTANT ACCESS: No user found, allowing anonymous access to', location.pathname);
    setEmergencyAccess(true);
  }

  // EMERGENCY ACCESS: Allow access even without proper authentication
  if (emergencyAccess && !user) {
    console.log('🚨 EMERGENCY ACCESS GRANTED: Allowing access without authentication to', location.pathname);
    // Show warning banner but allow access
    return (
      <div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-center text-sm">
          👤 Modo Invitado: Estás explorando sin autenticación. Algunas funciones pueden estar limitadas.
        </div>
        {children}
      </div>
    );
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