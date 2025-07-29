import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { mockAuthService, shouldUseMockAuth } from '@/services/mockAuth';
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
  const [useMockAuth] = useState(shouldUseMockAuth());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set a timeout for the entire initialization process
        const initTimeout = setTimeout(() => {
          console.warn('Auth initialization timeout - setting loading to false');
          setLoading(false);
        }, 10000); // 10 second timeout

        if (useMockAuth) {
          // Use mock authentication
          console.log('Using mock authentication system');
          const { session: mockSession } = await mockAuthService.getSession();
          const { user: mockUser } = await mockAuthService.getUser();
          
          if (mockSession && mockUser) {
            // Convert mock session to Session-like object
            const sessionLike = {
              ...mockSession,
              token_type: 'bearer',
              user: {
                id: mockUser.id,
                email: mockUser.email,
                user_metadata: {
                  full_name: mockUser.full_name,
                  role: mockUser.role
                },
                created_at: mockUser.created_at
              }
            } as Session;
            
            setSession(sessionLike);
            setUser(mockUser as ExtendedUser);
            setProfile(mockUser);
          }
          
          setLoading(false);
          clearTimeout(initTimeout);
          return;
        }

        // Original Supabase authentication
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }

        clearTimeout(initTimeout);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    if (!useMockAuth) {
      // Listen for auth changes (Supabase only)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [useMockAuth]);

  const fetchUserProfile = async (userId: string) => {
    const fetchTimeout = setTimeout(() => {
      console.warn('Profile fetch timeout - setting loading to false');
      setLoading(false);
    }, 8000); // 8 second timeout for profile fetch

    try {
      setLoading(true);
      
      // First, get user data from auth.users metadata as fallback
      const { data: authUser } = await supabase.auth.getUser();
      const userMetadata = authUser?.user?.user_metadata;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Handle specific error cases
        if (error.code === '42P01') {
          console.warn('Users table does not exist. Please run the database setup script.');
        } else if (error.code === '42P17') {
          console.warn('RLS policy recursion detected. Please fix the database policies.');
        } else if (error.code === 'PGRST116') {
          console.warn('User profile not found in users table.');
        }
        
        // If we can't get profile from database but have auth metadata, create a fallback profile
        if (userMetadata && authUser?.user) {
          const fallbackProfile = {
            id: authUser.user.id,
            email: authUser.user.email!,
            full_name: userMetadata.full_name || 'User',
            role: (userMetadata.role as UserRole) || 'creator',
            username: null,
            avatar_url: null,
            phone: null,
            location: null,
            timezone: null,
            language: null,
            is_verified: false,
            verification_status: 'pending' as const,
            created_at: authUser.user.created_at,
            updated_at: null,
            last_seen_at: null,
          };
          
          console.warn('Using fallback profile from auth metadata:', fallbackProfile);
          setProfile(fallbackProfile);
        } else {
          // Set profile to null instead of undefined to prevent infinite loops
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      setProfile(null);
    } finally {
      clearTimeout(fetchTimeout);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: UserRole }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
        },
      },
    });

    if (!error && data.user) {
      // Try to create user profile in our users table
      // If this fails due to RLS policy issues, we'll handle it gracefully
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: userData.full_name,
            role: userData.role,
          });

        if (profileError) {
          console.warn('User profile creation failed (RLS policy issue):', profileError);
          // Don't block signup for RLS issues - user can still authenticate
          if (profileError.code === '42P17') {
            console.warn('RLS policy recursion detected. User authenticated but profile creation failed.');
            console.warn('Please run the database setup script to fix RLS policies.');
          }
        }
      } catch (profileError) {
        console.warn('Failed to create user profile, but authentication succeeded:', profileError);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (useMockAuth) {
      const result = await mockAuthService.signIn(email, password);
      
      if (result.error) {
        return { error: { message: result.error.message } as AuthError };
      }
      
      if (result.user && result.session) {
        // Convert mock session to Session-like object
        const sessionLike = {
          ...result.session,
          token_type: 'bearer',
          user: {
            id: result.user.id,
            email: result.user.email,
            user_metadata: {
              full_name: result.user.full_name,
              role: result.user.role
            },
            created_at: result.user.created_at
          }
        } as Session;
        
        setSession(sessionLike);
        setUser(result.user as ExtendedUser);
        setProfile(result.user);
      }
      
      return { error: null };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (useMockAuth) {
      await mockAuthService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (useMockAuth) {
      const result = await mockAuthService.resetPassword(email);
      return { error: result.error ? { message: result.error.message } as AuthError : null };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    if (useMockAuth) {
      const result = await mockAuthService.updateProfile(user.id, updates);
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (result.user) {
        setProfile(result.user);
      }
      return;
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    // Refresh profile
    await fetchUserProfile(user.id);
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