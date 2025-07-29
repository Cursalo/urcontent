// Centralized Mock Data Service - database-ready structure
// This service provides a unified interface for all mock data operations
// Designed to be easily replaceable with real database calls

import { 
  mockUsers, 
  MockUser, 
  MockCreatorProfile, 
  MockBusinessProfile, 
  MockCollaboration, 
  MockPortfolioItem, 
  MockAnalyticsData,
  findUserByEmail, 
  validateCredentials, 
  getUserById,
  createMockSession,
  MockSession
} from '../data/mockUsers';

import { 
  mockBusinessProfiles,
  getBusinessProfileById,
  getBusinessProfileByUserId,
  getBusinessProfilesByIndustry,
  getVerifiedBusinessProfiles
} from '../data/mockBusinessProfiles';

import { 
  mockCreatorProfiles,
  getCreatorProfileById,
  getCreatorProfileByUserId,
  getCreatorProfilesBySpecialty,
  getAvailableCreatorProfiles,
  getCreatorProfilesByRating,
  getCreatorProfilesByURScore
} from '../data/mockCreatorProfiles';

import { 
  mockPortfolioItems,
  getPortfolioItemById,
  getPortfolioItemsByCreatorId,
  getFeaturedPortfolioItems,
  getPortfolioItemsByPlatform,
  getPortfolioItemsByTag,
  getPortfolioItemsByEngagementRate
} from '../data/mockPortfolio';

import { 
  mockCollaborations,
  getCollaborationById,
  getCollaborationsByBusinessId,
  getCollaborationsByCreatorId,
  getCollaborationsByStatus,
  getActiveCollaborations,
  getCompletedCollaborations,
  getProposedCollaborations,
  getCollaborationsByType,
  getCollaborationsByPlatform
} from '../data/mockCollaborations';

import { 
  mockAnalyticsData,
  getAnalyticsByUserId,
  getAnalyticsByPeriod,
  getLatestAnalytics,
  getAnalyticsRange,
  getGrowthTrend,
  getEngagementTrend,
  calculateROITrend
} from '../data/mockAnalytics';

export interface CreatorDashboardData {
  profile: MockCreatorProfile;
  user: MockUser;
  portfolio: MockPortfolioItem[];
  collaborations: MockCollaboration[];
  analytics: {
    monthly: MockAnalyticsData[];
    weekly: MockAnalyticsData[];
    daily: MockAnalyticsData[];
  };
  metrics: {
    totalEarnings: number;
    monthlyEarnings: number;
    activeCollaborations: number;
    completedCollaborations: number;
    portfolioItems: number;
    avgRating: number;
  };
}

export interface BusinessDashboardData {
  profile: MockBusinessProfile;
  user: MockUser;
  collaborations: MockCollaboration[];
  analytics: {
    monthly: MockAnalyticsData[];
    weekly: MockAnalyticsData[];
    daily: MockAnalyticsData[];
  };
  metrics: {
    totalSpent: number;
    monthlySpent: number;
    activeCampaigns: number;
    completedCampaigns: number;
    avgCampaignROI: number;
    totalReach: number;
  };
}

export interface CreatorFilters {
  search?: string;
  specialties?: string[];
  minRating?: number;
  minURScore?: number;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  location?: string;
  isAvailable?: boolean;
  priceRange?: [number, number];
}

export interface CollaborationFilters {
  status?: string;
  type?: string;
  platform?: string;
  businessId?: string;
  creatorId?: string;
  startDate?: string;
  endDate?: string;
  minBudget?: number;
  maxBudget?: number;
}

class MockDataService {
  // Authentication methods
  async signIn(email: string, password: string): Promise<{ user: MockUser; session: MockSession } | null> {
    const user = validateCredentials(email, password);
    if (!user) return null;
    
    const session = createMockSession(user);
    return { user, session };
  }

  async signUp(userData: Omit<MockUser, 'id' | 'created_at' | 'updated_at'>): Promise<{ user: MockUser; session: MockSession }> {
    const newUser: MockUser = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    const session = createMockSession(newUser);
    return { user: newUser, session };
  }

