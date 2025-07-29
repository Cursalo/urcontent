// Custom hook for hybrid dashboard data
// Provides unified data access for both mock and real users
// Automatically detects user type and fetches appropriate data

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hybridDataService } from '@/services/hybridDataService';
import { detectUserAuthType } from '@/services/mockAuth';

export interface DashboardMetrics {
  totalEarnings: number;
  monthlyEarnings: number;
  activeCollaborations: number;
  completedCollaborations: number;
  portfolioItems: number;
  avgRating: number;
  urScore?: number;
  totalFollowers?: number;
  totalSpent?: number;
  totalReach?: number;
  activeCampaigns?: number;
  completedCampaigns?: number;
  avgCampaignROI?: number;
}

export interface DashboardData {
  profile: any;
  user: any;
  collaborations: any[];
  portfolio?: any[];
  analytics: {
    monthly: any[];
    weekly: any[];
    daily: any[];
  };
  metrics: DashboardMetrics;
  authType: 'mock' | 'supabase';
}

export function useHybridDashboard(userRole?: string) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Detect user auth type
  const authType = useMemo(() => {
    return detectUserAuthType(user?.email);
  }, [user?.email]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        console.log('🔄 No user found, skipping dashboard data fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`📊 Fetching ${authType} dashboard data for user:`, {
          id: user.id,
          email: user.email,
          role: profile?.role || userRole
        });

        const data = await hybridDataService.getDashboardData(user.id, user.email);

        if (!data) {
          console.log('⚠️ No dashboard data found, creating robust emergency fallback');
          // Create comprehensive emergency fallback data
          const emergencyData = {
            profile: {
              id: user.id || 'emergency-user',
              display_name: user?.user_metadata?.full_name || 'Emergency User',
              bio: 'Welcome! Your dashboard is loading with default data.',
              specialties: ['Content Creation'],
              rate_per_hour: 50,
              location: 'Remote',
              avatar_url: null,
              full_name: user?.user_metadata?.full_name || 'Emergency User',
              email: user?.email || 'user@example.com',
              role: profile?.role || userRole || 'creator',
              is_verified: false,
              user: {
                id: user.id || 'emergency-user',
                email: user?.email || 'user@example.com',
                full_name: user?.user_metadata?.full_name || 'Emergency User'
              }
            },
            user: {
              id: user.id || 'emergency-user',
              email: user?.email || 'user@example.com',
              full_name: user?.user_metadata?.full_name || 'Emergency User',
              role: profile?.role || userRole || 'creator'
            },
            collaborations: [],
            portfolio: [],
            analytics: { 
              monthly: [],
              weekly: [], 
              daily: [],
              summary: {
                totalViews: 0,
                totalEngagement: 0,
                averageRating: 0
              }
            },
            metrics: {
              totalEarnings: 0,
              monthlyEarnings: 0,
              activeCollaborations: 0,
              completedCollaborations: 0,
              portfolioItems: 0,
              avgRating: 0,
              urScore: 0,
              totalFollowers: 0
            },
            authType: 'mock' as const
          };
          
          setDashboardData(emergencyData);
          console.log('✅ EMERGENCY DATA: Created robust fallback dashboard data');
          setError(null); // Clear any previous errors
          return;
        }

        // Determine which dashboard data to use based on user role with safe access
        const finalRole = profile?.role || userRole || 'creator';
        let formattedData: DashboardData;

        if (finalRole === 'creator' && data.creator) {
          // Safely extract creator data with comprehensive fallbacks
          const creatorData = data.creator;
          const creatorProfile = creatorData.profile || {};
          const creatorUser = creatorData.user || {};
          const creatorMetrics = creatorData.metrics || {};
          
          formattedData = {
            profile: {
              ...creatorProfile,
              id: creatorProfile.id || user.id || 'creator-profile',
              display_name: creatorProfile.display_name || creatorUser.full_name || user?.user_metadata?.full_name || 'Creator',
              bio: creatorProfile.bio || 'Content creator',
              avatar_url: creatorProfile.avatar_url || null,
              full_name: creatorProfile.full_name || creatorUser.full_name || user?.user_metadata?.full_name || 'Creator',
              email: creatorProfile.email || creatorUser.email || user?.email || 'creator@example.com',
              role: creatorProfile.role || 'creator',
              is_verified: creatorProfile.is_verified || false,
              user: {
                id: creatorUser.id || user.id || 'creator-user',
                email: creatorUser.email || user?.email || 'creator@example.com',
                full_name: creatorUser.full_name || user?.user_metadata?.full_name || 'Creator'
              }
            },
            user: {
              id: creatorUser.id || user.id || 'creator-user',
              email: creatorUser.email || user?.email || 'creator@example.com',
              full_name: creatorUser.full_name || user?.user_metadata?.full_name || 'Creator',
              role: creatorUser.role || 'creator'
            },
            collaborations: Array.isArray(creatorData.collaborations) ? creatorData.collaborations : [],
            portfolio: Array.isArray(creatorData.portfolio) ? creatorData.portfolio : [],
            analytics: {
              monthly: Array.isArray(creatorData.analytics?.monthly) ? creatorData.analytics.monthly : [],
              weekly: Array.isArray(creatorData.analytics?.weekly) ? creatorData.analytics.weekly : [],
              daily: Array.isArray(creatorData.analytics?.daily) ? creatorData.analytics.daily : []
            },
            metrics: {
              totalEarnings: Number(creatorMetrics.totalEarnings) || 0,
              monthlyEarnings: Number(creatorMetrics.monthlyEarnings) || 0,
              activeCollaborations: Number(creatorMetrics.activeCollaborations) || 0,
              completedCollaborations: Number(creatorMetrics.completedCollaborations) || 0,
              portfolioItems: Number(creatorMetrics.portfolioItems) || 0,
              avgRating: Number(creatorMetrics.avgRating) || 0,
              urScore: Number(creatorProfile.ur_score) || 0,
              totalFollowers: (Number(creatorProfile.instagram_followers) || 0) + 
                             (Number(creatorProfile.tiktok_followers) || 0) + 
                             (Number(creatorProfile.youtube_followers) || 0)
            },
            authType: data.authType || 'mock'
          };
        } else if (finalRole === 'business' && data.business) {
          // Safely extract business data with comprehensive fallbacks
          const businessData = data.business;
          const businessProfile = businessData.profile || {};
          const businessUser = businessData.user || {};
          const businessMetrics = businessData.metrics || {};
          
          formattedData = {
            profile: {
              ...businessProfile,
              id: businessProfile.id || user.id || 'business-profile',
              display_name: businessProfile.display_name || businessProfile.company_name || businessUser.full_name || user?.user_metadata?.full_name || 'Business',
              bio: businessProfile.bio || 'Business profile',
              avatar_url: businessProfile.avatar_url || null,
              full_name: businessProfile.full_name || businessUser.full_name || user?.user_metadata?.full_name || 'Business',
              email: businessProfile.email || businessUser.email || user?.email || 'business@example.com',
              role: businessProfile.role || 'business',
              is_verified: businessProfile.is_verified || false,
              user: {
                id: businessUser.id || user.id || 'business-user',
                email: businessUser.email || user?.email || 'business@example.com',
                full_name: businessUser.full_name || user?.user_metadata?.full_name || 'Business'
              }
            },
            user: {
              id: businessUser.id || user.id || 'business-user',
              email: businessUser.email || user?.email || 'business@example.com',
              full_name: businessUser.full_name || user?.user_metadata?.full_name || 'Business',
              role: businessUser.role || 'business'
            },
            collaborations: Array.isArray(businessData.collaborations) ? businessData.collaborations : [],
            portfolio: [],
            analytics: {
              monthly: Array.isArray(businessData.analytics?.monthly) ? businessData.analytics.monthly : [],
              weekly: Array.isArray(businessData.analytics?.weekly) ? businessData.analytics.weekly : [],
              daily: Array.isArray(businessData.analytics?.daily) ? businessData.analytics.daily : []
            },
            metrics: {
              totalEarnings: 0,
              monthlyEarnings: 0,
              activeCollaborations: Number(businessMetrics.activeCampaigns) || 0,
              completedCollaborations: Number(businessMetrics.completedCampaigns) || 0,
              portfolioItems: 0,
              avgRating: 0,
              totalSpent: Number(businessMetrics.totalSpent) || 0,
              totalReach: Number(businessMetrics.totalReach) || 0,
              activeCampaigns: Number(businessMetrics.activeCampaigns) || 0,
              completedCampaigns: Number(businessMetrics.completedCampaigns) || 0,
              avgCampaignROI: Number(businessMetrics.avgCampaignROI) || 0
            },
            authType: data.authType || 'mock'
          };
        } else {
          // Default to creator data structure if role is unclear with robust fallback
          const fallbackData = data.creator || data.business || {};
          const fallbackProfile = fallbackData.profile || {};
          const fallbackUser = fallbackData.user || {};
          const fallbackMetrics = fallbackData.metrics || {};
          
          console.log('⚠️ Using fallback data structure due to unclear role');
          
          formattedData = {
            profile: {
              ...fallbackProfile,
              id: fallbackProfile.id || user.id || 'fallback-profile',
              display_name: fallbackProfile.display_name || fallbackUser.full_name || user?.user_metadata?.full_name || 'User',
              bio: fallbackProfile.bio || 'User profile',
              avatar_url: fallbackProfile.avatar_url || null,
              full_name: fallbackProfile.full_name || fallbackUser.full_name || user?.user_metadata?.full_name || 'User',
              email: fallbackProfile.email || fallbackUser.email || user?.email || 'user@example.com',
              role: fallbackProfile.role || finalRole,
              is_verified: fallbackProfile.is_verified || false,
              user: {
                id: fallbackUser.id || user.id || 'fallback-user',
                email: fallbackUser.email || user?.email || 'user@example.com',
                full_name: fallbackUser.full_name || user?.user_metadata?.full_name || 'User'
              }
            },
            user: {
              id: fallbackUser.id || user.id || 'fallback-user',
              email: fallbackUser.email || user?.email || 'user@example.com',
              full_name: fallbackUser.full_name || user?.user_metadata?.full_name || 'User',
              role: fallbackUser.role || finalRole
            },
            collaborations: Array.isArray(fallbackData.collaborations) ? fallbackData.collaborations : [],
            portfolio: Array.isArray(fallbackData.portfolio) ? fallbackData.portfolio : [],
            analytics: {
              monthly: Array.isArray(fallbackData.analytics?.monthly) ? fallbackData.analytics.monthly : [],
              weekly: Array.isArray(fallbackData.analytics?.weekly) ? fallbackData.analytics.weekly : [],
              daily: Array.isArray(fallbackData.analytics?.daily) ? fallbackData.analytics.daily : []
            },
            metrics: {
              totalEarnings: Number(fallbackMetrics.totalEarnings) || 0,
              monthlyEarnings: Number(fallbackMetrics.monthlyEarnings) || 0,
              activeCollaborations: Number(fallbackMetrics.activeCollaborations) || 0,
              completedCollaborations: Number(fallbackMetrics.completedCollaborations) || 0,
              portfolioItems: Number(fallbackMetrics.portfolioItems) || 0,
              avgRating: Number(fallbackMetrics.avgRating) || 0
            },
            authType: data.authType || 'mock'
          };
        }

        setDashboardData(formattedData);
        
        console.log(`✅ ${authType} dashboard data loaded successfully:`, {
          collaborations: formattedData.collaborations.length,
          portfolioItems: formattedData.portfolio?.length || 0,
          authType: formattedData.authType
        });

      } catch (error: any) {
        console.error('❌ Error fetching dashboard data:', error);
        
        // Implement retry logic for transient errors
        if (retryCount < MAX_RETRIES && error.name !== 'AbortError') {
          console.log(`🔄 Retrying dashboard fetch (${retryCount + 1}/${MAX_RETRIES})`);
          setRetryCount(prev => prev + 1);
          
          // Retry with exponential backoff
          setTimeout(() => {
            fetchDashboardData();
          }, Math.pow(2, retryCount) * 1000);
          
          return;
        }
        
        // Create comprehensive emergency data on final failure
        console.log('🚨 All retries exhausted, creating comprehensive emergency fallback');
        const emergencyFallback = {
          profile: {
            id: user.id || 'emergency-user',
            display_name: user?.user_metadata?.full_name || 'User',
            bio: 'Welcome! We\'re having trouble loading your data, but you can still explore.',
            avatar_url: null,
            full_name: user?.user_metadata?.full_name || 'User',
            email: user?.email || 'user@example.com',
            role: profile?.role || userRole || 'creator',
            is_verified: false,
            user: {
              id: user.id || 'emergency-user',
              email: user?.email || 'user@example.com',
              full_name: user?.user_metadata?.full_name || 'User'
            }
          },
          user: {
            id: user.id || 'emergency-user',
            email: user?.email || 'user@example.com',
            full_name: user?.user_metadata?.full_name || 'User',
            role: profile?.role || userRole || 'creator'
          },
          collaborations: [],
          portfolio: [],
          analytics: { monthly: [], weekly: [], daily: [] },
          metrics: {
            totalEarnings: 0,
            monthlyEarnings: 0,
            activeCollaborations: 0,
            completedCollaborations: 0,
            portfolioItems: 0,
            avgRating: 0,
            urScore: 0,
            totalFollowers: 0
          },
          authType: 'mock' as const
        };
        
        setDashboardData(emergencyFallback);
        setError(`Unable to load dashboard data after ${MAX_RETRIES} attempts. Showing default content.`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile?.role, userRole, authType]);

  // Helper functions for specific data types
  const getCollaborations = async (filters?: any) => {
    if (!user) return [];
    
    try {
      return await hybridDataService.getCollaborations(user.id, user.email, filters);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      return [];
    }
  };

  const getPortfolio = async () => {
    if (!user || !dashboardData?.profile?.id) return [];
    
    try {
      return await hybridDataService.getPortfolioItems(dashboardData.profile.id, user.email);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return [];
    }
  };

  const getAnalytics = async (period?: 'daily' | 'weekly' | 'monthly') => {
    if (!user) return [];
    
    try {
      return await hybridDataService.getAnalytics(user.id, user.email, period);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  };

  const createCollaboration = async (data: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await hybridDataService.createCollaboration(data, user.email);
    } catch (error) {
      console.error('Error creating collaboration:', error);
      throw error;
    }
  };

  const updateCollaboration = async (id: string, updates: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await hybridDataService.updateCollaboration(id, updates, user.email);
    } catch (error) {
      console.error('Error updating collaboration:', error);
      throw error;
    }
  };

  // Refresh dashboard data
  const refresh = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await hybridDataService.getDashboardData(user.id, user.email);
      if (data) {
        // Re-format data using the same logic as above
        const finalRole = profile?.role || userRole || 'creator';
        if (finalRole === 'creator' && data.creator) {
          setDashboardData({
            profile: data.creator.profile,
            user: data.creator.user,
            collaborations: data.creator.collaborations || [],
            portfolio: data.creator.portfolio || [],
            analytics: data.creator.analytics || { monthly: [], weekly: [], daily: [] },
            metrics: {
              totalEarnings: data.creator.metrics?.totalEarnings || 0,
              monthlyEarnings: data.creator.metrics?.monthlyEarnings || 0,
              activeCollaborations: data.creator.metrics?.activeCollaborations || 0,
              completedCollaborations: data.creator.metrics?.completedCollaborations || 0,
              portfolioItems: data.creator.metrics?.portfolioItems || 0,
              avgRating: data.creator.metrics?.avgRating || 0,
              urScore: data.creator.profile?.ur_score || 0,
              totalFollowers: (data.creator.profile?.instagram_followers || 0) + 
                             (data.creator.profile?.tiktok_followers || 0) + 
                             (data.creator.profile?.youtube_followers || 0)
            },
            authType: data.authType
          });
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    dashboardData,
    authType,
    
    // Helper functions
    getCollaborations,
    getPortfolio,
    getAnalytics,
    createCollaboration,
    updateCollaboration,
    refresh,
    
    // Computed values for easy access
    userProfile: dashboardData?.profile,
    collaborations: dashboardData?.collaborations || [],
    portfolio: dashboardData?.portfolio || [],
    metrics: dashboardData?.metrics || {
      totalEarnings: 0,
      monthlyEarnings: 0,
      activeCollaborations: 0,
      completedCollaborations: 0,
      portfolioItems: 0,
      avgRating: 0
    },
    analytics: dashboardData?.analytics || { monthly: [], weekly: [], daily: [] }
  };
}