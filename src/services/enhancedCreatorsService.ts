// Enhanced Creator Service
// Extended creator management with advanced features

import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { collaborationService } from './collaborations';
import { paymentsService } from './payments';
import { notificationService } from './notifications';
import { auditService } from './auditService';
import { fileUploadService } from './fileUploadService';
import { analyticsService } from './analyticsService';

export interface CreatorProfile extends Tables<'creator_profiles'> {
  user: Tables<'users'>;
  portfolio: Tables<'portfolio_items'>[];
  statistics?: CreatorStatistics;
  ratings?: CreatorRating[];
  earnings?: CreatorEarnings;
}

export interface CreatorStatistics {
  total_collaborations: number;
  completed_collaborations: number;
  success_rate: number;
  avg_rating: number;
  total_earnings: number;
  response_time_hours: number;
  repeat_clients: number;
  profile_views: number;
  portfolio_engagement: number;
}

export interface CreatorRating {
  id: string;
  business_id: string;
  collaboration_id: string;
  rating: number;
  review: string;
  business_name: string;
  created_at: string;
}

export interface CreatorEarnings {
  total_earnings: number;
  current_month: number;
  last_month: number;
  growth_rate: number;
  pending_payments: number;
  by_category: Record<string, number>;
  earnings_history: Array<{ month: string; amount: number }>;
}

export interface PortfolioItem extends Tables<'portfolio_items'> {
  analytics?: {
    views: number;
    likes: number;
    shares: number;
    engagement_rate: number;
    conversion_rate: number;
  };
}

export interface CreatorSearchFilters {
  search?: string;
  specialties?: string[];
  location?: string;
  min_rating?: number;
  max_rating?: number;
  min_price?: number;
  max_price?: number;
  min_followers?: number;
  max_followers?: number;
  engagement_rate_min?: number;
  engagement_rate_max?: number;
  availability?: 'available' | 'busy' | 'any';
  verified_only?: boolean;
  sort_by?: 'rating' | 'price' | 'followers' | 'engagement' | 'recent';
  sort_order?: 'asc' | 'desc';
}

export interface CreatorRecommendation {
  creator: CreatorProfile;
  match_score: number;
  match_reasons: string[];
  estimated_performance: {
    engagement_rate: number;
    completion_probability: number;
    roi_estimate: number;
  };
}

class EnhancedCreatorsService {
  // Advanced creator search with AI-powered recommendations
  async searchCreators(
    filters: CreatorSearchFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<CreatorProfile[]> {
    try {
      let query = supabase
        .from('creator_profiles')
        .select(`
          *,
          user:users(*),
          portfolio:portfolio_items(*)
        `);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `user.full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,specialties.cs.{${filters.search}}`
        );
      }

      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.min_rating) {
        query = query.gte('average_rating', filters.min_rating);
      }

      if (filters.max_rating) {
        query = query.lte('average_rating', filters.max_rating);
      }

      if (filters.min_price) {
        query = query.gte('min_collaboration_fee', filters.min_price);
      }

      if (filters.max_price) {
        query = query.lte('max_collaboration_fee', filters.max_price);
      }

      if (filters.min_followers) {
        query = query.gte('instagram_followers', filters.min_followers);
      }

      if (filters.max_followers) {
        query = query.lte('instagram_followers', filters.max_followers);
      }

      if (filters.engagement_rate_min) {
        query = query.gte('engagement_rate', filters.engagement_rate_min);
      }

      if (filters.engagement_rate_max) {
        query = query.lte('engagement_rate', filters.engagement_rate_max);
      }

      if (filters.availability === 'available') {
        query = query.eq('is_available', true);
      } else if (filters.availability === 'busy') {
        query = query.eq('is_available', false);
      }

      if (filters.verified_only) {
        query = query.eq('is_verified', true);
      }

      // Apply sorting
      const sortColumn = this.getSortColumn(filters.sort_by);
      const ascending = filters.sort_order === 'asc';
      query = query.order(sortColumn, { ascending });

      const { data, error } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Enhance with statistics
      const enhancedData = await Promise.all(
        (data || []).map(async (creator) => {
          const statistics = await this.getCreatorStatistics(creator.id);
          return { ...creator, statistics };
        })
      );

