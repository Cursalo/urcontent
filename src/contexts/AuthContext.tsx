import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { hybridAuthService } from '@/services/hybridAuth';
import { MockUser } from '@/data/mockUsers';

type UserProfile = Tables<'users'>;
type UserRole = 'creator' | 'business' | 'admin';

// Extended user type that works with both Supabase User and MockUser
interface ExtendedUser extends Partial<User> {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
  created_at?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  profile: UserProfile | MockUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; role: UserRole }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | MockUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState<'mock' | 'supabase'>('supabase');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing Hybrid Authentication System');
        setLoading(true);
        
        // Use hybrid auth service to get session
        const result = await hybridAuthService.getSession();
        
        if (result.user && result.session) {
          console.log(`✅ Hybrid Auth: User authenticated via ${result.authType}`, {
            id: result.user.id,
            email: result.user.email,
            authType: result.authType
          });
          
          setUser(result.user as ExtendedUser);
          setSession(result.session as Session);
          setProfile(result.profile as UserProfile | MockUser);
          setAuthType(result.authType);
        } else {
          console.log('🔐 No active session found');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Hybrid auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to hybrid auth state changes
    const subscription = hybridAuthService.onAuthStateChange((state) => {
      console.log(`🔐 Hybrid Auth state change: ${state.authType}`, {
        hasUser: !!state.user,
        hasProfile: !!state.profile,
        loading: state.loading
      });
      
      setUser(state.user as ExtendedUser);
      setProfile(state.profile);
      setSession(state.session as Session);
      setAuthType(state.authType);
      setLoading(state.loading);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Remove old fetchUserProfile function - handled by hybrid service

  const signUp = async (email: string, password: string, userData: { full_name: string; role: UserRole }) => {
    const result = await hybridAuthService.signUp(email, password, userData);
    
    if (!result.error && result.user) {
      console.log('✅ Hybrid Auth: Sign up successful');
      setUser(result.user as ExtendedUser);
      setSession(result.session as Session);
      setProfile(result.profile as UserProfile | MockUser);
      setAuthType(result.authType);
    }
    
    return { error: result.error as AuthError | null };
  };

  const signIn = async (email: string, password: string) => {
    const result = await hybridAuthService.signIn(email, password);
    
    if (!result.error && result.user) {
      console.log(`✅ Hybrid Auth: Sign in successful via ${result.authType}`);
      setUser(result.user as ExtendedUser);
      setSession(result.session as Session);
      setProfile(result.profile as UserProfile | MockUser);
      setAuthType(result.authType);
    }
    
    return { error: result.error as AuthError | null };
  };

  const signOut = async () => {
    await hybridAuthService.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setAuthType('supabase');
    console.log('✅ Hybrid Auth: Signed out successfully');
  };

  const resetPassword = async (email: string) => {
    const result = await hybridAuthService.resetPassword(email);
    return { error: result.error as AuthError | null };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const result = await hybridAuthService.updateProfile(user.id, updates, authType);
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    if (result.profile) {
      setProfile(result.profile);
      console.log(`✅ Hybrid Auth: Profile updated via ${result.authType}`);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};