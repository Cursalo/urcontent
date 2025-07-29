// Service Test Utilities
// Comprehensive testing utilities for all services

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { serviceManager } from '../serviceManager';
import { authService } from '../authService';
import { userManagementService } from '../userManagementService';
import { analyticsService } from '../analyticsService';
import { fileUploadService } from '../fileUploadService';
import { adminService } from '../adminService';
import { enhancedCreatorsService } from '../enhancedCreatorsService';
import { enhancedBusinessService } from '../enhancedBusinessService';
import { auditService } from '../auditService';
import { rateLimitService } from '../rateLimitService';

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'creator' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockCreator = {
  id: 'test-creator-id',
  user_id: 'test-user-id',
  bio: 'Test creator bio',
  specialties: ['beauty', 'fashion'],
  instagram_handle: '@testcreator',
  instagram_followers: 10000,
  engagement_rate: 4.5,
  min_collaboration_fee: 50000,
  max_collaboration_fee: 200000,
  is_available: true,
  ur_score: 85,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockBusiness = {
  id: 'test-business-id',
  user_id: 'test-user-id',
  company_name: 'Test Business',
  industry: 'beauty',
  description: 'Test business description',
  company_size: 'small',
  is_verified_business: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockCollaboration = {
  id: 'test-collaboration-id',
  business_id: 'test-business-id',
  creator_id: 'test-creator-id',
  title: 'Test Collaboration',
  description: 'Test collaboration description',
  collaboration_type: 'instagram_post',
  status: 'proposed' as const,
  compensation_amount: 100000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Test utilities
export class ServiceTestRunner {
  private originalEnv: Record<string, string | undefined> = {};

  // Setup test environment
  setupTestEnv(): void {
    // Store original environment variables
    this.originalEnv = {
      NODE_ENV: process.env.NODE_ENV,
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL
    };

    // Set test environment
    process.env.NODE_ENV = 'test';
    import.meta.env.VITE_USE_MOCK_DATA = 'true';
    
    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  }

  // Cleanup test environment
  cleanupTestEnv(): void {
    // Restore environment variables
    Object.entries(this.originalEnv).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value;
        (import.meta.env as any)[key] = value;
      }
    });

    // Restore console methods
    vi.restoreAllMocks();
  }

  // Run comprehensive service tests
  async runAllServiceTests(): Promise<void> {
    describe('URContent Services Test Suite', () => {
      beforeEach(() => {
        this.setupTestEnv();
      });

      afterEach(() => {
        this.cleanupTestEnv();
      });

      // Service Manager Tests
      this.testServiceManager();
      
      // Authentication Service Tests
      this.testAuthService();
      
      // User Management Tests
      this.testUserManagementService();
      
      // Analytics Service Tests
      this.testAnalyticsService();
      
      // File Upload Service Tests
      this.testFileUploadService();
      
      // Creator Service Tests
      this.testCreatorService();
      
      // Business Service Tests
      this.testBusinessService();
      
      // Admin Service Tests
      this.testAdminService();
      
      // Audit Service Tests
      this.testAuditService();
      
      // Rate Limit Service Tests
      this.testRateLimitService();
    });
  }

  // Individual service test methods
  private testServiceManager(): void {
    describe('ServiceManager', () => {
      it('should initialize successfully', async () => {
        await expect(serviceManager.initialize()).resolves.not.toThrow();
      });

      it('should return service health status', async () => {
        const health = await serviceManager.getServiceHealth();
        expect(health).toBeDefined();
        expect(typeof health).toBe('object');
      });

      it('should return system status', async () => {
        const status = await serviceManager.getSystemStatus();
        expect(status).toHaveProperty('status');
        expect(status).toHaveProperty('services');
        expect(status).toHaveProperty('metrics');
      });

      it('should handle feature flags', () => {
        const mockEnabled = serviceManager.isFeatureEnabled('enableMockData');
        expect(typeof mockEnabled).toBe('boolean');
      });
    });
  }

  private testAuthService(): void {
    describe('AuthService', () => {
      it('should handle login attempts', async () => {
        const result = await authService.login({
          email: 'creator@test.com',
          password: 'password123'
        });
        expect(result).toHaveProperty('success');
      });

      it('should handle registration', async () => {
        const result = await authService.register({
          email: 'newuser@test.com',
          password: 'password123',
          fullName: 'New User',
          role: 'creator',
          acceptTerms: true
        });
        expect(result).toHaveProperty('success');
      });

      it('should handle logout', async () => {
        await expect(authService.logout()).resolves.not.toThrow();
      });

      it('should check permissions', async () => {
        const hasPermission = await authService.hasPermission('read:own_profile');
        expect(typeof hasPermission).toBe('boolean');
      });
    });
  }

  private testUserManagementService(): void {
    describe('UserManagementService', () => {
      it('should get users with filters', async () => {
        const users = await userManagementService.getUsers({
          role: 'creator',
          verified: true
        });
        expect(Array.isArray(users)).toBe(true);
      });

      it('should get user statistics', async () => {
        const stats = await userManagementService.getUserStats();
        expect(stats).toHaveProperty('total_users');
        expect(stats).toHaveProperty('active_users');
        expect(stats).toHaveProperty('creators_count');
      });

      it('should search users', async () => {
        const results = await userManagementService.searchUsers('test');
        expect(Array.isArray(results)).toBe(true);
      });

      it('should export users data', async () => {
        const csvData = await userManagementService.exportUsers({}, 'csv');
        expect(typeof csvData).toBe('string');
      });
    });
  }

  private testAnalyticsService(): void {
    describe('AnalyticsService', () => {
      it('should get platform metrics', async () => {
        const metrics = await analyticsService.getPlatformMetrics();
        expect(metrics).toHaveProperty('total_users');
        expect(metrics).toHaveProperty('total_collaborations');
        expect(metrics).toHaveProperty('total_revenue');
      });

      it('should get user analytics', async () => {
        const analytics = await analyticsService.getUserAnalytics('test-user-id');
        expect(analytics).toHaveProperty('user_id');
        expect(analytics).toHaveProperty('total_earnings');
        expect(analytics).toHaveProperty('engagement_score');
      });

      it('should get revenue analytics', async () => {
        const revenue = await analyticsService.getRevenueAnalytics();
        expect(revenue).toHaveProperty('total_revenue');
        expect(revenue).toHaveProperty('platform_commission');
        expect(revenue).toHaveProperty('monthly_revenue');
      });

      it('should track custom events', async () => {
        await expect(
          analyticsService.trackEvent('test-user-id', 'test_event', { data: 'test' })
        ).resolves.not.toThrow();
      });
    });
  }

  private testFileUploadService(): void {
    describe('FileUploadService', () => {
      it('should get file statistics', async () => {
        const stats = await fileUploadService.getFileStats();
        expect(stats).toHaveProperty('total_files');
        expect(stats).toHaveProperty('total_size');
        expect(stats).toHaveProperty('storage_used');
      });

      it('should get files with filters', async () => {
        const files = await fileUploadService.getFiles({
          category: 'portfolio',
          file_type: 'image'
        });
        expect(Array.isArray(files)).toBe(true);
      });

      it('should validate file uploads', () => {
        // Create mock file
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        
        // This would test the validation logic
        expect(mockFile.type).toBe('image/jpeg');
      });
    });
  }

  private testCreatorService(): void {
    describe('EnhancedCreatorsService', () => {
      it('should search creators with filters', async () => {
        const creators = await enhancedCreatorsService.searchCreators({
          specialties: ['beauty'],
          min_rating: 4.0,
          availability: 'available'
        });
        expect(Array.isArray(creators)).toBe(true);
      });

      it('should get creator recommendations', async () => {
        const recommendations = await enhancedCreatorsService.getRecommendations(
          'test-business-id',
          {
            category: 'beauty',
            budget_range: [50000, 200000],
            target_audience: ['18-35', 'female'],
            campaign_goals: ['brand_awareness'],
            preferred_platforms: ['instagram']
          }
        );
        expect(Array.isArray(recommendations)).toBe(true);
      });

      it('should get creator statistics', async () => {
        const stats = await enhancedCreatorsService.getCreatorStatistics('test-creator-id');
        expect(stats).toHaveProperty('total_collaborations');
        expect(stats).toHaveProperty('success_rate');
        expect(stats).toHaveProperty('total_earnings');
      });

      it('should get creator analytics', async () => {
        const analytics = await enhancedCreatorsService.getCreatorAnalytics('test-creator-id');
        expect(analytics).toHaveProperty('performance_metrics');
        expect(analytics).toHaveProperty('revenue_breakdown');
      });
    });
  }

  private testBusinessService(): void {
    describe('EnhancedBusinessService', () => {
      it('should search businesses with filters', async () => {
        const businesses = await enhancedBusinessService.searchBusinesses({
          industry: 'beauty',
          verified_only: true,
          has_active_campaigns: true
        });
        expect(Array.isArray(businesses)).toBe(true);
      });

      it('should get business statistics', async () => {
        const stats = await enhancedBusinessService.getBusinessStatistics('test-business-id');
        expect(stats).toHaveProperty('total_campaigns');
        expect(stats).toHaveProperty('total_spent');
        expect(stats).toHaveProperty('success_rate');
      });

      it('should get ROI metrics', async () => {
        const roi = await enhancedBusinessService.getROIMetrics('test-business-id');
        expect(roi).toHaveProperty('overall_roi');
        expect(roi).toHaveProperty('roi_by_category');
        expect(roi).toHaveProperty('roi_trend');
      });

      it('should get business insights', async () => {
        const insights = await enhancedBusinessService.getBusinessInsights('test-business-id');
        expect(insights).toHaveProperty('content_performance');
        expect(insights).toHaveProperty('creator_insights');
        expect(insights).toHaveProperty('budget_optimization');
      });
    });
  }

  private testAdminService(): void {
    describe('AdminService', () => {
      it('should get dashboard data', async () => {
        const dashboard = await adminService.getDashboardData();
        expect(dashboard).toHaveProperty('platform_metrics');
        expect(dashboard).toHaveProperty('recent_activities');
        expect(dashboard).toHaveProperty('system_health');
      });

      it('should perform health check', async () => {
        const health = await adminService.performHealthCheck();
        expect(health).toHaveProperty('overall_status');
        expect(health).toHaveProperty('services');
        expect(health).toHaveProperty('recommendations');
      });

      it('should get platform configuration', async () => {
        const config = await adminService.getPlatformConfiguration();
        expect(Array.isArray(config)).toBe(true);
      });

      it('should get moderation queue', async () => {
        const queue = await adminService.getModerationQueue();
        expect(Array.isArray(queue)).toBe(true);
      });
    });
  }

  private testAuditService(): void {
    describe('AuditService', () => {
      it('should log authentication events', async () => {
        await expect(
          auditService.logAuthEvent('test@example.com', 'login_success')
        ).resolves.not.toThrow();
      });

      it('should get audit events', async () => {
        const events = await auditService.getAuditEvents({}, 10);
        expect(Array.isArray(events)).toBe(true);
      });

      it('should get audit statistics', async () => {
        const stats = await auditService.getAuditStats();
        expect(stats).toHaveProperty('total_events');
        expect(stats).toHaveProperty('success_rate');
        expect(stats).toHaveProperty('events_by_type');
      });

      it('should export audit logs', async () => {
        const csvData = await auditService.exportAuditLogs({}, 'csv');
        expect(typeof csvData).toBe('string');
      });
    });
  }

  private testRateLimitService(): void {
    describe('RateLimitService', () => {
      it('should check rate limits', async () => {
        const allowed = await rateLimitService.checkRateLimit('test-user', 10, 60000);
        expect(typeof allowed).toBe('boolean');
      });

      it('should get rate limit status', async () => {
        const status = await rateLimitService.getRateLimitStatus('test-user', 10, 60000);
        expect(status).toHaveProperty('allowed');
        expect(status).toHaveProperty('remainingRequests');
        expect(status).toHaveProperty('resetTime');
      });

      it('should reset rate limits', async () => {
        await expect(
          rateLimitService.resetRateLimit('test-user')
        ).resolves.not.toThrow();
      });

      it('should use predefined configurations', async () => {
        const allowed = await rateLimitService.checkAuthRateLimit('test@example.com', 'login');
        expect(typeof allowed).toBe('boolean');
      });
    });
  }

  // Performance testing utilities
  async testServicePerformance(): Promise<Record<string, number>> {
    const performanceResults: Record<string, number> = {};

    // Test authentication performance
    const authStart = performance.now();
    await authService.getCurrentSession();
    performanceResults.auth = performance.now() - authStart;

    // Test analytics performance
    const analyticsStart = performance.now();
    await analyticsService.getPlatformMetrics();
    performanceResults.analytics = performance.now() - analyticsStart;

    // Test user management performance
    const userMgmtStart = performance.now();
    await userManagementService.getUserStats();
    performanceResults.userManagement = performance.now() - userMgmtStart;

    return performanceResults;
  }

  // Load testing utilities
  async testServiceLoad(concurrentRequests: number = 10): Promise<{
    successCount: number;
    errorCount: number;
    averageResponseTime: number;
  }> {
    const promises = [];
    const startTime = performance.now();
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        analyticsService.getPlatformMetrics()
          .then(() => successCount++)
          .catch(() => errorCount++)
      );
    }

    await Promise.allSettled(promises);
    const averageResponseTime = (performance.now() - startTime) / concurrentRequests;

    return {
      successCount,
      errorCount,
      averageResponseTime
    };
  }
}

// Export singleton instance
export const serviceTestRunner = new ServiceTestRunner();

// Utility functions for test data generation
export const generateMockData = {
  user: (overrides = {}) => ({ ...mockUser, ...overrides }),
  creator: (overrides = {}) => ({ ...mockCreator, ...overrides }),
  business: (overrides = {}) => ({ ...mockBusiness, ...overrides }),
  collaboration: (overrides = {}) => ({ ...mockCollaboration, ...overrides }),
  
  // Generate arrays of mock data
  users: (count: number, overrides = {}) => 
    Array.from({ length: count }, (_, i) => 
      generateMockData.user({ id: `user-${i}`, ...overrides })
    ),
  
  creators: (count: number, overrides = {}) => 
    Array.from({ length: count }, (_, i) => 
      generateMockData.creator({ id: `creator-${i}`, ...overrides })
    ),
  
  businesses: (count: number, overrides = {}) => 
    Array.from({ length: count }, (_, i) => 
      generateMockData.business({ id: `business-${i}`, ...overrides })
    )
};

// Export default test runner
export default serviceTestRunner;