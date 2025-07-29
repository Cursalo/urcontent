// Mock Creator Profile data - database-ready structure
import { MockCreatorProfile, mockUsers } from './mockUsers';

export const mockCreatorProfiles: MockCreatorProfile[] = [
  {
    id: 'creator-profile-001',
    user_id: 'creator-user-001',
    bio: 'Creative content creator specializing in fashion and lifestyle photography. Based in Barcelona, I create authentic content that resonates with audiences. Available for collaborations worldwide with a focus on sustainable fashion and conscious living.',
    specialties: ['Fashion', 'Lifestyle', 'Travel', 'Beauty', 'Sustainability'],
    rating: 4.9,
    ur_score: 94,
    instagram_followers: 87500,
    tiktok_followers: 32800,
    youtube_followers: 26300,
    instagram_handle: '@sofia_creator',
    tiktok_handle: '@sofiacreative',
    youtube_handle: 'Sofia Martinez',
    engagement_rate: 6.8,
    min_collaboration_fee: 50000, // €500 in cents
    max_collaboration_fee: 250000, // €2500 in cents
    is_available: true,
    public_slug: 'sofia-martinez',
    years_experience: 4,
    preferred_brands: ['sustainable fashion', 'beauty', 'travel', 'lifestyle'],
    content_style: ['minimalist', 'bright', 'authentic', 'storytelling'],
    rates_per_post: 120000, // €1200 in cents
    rates_per_story: 25000, // €250 in cents
    rates_per_reel: 150000, // €1500 in cents
    rates_per_video: 300000, // €3000 in cents
    location_preferences: ['Barcelona', 'Madrid', 'Europe', 'Remote'],
    languages_spoken: ['Spanish', 'English', 'Catalan'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-07-29T10:00:00Z'
  },
  {
    id: 'creator-profile-002',
    user_id: 'creator-user-002',
    bio: 'Fitness enthusiast and lifestyle creator based in Madrid. I inspire people to live healthier, more active lives through engaging content and practical tips. Specializing in fitness, technology reviews, and urban lifestyle.',
    specialties: ['Fitness', 'Lifestyle', 'Technology', 'Health & Wellness'],
    rating: 4.7,
    ur_score: 86,
    instagram_followers: 78400,
    tiktok_followers: 45200,
    youtube_followers: 12800,
    instagram_handle: '@marco_lifestyle',
    tiktok_handle: '@marcofit',
    youtube_handle: 'Marco Rodriguez Fitness',
    engagement_rate: 5.2,
    min_collaboration_fee: 40000, // €400 in cents
    max_collaboration_fee: 180000, // €1800 in cents
    is_available: true,
    public_slug: 'marco-rodriguez',
    years_experience: 3,
    preferred_brands: ['fitness', 'technology', 'health', 'sportswear'],
    content_style: ['energetic', 'motivational', 'informative', 'dynamic'],
    rates_per_post: 80000, // €800 in cents
    rates_per_story: 20000, // €200 in cents
    rates_per_reel: 100000, // €1000 in cents
    rates_per_video: 200000, // €2000 in cents
    location_preferences: ['Madrid', 'Spain', 'Gyms', 'Outdoor'],
    languages_spoken: ['Spanish', 'English'],
    created_at: '2024-02-10T08:30:00Z',
    updated_at: '2024-07-29T08:30:00Z'
  },
  {
    id: 'creator-profile-003',
    user_id: 'creator-user-003',
    bio: 'Food photographer and culinary storyteller from Valencia. I showcase the beauty of Mediterranean cuisine and local food culture. Passionate about authentic flavors and sustainable cooking practices.',
    specialties: ['Food', 'Travel', 'Photography', 'Culture'],
    rating: 4.5,
    ur_score: 78,
    instagram_followers: 32100,
    tiktok_followers: 18600,
    youtube_followers: 8400,
    instagram_handle: '@elena_foodie',
    tiktok_handle: '@elenafoodstories',
    youtube_handle: 'Elena Garcia Food',
    engagement_rate: 8.1,
    min_collaboration_fee: 30000, // €300 in cents
    max_collaboration_fee: 120000, // €1200 in cents
    is_available: true,
    public_slug: 'elena-garcia',
    years_experience: 2,
    preferred_brands: ['food', 'restaurants', 'kitchenware', 'local products'],
    content_style: ['warm', 'authentic', 'artistic', 'detailed'],
    rates_per_post: 60000, // €600 in cents
    rates_per_story: 15000, // €150 in cents
    rates_per_reel: 75000, // €750 in cents
    rates_per_video: 150000, // €1500 in cents
    location_preferences: ['Valencia', 'Mediterranean', 'Restaurants', 'Markets'],
    languages_spoken: ['Spanish', 'English', 'Valencian'],
    created_at: '2024-03-20T14:15:00Z',
    updated_at: '2024-07-29T14:15:00Z'
  }
];

// Helper functions for creator profiles
export const getCreatorProfileById = (id: string): MockCreatorProfile | undefined => {
  return mockCreatorProfiles.find(profile => profile.id === id);
};

export const getCreatorProfileByUserId = (userId: string): MockCreatorProfile | undefined => {
  return mockCreatorProfiles.find(profile => profile.user_id === userId);
};

export const getCreatorProfilesBySpecialty = (specialty: string): MockCreatorProfile[] => {
  return mockCreatorProfiles.filter(profile => 
    profile.specialties.some(s => s && typeof s === 'string' && s.toLowerCase().includes(specialty.toLowerCase()))
  );
};

export const getAvailableCreatorProfiles = (): MockCreatorProfile[] => {
  return mockCreatorProfiles.filter(profile => profile.is_available);
};

export const getCreatorProfilesByRating = (minRating: number): MockCreatorProfile[] => {
  return mockCreatorProfiles.filter(profile => profile.rating >= minRating);
};

export const getCreatorProfilesByURScore = (minScore: number): MockCreatorProfile[] => {
  return mockCreatorProfiles.filter(profile => profile.ur_score >= minScore);
};