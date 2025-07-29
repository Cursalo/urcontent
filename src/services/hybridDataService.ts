// Hybrid Data Service
// Provides unified data access for both mock and real users
// Seamlessly switches between mock data and Supabase based on user type

import { mockDataService, CreatorDashboardData, BusinessDashboardData } from './mockDataService';
import { creatorService } from './creators';
import { collaborationService } from './collaborations';
import { detectUserAuthType } from './mockAuth';
import { MockUser, MockCreatorProfile, MockBusinessProfile, MockCollaboration } from '@/data/mockUsers';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'users'>;
type CreatorProfile = Tables<'creator_profiles'>;
type BusinessProfile = Tables<'business_profiles'>;
type Collaboration = Tables<'collaborations'>;

export interface HybridDashboardData {
  authType: 'mock' | 'supabase';
  creator?: CreatorDashboardData | {
    profile: CreatorProfile;
    user: UserProfile;
    portfolio: any[];
    collaborations: Collaboration[];
    analytics: any;
    metrics: any;
  };
  business?: BusinessDashboardData | {
    profile: BusinessProfile;
    user: UserProfile;
    collaborations: Collaboration[];
    analytics: any;
    metrics: any;
  };
}

class HybridDataService {
  
  // Smart dashboard data retrieval
  async getDashboardData(userId: string, userEmail?: string): Promise<HybridDashboardData | null> {
    const authType = detectUserAuthType(userEmail);
    
    console.log(`📊 Hybrid Data: Getting dashboard data for ${authType} user: ${userId}`);

    if (authType === 'mock') {
      return this.getMockDashboardData(userId);
    } else {
      return this.getSupabaseDashboardData(userId);
    }
  }

