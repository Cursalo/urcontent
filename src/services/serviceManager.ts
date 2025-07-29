// Service Manager
// Centralized service initialization and configuration

import { authService } from './authService';
import { rateLimitService } from './rateLimitService';
import { auditService } from './auditService';
import { analyticsService } from './analyticsService';
import { fileUploadService } from './fileUploadService';
import { userManagementService } from './userManagementService';
import { adminService } from './adminService';
import { enhancedCreatorsService } from './enhancedCreatorsService';
import { enhancedBusinessService } from './enhancedBusinessService';
import { hybridAuthService } from './hybridAuth';
import { profileService } from './profileService';

export interface ServiceConfig {
  environment: 'development' | 'staging' | 'production';
  features: {
    enableMockData: boolean;
    enableRateLimiting: boolean;
    enableAuditLogging: boolean;
    enableAnalytics: boolean;
    enableFileUploads: boolean;
    enablePushNotifications: boolean;
    enableRealTimeUpdates: boolean;
  };
  limits: {
    maxFileUploadSize: number;
    maxRequestsPerMinute: number;
    maxConcurrentUploads: number;
  };
  integrations: {
    supabase: boolean;
    mercadoPago: boolean;
    cloudinary: boolean;
    sendGrid: boolean;
    pusher: boolean;
  };
}

export interface ServiceStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export interface ServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  lastError?: string;
}

class ServiceManager {
  private config: ServiceConfig;
  private initialized = false;
  private serviceStatuses = new Map<string, ServiceStatus>();
  private serviceMetrics = new Map<string, ServiceMetrics>();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  // Initialize all services
  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    if (this.initialized) {
      console.warn('ServiceManager already initialized');
      return;
    }

