import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

const Login: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
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
      </div>
    </div>
  );
};

export default Login;