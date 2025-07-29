// Mock authentication service to bypass Supabase issues
// Provides immediate testing capability for all 3 user types

import { validateCredentials, createMockSession, MockUser, MockSession } from '@/data/mockUsers';

export interface MockAuthError {
  message: string;
  code?: string;
}

export interface MockAuthResult {
  user?: MockUser;
  session?: MockSession;
  error?: MockAuthError;
}

export interface MockSignUpData {
  full_name: string;
  role: 'creator' | 'business' | 'admin';
}

class MockAuthService {
  private storageKeys = {
    session: 'mock_auth_session',
    user: 'mock_auth_user'
  };

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<MockAuthResult> {
    // Simulate network delay
    await this.delay(500);

    const user = validateCredentials(email, password);
    
    if (!user) {
      return {
        error: {
          message: 'Invalid email or password',
          code: 'invalid_credentials'
        }
      };
    }

    const session = createMockSession(user);
    
    // Store session and user in localStorage
    this.setStoredSession(session);
    this.setStoredUser(user);

    return {
      user,
      session
    };
  }

  // Sign up (simplified for mock - in real app would create new user)
  async signUp(email: string, password: string, userData: MockSignUpData): Promise<MockAuthResult> {
    // Simulate network delay
    await this.delay(800);

    // For mock purposes, we'll reject if user already exists
    const existingUser = validateCredentials(email, password);
    if (existingUser) {
      return {
        error: {
          message: 'User already exists',
          code: 'user_already_exists'
        }
      };
    }

    // In real implementation, this would create a new user
    return {
      error: {
        message: 'Sign up functionality is mocked. Please use existing test accounts.',
        code: 'signup_disabled'
      }
    };
  }

  // Sign out
  async signOut(): Promise<void> {
    await this.delay(200);
    
    localStorage.removeItem(this.storageKeys.session);
    localStorage.removeItem(this.storageKeys.user);
  }

  // Get current session
  async getSession(): Promise<{ session: MockSession | null; error?: MockAuthError }> {
    await this.delay(100);
    
    const session = this.getStoredSession();
    
    if (!session) {
      return { session: null };
    }

    // Check if session is expired
    if (Date.now() > session.expires_at) {
      await this.signOut();
      return { 
        session: null,
        error: {
          message: 'Session expired',
          code: 'session_expired'
        }
      };
    }

    return { session };
  }

  // Get current user
  async getUser(): Promise<{ user: MockUser | null; error?: MockAuthError }> {
    await this.delay(100);
    
    const user = this.getStoredUser();
    const session = this.getStoredSession();

    if (!user || !session) {
      return { user: null };
    }

    // Check if session is still valid
    if (Date.now() > session.expires_at) {
      await this.signOut();
      return { 
        user: null,
        error: {
          message: 'Session expired',
          code: 'session_expired'
        }
      };
    }

    return { user };
  }

  // Reset password (mock)
  async resetPassword(email: string): Promise<MockAuthResult> {
    await this.delay(500);
    
    return {
      error: {
        message: 'Password reset is mocked. Please use existing test accounts.',
        code: 'reset_disabled'
      }
    };
  }

  // Update user profile (mock)
  async updateProfile(userId: string, updates: Partial<MockUser>): Promise<MockAuthResult> {
    await this.delay(300);
    
    const user = this.getStoredUser();
    if (!user || user.id !== userId) {
      return {
        error: {
          message: 'User not found',
          code: 'user_not_found'
        }
      };
    }

    // Update stored user
    const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
    this.setStoredUser(updatedUser);

    return {
      user: updatedUser
    };
  }

  // Auth state change listeners (simplified)
  onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
    // For mock purposes, we'll just call the callback with current session
    const session = this.getStoredSession();
    
    // Simulate initial auth state
    setTimeout(() => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    }, 100);

    // Return unsubscribe function
    return {
      unsubscribe: () => {
        // Mock unsubscribe
      }
    };
  }

  // Private helper methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setStoredSession(session: MockSession): void {
    localStorage.setItem(this.storageKeys.session, JSON.stringify(session));
  }

  private getStoredSession(): MockSession | null {
    try {
      const stored = localStorage.getItem(this.storageKeys.session);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private setStoredUser(user: MockUser): void {
    localStorage.setItem(this.storageKeys.user, JSON.stringify(user));
  }

  private getStoredUser(): MockUser | null {
    try {
      const stored = localStorage.getItem(this.storageKeys.user);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const mockAuthService = new MockAuthService();

// Helper function to check if we should use mock auth
export const shouldUseMockAuth = (): boolean => {
  // Check environment variables
  return import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
         window.location.hostname === 'localhost' ||
         !import.meta.env.VITE_SUPABASE_URL ||
         // For immediate testing, always use mock auth to bypass Supabase issues  
         import.meta.env.MODE === 'development';
};