// Mock Analytics data - database-ready structure
import { MockAnalyticsData } from './mockUsers';

export const mockAnalyticsData: MockAnalyticsData[] = [
  // Sofia Martinez (creator-user-001) - Monthly analytics
  {
    id: 'analytics-001',
    user_id: 'creator-user-001',
    period: 'monthly',
    date: '2024-07-01',
    metrics: {
      follower_growth: 2450,
      engagement_rate: 6.8,
      reach: 156000,
      impressions: 287000,
      profile_views: 12400
    },
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 'analytics-002',
    user_id: 'creator-user-001',
    period: 'monthly',
    date: '2024-06-01',
    metrics: {
      follower_growth: 1890,
      engagement_rate: 6.2,
      reach: 142000,
      impressions: 265000,
      profile_views: 11200
    },
    created_at: '2024-07-01T00:00:00Z'
  },
  {
    id: 'analytics-003',
    user_id: 'creator-user-001',
    period: 'monthly',
    date: '2024-05-01',
    metrics: {
      follower_growth: 2100,
      engagement_rate: 7.1,
      reach: 168000,
      impressions: 298000,
      profile_views: 13800
    },
    created_at: '2024-06-01T00:00:00Z'
  },
  // Marco Rodriguez (creator-user-002) - Monthly analytics
  {
    id: 'analytics-004',
    user_id: 'creator-user-002',
    period: 'monthly',
    date: '2024-07-01',
    metrics: {
      follower_growth: 1890,
      engagement_rate: 5.2,
      reach: 98000,
      impressions: 184000,
      profile_views: 8900
    },
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 'analytics-005',
    user_id: 'creator-user-002',
    period: 'monthly',
    date: '2024-06-01',
    metrics: {
      follower_growth: 1650,
      engagement_rate: 4.9,
      reach: 89000,
      impressions: 167000,
      profile_views: 7800
    },
    created_at: '2024-07-01T00:00:00Z'
  },
  {
    id: 'analytics-006',
    user_id: 'creator-user-002',
    period: 'monthly',
    date: '2024-05-01',
    metrics: {
      follower_growth: 2200,
      engagement_rate: 5.8,
      reach: 105000,
      impressions: 198000,
      profile_views: 9500
    },
    created_at: '2024-06-01T00:00:00Z'
  },
  // Elena Garcia (creator-user-003) - Monthly analytics
  {
    id: 'analytics-007',
    user_id: 'creator-user-003',
    period: 'monthly',
    date: '2024-07-01',
    metrics: {
      follower_growth: 1200,
      engagement_rate: 8.1,
      reach: 45000,
      impressions: 78000,
      profile_views: 3400
    },
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 'analytics-008',
    user_id: 'creator-user-003',
    period: 'monthly',
    date: '2024-06-01',
    metrics: {
      follower_growth: 980,
      engagement_rate: 7.8,
      reach: 41000,
      impressions: 72000,
      profile_views: 3100
    },
    created_at: '2024-07-01T00:00:00Z'
  },
  {
    id: 'analytics-009',
    user_id: 'creator-user-003',
    period: 'monthly',
    date: '2024-05-01',
    metrics: {
      follower_growth: 1450,
      engagement_rate: 8.5,
      reach: 52000,
      impressions: 89000,
      profile_views: 4200
    },
    created_at: '2024-06-01T00:00:00Z'
  },
  // Business analytics - Restaurant La Plaza (business-user-001)
  {
    id: 'analytics-010',
    user_id: 'business-user-001',
    period: 'monthly',
    date: '2024-07-01',
    metrics: {
      campaign_reach: 234000,
      conversion_rate: 2.8,
      roi: 340,
      cost_per_engagement: 0.67,
      brand_mentions: 156
    },
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 'analytics-011',
    user_id: 'business-user-001',
    period: 'monthly',
    date: '2024-06-01',
    metrics: {
      campaign_reach: 198000,
      conversion_rate: 2.4,
      roi: 285,
      cost_per_engagement: 0.72,
      brand_mentions: 134
    },
    created_at: '2024-07-01T00:00:00Z'
  },
  // Bella Fashion (business-user-002)
  {
    id: 'analytics-012',
    user_id: 'business-user-002',
    period: 'monthly',
    date: '2024-07-01',
    metrics: {
      campaign_reach: 445000,
      conversion_rate: 3.2,
      roi: 425,
      cost_per_engagement: 0.54,
      brand_mentions: 289
    },
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 'analytics-013',
    user_id: 'business-user-002',
    period: 'monthly',
    date: '2024-06-01',
    metrics: {
      campaign_reach: 398000,
      conversion_rate: 2.9,
      roi: 378,
      cost_per_engagement: 0.58,
      brand_mentions: 245
    },
    created_at: '2024-07-01T00:00:00Z'
  },
  // Paradise Resort (business-user-003)
  {
    id: 'analytics-014',
    user_id: 'business-user-003',
    period: 'monthly',
    date: '2024-07-01',
    metrics: {
      campaign_reach: 567000,
      conversion_rate: 4.1,
      roi: 520,
      cost_per_engagement: 0.42,
      brand_mentions: 234
    },
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 'analytics-015',
    user_id: 'business-user-003',
    period: 'monthly',
    date: '2024-06-01',
    metrics: {
      campaign_reach: 489000,
      conversion_rate: 3.8,
      roi: 478,
      cost_per_engagement: 0.45,
      brand_mentions: 198
    },
    created_at: '2024-07-01T00:00:00Z'
  },
  // Weekly analytics for detailed tracking - Sofia Martinez
  {
    id: 'analytics-016',
    user_id: 'creator-user-001',
    period: 'weekly',
    date: '2024-07-22',
    metrics: {
      follower_growth: 450,
      engagement_rate: 7.2,
      reach: 34000,
      impressions: 62000,
      profile_views: 2800
    },
    created_at: '2024-07-29T00:00:00Z'
  },
  {
    id: 'analytics-017',
    user_id: 'creator-user-001',
    period: 'weekly',
    date: '2024-07-15',
    metrics: {
      follower_growth: 520,
      engagement_rate: 6.9,
      reach: 38000,
      impressions: 68000,
      profile_views: 3200
    },
    created_at: '2024-07-22T00:00:00Z'
  },
  {
    id: 'analytics-018',
    user_id: 'creator-user-001',
    period: 'weekly',
    date: '2024-07-08',
    metrics: {
      follower_growth: 680,
      engagement_rate: 6.5,
      reach: 42000,
      impressions: 75000,
      profile_views: 3600
    },
    created_at: '2024-07-15T00:00:00Z'
  },
  // Daily analytics for immediate insights - Sofia Martinez
  {
    id: 'analytics-019',
    user_id: 'creator-user-001',
    period: 'daily',
    date: '2024-07-29',
    metrics: {
      follower_growth: 89,
      engagement_rate: 8.1,
      reach: 6700,
      impressions: 12400,
      profile_views: 520
    },
    created_at: '2024-07-30T00:00:00Z'
  },
  {
    id: 'analytics-020',
    user_id: 'creator-user-001',
    period: 'daily',
    date: '2024-07-28',
    metrics: {
      follower_growth: 67,
      engagement_rate: 7.8,
      reach: 5900,
      impressions: 11200,
      profile_views: 445
    },
    created_at: '2024-07-29T00:00:00Z'
  },
  // Marco Rodriguez weekly analytics
  {
    id: 'analytics-021',
    user_id: 'creator-user-002',
    period: 'weekly',
    date: '2024-07-22',
    metrics: {
      follower_growth: 340,
      engagement_rate: 5.6,
      reach: 22000,
      impressions: 41000,
      profile_views: 1900
    },
    created_at: '2024-07-29T00:00:00Z'
  },
  {
    id: 'analytics-022',
    user_id: 'creator-user-002',
    period: 'weekly',
    date: '2024-07-15',
    metrics: {
      follower_growth: 420,
      engagement_rate: 5.1,
      reach: 25000,
      impressions: 46000,
      profile_views: 2200
    },
    created_at: '2024-07-22T00:00:00Z'
  },
  // Elena Garcia weekly analytics
  {
    id: 'analytics-023',
    user_id: 'creator-user-003',
    period: 'weekly',
    date: '2024-07-22',
    metrics: {
      follower_growth: 180,
      engagement_rate: 8.8,
      reach: 8900,
      impressions: 15600,
      profile_views: 670
    },
    created_at: '2024-07-29T00:00:00Z'
  },
  {
    id: 'analytics-024',
    user_id: 'creator-user-003',
    period: 'weekly',
    date: '2024-07-15',
    metrics: {
      follower_growth: 220,
      engagement_rate: 8.3,
      reach: 10200,
      impressions: 18400,
      profile_views: 780
    },
    created_at: '2024-07-22T00:00:00Z'
  }
];

