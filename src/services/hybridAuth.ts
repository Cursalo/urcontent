// Hybrid Authentication Service
// Intelligently routes users between mock and real Supabase authentication
// Provides seamless experience for both test users and real users

import { AuthError, User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { mockAuthService, MockAuthResult, shouldUseMockAuthForUser, detectUserAuthType } from './mockAuth';
import { validateCredentials, MockUser, createMockSession, MockSession } from '@/data/mockUsers';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'users'>;
type UserRole = 'creator' | 'business' | 'admin';

export interface HybridAuthResult {
  user?: User | MockUser;
  session?: Session | MockSession;
  profile?: UserProfile | MockUser;
  error?: AuthError | { message: string };
  authType: 'mock' | 'supabase';
}

export interface HybridAuthState {
  user: User | MockUser | null;
  profile: UserProfile | MockUser | null;
  session: Session | MockSession | null;
  loading: boolean;
  authType: 'mock' | 'supabase';
}

class HybridAuthService {
  private currentAuthType: 'mock' | 'supabase' = 'supabase';
  private listeners: Array<(state: HybridAuthState) => void> = [];

  // Smart sign in - detects user type and routes appropriately
  async signIn(email: string, password: string): Promise<HybridAuthResult> {
    const authType = detectUserAuthType(email);
    this.currentAuthType = authType;

    console.log(`🔐 Hybrid Auth: Detected ${authType} auth for ${email}`);

    if (authType === 'mock') {
      return this.handleMockSignIn(email, password);
    } else {
      return this.handleSupabaseSignIn(email, password);
    }
  }

  // Smart sign up - routes to appropriate system
  async signUp(email: string, password: string, userData: { full_name: string; role: UserRole }): Promise<HybridAuthResult> {
    const authType = detectUserAuthType(email);
    this.currentAuthType = authType;

    if (authType === 'mock') {
      return {
        error: { message: 'Mock users cannot sign up. Use existing test accounts.' },
        authType: 'mock'
      };
    } else {
      return this.handleSupabaseSignUp(email, password, userData);
    }
  }

  // Smart session retrieval
  async getSession(): Promise<HybridAuthResult> {
    // First try to get any existing session
    const mockSession = await this.getMockSession();
    const supabaseSession = await this.getSupabaseSession();

    // Prioritize mock session if it exists and is valid
    if (mockSession.session && mockSession.user) {
      console.log('🔐 Hybrid Auth: Using mock session');
      return {
        ...mockSession,
        authType: 'mock'
      };
    }

    // Use Supabase session if available
    if (supabaseSession.session && supabaseSession.user) {
      console.log('🔐 Hybrid Auth: Using Supabase session');
      return {
        ...supabaseSession,
        authType: 'supabase'
      };
    }

    // No valid session found
    return {
      user: null,
      session: null,
      profile: null,
      authType: 'supabase'
    };
  }

  // Smart sign out - handles both types
  async signOut(): Promise<void> {
    // Clear both types of sessions to be safe
    await Promise.allSettled([
      mockAuthService.signOut(),
      supabase.auth.signOut()
    ]);
    
    console.log('🔐 Hybrid Auth: Signed out from both systems');
  }

  // Password reset routing
  async resetPassword(email: string): Promise<HybridAuthResult> {
    const authType = detectUserAuthType(email);

    if (authType === 'mock') {
      const result = await mockAuthService.resetPassword(email);
      return {
        error: result.error ? { message: result.error.message } : undefined,
        authType: 'mock'
      };
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return {
        error: error || undefined,
        authType: 'supabase'
      };
    }
  }

  // Profile updates with hybrid support
  async updateProfile(userId: string, updates: Partial<UserProfile>, authType?: 'mock' | 'supabase'): Promise<HybridAuthResult> {
    const currentAuthType = authType || this.currentAuthType;

    if (currentAuthType === 'mock') {
      const result = await mockAuthService.updateProfile(userId, updates);
      return {
        user: result.user,
        profile: result.user,
        error: result.error ? { message: result.error.message } : undefined,
        authType: 'mock'
      };
    } else {
      try {
        // Use profile service for robust updates
        const { profileService } = await import('./profileService');
        const result = await profileService.updateProfile(userId, updates);

        if (result.success && result.profile) {
          return {
            profile: result.profile,
            authType: 'supabase'
          };
        } else {
          return {
            error: { message: result.error || 'Profile update failed' },
            authType: 'supabase'
          };
        }
      } catch (error: any) {
        return {
          error: { message: error.message || 'Profile update failed' },
          authType: 'supabase'
        };
      }
    }
  }

  // Private helper methods
  private async handleMockSignIn(email: string, password: string): Promise<HybridAuthResult> {
    try {
      const result = await mockAuthService.signIn(email, password);
      
      if (result.error) {
        return {
          error: { message: result.error.message },
          authType: 'mock'
        };
      }

      if (result.user && result.session) {
        console.log('✅ Mock Auth: Sign in successful');
        return {
          user: result.user,
          session: result.session,
          profile: result.user, // Use user as profile for mock
          authType: 'mock'
        };
      }

      return {
        error: { message: 'Mock authentication failed' },
        authType: 'mock'
      };
    } catch (error: any) {
      return {
        error: { message: error.message || 'Mock authentication error' },
        authType: 'mock'
      };
    }
  }

  private async handleSupabaseSignIn(email: string, password: string): Promise<HybridAuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          error: error,
          authType: 'supabase'
        };
      }

      if (data.user && data.session) {
        console.log('✅ Supabase Auth: Sign in successful');
        
        // Try to fetch profile
        const profile = await this.fetchUserProfile(data.user.id);
        
        return {
          user: data.user,
          session: data.session,
          profile: profile,
          authType: 'supabase'
        };
      }

      return {
        error: { message: 'Supabase authentication failed' },
        authType: 'supabase'
      };
    } catch (error: any) {
      console.error('Supabase sign in error:', error);
      return {
        error: { message: error.message || 'Supabase authentication error' },
        authType: 'supabase'
      };
    }
  }

  private async handleSupabaseSignUp(email: string, password: string, userData: { full_name: string; role: UserRole }): Promise<HybridAuthResult> {
    try {
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

      if (error) {
        return {
          error: error,
          authType: 'supabase'
        };
      }

      if (data.user) {
        console.log('✅ Supabase Auth: Sign up successful');
        
        // Use profile service to create profile robustly
        try {
          const { profileService } = await import('./profileService');
          const profileResult = await profileService.getOrCreateProfile(
            data.user.id,
            data.user.email!,
            userData.full_name,
            userData.role
          );

          if (profileResult.success) {
            console.log(`✅ Profile ${profileResult.created ? 'created' : 'exists'} for new user`);
            return {
              user: data.user,
              session: data.session,
              profile: profileResult.profile,
              authType: 'supabase'
            };
          } else {
            console.warn('❌ Profile creation failed during signup:', profileResult.error);
            // Still return successful auth - profile can be created later
            return {
              user: data.user,
              session: data.session,
              authType: 'supabase'
            };
          }
        } catch (profileError) {
          console.warn('❌ Profile service exception during signup:', profileError);
          // Still return successful auth - profile can be created later
          return {
            user: data.user,
            session: data.session,
            authType: 'supabase'
          };
        }
      }

      return {
        error: { message: 'Supabase sign up failed' },
        authType: 'supabase'
      };
    } catch (error: any) {
      return {
        error: { message: error.message || 'Supabase sign up error' },
        authType: 'supabase'
      };
    }
  }

  private async getMockSession(): Promise<{ user?: MockUser; session?: MockSession; profile?: MockUser }> {
    try {
      const { session } = await mockAuthService.getSession();
      if (!session) return {};

      const { user } = await mockAuthService.getUser();
      if (!user) return {};

      return {
        user,
        session,
        profile: user // Use user as profile for mock
      };
    } catch (error) {
      console.warn('Error getting mock session:', error);
      return {};
    }
  }

  private async getSupabaseSession(): Promise<{ user?: User; session?: Session; profile?: UserProfile }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return {};
      }

      const profile = await this.fetchUserProfile(session.user.id);

      return {
        user: session.user,
        session,
        profile
      };
    } catch (error) {
      console.warn('Error getting Supabase session:', error);
      return {};
    }
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Import profile service here to avoid circular dependencies
      const { profileService } = await import('./profileService');
      
      // First, get user data from auth metadata for profile creation
      const { data: authUser } = await supabase.auth.getUser();
      const userMetadata = authUser?.user?.user_metadata;
      
      if (!authUser?.user) {
        console.warn('No authenticated user found for profile fetch');
        return null;
      }

      // Use the enhanced profile service to handle all edge cases
      const result = await profileService.getOrCreateProfile(
        userId,
        authUser.user.email!,
        userMetadata?.full_name || userMetadata?.name || 'User',
        (userMetadata?.role as UserRole) || 'creator'
      );

      if (result.success && result.profile) {
        console.log(`✅ Profile ${result.created ? 'created' : 'fetched'} successfully for user ${userId}`);
        return result.profile;
      } else {
        console.warn('❌ Profile service failed:', result.error);
        
        // The profile service already handles fallbacks, but if it still fails,
        // we'll return null to indicate the profile couldn't be loaded
        return null;
      }
    } catch (error) {
      console.error('❌ Unexpected error in fetchUserProfile:', error);
      return null;
    }
  }

  // Auth state change listener for compatibility
  onAuthStateChange(callback: (state: HybridAuthState) => void) {
    this.listeners.push(callback);

    // Initial state
    this.getSession().then(result => {
      callback({
        user: result.user || null,
        profile: result.profile || null,
        session: result.session || null,
        loading: false,
        authType: result.authType
      });
    });

    // Listen to Supabase changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (this.currentAuthType === 'supabase') {
        const profile = session?.user ? await this.fetchUserProfile(session.user.id) : null;
        
        callback({
          user: session?.user || null,
          profile,
          session,
          loading: false,
          authType: 'supabase'
        });
      }
    });

    // Return unsubscribe function
    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
        subscription.unsubscribe();
      }
    };
  }

  // Get current auth type
  getCurrentAuthType(): 'mock' | 'supabase' {
    return this.currentAuthType;
  }

  // Force auth type (for testing)
  setAuthType(type: 'mock' | 'supabase'): void {
    this.currentAuthType = type;
  }
}

export const hybridAuthService = new HybridAuthService();
export default hybridAuthService;