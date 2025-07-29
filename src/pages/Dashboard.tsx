import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import CreatorDashboard from "./creator/CreatorDashboard";
import BusinessDashboard from "./business/BusinessDashboard";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

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

  // Get user role with proper string type checking and fallback handling
  const profileRole = typeof profile?.role === 'string' ? profile.role : null;
  const metadataRole = typeof user?.user_metadata?.role === 'string' ? user.user_metadata.role : null;
  const userRole = profileRole || metadataRole || 'creator';

  // Log role detection for debugging - clean output
  console.log('Dashboard role detection:', userRole);

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case 'admin':
      console.log('Routing to AdminDashboard');
      return <AdminDashboard />;
    case 'creator':
      console.log('Routing to CreatorDashboard');
      return <CreatorDashboard />;
    case 'business':
      console.log('Routing to BusinessDashboard');
      return <BusinessDashboard />;
    default:
      console.warn(`Unknown role "${userRole}", defaulting to CreatorDashboard`);
      return <CreatorDashboard />;
  }
};

export default Dashboard;