      return enhancedData;
    } catch (error) {
      console.error('Failed to search creators:', error);
      return [];
    }
  }

  // Get personalized creator recommendations for businesses
  async getRecommendations(
    businessId: string,
    requirements: {
      category: string;
      budget_range: [number, number];
      target_audience: string[];
      campaign_goals: string[];
      preferred_platforms: string[];
    },
    limit: number = 10
  ): Promise<CreatorRecommendation[]> {
    try {
      // Get business collaboration history for better matching
      const businessCollaborations = await collaborationService.getBusinessCollaborations(businessId);
      
      // Get all creators that match basic criteria
      const potentialCreators = await this.searchCreators({
        specialties: [requirements.category],
        min_price: requirements.budget_range[0],
        max_price: requirements.budget_range[1],
        availability: 'available',
        verified_only: true
      }, 50);

      // Calculate match scores and recommendations
      const recommendations: CreatorRecommendation[] = [];
      
      for (const creator of potentialCreators) {
        const matchScore = await this.calculateMatchScore(
          creator,
          requirements,
          businessCollaborations
        );
        
        if (matchScore.score > 0.6) { // Minimum match threshold
          const estimatedPerformance = await this.estimatePerformance(
            creator,
            requirements
          );
          
          recommendations.push({
            creator,
            match_score: matchScore.score,
            match_reasons: matchScore.reasons,
            estimated_performance: estimatedPerformance
          });
        }
      }

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get creator recommendations:', error);
      return [];
    }
  }

  // Get comprehensive creator statistics
  async getCreatorStatistics(creatorId: string): Promise<CreatorStatistics> {
    try {
      // Get collaborations data
      const collaborations = await collaborationService.getCreatorCollaborations(creatorId);
      const completedCollaborations = collaborations.filter(c => c.status === 'completed');
      
      // Get earnings data
      const creatorProfile = await this.getCreatorById(creatorId);
      const payments = creatorProfile ? 
        await paymentsService.getUserPayments(creatorProfile.user_id) :
        [];
      
      const totalEarnings = payments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Get ratings data
      const ratings = await this.getCreatorRatings(creatorId);
      const avgRating = ratings.length > 0 ?
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length :
        0;
      
      // Calculate other metrics
      const successRate = collaborations.length > 0 ?
        (completedCollaborations.length / collaborations.length) * 100 :
        0;
      
      const responseTime = await this.calculateAverageResponseTime(creatorId);
      const repeatClients = await this.countRepeatClients(creatorId);
      const profileViews = await this.getProfileViews(creatorId);
      
      return {
        total_collaborations: collaborations.length,
        completed_collaborations: completedCollaborations.length,
        success_rate: successRate,
        avg_rating: avgRating,
        total_earnings: totalEarnings,
        response_time_hours: responseTime,
        repeat_clients: repeatClients,
        profile_views: profileViews,
        portfolio_engagement: await this.calculatePortfolioEngagement(creatorId)
      };
    } catch (error) {
      console.error('Failed to get creator statistics:', error);
      return {
        total_collaborations: 0,
        completed_collaborations: 0,
        success_rate: 0,
        avg_rating: 0,
        total_earnings: 0,
        response_time_hours: 0,
        repeat_clients: 0,
        profile_views: 0,
        portfolio_engagement: 0
      };
    }
  }

  // Get creator earnings breakdown
  async getCreatorEarnings(creatorId: string): Promise<CreatorEarnings> {
    try {
      const creatorProfile = await this.getCreatorById(creatorId);
      if (!creatorProfile) {
        throw new Error('Creator not found');
      }

      const payments = await paymentsService.getUserPayments(creatorProfile.user_id);
      const approvedPayments = payments.filter(p => p.status === 'approved');
      const pendingPayments = payments.filter(p => p.status === 'pending');
      
      const totalEarnings = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate monthly earnings
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      const currentMonthEarnings = approvedPayments
        .filter(p => new Date(p.created_at) >= currentMonthStart)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const lastMonthEarnings = approvedPayments
        .filter(p => {
          const date = new Date(p.created_at);
          return date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      const growthRate = lastMonthEarnings > 0 ?
        ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 :
        0;
      
      // Earnings by category
      const byCategory: Record<string, number> = {};
      approvedPayments.forEach(payment => {
        const category = payment.type || 'other';
        byCategory[category] = (byCategory[category] || 0) + payment.amount;
      });
      
      // Earnings history (last 12 months)
      const earningsHistory = this.calculateEarningsHistory(approvedPayments, 12);
      
      return {
        total_earnings: totalEarnings,
        current_month: currentMonthEarnings,
        last_month: lastMonthEarnings,
        growth_rate: growthRate,
        pending_payments: pendingAmount,
        by_category: byCategory,
        earnings_history: earningsHistory
      };
    } catch (error) {
      console.error('Failed to get creator earnings:', error);
      return {
        total_earnings: 0,
        current_month: 0,
        last_month: 0,
        growth_rate: 0,
        pending_payments: 0,
        by_category: {},
        earnings_history: []
      };
    }
  }

  // Enhanced portfolio management
  async getEnhancedPortfolio(creatorId: string): Promise<PortfolioItem[]> {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Enhance each portfolio item with analytics
      const enhancedItems = await Promise.all(
        (data || []).map(async (item) => {
          const analytics = await this.getPortfolioItemAnalytics(item.id);
          return { ...item, analytics };
        })
      );

      return enhancedItems;
    } catch (error) {
      console.error('Failed to get enhanced portfolio:', error);
      return [];
    }
  }

  // Add portfolio item with file upload
  async addPortfolioItem(
    creatorId: string,
    itemData: {
      title: string;
      description: string;
      category: string;
      media_files: File[];
      tags?: string[];
      collaboration_id?: string;
    }
  ): Promise<PortfolioItem> {
    try {
      const creatorProfile = await this.getCreatorById(creatorId);
      if (!creatorProfile) {
        throw new Error('Creator not found');
      }

      // Upload media files
      const uploadedFiles = await Promise.all(
        itemData.media_files.map(file =>
          fileUploadService.uploadFile(file, {
            category: 'portfolio',
            userId: creatorProfile.user_id,
            generateThumbnail: true,
            compress: true
          })
        )
      );

      // Create portfolio item
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
          creator_id: creatorId,
          title: itemData.title,
          description: itemData.description,
          category: itemData.category,
          media_urls: uploadedFiles.map(f => f.url),
          thumbnail_url: uploadedFiles[0]?.thumbnail_url,
          tags: itemData.tags || [],
          collaboration_id: itemData.collaboration_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log portfolio update
      await auditService.logUserAction(
        creatorProfile.user_id,
        creatorProfile.user.email || 'unknown',
        'Added portfolio item',
        'portfolio_item',
        data.id,
        { title: itemData.title, category: itemData.category }
      );

      return data;
    } catch (error) {
      console.error('Failed to add portfolio item:', error);
      throw error;
    }
  }

  // Update creator availability and status
  async updateAvailability(
    creatorId: string,
    availability: {
      is_available: boolean;
      availability_note?: string;
      busy_until?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('creator_profiles')
        .update({
          is_available: availability.is_available,
          availability_note: availability.availability_note,
          busy_until: availability.busy_until,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      if (error) {
        throw error;
      }

      // Notify interested businesses if becoming available
      if (availability.is_available) {
        await this.notifyInterestedBusinesses(creatorId);
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
      throw error;
    }
  }

  // Get creator ratings and reviews
  async getCreatorRatings(
    creatorId: string,
    limit: number = 20
  ): Promise<CreatorRating[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_ratings')
        .select(`
          *,
          business_profile:business_profiles(company_name),
          collaboration:collaborations(title)
        `)
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(rating => ({
        id: rating.id,
        business_id: rating.business_id,
        collaboration_id: rating.collaboration_id,
        rating: rating.rating,
        review: rating.review || '',
        business_name: rating.business_profile?.company_name || 'Unknown',
        created_at: rating.created_at
      }));
    } catch (error) {
      console.error('Failed to get creator ratings:', error);
      return [];
    }
  }

  // Advanced creator analytics
  async getCreatorAnalytics(
    creatorId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{
    performance_metrics: any;
    engagement_trends: any;
    revenue_breakdown: any;
    collaboration_success: any;
  }> {
    try {
      const creatorProfile = await this.getCreatorById(creatorId);
      if (!creatorProfile) {
        throw new Error('Creator not found');
      }

      // Get user analytics from the analytics service
      const userAnalytics = await analyticsService.getUserAnalytics(creatorProfile.user_id);
      
      // Get earnings data
      const earnings = await this.getCreatorEarnings(creatorId);
      
      // Get collaboration success metrics
      const collaborations = await collaborationService.getCreatorCollaborations(creatorId);
      
      return {
        performance_metrics: {
          total_collaborations: userAnalytics.collaboration_requests,
          completion_rate: userAnalytics.completion_rate,
          response_rate: userAnalytics.response_rate,
          avg_rating: userAnalytics.avg_rating,
          engagement_score: userAnalytics.engagement_score
        },
        engagement_trends: {
          profile_views: userAnalytics.profile_views,
          portfolio_engagement: await this.calculatePortfolioEngagement(creatorId),
          social_growth: this.calculateSocialGrowth(creatorProfile)
        },
        revenue_breakdown: {
          total_earnings: earnings.total_earnings,
          monthly_trend: earnings.earnings_history,
          by_category: earnings.by_category,
          growth_rate: earnings.growth_rate
        },
        collaboration_success: {
          success_rate: this.calculateSuccessRate(collaborations),
          repeat_client_rate: await this.calculateRepeatClientRate(creatorId),
          avg_collaboration_value: this.calculateAverageCollaborationValue(collaborations)
        }
      };
    } catch (error) {
      console.error('Failed to get creator analytics:', error);
      return {
        performance_metrics: {},
        engagement_trends: {},
        revenue_breakdown: {},
        collaboration_success: {}
      };
    }
  }

  // Private helper methods
  private async getCreatorById(creatorId: string): Promise<CreatorProfile | null> {
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select(`
          *,
          user:users(*),
          portfolio:portfolio_items(*)
        `)
        .eq('id', creatorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get creator by ID:', error);
      return null;
    }
  }

  private getSortColumn(sortBy?: string): string {
    switch (sortBy) {
      case 'rating':
        return 'average_rating';
      case 'price':
        return 'min_collaboration_fee';
      case 'followers':
        return 'instagram_followers';
      case 'engagement':
        return 'engagement_rate';
      case 'recent':
        return 'updated_at';
      default:
        return 'ur_score';
    }
  }

  private async calculateMatchScore(
    creator: CreatorProfile,
    requirements: any,
    businessHistory: any[]
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];
    
    // Category match (40% weight)
    if (creator.specialties?.includes(requirements.category)) {
      score += 0.4;
      reasons.push(`Especialista en ${requirements.category}`);
    }
    
    // Budget fit (20% weight)
    const budgetMatch = this.calculateBudgetMatch(
      [creator.min_collaboration_fee || 0, creator.max_collaboration_fee || 0],
      requirements.budget_range
    );
    score += budgetMatch * 0.2;
    if (budgetMatch > 0.8) {
      reasons.push('Budget perfectamente alineado');
    }
    
    // Rating and experience (20% weight)
    if (creator.average_rating && creator.average_rating >= 4.5) {
      score += 0.2;
      reasons.push('Excelente calificación promedio');
    } else if (creator.average_rating && creator.average_rating >= 4.0) {
      score += 0.15;
    }
    
    // Engagement rate (10% weight)
    if (creator.engagement_rate && creator.engagement_rate >= 5) {
      score += 0.1;
      reasons.push('Alto engagement rate');
    }
    
    // Previous collaboration success (10% weight)
    const successRate = await this.getCreatorSuccessRate(creator.id);
    if (successRate >= 0.9) {
      score += 0.1;
      reasons.push('Alta tasa de éxito en colaboraciones');
    }
    
    return { score: Math.min(score, 1), reasons };
  }

  private calculateBudgetMatch(creatorRange: [number, number], requirementRange: [number, number]): number {
    const [creatorMin, creatorMax] = creatorRange;
    const [reqMin, reqMax] = requirementRange;
    
    // Calculate overlap
    const overlapStart = Math.max(creatorMin, reqMin);
    const overlapEnd = Math.min(creatorMax, reqMax);
    
    if (overlapEnd < overlapStart) {
      return 0; // No overlap
    }
    
    const overlapSize = overlapEnd - overlapStart;
    const reqRangeSize = reqMax - reqMin;
    
    return overlapSize / reqRangeSize;
  }

  private async estimatePerformance(
    creator: CreatorProfile,
    requirements: any
  ): Promise<{
    engagement_rate: number;
    completion_probability: number;
    roi_estimate: number;
  }> {
    // Mock performance estimation - in production, this would use ML models
    return {
      engagement_rate: creator.engagement_rate || 3.5,
      completion_probability: 0.85,
      roi_estimate: 2.3
    };
  }

  private async calculateAverageResponseTime(creatorId: string): Promise<number> {
    // Mock calculation - in production, this would analyze message response times
    return 4.5; // hours
  }

  private async countRepeatClients(creatorId: string): Promise<number> {
    try {
      const collaborations = await collaborationService.getCreatorCollaborations(creatorId);
      const businessIds = new Set();
      const repeatBusinessIds = new Set();
      
      collaborations.forEach(collab => {
        if (businessIds.has(collab.business_id)) {
          repeatBusinessIds.add(collab.business_id);
        } else {
          businessIds.add(collab.business_id);
        }
      });
      
      return repeatBusinessIds.size;
    } catch (error) {
      return 0;
    }
  }

  private async getProfileViews(creatorId: string): Promise<number> {
    // Mock data - in production, this would track actual profile views
    return Math.floor(Math.random() * 1000) + 500;
  }

  private async calculatePortfolioEngagement(creatorId: string): Promise<number> {
    // Mock calculation - in production, this would analyze portfolio item engagement
    return 6.8; // percentage
  }

  private async getPortfolioItemAnalytics(itemId: string): Promise<{
    views: number;
    likes: number;
    shares: number;
    engagement_rate: number;
    conversion_rate: number;
  }> {
    // Mock analytics - in production, this would track real metrics
    return {
      views: Math.floor(Math.random() * 500) + 100,
      likes: Math.floor(Math.random() * 50) + 10,
      shares: Math.floor(Math.random() * 20) + 2,
      engagement_rate: Math.random() * 10 + 2,
      conversion_rate: Math.random() * 5 + 1
    };
  }

  private calculateEarningsHistory(
    payments: any[],
    months: number
  ): Array<{ month: string; amount: number }> {
    const history: Array<{ month: string; amount: number }> = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      
      const monthPayments = payments.filter(p => 
        p.created_at.substring(0, 7) === monthKey && p.status === 'approved'
      );
      
      const amount = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      history.push({
        month: monthKey,
        amount
      });
    }
    
    return history;
  }

  private async getCreatorSuccessRate(creatorId: string): Promise<number> {
    try {
      const collaborations = await collaborationService.getCreatorCollaborations(creatorId);
      if (collaborations.length === 0) return 0;
      
      const completed = collaborations.filter(c => c.status === 'completed').length;
      return completed / collaborations.length;
    } catch (error) {
      return 0;
    }
  }

  private calculateSocialGrowth(creator: any): any {
    // Mock social growth calculation
    return {
      instagram_growth: 5.2,
      tiktok_growth: 8.7,
      youtube_growth: 3.1
    };
  }

  private calculateSuccessRate(collaborations: any[]): number {
    if (collaborations.length === 0) return 0;
    const completed = collaborations.filter(c => c.status === 'completed').length;
    return (completed / collaborations.length) * 100;
  }

  private async calculateRepeatClientRate(creatorId: string): Promise<number> {
    const repeatClients = await this.countRepeatClients(creatorId);
    const collaborations = await collaborationService.getCreatorCollaborations(creatorId);
    const uniqueClients = new Set(collaborations.map(c => c.business_id)).size;
    
    return uniqueClients > 0 ? (repeatClients / uniqueClients) * 100 : 0;
  }

  private calculateAverageCollaborationValue(collaborations: any[]): number {
    if (collaborations.length === 0) return 0;
    const total = collaborations.reduce((sum, c) => sum + (c.compensation_amount || 0), 0);
    return total / collaborations.length;
  }

  private async notifyInterestedBusinesses(creatorId: string): Promise<void> {
    // This would notify businesses who have shown interest in this creator
    console.log(`📢 Notifying interested businesses about creator ${creatorId} availability`);
  }
}

export const enhancedCreatorsService = new EnhancedCreatorsService();
export default enhancedCreatorsService;