import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useParams, useLocation } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import CreatorDashboard from "./creator/CreatorDashboard";
import BusinessDashboard from "./business/BusinessDashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { toast } from "sonner";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const params = useParams();
  const location = useLocation();
  const routeRole = params.role as 'creator' | 'business' | 'admin' | undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-sm">UR</span>
          </div>
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // BULLETPROOF ROLE DETECTION: Multiple fallback layers for any user type
  const detectUserRole = (): 'creator' | 'business' | 'admin' => {
    // Layer 1: Route-forced role (for deep links)
    if (routeRole && ['creator', 'business', 'admin'].includes(routeRole)) {
      console.log('🎯 Dashboard: Using route-forced role:', routeRole);
      return routeRole;
    }
    
    // Layer 2: Profile role (real users with completed profiles)
    if (profile?.role && typeof profile.role === 'string') {
      console.log('👤 Dashboard: Using profile role:', profile.role);
      return profile.role as 'creator' | 'business' | 'admin';
    }
    
    // Layer 3: Auth metadata (mock users and real users without profiles)
    if (user?.user_metadata?.role && typeof user.user_metadata.role === 'string') {
      console.log('🔐 Dashboard: Using auth metadata role:', user.user_metadata.role);
      return user.user_metadata.role as 'creator' | 'business' | 'admin';
    }
    
    // Layer 4: Email-based detection for mock users
    if (user?.email) {
      if (user.email.includes('admin@')) {
        console.log('📧 Dashboard: Detected admin via email pattern');
        return 'admin';
      }
      if (user.email.includes('venue@') || user.email.includes('business@')) {
        console.log('📧 Dashboard: Detected business via email pattern');
        return 'business';
      }
      if (user.email.includes('creator@')) {
        console.log('📧 Dashboard: Detected creator via email pattern');
        return 'creator';
      }
    }
    
    // Layer 5: Ultimate fallback - always default to creator
    console.log('🛡️ Dashboard: Using ultimate fallback to creator role');
    return 'creator';
  };
  
  const userRole = detectUserRole();

  // Comprehensive role detection logging
  useEffect(() => {
    if (user) {
      console.log('🎛️ BULLETPROOF DASHBOARD ACCESS:', {
        userId: user.id,
        email: user.email,
        finalRole: userRole,
        routeRole: routeRole,
        profileRole: profile?.role,
        metadataRole: user.user_metadata?.role,
        hasProfile: !!profile,
        authType: profile ? 'real-user' : 'mock-user',
        route: location.pathname
      });
      
      // Show role detection toast for transparency
      if (!loading) {
        const roleSource = routeRole ? 'route' : 
                          profile?.role ? 'profile' : 
                          user.user_metadata?.role ? 'auth-metadata' : 'fallback';
        
        toast.success(`Dashboard loaded as ${userRole}`, {
          description: `Role detected from: ${roleSource}`,
          duration: 3000
        });
      }
    }
  }, [user, userRole, routeRole, profile, loading, location.pathname]);

  // BULLETPROOF DASHBOARD COMPONENT ROUTING with Error Boundaries
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        console.log('🎯 Routing to AdminDashboard');
        return (
          <ErrorBoundary fallback={<DashboardErrorFallback role="admin" />}>
            <AdminDashboard />
          </ErrorBoundary>
        );
      case 'creator':
        console.log('🎯 Routing to CreatorDashboard');
        return (
          <ErrorBoundary fallback={<DashboardErrorFallback role="creator" />}>
            <CreatorDashboard />
          </ErrorBoundary>
        );
      case 'business':
        console.log('🎯 Routing to BusinessDashboard');
        return (
          <ErrorBoundary fallback={<DashboardErrorFallback role="business" />}>
            <BusinessDashboard />
          </ErrorBoundary>
        );
      default:
        console.warn(`⚠️ Unknown role "${userRole}", defaulting to CreatorDashboard`);
        return (
          <ErrorBoundary fallback={<DashboardErrorFallback role="creator" />}>
            <CreatorDashboard />
          </ErrorBoundary>
        );
    }
  };
  
  return renderDashboard();
};

// Error Fallback Component for Dashboard Failures
const DashboardErrorFallback = ({ role }: { role: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
      <p className="text-gray-600 mb-6">The {role} dashboard encountered an error.</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Reload Dashboard
      </button>
    </div>
  </div>
);

export default Dashboard;