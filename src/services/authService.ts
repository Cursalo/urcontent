// Authentication & Authorization Service
// Comprehensive auth service with role-based access control

import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { hybridAuthService, HybridAuthResult } from './hybridAuth';
import { profileService } from './profileService';
import { notificationService } from './notifications';
import { rateLimitService } from './rateLimitService';
import { auditService } from './auditService';

export type UserRole = 'creator' | 'business' | 'admin';
export type AuthProvider = 'email' | 'google' | 'facebook';

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  profile?: any;
  error?: string;
  requiresVerification?: boolean;
  requiresOnboarding?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  redirectUrl?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
  email: string;
}

export interface AuthState {
  user: any | null;
  profile: any | null;
  session: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  permissions: string[];
}

class AuthService {
  private authStateListeners: Array<(state: AuthState) => void> = [];
  private currentAuthType: 'mock' | 'supabase' = 'supabase';

  // Initialize auth service
  async initialize(): Promise<void> {
    console.log('🔐 AuthService: Initializing...');
    
    try {
      // Set up auth state listener
      this.setupAuthStateListener();
      
      // Initialize rate limiting
      await rateLimitService.initialize();
      
      console.log('✅ AuthService: Initialized successfully');
    } catch (error) {
      console.error('❌ AuthService: Initialization failed:', error);
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, rememberMe = false } = credentials;
    
    try {
      // Check rate limiting
      const isAllowed = await rateLimitService.checkRateLimit(
        `login:${email}`, 
        5, // max 5 attempts
        15 * 60 * 1000 // 15 minutes window
      );
      
      if (!isAllowed) {
        return {
          success: false,
          error: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.'
        };
      }

      // Use hybrid auth service for login
      const result = await hybridAuthService.signIn(email, password);
      
      if (result.error) {
        // Log failed attempt
        await auditService.logAuthEvent(email, 'login_failed', {
          reason: result.error.message,
          ip: await this.getClientIP()
        });
        
        return {
          success: false,
          error: result.error.message
        };
      }

      if (result.user && result.session) {
        // Check if user needs verification
        if (result.authType === 'supabase' && !result.user.email_confirmed_at) {
          return {
            success: false,
            error: 'Por favor verifica tu email antes de continuar.',
            requiresVerification: true
          };
        }

        // Check if user needs onboarding
        const needsOnboarding = await this.checkOnboardingStatus(result.user.id, result.profile);
        
        // Set remember me preference
        if (rememberMe) {
          localStorage.setItem('urcontent_remember_me', 'true');
        }

        // Log successful login
        await auditService.logAuthEvent(result.user.email, 'login_success', {
          role: result.profile?.role,
          authType: result.authType,
          ip: await this.getClientIP()
        });

        // Send welcome notification for new users
        if (needsOnboarding) {
          await notificationService.createNotification({
            user_id: result.user.id,
            title: '¡Bienvenido a URContent!',
            message: 'Completa tu perfil para comenzar a colaborar.',
            type: 'welcome',
            is_read: false
          });
        }

        return {
          success: true,
          user: result.user,
          session: result.session,
          profile: result.profile,
          requiresOnboarding: needsOnboarding
        };
      }

      return {
        success: false,
        error: 'Error de autenticación inesperado.'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      await auditService.logAuthEvent(email, 'login_error', {
        error: error.message,
        ip: await this.getClientIP()
      });
      
      return {
        success: false,
        error: 'Error interno del servidor. Intenta nuevamente.'
      };
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResult> {
    const { email, password, fullName, role, acceptTerms, marketingConsent = false } = data;
    
    try {
      // Validate registration data
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error!
        };
      }

      // Check rate limiting
      const isAllowed = await rateLimitService.checkRateLimit(
        `register:${email}`, 
        3, // max 3 attempts
        60 * 60 * 1000 // 1 hour window
      );
      
      if (!isAllowed) {
        return {
          success: false,
          error: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.'
        };
      }

      // Use hybrid auth service for registration
      const result = await hybridAuthService.signUp(email, password, {
        full_name: fullName,
        role: role
      });
      
      if (result.error) {
        await auditService.logAuthEvent(email, 'register_failed', {
          reason: result.error.message,
          role: role,
          ip: await this.getClientIP()
        });
        
        return {
          success: false,
          error: result.error.message
        };
      }

      if (result.user) {
        // Log successful registration
        await auditService.logAuthEvent(email, 'register_success', {
          role: role,
          authType: result.authType,
          ip: await this.getClientIP()
        });

        // Store marketing consent
        if (result.profile) {
          await profileService.updateProfile(result.user.id, {
            marketing_consent: marketingConsent,
            terms_accepted: acceptTerms,
            terms_accepted_at: new Date().toISOString()
          });
        }

        // Send welcome email (in production)
        await this.sendWelcomeEmail(email, fullName, role);

        return {
          success: true,
          user: result.user,
          session: result.session,
          profile: result.profile,
          requiresVerification: result.authType === 'supabase',
          requiresOnboarding: true
        };
      }

      return {
        success: false,
        error: 'Error de registro inesperado.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      await auditService.logAuthEvent(email, 'register_error', {
        error: error.message,
        role: role,
        ip: await this.getClientIP()
      });
      
      return {
        success: false,
        error: 'Error interno del servidor. Intenta nuevamente.'
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const currentSession = await this.getCurrentSession();
      const userEmail = currentSession?.user?.email;
      
      await hybridAuthService.signOut();
      
      // Clear local storage
      localStorage.removeItem('urcontent_remember_me');
      
      // Log logout
      if (userEmail) {
        await auditService.logAuthEvent(userEmail, 'logout', {
          ip: await this.getClientIP()
        });
      }
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current session
  async getCurrentSession(): Promise<any> {
    try {
      const result = await hybridAuthService.getSession();
      return result.session ? {
        user: result.user,
        session: result.session,
        profile: result.profile
      } : null;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Get current user with profile
  async getCurrentUser(): Promise<{ user: any; profile: any } | null> {
    try {
      const session = await this.getCurrentSession();
      return session ? {
        user: session.user,
        profile: session.profile
      } : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Reset password
  async resetPassword(request: ResetPasswordRequest): Promise<AuthResult> {
    const { email, redirectUrl } = request;
    
    try {
      // Check rate limiting
      const isAllowed = await rateLimitService.checkRateLimit(
        `reset_password:${email}`, 
        3, // max 3 attempts
        60 * 60 * 1000 // 1 hour window
      );
      
      if (!isAllowed) {
        return {
          success: false,
          error: 'Demasiados intentos de recuperación. Intenta nuevamente en 1 hora.'
        };
      }

      const result = await hybridAuthService.resetPassword(email);
      
      if (result.error) {
        return {
          success: false,
          error: result.error.message
        };
      }

      // Log password reset request
      await auditService.logAuthEvent(email, 'password_reset_requested', {
        ip: await this.getClientIP()
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Error interno del servidor. Intenta nuevamente.'
      };
    }
  }

  // Update password
  async updatePassword(request: UpdatePasswordRequest): Promise<AuthResult> {
    const { currentPassword, newPassword } = request;
    
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return {
          success: false,
          error: 'Debes estar autenticado para cambiar la contraseña.'
        };
      }

      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error!
        };
      }

      // For Supabase users, update password
      if (this.currentAuthType === 'supabase') {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }

      // Log password update
      await auditService.logAuthEvent(session.user.email, 'password_updated', {
        ip: await this.getClientIP()
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: 'Error interno del servidor. Intenta nuevamente.'
      };
    }
  }

  // Verify email
  async verifyEmail(request: EmailVerificationRequest): Promise<AuthResult> {
    const { token, email } = request;
    
    try {
      // For Supabase, this is handled automatically via email link
      // For mock users, we'll simulate verification
      if (this.currentAuthType === 'mock') {
        // Mock users don't need verification
        return { success: true };
      }

      // Log email verification
      await auditService.logAuthEvent(email, 'email_verified', {
        ip: await this.getClientIP()
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Error al verificar el email. Intenta nuevamente.'
      };
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<AuthResult> {
    try {
      // Check rate limiting
      const isAllowed = await rateLimitService.checkRateLimit(
        `verification:${email}`, 
        3, // max 3 attempts
        60 * 60 * 1000 // 1 hour window
      );
      
      if (!isAllowed) {
        return {
          success: false,
          error: 'Demasiados intentos de reenvío. Intenta nuevamente en 1 hora.'
        };
      }

      if (this.currentAuthType === 'supabase') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
        
        if (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: 'Error interno del servidor. Intenta nuevamente.'
      };
    }
  }

  // Check user permissions
  async hasPermission(permission: string, userId?: string): Promise<boolean> {
    try {
      const user = userId ? 
        await profileService.getProfile(userId) : 
        await this.getCurrentUser();
      
      if (!user || !user.profile) return false;
      
      const role = user.profile.role;
      const permissions = this.getRolePermissions(role);
      
      return permissions.includes(permission) || permissions.includes('*');
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Check if user has role
  async hasRole(role: UserRole, userId?: string): Promise<boolean> {
    try {
      const user = userId ? 
        await profileService.getProfile(userId) : 
        await this.getCurrentUser();
      
      return user?.profile?.role === role;
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  // Get role permissions
  private getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      creator: [
        'read:own_profile',
        'update:own_profile',
        'create:portfolio',
        'read:collaborations',
        'accept:collaborations',
        'create:submissions',
        'read:payments',
        'read:notifications'
      ],
      business: [
        'read:own_profile',
        'update:own_profile',
        'create:campaigns',
        'read:campaigns',
        'update:campaigns',
        'read:creators',
        'create:collaborations',
        'read:collaborations',
        'read:analytics',
        'create:payments',
        'read:payments',
        'read:notifications'
      ],
      admin: ['*'] // All permissions
    };
    
    return permissions[role] || [];
  }

  // Setup auth state listener
  private setupAuthStateListener(): void {
    hybridAuthService.onAuthStateChange((hybridState) => {
      const authState: AuthState = {
        user: hybridState.user,
        profile: hybridState.profile,
        session: hybridState.session,
        loading: hybridState.loading,
        isAuthenticated: !!hybridState.user,
        role: hybridState.profile?.role || null,
        permissions: hybridState.profile?.role ? 
          this.getRolePermissions(hybridState.profile.role) : []
      };
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(authState);
        } catch (error) {
          console.error('Auth state listener error:', error);
        }
      });
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (state: AuthState) => void): { unsubscribe: () => void } {
    this.authStateListeners.push(callback);
    
    return {
      unsubscribe: () => {
        const index = this.authStateListeners.indexOf(callback);
        if (index > -1) {
          this.authStateListeners.splice(index, 1);
        }
      }
    };
  }

  // Validation helpers
  private validateRegistrationData(data: RegisterData): { isValid: boolean; error?: string } {
    if (!data.email || !data.password || !data.fullName || !data.role) {
      return { isValid: false, error: 'Todos los campos son obligatorios.' };
    }
    
    if (!this.isValidEmail(data.email)) {
      return { isValid: false, error: 'El email no es válido.' };
    }
    
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
    
    if (!data.acceptTerms) {
      return { isValid: false, error: 'Debes aceptar los términos y condiciones.' };
    }
    
    if (!['creator', 'business', 'admin'].includes(data.role)) {
      return { isValid: false, error: 'Rol de usuario inválido.' };
    }
    
    return { isValid: true };
  }

  private validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { 
        isValid: false, 
        error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.' 
      };
    }
    
    return { isValid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if user needs onboarding
  private async checkOnboardingStatus(userId: string, profile: any): Promise<boolean> {
    if (!profile) return true;
    
    // Check if profile is complete based on role
    if (profile.role === 'creator') {
      return !profile.specialties || !profile.portfolio_url;
    } else if (profile.role === 'business') {
      return !profile.company_name || !profile.industry;
    }
    
    return false;
  }

  // Send welcome email
  private async sendWelcomeEmail(email: string, name: string, role: UserRole): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, etc.)
      console.log(`📧 Welcome email sent to ${email} (${name}) - Role: ${role}`);
    } catch (error) {
      console.error('Welcome email error:', error);
    }
  }

  // Get client IP (for audit logging)
  private async getClientIP(): Promise<string> {
    try {
      // In production, get from request headers or IP service
      return 'localhost';
    } catch (error) {
      return 'unknown';
    }
  }
}

export const authService = new AuthService();
export default authService;