  async getCurrentUser(userId: string): Promise<MockUser | null> {
    return getUserById(userId) || null;
  }

  // Creator methods
  async getCreatorDashboardData(userId: string): Promise<CreatorDashboardData | null> {
    const user = getUserById(userId);
    const profile = getCreatorProfileByUserId(userId);
    
    if (!user || !profile) return null;

    const portfolio = getPortfolioItemsByCreatorId(profile.id);
    const collaborations = getCollaborationsByCreatorId(userId);
    
    const analytics = {
      monthly: getAnalyticsByPeriod(userId, 'monthly'),
      weekly: getAnalyticsByPeriod(userId, 'weekly'),
      daily: getAnalyticsByPeriod(userId, 'daily')
    };

    const completedCollaborations = collaborations.filter(c => c.status === 'completed');
    const activeCollaborations = collaborations.filter(c => ['accepted', 'in_progress'].includes(c.status));
    
    const totalEarnings = completedCollaborations.reduce((sum, c) => sum + c.compensation_amount, 0);
    const currentMonth = new Date().getMonth();
    const monthlyEarnings = completedCollaborations
      .filter(c => c.completed_at && new Date(c.completed_at).getMonth() === currentMonth)
      .reduce((sum, c) => sum + c.compensation_amount, 0);

    const avgRating = completedCollaborations
      .filter(c => c.rating_by_business)
      .reduce((sum, c, _, arr) => sum + (c.rating_by_business! / arr.length), 0);

    const metrics = {
      totalEarnings,
      monthlyEarnings,
      activeCollaborations: activeCollaborations.length,
      completedCollaborations: completedCollaborations.length,
      portfolioItems: portfolio.length,
      avgRating: Math.round(avgRating * 10) / 10
    };

    return {
      profile,
      user,
      portfolio,
      collaborations,
      analytics,
      metrics
    };
  }

