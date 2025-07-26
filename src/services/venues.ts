import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Venue = Tables<'venues'> & {
  business_profile: Tables<'business_profiles'> & {
    user: Tables<'users'>;
  };
  offers?: Tables<'offers'>[];
  reservations?: Tables<'reservations'>[];
};

export type VenueFilters = {
  search?: string;
  category?: string;
  city?: string;
  is_verified?: boolean;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
};

export type VenueStats = {
  totalBookings: number;
  activeOffers: number;
  monthlyRevenue: number;
  avgRating: number;
  totalReviews: number;
  creditsRedeemed: number;
};

class VenuesService {
  // Get all venues with filters
  async getVenues(filters: VenueFilters = {}): Promise<Venue[]> {
    let query = supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `);

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
      );
    }

    // Apply category filter
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Apply city filter
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    // Apply verification filter
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified);
    }

    // Apply active filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    // Apply location filter (if latitude/longitude provided)
    if (filters.latitude && filters.longitude && filters.radius) {
      // Using PostGIS distance calculation (requires PostGIS extension)
      query = query.rpc('venues_within_radius', {
        lat: filters.latitude,
        lng: filters.longitude,
        radius_km: filters.radius
      });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }

    return data || [];
  }

  // Get single venue by ID
  async getVenue(id: string): Promise<Venue | null> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching venue:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  // Get venues by business profile ID
  async getVenuesByBusinessId(businessProfileId: string): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .eq('business_profile_id', businessProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching venues by business ID:', error);
      throw error;
    }

    return data || [];
  }

  // Create new venue
  async createVenue(
    businessProfileId: string,
    venueData: Omit<TablesInsert<'venues'>, 'business_profile_id'>
  ): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .insert({
        business_profile_id: businessProfileId,
        ...venueData,
      })
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .single();

    if (error) {
      console.error('Error creating venue:', error);
      throw error;
    }

    return data;
  }

  // Update venue
  async updateVenue(
    id: string,
    updates: TablesUpdate<'venues'>
  ): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .single();

    if (error) {
      console.error('Error updating venue:', error);
      throw error;
    }

    return data;
  }

  // Delete venue
  async deleteVenue(id: string): Promise<void> {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting venue:', error);
      throw error;
    }
  }

  // Get venue statistics
  async getVenueStats(venueId: string): Promise<VenueStats> {
    // Get reservations count and revenue
    const { data: reservations, error: reservationError } = await supabase
      .from('reservations')
      .select('credits_used, venue_commission_ars, rating')
      .eq('venue_id', venueId);

    if (reservationError) {
      console.error('Error fetching venue reservations:', reservationError);
      throw reservationError;
    }

    // Get active offers count
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('id')
      .eq('venue_id', venueId)
      .eq('is_active', true);

    if (offersError) {
      console.error('Error fetching venue offers:', offersError);
      throw offersError;
    }

    const totalBookings = reservations?.length || 0;
    const activeOffers = offers?.length || 0;
    const monthlyRevenue = reservations?.reduce((sum, r) => 
      sum + (r.venue_commission_ars || 0), 0
    ) || 0;
    const creditsRedeemed = reservations?.reduce((sum, r) => 
      sum + (r.credits_used || 0), 0
    ) || 0;
    
    // Calculate average rating
    const ratings = reservations?.filter(r => r.rating).map(r => r.rating) || [];
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + (rating || 0), 0) / ratings.length 
      : 0;
    const totalReviews = ratings.length;

    return {
      totalBookings,
      activeOffers,
      monthlyRevenue,
      avgRating,
      totalReviews,
      creditsRedeemed,
    };
  }

  // Search venues
  async searchVenues(query: string, limit: number = 20): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`
      )
      .eq('is_active', true)
      .limit(limit)
      .order('is_verified', { ascending: false });

    if (error) {
      console.error('Error searching venues:', error);
      throw error;
    }

    return data || [];
  }

  // Get venues by category
  async getVenuesByCategory(category: string, limit: number = 20): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .eq('category', category)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching venues by category:', error);
      throw error;
    }

    return data || [];
  }

  // Get featured venues
  async getFeaturedVenues(limit: number = 10): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .eq('is_verified', true)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured venues:', error);
      throw error;
    }

    return data || [];
  }

  // Get venues by city
  async getVenuesByCity(city: string, limit: number = 20): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*),
        reservations(*)
      `)
      .eq('city', city)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching venues by city:', error);
      throw error;
    }

    return data || [];
  }

  // Update venue verification status (admin only)
  async updateVerificationStatus(id: string, isVerified: boolean): Promise<Venue> {
    return this.updateVenue(id, {
      is_verified: isVerified,
    });
  }

  // Toggle venue active status
  async toggleActiveStatus(id: string): Promise<Venue> {
    // First get current status
    const venue = await this.getVenue(id);
    if (!venue) {
      throw new Error('Venue not found');
    }

    return this.updateVenue(id, {
      is_active: !venue.is_active,
    });
  }

  // Get venue dashboard data
  async getVenueDashboardData(venueId: string): Promise<{
    venue: Venue;
    stats: VenueStats;
    recentReservations: any[];
    topOffers: any[];
  }> {
    const [venue, stats] = await Promise.all([
      this.getVenue(venueId),
      this.getVenueStats(venueId)
    ]);

    if (!venue) {
      throw new Error('Venue not found');
    }

    // Get recent reservations
    const { data: recentReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        *,
        user:users(*),
        offer:offers(*)
      `)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (reservationsError) {
      console.error('Error fetching recent reservations:', reservationsError);
      throw reservationsError;
    }

    // Get top offers by bookings
    const { data: topOffers, error: offersError } = await supabase
      .from('offers')
      .select(`
        *,
        reservations:reservations(count)
      `)
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .order('total_bookings', { ascending: false })
      .limit(5);

    if (offersError) {
      console.error('Error fetching top offers:', offersError);
      throw offersError;
    }

    return {
      venue,
      stats,
      recentReservations: recentReservations || [],
      topOffers: topOffers || [],
    };
  }

  // Get venues with availability for a specific date
  async getAvailableVenues(
    date: string,
    category?: string,
    city?: string
  ): Promise<Venue[]> {
    let query = supabase
      .from('venues')
      .select(`
        *,
        business_profile:business_profiles(
          *,
          user:users(*)
        ),
        offers(*)
      `)
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query.order('average_rating', { ascending: false });

    if (error) {
      console.error('Error fetching available venues:', error);
      throw error;
    }

    // TODO: Filter by actual availability based on offers and existing reservations
    return data || [];
  }
}

export const venuesService = new VenuesService();