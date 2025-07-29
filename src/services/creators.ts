import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { mockCreatorProfiles, mockPortfolioItems, mockUsers, MockCreatorProfile, MockPortfolioItem, MockUser } from '@/data/mockUsers';

export type Creator = Tables<'creator_profiles'> & {
  user: Tables<'users'>;
  portfolio: Tables<'portfolio_items'>[];
};

// Mock Creator type for development
export type MockCreator = MockCreatorProfile & {
  user: MockUser;
  portfolio: MockPortfolioItem[];
};

// Environment flag for using mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
                      window.location.hostname === 'localhost' ||
                      !import.meta.env.VITE_SUPABASE_URL;

export type CreatorFilters = {
  search?: string;
  category?: string;
  location?: string;
  followersRange?: [number, number];
  priceRange?: [number, number];
  engagementRange?: [number, number];
  specialties?: string[];
  isAvailable?: boolean;
};

class CreatorService {
  // Get all creators with filters for marketplace
  async getCreators(filters: CreatorFilters = {}): Promise<Creator[]> {
    let query = supabase
      .from('creator_profiles')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .eq('is_available', filters.isAvailable ?? true);

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `user.full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,specialties.cs.{${filters.search}}`
      );
    }

    // Apply location filter
    if (filters.location) {
      query = query.eq('user.location', filters.location);
    }

    // Apply price range filter
    if (filters.priceRange) {
      query = query
        .gte('min_collaboration_fee', filters.priceRange[0])
        .lte('max_collaboration_fee', filters.priceRange[1]);
    }

    // Apply engagement rate filter
    if (filters.engagementRange) {
      query = query
        .gte('engagement_rate', filters.engagementRange[0])
        .lte('engagement_rate', filters.engagementRange[1]);
    }

    // Apply followers range filter (Instagram followers)
    if (filters.followersRange) {
      query = query
        .gte('instagram_followers', filters.followersRange[0])
        .lte('instagram_followers', filters.followersRange[1]);
    }

    // Apply specialties filter
    if (filters.specialties && filters.specialties.length > 0) {
      query = query.overlaps('specialties', filters.specialties);
    }

    const { data, error } = await query.order('ur_score', { ascending: false });

    if (error) {
      console.error('Error fetching creators:', error);
      throw error;
    }

    return data || [];
  }

  // Get a single creator by ID
  async getCreator(id: string): Promise<Creator | null> {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching creator:', error);
      throw error;
    }

    return data;
  }

  // Get creator by user ID
  async getCreatorByUserId(userId: string): Promise<Creator | MockCreator | null> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for getCreatorByUserId:', userId);
      
      // Find creator profile by user_id
      const creatorProfile = mockCreatorProfiles.find(profile => profile.user_id === userId);
      if (!creatorProfile) {
        console.log('No mock creator profile found for user_id:', userId);
        return null;
      }
      
      // Find associated user
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        console.log('No mock user found for user_id:', userId);
        return null;
      }
      
      // Find portfolio items
      const portfolio = mockPortfolioItems.filter(item => item.creator_id === creatorProfile.id);
      
      const mockCreator: MockCreator = {
        ...creatorProfile,
        user,
        portfolio
      };
      
      console.log('Mock creator found:', mockCreator);
      return mockCreator;
    }

    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select(`
          *,
          user:users(*),
          portfolio:portfolio_items(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching creator by user ID:', error);
        if (error.code === 'PGRST116') {
          // No profile found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase error, falling back to mock data:', error);
      
      // Fallback to mock data on Supabase errors
      const creatorProfile = mockCreatorProfiles.find(profile => profile.user_id === userId);
      if (!creatorProfile) return null;
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) return null;
      
      const portfolio = mockPortfolioItems.filter(item => item.creator_id === creatorProfile.id);
      
      return {
        ...creatorProfile,
        user,
        portfolio
      } as MockCreator;
    }
  }

  // Create a new creator profile
  async createCreatorProfile(
    userId: string, 
    profileData: Omit<TablesInsert<'creator_profiles'>, 'user_id'>
  ): Promise<Creator> {
    const { data, error } = await supabase
      .from('creator_profiles')
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .single();

    if (error) {
      console.error('Error creating creator profile:', error);
      throw error;
    }

    return data;
  }

  // Update creator profile
  async updateCreatorProfile(
    id: string, 
    updates: TablesUpdate<'creator_profiles'>
  ): Promise<Creator> {
    const { data, error } = await supabase
      .from('creator_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .single();

    if (error) {
      console.error('Error updating creator profile:', error);
      throw error;
    }

    return data;
  }

  // Add portfolio item
  async addPortfolioItem(
    creatorId: string,
    portfolioData: Omit<TablesInsert<'portfolio_items'>, 'creator_id'>
  ): Promise<Tables<'portfolio_items'>> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert({
        creator_id: creatorId,
        ...portfolioData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding portfolio item:', error);
      throw error;
    }

    return data;
  }

  // Update portfolio item
  async updatePortfolioItem(
    id: string,
    updates: TablesUpdate<'portfolio_items'>
  ): Promise<Tables<'portfolio_items'>> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating portfolio item:', error);
      throw error;
    }

    return data;
  }

  // Delete portfolio item
  async deletePortfolioItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting portfolio item:', error);
      throw error;
    }
  }

  // Get creator analytics
  async getCreatorAnalytics(userId: string): Promise<Tables<'user_analytics'>[]> {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creator analytics:', error);
      throw error;
    }

    return data || [];
  }

  // Update creator availability
  async updateAvailability(id: string, isAvailable: boolean): Promise<void> {
    const { error } = await supabase
      .from('creator_profiles')
      .update({ 
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating creator availability:', error);
      throw error;
    }
  }

  // Search creators by specialties or location
  async searchCreators(query: string, limit: number = 20): Promise<Creator[]> {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .or(
        `user.full_name.ilike.%${query}%,bio.ilike.%${query}%,specialties.cs.{${query}}`
      )
      .eq('is_available', true)
      .limit(limit)
      .order('ur_score', { ascending: false });

    if (error) {
      console.error('Error searching creators:', error);
      throw error;
    }

    return data || [];
  }

  // Get top creators by URScore
  async getTopCreators(limit: number = 10): Promise<Creator[]> {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .eq('is_available', true)
      .order('ur_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top creators:', error);
      throw error;
    }

    return data || [];
  }

  // Get creators by category/specialty
  async getCreatorsByCategory(category: string, limit: number = 20): Promise<Creator[]> {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*)
      `)
      .contains('specialties', [category])
      .eq('is_available', true)
      .order('ur_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching creators by category:', error);
      throw error;
    }

    return data || [];
  }
}

export const creatorService = new CreatorService();