// Helper functions for analytics
export const getAnalyticsByUserId = (userId: string): MockAnalyticsData[] => {
  return mockAnalyticsData.filter(data => data.user_id === userId);
};

export const getAnalyticsByPeriod = (userId: string, period: 'daily' | 'weekly' | 'monthly'): MockAnalyticsData[] => {
  return mockAnalyticsData.filter(data => 
    data.user_id === userId && data.period === period
  );
};

export const getLatestAnalytics = (userId: string, period: 'daily' | 'weekly' | 'monthly'): MockAnalyticsData | undefined => {
  const userAnalytics = getAnalyticsByPeriod(userId, period);
  return userAnalytics.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
};

export const getAnalyticsRange = (
  userId: string, 
  startDate: string, 
  endDate: string,
  period?: 'daily' | 'weekly' | 'monthly'
): MockAnalyticsData[] => {
  return mockAnalyticsData.filter(data => {
    const dataDate = new Date(data.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const inRange = dataDate >= start && dataDate <= end;
    const matchesPeriod = !period || data.period === period;
    const matchesUser = data.user_id === userId;
    
    return inRange && matchesPeriod && matchesUser;
  });
};

export const getGrowthTrend = (userId: string, months: number = 3): number[] => {
  const monthlyData = getAnalyticsByPeriod(userId, 'monthly')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-months);
    
  return monthlyData.map(data => data.metrics.follower_growth || 0);
};

export const getEngagementTrend = (userId: string, months: number = 3): number[] => {
  const monthlyData = getAnalyticsByPeriod(userId, 'monthly')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-months);
    
  return monthlyData.map(data => data.metrics.engagement_rate || 0);
};

export const calculateROITrend = (userId: string, months: number = 3): number[] => {
  const monthlyData = getAnalyticsByPeriod(userId, 'monthly')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-months);
    
  return monthlyData.map(data => data.metrics.roi || 0);
};