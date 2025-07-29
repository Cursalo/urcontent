import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { DashboardRedirect } from '@/components/dashboard/DashboardRedirect';

const Login: React.FC = () => {
  const { user, loading } = useAuth();

  // INSTANT ACCESS: Skip loading completely
  const [emergencyAccess, setEmergencyAccess] = React.useState(false);
  
  React.useEffect(() => {
    // Skip any loading delays - immediate access
    if (loading) {
      console.log('⚡ INSTANT LOGIN: Skipping loading screen');
      setEmergencyAccess(true);
    }
  }, [loading]);

  // Never show loading - go straight to login form
  if (loading && !emergencyAccess) {
    console.log('⚡ INSTANT LOGIN: Bypassing loading screen');
    setEmergencyAccess(true);
  }

  // BULLETPROOF REDIRECT: Send user to their appropriate dashboard
  if (user && !emergencyAccess) {
    return <DashboardRedirect />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">UR</span>
          </div>
          <h1 className="text-4xl font-light text-black mb-4">
            Bienvenido de <span className="font-semibold">vuelta</span>
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Inicia sesión en tu cuenta de URContent
          </p>
        </div>
        <LoginForm />
        
        {/* Emergency Access Panel */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">🚨 Emergency Access</h3>
          <p className="text-xs text-yellow-700 mb-3">
            If authentication is not working, you can access the app directly:
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/dashboard/creator'}
              className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-3 rounded border border-yellow-300"
            >
              🎨 Creator Dashboard (Emergency Access)
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/business'}
              className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-3 rounded border border-yellow-300"
            >
              🏢 Business Dashboard (Emergency Access)
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/admin'}
              className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-3 rounded border border-yellow-300"
            >
              👑 Admin Dashboard (Emergency Access)
            </button>
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            Note: Some features may not work properly in emergency mode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;