  async getCreatorProfiles(filters: CreatorFilters = {}): Promise<MockCreatorProfile[]> {
    let profiles = [...mockCreatorProfiles];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      profiles = profiles.filter(p => 
        p.bio.toLowerCase().includes(searchLower) ||
        p.specialties.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    if (filters.specialties && filters.specialties.length > 0) {
      profiles = profiles.filter(p => 
        filters.specialties!.some(specialty => 
          p.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
        )
      );
    }

    if (filters.minRating) {
      profiles = profiles.filter(p => p.rating >= filters.minRating!);
    }

    if (filters.minURScore) {
      profiles = profiles.filter(p => p.ur_score >= filters.minURScore!);
    }

    if (filters.minFollowers) {
      profiles = profiles.filter(p => p.instagram_followers >= filters.minFollowers!);
    }

    if (filters.maxFollowers) {
      profiles = profiles.filter(p => p.instagram_followers <= filters.maxFollowers!);
    }

    if (filters.minEngagement) {
      profiles = profiles.filter(p => p.engagement_rate >= filters.minEngagement!);
    }

    if (filters.isAvailable !== undefined) {
      profiles = profiles.filter(p => p.is_available === filters.isAvailable);
    }

    if (filters.priceRange) {
      profiles = profiles.filter(p => 
        p.min_collaboration_fee >= filters.priceRange![0] &&
        p.max_collaboration_fee <= filters.priceRange![1]
      );
    }

    // Sort by UR Score by default
    return profiles.sort((a, b) => b.ur_score - a.ur_score);
  }

  // Business methods
  async getBusinessDashboardData(userId: string): Promise<BusinessDashboardData | null> {
    const user = getUserById(userId);
    const profile = getBusinessProfileByUserId(userId);
    
    if (!user || !profile) return null;

    const collaborations = getCollaborationsByBusinessId(userId);
    
    const analytics = {
      monthly: getAnalyticsByPeriod(userId, 'monthly'),
      weekly: getAnalyticsByPeriod(userId, 'weekly'),
      daily: getAnalyticsByPeriod(userId, 'daily')
    };

    const completedCampaigns = collaborations.filter(c => c.status === 'completed');
    const activeCampaigns = collaborations.filter(c => ['accepted', 'in_progress'].includes(c.status));
    
    const totalSpent = completedCampaigns.reduce((sum, c) => sum + c.compensation_amount, 0);
    const currentMonth = new Date().getMonth();
    const monthlySpent = completedCampaigns
      .filter(c => c.completed_at && new Date(c.completed_at).getMonth() === currentMonth)
      .reduce((sum, c) => sum + c.compensation_amount, 0);

    const avgCampaignROI = completedCampaigns
      .filter(c => c.performance?.roi)
      .reduce((sum, c, _, arr) => sum + (c.performance!.roi / arr.length), 0);

    const totalReach = completedCampaigns
      .reduce((sum, c) => sum + (c.performance?.total_reach || 0), 0);

    const metrics = {
      totalSpent,
      monthlySpent,
      activeCampaigns: activeCampaigns.length,
      completedCampaigns: completedCampaigns.length,
      avgCampaignROI: Math.round(avgCampaignROI * 10) / 10,
      totalReach
    };

    return {
      profile,
      user,
      collaborations,
      analytics,
      metrics
    };
  }

  async getBusinessProfiles(industry?: string): Promise<MockBusinessProfile[]> {
    if (industry) {
      return getBusinessProfilesByIndustry(industry);
    }
    return [...mockBusinessProfiles];
  }

  // Collaboration methods
  async getCollaborations(filters: CollaborationFilters = {}): Promise<MockCollaboration[]> {
    let collaborations = [...mockCollaborations];

    if (filters.status) {
      collaborations = collaborations.filter(c => c.status === filters.status);
    }

    if (filters.type) {
      collaborations = collaborations.filter(c => c.collaboration_type === filters.type);
    }

    if (filters.platform) {
      collaborations = collaborations.filter(c => c.platform === filters.platform);
    }

    if (filters.businessId) {
      collaborations = collaborations.filter(c => c.business_id === filters.businessId);
    }

    if (filters.creatorId) {
      collaborations = collaborations.filter(c => c.creator_id === filters.creatorId);
    }

    if (filters.minBudget) {
      collaborations = collaborations.filter(c => c.compensation_amount >= filters.minBudget!);
    }

    if (filters.maxBudget) {
      collaborations = collaborations.filter(c => c.compensation_amount <= filters.maxBudget!);
    }

    if (filters.startDate) {
      collaborations = collaborations.filter(c => 
        new Date(c.timeline.start_date) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      collaborations = collaborations.filter(c => 
        new Date(c.timeline.end_date) <= new Date(filters.endDate!)
      );
    }

    return collaborations.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async createCollaboration(data: Partial<MockCollaboration>): Promise<MockCollaboration> {
    const newCollaboration: MockCollaboration = {
      id: `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: data.title || '',
      description: data.description || '',
      business_id: data.business_id || '',
      creator_id: data.creator_id || '',
      status: 'proposed',
      collaboration_type: data.collaboration_type || 'sponsored_post',
      platform: data.platform || 'instagram',
      compensation_amount: data.compensation_amount || 0,
      compensation_type: data.compensation_type || 'fixed',
      deliverables: data.deliverables || {
        posts: 1,
        stories: 0,
        reels: 0,
        videos: 0,
        usage_rights: false,
        exclusivity_period: 0,
        revisions_included: 1
      },
      requirements: data.requirements || {
        hashtags: [],
        mentions: [],
        content_guidelines: '',
        posting_schedule: '',
        approval_required: false
      },
      timeline: data.timeline || {
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        content_due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        posting_start_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        posting_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      accepted_at: null,
      started_at: null,
      completed_at: null,
      cancelled_at: null,
      performance: null,
      creator_response: null,
      business_feedback: null,
      rating_by_business: null,
      rating_by_creator: null
    };

    mockCollaborations.push(newCollaboration);
    return newCollaboration;
  }

  async updateCollaboration(id: string, updates: Partial<MockCollaboration>): Promise<MockCollaboration | null> {
    const index = mockCollaborations.findIndex(c => c.id === id);
    if (index === -1) return null;

    mockCollaborations[index] = {
      ...mockCollaborations[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return mockCollaborations[index];
  }

  // Portfolio methods
  async getPortfolioItems(creatorId: string): Promise<MockPortfolioItem[]> {
    return getPortfolioItemsByCreatorId(creatorId);
  }

  async createPortfolioItem(data: Partial<MockPortfolioItem>): Promise<MockPortfolioItem> {
    const newItem: MockPortfolioItem = {
      id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      creator_id: data.creator_id || '',
      title: data.title || '',
      description: data.description || '',
      media_url: data.media_url || '',
      media_type: data.media_type || 'image',
      platform: data.platform || 'instagram',
      engagement_stats: data.engagement_stats || {
        likes: 0,
        comments: 0,
        engagement_rate: 0
      },
      performance_metrics: data.performance_metrics || {},
      tags: data.tags || [],
      brand_mention: data.brand_mention || null,
      campaign_id: data.campaign_id || null,
      is_featured: data.is_featured || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockPortfolioItems.push(newItem);
    return newItem;
  }

  // Analytics methods
  async getAnalytics(userId: string, period?: 'daily' | 'weekly' | 'monthly'): Promise<MockAnalyticsData[]> {
    if (period) {
      return getAnalyticsByPeriod(userId, period);
    }
    return getAnalyticsByUserId(userId);
  }

  async getAnalyticsTrends(userId: string): Promise<{
    followerGrowth: number[];
    engagementRate: number[];
    roi?: number[];
  }> {
    return {
      followerGrowth: getGrowthTrend(userId),
      engagementRate: getEngagementTrend(userId),
      roi: calculateROITrend(userId)
    };
  }

  // Search and discovery methods
  async searchCreators(query: string, limit: number = 20): Promise<MockCreatorProfile[]> {
    const searchLower = query.toLowerCase();
    return mockCreatorProfiles
      .filter(profile => 
        profile.bio.toLowerCase().includes(searchLower) ||
        profile.specialties.some(s => s.toLowerCase().includes(searchLower))
      )
      .slice(0, limit);
  }

  async getTopCreators(limit: number = 10): Promise<MockCreatorProfile[]> {
    return mockCreatorProfiles
      .sort((a, b) => b.ur_score - a.ur_score)
      .slice(0, limit);
  }

  async getFeaturedCollaborations(): Promise<MockCollaboration[]> {
    return mockCollaborations
      .filter(c => c.status === 'completed' && c.performance?.roi && c.performance.roi > 300)
      .sort((a, b) => (b.performance?.roi || 0) - (a.performance?.roi || 0))
      .slice(0, 6);
  }

  // Utility methods for easy database migration
  async exportAllData(): Promise<{
    users: MockUser[];
    creatorProfiles: MockCreatorProfile[];
    businessProfiles: MockBusinessProfile[];
    portfolioItems: MockPortfolioItem[];
    collaborations: MockCollaboration[];
    analytics: MockAnalyticsData[];
  }> {
    return {
      users: mockUsers,
      creatorProfiles: mockCreatorProfiles,
      businessProfiles: mockBusinessProfiles,
      portfolioItems: mockPortfolioItems,
      collaborations: mockCollaborations,
      analytics: mockAnalyticsData
    };
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; dataCount: number }> {
    const totalRecords = mockUsers.length + 
                        mockCreatorProfiles.length + 
                        mockBusinessProfiles.length + 
                        mockPortfolioItems.length + 
                        mockCollaborations.length + 
                        mockAnalyticsData.length;

    return {
      status: 'healthy',
      dataCount: totalRecords
    };
  }
}

export const mockDataService = new MockDataService();
export default mockDataService;