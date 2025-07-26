import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Offer = Tables<'offers'> & {
  venue: Tables<'venues'> & {
    business_profile: Tables<'business_profiles'> & {
      user: Tables<'users'>;
    };
  };
  reservations?: Tables<'reservations'>[];
};

export type OfferFilters = {
  search?: string;
  category?: string;
  min_membership_tier?: string;
  city?: string;
  min_credits?: number;
  max_credits?: number;
  min_value?: number;
  max_value?: number;
  is_active?: boolean;
  is_featured?: boolean;
  venue_id?: string;
  available_date?: string;
};

export type OfferStats = {
  totalBookings: number;
  totalRevenue: number;
  avgRating: number;
  conversionRate: number;
  creditsRedeemed: number;
  lastBooking?: string;
};

class OffersService {
  // Get all offers with filters
  async getOffers(filters: OfferFilters = {}): Promise<Offer[]> {
    let query = supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `);

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Apply category filter
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Apply membership tier filter
    if (filters.min_membership_tier) {
      const tierOrder = { basic: 1, premium: 2, vip: 3 };
      const minTierValue = tierOrder[filters.min_membership_tier as keyof typeof tierOrder];
      // This would need a custom function or different approach in real implementation
      query = query.gte('min_membership_tier', filters.min_membership_tier);
    }

    // Apply city filter (through venue)
    if (filters.city) {
      query = query.eq('venue.city', filters.city);
    }

    // Apply credits range filter
    if (filters.min_credits) {
      query = query.gte('credit_cost', filters.min_credits);
    }
    if (filters.max_credits) {
      query = query.lte('credit_cost', filters.max_credits);
    }

    // Apply value range filter
    if (filters.min_value) {
      query = query.gte('original_value_ars', filters.min_value);
    }
    if (filters.max_value) {
      query = query.lte('original_value_ars', filters.max_value);
    }

    // Apply active filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    // Apply featured filter
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    // Apply venue filter
    if (filters.venue_id) {
      query = query.eq('venue_id', filters.venue_id);
    }

    // Filter by valid date range
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('valid_from', today);
    query = query.or(`valid_until.is.null,valid_until.gte.${today}`);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }

    return data || [];
  }

  // Get single offer by ID
  async getOffer(id: string): Promise<Offer | null> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching offer:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  // Get offers by venue ID
  async getOffersByVenueId(venueId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers by venue ID:', error);
      throw error;
    }

    return data || [];
  }

  // Create new offer
  async createOffer(
    venueId: string,
    offerData: Omit<TablesInsert<'offers'>, 'venue_id'>
  ): Promise<Offer> {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        venue_id: venueId,
        ...offerData,
      })
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      throw error;
    }

    return data;
  }

  // Update offer
  async updateOffer(
    id: string,
    updates: TablesUpdate<'offers'>
  ): Promise<Offer> {
    const { data, error } = await supabase
      .from('offers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .single();

    if (error) {
      console.error('Error updating offer:', error);
      throw error;
    }

    return data;
  }

  // Delete offer
  async deleteOffer(id: string): Promise<void> {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  }

  // Get offer statistics
  async getOfferStats(offerId: string): Promise<OfferStats> {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('credits_used, venue_commission_ars, rating, created_at')
      .eq('offer_id', offerId);

    if (error) {
      console.error('Error fetching offer reservations:', error);
      throw error;
    }

    const totalBookings = reservations?.length || 0;
    const totalRevenue = reservations?.reduce((sum, r) => 
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

    // Calculate conversion rate (would need view/impression data)
    const conversionRate = 0; // TODO: Implement with analytics data

    // Get last booking date
    const lastBooking = reservations && reservations.length > 0
      ? reservations.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]?.created_at
      : undefined;

    return {
      totalBookings,
      totalRevenue,
      avgRating,
      conversionRate,
      creditsRedeemed,
      lastBooking,
    };
  }

  // Search offers
  async searchOffers(query: string, limit: number = 20): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      )
      .eq('is_active', true)
      .limit(limit)
      .order('is_featured', { ascending: false });

    if (error) {
      console.error('Error searching offers:', error);
      throw error;
    }

    return data || [];
  }

  // Get offers by category
  async getOffersByCategory(category: string, limit: number = 20): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .eq('category', category)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching offers by category:', error);
      throw error;
    }

    return data || [];
  }

  // Get featured offers
  async getFeaturedOffers(limit: number = 10): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured offers:', error);
      throw error;
    }

    return data || [];
  }

  // Get offers by membership tier
  async getOffersByMembershipTier(tier: string, limit: number = 20): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations(*)
      `)
      .lte('min_membership_tier', tier) // User can access this tier and below
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching offers by membership tier:', error);
      throw error;
    }

    return data || [];
  }

  // Toggle offer active status
  async toggleActiveStatus(id: string): Promise<Offer> {
    // First get current status
    const offer = await this.getOffer(id);
    if (!offer) {
      throw new Error('Offer not found');
    }

    return this.updateOffer(id, {
      is_active: !offer.is_active,
    });
  }

  // Toggle offer featured status
  async toggleFeaturedStatus(id: string): Promise<Offer> {
    // First get current status
    const offer = await this.getOffer(id);
    if (!offer) {
      throw new Error('Offer not found');
    }

    return this.updateOffer(id, {
      is_featured: !offer.is_featured,
    });
  }

  // Duplicate offer
  async duplicateOffer(id: string, updates?: Partial<TablesInsert<'offers'>>): Promise<Offer> {
    const originalOffer = await this.getOffer(id);
    if (!originalOffer) {
      throw new Error('Original offer not found');
    }

    const duplicatedData: TablesInsert<'offers'> = {
      venue_id: originalOffer.venue_id,
      title: `${originalOffer.title} (Copia)`,
      description: originalOffer.description,
      type: originalOffer.type,
      category: originalOffer.category,
      original_value_ars: originalOffer.original_value_ars,
      credit_cost: originalOffer.credit_cost,
      min_membership_tier: originalOffer.min_membership_tier,
      max_redemptions_per_month: originalOffer.max_redemptions_per_month,
      total_capacity: originalOffer.total_capacity,
      duration_minutes: originalOffer.duration_minutes,
      available_days: originalOffer.available_days,
      available_time_slots: originalOffer.available_time_slots,
      advance_booking_hours: originalOffer.advance_booking_hours,
      cancellation_hours: originalOffer.cancellation_hours,
      special_requirements: originalOffer.special_requirements,
      content_requirements: originalOffer.content_requirements,
      images: originalOffer.images,
      is_featured: false,
      is_active: false, // Start as inactive
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: originalOffer.valid_until,
      ...updates,
    };

    return this.createOffer(originalOffer.venue_id, duplicatedData);
  }

  // Get available time slots for an offer on a specific date
  async getAvailableTimeSlots(
    offerId: string, 
    date: string
  ): Promise<string[]> {
    const offer = await this.getOffer(offerId);
    if (!offer || !offer.available_time_slots) {
      return [];
    }

    // Get existing reservations for this date
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('scheduled_time')
      .eq('offer_id', offerId)
      .eq('scheduled_date', date)
      .in('status', ['confirmed', 'checked_in']);

    if (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }

    const bookedTimes = reservations?.map(r => r.scheduled_time) || [];
    
    // Filter out booked time slots
    return offer.available_time_slots.filter(slot => !bookedTimes.includes(slot));
  }

  // Check if offer is available for booking
  async isOfferAvailable(
    offerId: string,
    date: string,
    time?: string
  ): Promise<boolean> {
    const offer = await this.getOffer(offerId);
    if (!offer || !offer.is_active) {
      return false;
    }

    // Check if date is within valid range
    const offerDate = new Date(date);
    const today = new Date();
    const validFrom = new Date(offer.valid_from);
    const validUntil = offer.valid_until ? new Date(offer.valid_until) : null;

    if (offerDate < today || offerDate < validFrom) {
      return false;
    }

    if (validUntil && offerDate > validUntil) {
      return false;
    }

    // Check advance booking requirement
    const advanceHours = offer.advance_booking_hours || 24;
    const requiredBookingTime = new Date(today.getTime() + advanceHours * 60 * 60 * 1000);
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const bookingDateTime = new Date(offerDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      if (bookingDateTime < requiredBookingTime) {
        return false;
      }
    }

    // Check capacity if specified
    if (offer.total_capacity) {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('offer_id', offerId)
        .eq('scheduled_date', date)
        .in('status', ['confirmed', 'checked_in']);

      if (error) {
        console.error('Error checking capacity:', error);
        throw error;
      }

      if (reservations && reservations.length >= offer.total_capacity) {
        return false;
      }
    }

    return true;
  }

  // Get trending offers
  async getTrendingOffers(limit: number = 10): Promise<Offer[]> {
    // Get offers with most bookings in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        venue:venues(
          *,
          business_profile:business_profiles(
            *,
            user:users(*)
          )
        ),
        reservations!inner(*)
      `)
      .eq('is_active', true)
      .gte('reservations.created_at', thirtyDaysAgo.toISOString())
      .order('total_bookings', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending offers:', error);
      throw error;
    }

    return data || [];
  }
}

export const offersService = new OffersService();