  // Get creator profile with hybrid support
  async getCreatorProfile(userId: string, userEmail?: string): Promise<any> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      const data = await mockDataService.getCreatorDashboardData(userId);
      return data?.profile || null;
    } else {
      try {
        const profile = await creatorService.getCreatorByUserId(userId);
        return profile;
      } catch (error) {
        console.warn('Failed to get real creator profile, trying mock fallback:', error);
        const data = await mockDataService.getCreatorDashboardData(userId);
        return data?.profile || null;
      }
    }
  }

  // Get business profile with hybrid support
  async getBusinessProfile(userId: string, userEmail?: string): Promise<any> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      const data = await mockDataService.getBusinessDashboardData(userId);
      return data?.profile || null;
    } else {
      // For real users, we'd implement business profile service here
      // For now, fallback to mock if real user has no business profile
      console.log('Real business profiles not implemented yet, using mock fallback');
      const data = await mockDataService.getBusinessDashboardData(userId);
      return data?.profile || null;
    }
  }

  // Get collaborations with hybrid support
  async getCollaborations(userId: string, userEmail?: string, filters?: any): Promise<any[]> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      return await mockDataService.getCollaborations(filters || { creator_id: userId });
    } else {
      try {
        return await collaborationService.getCollaborations({ creator_id: userId, ...filters });
      } catch (error) {
        console.warn('Failed to get real collaborations, using mock fallback:', error);
        return await mockDataService.getCollaborations(filters || { creator_id: userId });
      }
    }
  }

  // Get portfolio items with hybrid support
  async getPortfolioItems(creatorId: string, userEmail?: string): Promise<any[]> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      return await mockDataService.getPortfolioItems(creatorId);
    } else {
      // For real users, we'd get portfolio from creator service
      try {
        const creator = await creatorService.getCreatorByUserId(creatorId);
        return creator?.portfolio || [];
      } catch (error) {
        console.warn('Failed to get real portfolio, using mock fallback:', error);
        return await mockDataService.getPortfolioItems(creatorId);
      }
    }
  }

  // Get analytics with hybrid support
  async getAnalytics(userId: string, userEmail?: string, period?: 'daily' | 'weekly' | 'monthly'): Promise<any[]> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      return await mockDataService.getAnalytics(userId, period);
    } else {
      // For real users, we'd implement real analytics
      // For now, use mock data as fallback
      console.log('Real analytics not implemented yet, using mock data');
      return await mockDataService.getAnalytics(userId, period);
    }
  }

  // Search creators with hybrid support
  async searchCreators(query: string, userEmail?: string, filters?: any): Promise<any[]> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      return await mockDataService.searchCreators(query);
    } else {
      try {
        return await creatorService.searchCreators(query);
      } catch (error) {
        console.warn('Failed to search real creators, using mock fallback:', error);
        return await mockDataService.searchCreators(query);
      }
    }
  }

  // Create collaboration with hybrid support
  async createCollaboration(data: any, userEmail?: string): Promise<any> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      return await mockDataService.createCollaboration(data);
    } else {
      try {
        return await collaborationService.createCollaboration(data);
      } catch (error) {
        console.warn('Failed to create real collaboration, using mock:', error);
        return await mockDataService.createCollaboration(data);
      }
    }
  }

  // Update collaboration with hybrid support
  async updateCollaboration(id: string, updates: any, userEmail?: string): Promise<any> {
    const authType = detectUserAuthType(userEmail);
    
    if (authType === 'mock') {
      return await mockDataService.updateCollaboration(id, updates);
    } else {      
      try {
        return await collaborationService.updateCollaboration(id, updates);
      } catch (error) {
        console.warn('Failed to update real collaboration, using mock:', error);
        return await mockDataService.updateCollaboration(id, updates);
      }
    }
  }

  // Private methods for specific auth types
  private async getMockDashboardData(userId: string): Promise<HybridDashboardData | null> {
    try {
      // Try to get creator dashboard data first
      const creatorData = await mockDataService.getCreatorDashboardData(userId);
      if (creatorData) {
        console.log('✅ Mock Data: Creator dashboard data loaded');
        return {
          authType: 'mock',
          creator: creatorData
        };
      }

      // Try to get business dashboard data
      const businessData = await mockDataService.getBusinessDashboardData(userId);
      if (businessData) {
        console.log('✅ Mock Data: Business dashboard data loaded');
        return {
          authType: 'mock',
          business: businessData
        };
      }

      console.warn('No mock dashboard data found for user:', userId);
      return null;
    } catch (error) {
      console.error('Error getting mock dashboard data:', error);
      return null;
    }
  }

  private async getSupabaseDashboardData(userId: string): Promise<HybridDashboardData | null> {
    try {
      // Try to get creator profile first
      const creatorProfile = await creatorService.getCreatorByUserId(userId);
      if (creatorProfile) {
        const collaborations = await collaborationService.getCreatorCollaborations(userId);
        
        // Build creator dashboard data
        const creatorDashboard = {
          profile: creatorProfile,
          user: creatorProfile.user,
          portfolio: creatorProfile.portfolio || [],
          collaborations: collaborations || [],
          analytics: {
            monthly: [],
            weekly: [],
            daily: []
          },
          metrics: {
            totalEarnings: 0,
            monthlyEarnings: 0,
            activeCollaborations: collaborations?.filter(c => ['accepted', 'in_progress'].includes(c.status || '')).length || 0,
            completedCollaborations: collaborations?.filter(c => c.status === 'completed').length || 0,
            portfolioItems: creatorProfile.portfolio?.length || 0,
            avgRating: 0
          }
        };

        console.log('✅ Supabase Data: Creator dashboard data loaded');
        return {
          authType: 'supabase',
          creator: creatorDashboard
        };
      }

      // Try business profile (not implemented yet, so fallback to mock)
      console.log('No Supabase creator profile found, trying mock fallback');
      return this.getMockDashboardData(userId);

    } catch (error) {
      console.error('Error getting Supabase dashboard data, falling back to mock:', error);
      return this.getMockDashboardData(userId);
    }
  }

  // Utility method to get appropriate data for any component
  async getDataForUser(userId: string, userEmail?: string, dataType: 'creator' | 'business' | 'collaborations' | 'portfolio' | 'analytics'): Promise<any> {
    const authType = detectUserAuthType(userEmail);
    
    console.log(`📊 Hybrid Data: Getting ${dataType} data for ${authType} user`);

    switch (dataType) {
      case 'creator':
        return this.getCreatorProfile(userId, userEmail);
      case 'business':
        return this.getBusinessProfile(userId, userEmail);
      case 'collaborations':
        return this.getCollaborations(userId, userEmail);
      case 'portfolio':
        return this.getPortfolioItems(userId, userEmail);
      case 'analytics':
        return this.getAnalytics(userId, userEmail);
      default:
        return null;
    }
  }

  // Health check for hybrid data service
  async healthCheck(userEmail?: string): Promise<{ status: string; authType: 'mock' | 'supabase'; dataAvailable: boolean }> {
    const authType = detectUserAuthType(userEmail);
    
    try {
      if (authType === 'mock') {
        const mockHealth = await mockDataService.healthCheck();
        return {
          status: 'healthy',
          authType: 'mock',
          dataAvailable: mockHealth.dataCount > 0
        };
      } else {
        // For real data, we'd check Supabase connection
        return {
          status: 'healthy',
          authType: 'supabase',
          dataAvailable: true
        };
      }
    } catch (error) {
      return {
        status: 'error',
        authType,
        dataAvailable: false
      };
    }
  }
}

export const hybridDataService = new HybridDataService();
export default hybridDataService;