    try {
      console.log('🚀 ServiceManager: Initializing services...');
      
      // Update config
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize core services in order
      await this.initializeCoreServices();
      await this.initializeEnhancedServices();
      await this.initializeIntegrations();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.initialized = true;
      console.log('✅ ServiceManager: All services initialized successfully');
      
    } catch (error) {
      console.error('❌ ServiceManager: Initialization failed:', error);
      throw error;
    }
  }

  // Get service configuration
  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  // Update service configuration
  async updateConfig(updates: Partial<ServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    console.log('🔧 ServiceManager: Configuration updated');
    
    // Reinitialize services that depend on config changes
    await this.reinitializeConfigDependentServices(updates);
  }

  // Get service health status
  async getServiceHealth(): Promise<Record<string, ServiceStatus>> {
    const healthChecks = await Promise.allSettled([
      this.checkServiceHealth('auth', () => authService.getCurrentSession()),
      this.checkServiceHealth('rateLimit', () => rateLimitService.getAllRateLimits()),
      this.checkServiceHealth('audit', () => auditService.getAuditEvents({}, 1)),
      this.checkServiceHealth('analytics', () => analyticsService.getPlatformMetrics()),
      this.checkServiceHealth('fileUpload', () => fileUploadService.getFileStats()),
      this.checkServiceHealth('userManagement', () => userManagementService.getUserStats()),
      this.checkServiceHealth('admin', () => adminService.performHealthCheck()),
      this.checkServiceHealth('hybridAuth', () => hybridAuthService.getSession()),
      this.checkServiceHealth('profile', () => profileService.getStats()),
    ]);

    const results: Record<string, ServiceStatus> = {};
    
    healthChecks.forEach((result, index) => {
      const serviceName = [
        'auth', 'rateLimit', 'audit', 'analytics', 'fileUpload', 
        'userManagement', 'admin', 'hybridAuth', 'profile'
      ][index];
      
      if (result.status === 'fulfilled') {
        results[serviceName] = result.value;
      } else {
        results[serviceName] = {
          service: serviceName,
          status: 'error',
          lastCheck: new Date().toISOString(),
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    return results;
  }

  // Get service metrics
  getServiceMetrics(): Record<string, ServiceMetrics> {
    const metrics: Record<string, ServiceMetrics> = {};
    
    for (const [service, data] of this.serviceMetrics.entries()) {
      metrics[service] = { ...data };
    }
    
    return metrics;
  }

  // Get overall system status
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: Record<string, ServiceStatus>;
    metrics: Record<string, ServiceMetrics>;
    config: ServiceConfig;
    uptime: number;
  }> {
    const services = await this.getServiceHealth();
    const metrics = this.getServiceMetrics();
    
    // Determine overall status
    const serviceStatuses = Object.values(services);
    const criticalServices = serviceStatuses.filter(s => s.status === 'error');
    const warningServices = serviceStatuses.filter(s => s.status === 'warning');
    
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalServices.length > 0) {
      overallStatus = 'critical';
    } else if (warningServices.length > 0) {
      overallStatus = 'warning';
    }
    
    return {
      status: overallStatus,
      services,
      metrics,
      config: this.config,
      uptime: this.calculateUptime()
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('🛑 ServiceManager: Shutting down services...');
    
    try {
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      // Shutdown services in reverse order
      await Promise.allSettled([
        auditService.destroy(),
        rateLimitService.destroy(),
        // Add other service shutdowns as needed
      ]);
      
      this.initialized = false;
      console.log('✅ ServiceManager: Shutdown complete');
      
    } catch (error) {
      console.error('❌ ServiceManager: Shutdown error:', error);
    }
  }

  // Feature flags
  isFeatureEnabled(feature: keyof ServiceConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Service discovery
  getAvailableServices(): string[] {
    return [
      'auth',
      'userManagement', 
      'creators',
      'business',
      'collaborations',
      'payments',
      'analytics',
      'fileUpload',
      'notifications',
      'admin',
      'audit',
      'rateLimit'
    ];
  }

  // Private methods
  private getDefaultConfig(): ServiceConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return {
      environment: (process.env.NODE_ENV as any) || 'development',
      features: {
        enableMockData: isDevelopment || import.meta.env.VITE_USE_MOCK_DATA === 'true',
        enableRateLimiting: !isDevelopment,
        enableAuditLogging: true,
        enableAnalytics: true,
        enableFileUploads: true,
        enablePushNotifications: isProduction,
        enableRealTimeUpdates: true
      },
      limits: {
        maxFileUploadSize: 10 * 1024 * 1024, // 10MB
        maxRequestsPerMinute: isDevelopment ? 1000 : 100,
        maxConcurrentUploads: 3
      },
      integrations: {
        supabase: !!import.meta.env.VITE_SUPABASE_URL,
        mercadoPago: !!import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
        cloudinary: !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        sendGrid: !!import.meta.env.VITE_SENDGRID_API_KEY,
        pusher: !!import.meta.env.VITE_PUSHER_APP_KEY
      }
    };
  }

  private async initializeCoreServices(): Promise<void> {
    console.log('🔧 Initializing core services...');
    
    // Initialize rate limiting first
    if (this.config.features.enableRateLimiting) {
      await rateLimitService.initialize();
      this.updateServiceMetrics('rateLimit', { success: true });
    }
    
    // Initialize audit logging
    if (this.config.features.enableAuditLogging) {
      await auditService.initialize();
      this.updateServiceMetrics('audit', { success: true });
    }
    
    // Initialize authentication
    await authService.initialize();
    this.updateServiceMetrics('auth', { success: true });
  }

  private async initializeEnhancedServices(): Promise<void> {
    console.log('🔧 Initializing enhanced services...');
    
    // These services don't need explicit initialization currently
    // but we track their availability
    this.updateServiceMetrics('userManagement', { success: true });
    this.updateServiceMetrics('analytics', { success: true });
    this.updateServiceMetrics('fileUpload', { success: true });
    this.updateServiceMetrics('admin', { success: true });
    this.updateServiceMetrics('creators', { success: true });
    this.updateServiceMetrics('business', { success: true });
  }

  private async initializeIntegrations(): Promise<void> {
    console.log('🔧 Initializing integrations...');
    
    // Check integration availability
    const integrations = this.config.integrations;
    
    if (integrations.supabase) {
      console.log('✅ Supabase integration enabled');
    }
    
    if (integrations.mercadoPago) {
      console.log('✅ MercadoPago integration enabled');
    }
    
    if (integrations.cloudinary) {
      console.log('✅ Cloudinary integration enabled');
    }
  }

  private async reinitializeConfigDependentServices(updates: Partial<ServiceConfig>): Promise<void> {
    // Reinitialize services that depend on changed config
    if (updates.features?.enableRateLimiting !== undefined) {
      if (updates.features.enableRateLimiting) {
        await rateLimitService.initialize();
      } else {
        await rateLimitService.destroy();
      }
    }
    
    if (updates.features?.enableAuditLogging !== undefined) {
      if (updates.features.enableAuditLogging) {
        await auditService.initialize();
      } else {
        await auditService.destroy();
      }
    }
  }

  private startHealthMonitoring(): void {
    // Perform health checks every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.getServiceHealth();
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 5 * 60 * 1000);
    
    console.log('💓 ServiceManager: Health monitoring started');
  }

  private async checkServiceHealth(
    serviceName: string,
    healthCheck: () => Promise<any>
  ): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      await Promise.race([
        healthCheck(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        )
      ]);
      
      const responseTime = Date.now() - startTime;
      const status: ServiceStatus = {
        service: serviceName,
        status: responseTime > 2000 ? 'warning' : 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime
      };
      
      this.serviceStatuses.set(serviceName, status);
      this.updateServiceMetrics(serviceName, { success: true, responseTime });
      
      return status;
    } catch (error: any) {
      const status: ServiceStatus = {
        service: serviceName,
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      
      this.serviceStatuses.set(serviceName, status);
      this.updateServiceMetrics(serviceName, { success: false, error: error.message });
      
      return status;
    }
  }

  private updateServiceMetrics(
    serviceName: string,
    update: { success: boolean; responseTime?: number; error?: string }
  ): void {
    const existing = this.serviceMetrics.get(serviceName) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      uptime: 100
    };
    
    const updated: ServiceMetrics = {
      ...existing,
      totalRequests: existing.totalRequests + 1,
      successfulRequests: update.success ? existing.successfulRequests + 1 : existing.successfulRequests,
      failedRequests: update.success ? existing.failedRequests : existing.failedRequests + 1,
      averageResponseTime: update.responseTime ? 
        (existing.averageResponseTime + update.responseTime) / 2 : 
        existing.averageResponseTime,
      uptime: (existing.successfulRequests / existing.totalRequests) * 100,
      lastError: update.error
    };
    
    this.serviceMetrics.set(serviceName, updated);
  }

  private calculateUptime(): number {
    // Calculate uptime since initialization
    const now = Date.now();
    const startTime = this.serviceMetrics.get('auth')?.totalRequests ? 
      now - (this.serviceMetrics.get('auth')!.totalRequests * 1000) : 
      now;
    
    return (now - startTime) / 1000; // seconds
  }
}

// Singleton instance
export const serviceManager = new ServiceManager();

// Auto-initialize in development
if (import.meta.env.DEV) {
  serviceManager.initialize().catch(console.error);
}

export default serviceManager;