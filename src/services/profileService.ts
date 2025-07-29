// Enhanced Profile Service
// Handles profile creation, fetching, and updates with robust error handling
// Includes retry logic and graceful fallbacks for database issues

import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { User } from '@supabase/supabase-js';

type UserProfile = Tables<'users'>;
type UserProfileInsert = TablesInsert<'users'>;
type UserProfileUpdate = TablesUpdate<'users'>;
type UserRole = 'creator' | 'business' | 'admin';

export interface ProfileCreationResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
  code?: string;
  created?: boolean;
}

export interface ProfileServiceOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

class ProfileService {
  private options: Required<ProfileServiceOptions>;

  constructor(options: ProfileServiceOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      enableLogging: options.enableLogging ?? true,
    };
  }

  private log(message: string, data?: any) {
    if (this.options.enableLogging) {
      console.log(`[ProfileService] ${message}`, data || '');
    }
  }

  private logError(message: string, error?: any) {
    if (this.options.enableLogging) {
      console.error(`[ProfileService] ${message}`, error || '');
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Safely get or create user profile using database function
   * This bypasses RLS issues and handles race conditions
   */
  async getOrCreateProfile(
    userId: string, 
    email: string, 
    fullName?: string, 
    role: UserRole = 'creator'
  ): Promise<ProfileCreationResult> {
    this.log('Getting or creating profile', { userId, email, role });

    try {
      // Use our robust database function that handles RLS and race conditions
      const { data, error } = await supabase.rpc('get_or_create_user_profile', {
        user_id: userId,
        user_email: email,
        full_name: fullName || 'User',
        user_role: role
      });

      if (error) {
        this.logError('Database function call failed', error);
        
        // Fallback to direct database operations
        return await this.fallbackProfileCreation(userId, email, fullName, role);
      }

      if (data?.success) {
        this.log('Profile operation successful', { 
          created: data.created, 
          userId 
        });
        
        return {
          success: true,
          profile: data.profile,
          created: data.created
        };
      } else {
        this.logError('Database function returned error', data);
        return {
          success: false,
          error: data?.error || 'Unknown database function error',
          code: data?.code
        };
      }
    } catch (error: any) {
      this.logError('Unexpected error in getOrCreateProfile', error);
      
      // Final fallback
      return await this.fallbackProfileCreation(userId, email, fullName, role);
    }
  }

  /**
   * Fallback profile creation when database function fails
   */
  private async fallbackProfileCreation(
    userId: string,
    email: string,
    fullName?: string,
    role: UserRole = 'creator'
  ): Promise<ProfileCreationResult> {
    this.log('Using fallback profile creation', { userId });

    // First try to fetch existing profile
    const existingProfile = await this.getProfile(userId);
    if (existingProfile.success && existingProfile.profile) {
      this.log('Found existing profile in fallback', { userId });
      return existingProfile;
    }

    // Try to create new profile with retries
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        this.log(`Fallback creation attempt ${attempt}`, { userId });

        const profileData: UserProfileInsert = {
          id: userId,
          email: email,
          full_name: fullName || 'User',
          role: role,
        };

        const { data, error } = await supabase
          .from('users')
          .insert(profileData)
          .select()
          .single();

        if (error) {
          // Handle specific error types
          if (error.code === '23505') { // Unique constraint violation
            this.log('Profile already exists (race condition)', { userId });
            // Try to fetch the existing profile
            const existingProfile = await this.getProfile(userId);
            if (existingProfile.success) {
              return existingProfile;
            }
          }

          if (error.code === '42501') { // RLS policy violation
            this.logError('RLS policy blocking profile creation', { userId, error });
            // Return a temporary profile that allows the user to continue
            return this.createTemporaryProfile(userId, email, fullName, role);
          }

          throw error;
        }

        this.log('Fallback profile creation successful', { userId });
        return {
          success: true,
          profile: data,
          created: true
        };

      } catch (error: any) {
        this.logError(`Fallback attempt ${attempt} failed`, { userId, error: error.message });
        
        if (attempt === this.options.maxRetries) {
          // Last attempt failed, return temporary profile
          this.logError('All fallback attempts failed, using temporary profile', { userId });
          return this.createTemporaryProfile(userId, email, fullName, role);
        }

        // Wait before retry
        await this.sleep(this.options.retryDelay * attempt);
      }
    }

    // Should never reach here, but return temporary profile as safety
    return this.createTemporaryProfile(userId, email, fullName, role);
  }

  /**
   * Create a temporary in-memory profile when database operations fail
   * This allows users to continue using the app even if profile creation fails
   */
  private createTemporaryProfile(
    userId: string,
    email: string,
    fullName?: string,
    role: UserRole = 'creator'
  ): ProfileCreationResult {
    this.log('Creating temporary profile', { userId });

    const temporaryProfile: UserProfile = {
      id: userId,
      email: email,
      role: role,
      full_name: fullName || 'User',
      username: null,
      avatar_url: null,
      phone: null,
      location: null,
      timezone: 'America/Argentina/Buenos_Aires',
      language: 'es',
      is_verified: false,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: null,
      last_seen_at: new Date().toISOString(),
    };

    return {
      success: true,
      profile: temporaryProfile,
      created: true,
      error: 'Using temporary profile due to database issues'
    };
  }

  /**
   * Get user profile with retry logic
   */
  async getProfile(userId: string): Promise<ProfileCreationResult> {
    this.log('Fetching profile', { userId });

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned - profile doesn't exist
            this.log('Profile not found', { userId });
            return {
              success: false,
              error: 'Profile not found',
              code: 'PROFILE_NOT_FOUND'
            };
          }
          throw error;
        }

        this.log('Profile fetched successfully', { userId });
        return {
          success: true,
          profile: data,
          created: false
        };

      } catch (error: any) {
        this.logError(`Profile fetch attempt ${attempt} failed`, { userId, error: error.message });
        
        if (attempt === this.options.maxRetries) {
          return {
            success: false,
            error: error.message || 'Failed to fetch profile after retries',
            code: error.code
          };
        }

        await this.sleep(this.options.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Unexpected error in getProfile'
    };
  }

  /**
   * Update user profile with retry logic
   */
  async updateProfile(userId: string, updates: UserProfileUpdate): Promise<ProfileCreationResult> {
    this.log('Updating profile', { userId, updates });

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        this.log('Profile updated successfully', { userId });
        return {
          success: true,
          profile: data,
          created: false
        };

      } catch (error: any) {
        this.logError(`Profile update attempt ${attempt} failed`, { userId, error: error.message });
        
        if (attempt === this.options.maxRetries) {
          return {
            success: false,
            error: error.message || 'Failed to update profile after retries',
            code: error.code
          };
        }

        await this.sleep(this.options.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Unexpected error in updateProfile'
    };
  }

  /**
   * Handle profile creation for authenticated user
   * Extracts user data from auth and creates profile
   */
  async handleAuthenticatedUser(user: User): Promise<ProfileCreationResult> {
    this.log('Handling authenticated user', { userId: user.id, email: user.email });

    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     'User';
    const role = (user.user_metadata?.role as UserRole) || 'creator';

    return await this.getOrCreateProfile(user.id, user.email!, fullName, role);
  }

  /**
   * Test profile creation (for debugging)
   */
  async testProfileCreation(userId: string = '18e8357e-77cf-40ed-8e20-60f5188c162a'): Promise<any> {
    this.log('Testing profile creation', { userId });

    try {
      const { data, error } = await supabase.rpc('test_profile_creation', {
        test_user_id: userId,
        test_email: 'test@example.com'
      });

      if (error) {
        this.logError('Test profile creation failed', error);
        return { success: false, error: error.message };
      }

      this.log('Test profile creation result', data);
      return data;
    } catch (error: any) {
      this.logError('Test profile creation exception', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      return !error && data !== null;
    } catch (error) {
      this.logError('Error checking profile existence', error);
      return false;
    }
  }

  /**
   * Get profile statistics for debugging
   */
  async getProfileStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Exclude system users

      if (error) throw error;

      const stats = data.reduce((acc: any, user) => {
        acc[user.role || 'unknown'] = (acc[user.role || 'unknown'] || 0) + 1;
        return acc;
      }, {});

      stats.total = data.length;
      return stats;
    } catch (error) {
      this.logError('Error getting profile stats', error);
      return { error: 'Failed to get stats' };
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService({
  maxRetries: 3,
  retryDelay: 1000,
  enableLogging: true
});

export default profileService;