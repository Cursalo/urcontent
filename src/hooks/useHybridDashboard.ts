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
          throw new Error('No dashboard data available');
        }

        // Determine which dashboard data to use based on user role
        const finalRole = profile?.role || userRole || 'creator';
        let formattedData: DashboardData;

        if (finalRole === 'creator' && data.creator) {
          formattedData = {
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
          };
        } else if (finalRole === 'business' && data.business) {
          formattedData = {
            profile: data.business.profile,
            user: data.business.user,
            collaborations: data.business.collaborations || [],
            analytics: data.business.analytics || { monthly: [], weekly: [], daily: [] },
            metrics: {
              totalEarnings: 0,
              monthlyEarnings: 0,
              activeCollaborations: data.business.metrics?.activeCampaigns || 0,
              completedCollaborations: data.business.metrics?.completedCampaigns || 0,
              portfolioItems: 0,
              avgRating: 0,
              totalSpent: data.business.metrics?.totalSpent || 0,
              monthlySpent: data.business.metrics?.monthlySpent || 0,
              totalReach: data.business.metrics?.totalReach || 0,
              activeCampaigns: data.business.metrics?.activeCampaigns || 0,
              completedCampaigns: data.business.metrics?.completedCampaigns || 0,
              avgCampaignROI: data.business.metrics?.avgCampaignROI || 0
            },
            authType: data.authType
          };
        } else {
          // Default to creator data structure if role is unclear
          const fallbackData = data.creator || data.business;
          if (!fallbackData) {
            throw new Error('No appropriate dashboard data found');
          }

          formattedData = {
            profile: fallbackData.profile,
            user: fallbackData.user,
            collaborations: fallbackData.collaborations || [],
            portfolio: fallbackData.portfolio || [],
            analytics: fallbackData.analytics || { monthly: [], weekly: [], daily: [] },
            metrics: {
              totalEarnings: fallbackData.metrics?.totalEarnings || 0,
              monthlyEarnings: fallbackData.metrics?.monthlyEarnings || 0,
              activeCollaborations: fallbackData.metrics?.activeCollaborations || 0,
              completedCollaborations: fallbackData.metrics?.completedCollaborations || 0,
              portfolioItems: fallbackData.metrics?.portfolioItems || 0,
              avgRating: fallbackData.metrics?.avgRating || 0
            },
            authType: data.authType
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
        setError(error.message || 'Failed to load dashboard data');
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