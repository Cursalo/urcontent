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

  // If user exists but profile is null, allow access but log the issue
  if (!profile) {
    console.warn('User authenticated but profile not found, allowing access with limited functionality');
  }

  // Check role requirements (only if profile exists)
  if (requiredRole && profile && profile.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check verification requirements (only if profile exists)
  if (requiresVerification && profile && !profile.is_verified) {
    return <Navigate to="/verify-account" replace />;
  }

  return <>{children}</>;
};