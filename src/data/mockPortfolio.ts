// Mock Portfolio Items data - database-ready structure
import { MockPortfolioItem } from './mockUsers';

export const mockPortfolioItems: MockPortfolioItem[] = [
  // Sofia Martinez (creator-profile-001) Portfolio
  {
    id: 'portfolio-001',
    creator_id: 'creator-profile-001',
    title: 'Sustainable Summer Fashion Collection',
    description: 'Showcasing eco-friendly summer outfits from emerging sustainable brands. Featuring versatile pieces perfect for Mediterranean lifestyle.',
    media_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop',
    media_type: 'carousel',
    platform: 'instagram',
    engagement_stats: {
      likes: 2453,
      comments: 127,
      shares: 89,
      saves: 456,
      reach: 12800,
      impressions: 18500,
      engagement_rate: 7.2
    },
    performance_metrics: {
      click_through_rate: 3.4,
      conversion_rate: 1.8,
      cost_per_engagement: 0.45
    },
    tags: ['sustainable fashion', 'summer', 'mediterranean', 'eco-friendly'],
    brand_mention: 'EcoStyle Brand',
    campaign_id: null,
    is_featured: true,
    created_at: '2024-07-15T10:00:00Z',
    updated_at: '2024-07-15T10:00:00Z'
  },
  {
    id: 'portfolio-002',
    creator_id: 'creator-profile-001',
    title: 'Barcelona Hidden Gems Guide',
    description: 'Discover the secret spots locals love in Barcelona. From cozy cafes to stunning viewpoints, explore the authentic side of the city.',
    media_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
    media_type: 'reel',
    platform: 'instagram',
    engagement_stats: {
      likes: 1876,
      comments: 156,
      shares: 234,
      saves: 567,
      views: 15634,
      reach: 8900,
      impressions: 22100,
      engagement_rate: 8.4
    },
    performance_metrics: {
      click_through_rate: 4.1,
      conversion_rate: 2.3
    },
    tags: ['travel', 'barcelona', 'local guide', 'hidden gems'],
    brand_mention: null,
    campaign_id: null,
    is_featured: true,
    created_at: '2024-07-10T10:00:00Z',
    updated_at: '2024-07-10T10:00:00Z'
  },
  {
    id: 'portfolio-003',
    creator_id: 'creator-profile-001',
    title: '5-Minute Natural Glow Routine',
    description: 'Quick and effective morning skincare routine using natural products. Perfect for busy mornings when you want that healthy glow.',
    media_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
    media_type: 'video',
    platform: 'youtube',
    engagement_stats: {
      views: 8945,
      likes: 567,
      comments: 45,
      shares: 23,
      engagement_rate: 7.1
    },
    performance_metrics: {
      click_through_rate: 2.8,
      conversion_rate: 1.5
    },
    tags: ['beauty', 'skincare', 'natural', 'morning routine'],
    brand_mention: 'Natural Beauty Co',
    campaign_id: 'collab-001',
    is_featured: true,
    created_at: '2024-07-05T10:00:00Z',
    updated_at: '2024-07-05T10:00:00Z'
  },
  {
    id: 'portfolio-004',
    creator_id: 'creator-profile-001',
    title: 'Mediterranean Lifestyle Essentials',
    description: 'Capturing the essence of Mediterranean living through lifestyle photography. From morning coffee rituals to sunset moments.',
    media_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    media_type: 'image',
    platform: 'instagram',
    engagement_stats: {
      likes: 3210,
      comments: 189,
      shares: 156,
      saves: 678,
      reach: 15600,
      impressions: 25400,
      engagement_rate: 6.9
    },
    performance_metrics: {
      click_through_rate: 3.2,
      conversion_rate: 1.9
    },
    tags: ['lifestyle', 'mediterranean', 'photography', 'authentic'],
    brand_mention: null,
    campaign_id: null,
    is_featured: false,
    created_at: '2024-06-28T14:30:00Z',
    updated_at: '2024-06-28T14:30:00Z'
  },
  {
    id: 'portfolio-018',
    creator_id: 'creator-profile-001',
    title: 'Sustainable Fashion Haul',
    description: 'Trying on the latest sustainable fashion pieces from local Spanish brands. Honest review and styling tips included.',
    media_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
    media_type: 'reel',
    platform: 'tiktok',
    engagement_stats: {
      views: 24500,
      likes: 3456,
      comments: 234,
      shares: 456,
      engagement_rate: 9.2
    },
    performance_metrics: {
      click_through_rate: 5.8,
      conversion_rate: 3.4
    },
    tags: ['fashion haul', 'sustainable', 'spanish brands', 'review'],
    brand_mention: 'Local Fashion Collective',
    campaign_id: 'collab-007',
    is_featured: true,
    created_at: '2024-06-15T16:20:00Z',
    updated_at: '2024-06-15T16:20:00Z'
  },
  // Marco Rodriguez (creator-profile-002) Portfolio
  {
    id: 'portfolio-005',
    creator_id: 'creator-profile-002',
    title: 'Ultimate Home Workout Challenge',
    description: '30-day home workout challenge with progressive exercises. No equipment needed, just dedication and consistency.',
    media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    media_type: 'reel',
    platform: 'instagram',
    engagement_stats: {
      likes: 1945,
      comments: 234,
      shares: 567,
      saves: 1234,
      views: 18900,
      reach: 11200,
      impressions: 28700,
      engagement_rate: 9.2
    },
    performance_metrics: {
      click_through_rate: 5.1,
      conversion_rate: 3.2
    },
    tags: ['fitness', 'home workout', 'challenge', 'no equipment'],
    brand_mention: null,
    campaign_id: null,
    is_featured: true,
    created_at: '2024-07-12T08:15:00Z',
    updated_at: '2024-07-12T08:15:00Z'
  },
  {
    id: 'portfolio-006',
    creator_id: 'creator-profile-002',
    title: 'Tech Review: Latest Fitness Tracker',
    description: 'Comprehensive review of the newest fitness tracker. Testing all features during real workouts and daily activities.',
    media_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    media_type: 'video',
    platform: 'youtube',
    engagement_stats: {
      views: 12450,
      likes: 789,
      comments: 67,
      shares: 34,
      engagement_rate: 7.3
    },
    performance_metrics: {
      click_through_rate: 4.2,
      conversion_rate: 2.8
    },
    tags: ['technology', 'fitness tracker', 'review', 'gadgets'],
    brand_mention: 'TechFit Pro',
    campaign_id: 'collab-008',
    is_featured: true,
    created_at: '2024-07-08T16:45:00Z',
    updated_at: '2024-07-08T16:45:00Z'
  },
  {
    id: 'portfolio-019',
    creator_id: 'creator-profile-002',
    title: 'Morning Routine for Productivity',
    description: 'My 6AM morning routine that sets me up for a productive day. Including workout, meditation, and healthy breakfast prep.',
    media_url: 'https://images.unsplash.com/photo-1506629905607-d39173d9e36b?w=800&h=600&fit=crop',
    media_type: 'reel',
    platform: 'instagram',
    engagement_stats: {
      likes: 2100,
      comments: 145,
      shares: 234,
      saves: 890,
      views: 16800,
      reach: 9500,
      impressions: 19200,
      engagement_rate: 8.7
    },
    performance_metrics: {
      click_through_rate: 4.8,
      conversion_rate: 2.9
    },
    tags: ['morning routine', 'productivity', 'wellness', 'healthy lifestyle'],
    brand_mention: null,
    campaign_id: null,
    is_featured: true,
    created_at: '2024-06-22T07:30:00Z',
    updated_at: '2024-06-22T07:30:00Z'
  },
  {
    id: 'portfolio-020',
    creator_id: 'creator-profile-002',
    title: 'Outdoor Training Madrid Parks',
    description: 'Discovering the best outdoor training spots in Madrid. From Retiro Park to Casa de Campo, find your perfect workout location.',
    media_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    media_type: 'video',
    platform: 'youtube',
    engagement_stats: {
      views: 8900,
      likes: 645,
      comments: 78,
      shares: 45,
      engagement_rate: 8.6
    },
    performance_metrics: {
      click_through_rate: 3.9,
      conversion_rate: 2.1
    },
    tags: ['outdoor training', 'madrid', 'parks', 'fitness'],
    brand_mention: 'Madrid City Tourism',
    campaign_id: 'collab-009',
    is_featured: false,
    created_at: '2024-06-05T14:00:00Z',
    updated_at: '2024-06-05T14:00:00Z'
  },
  // Elena Garcia (creator-profile-003) Portfolio
  {
    id: 'portfolio-007',
    creator_id: 'creator-profile-003',
    title: 'Valencia Food Market Tour',
    description: 'Exploring the vibrant Mercado Central in Valencia. Discovering local ingredients and traditional recipes from passionate vendors.',
    media_url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&h=600&fit=crop',
    media_type: 'reel',
    platform: 'tiktok',
    engagement_stats: {
      views: 8734,
      likes: 1456,
      comments: 123,
      shares: 234,
      engagement_rate: 10.2
    },
    performance_metrics: {
      click_through_rate: 6.8,
      conversion_rate: 4.1
    },
    tags: ['food', 'valencia', 'market', 'local culture'],
    brand_mention: null,
    campaign_id: null,
    is_featured: true,
    created_at: '2024-07-18T11:20:00Z',
    updated_at: '2024-07-18T11:20:00Z'
  },
  {
    id: 'portfolio-008',
    creator_id: 'creator-profile-003',
    title: 'Traditional Paella Recipe',
    description: 'Step-by-step guide to making authentic Valencian paella. Learning from a local chef with generations of family recipes.',
    media_url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&h=600&fit=crop',
    media_type: 'video',
    platform: 'youtube',
    engagement_stats: {
      views: 5678,
      likes: 456,
      comments: 89,
      shares: 67,
      engagement_rate: 11.8
    },
    performance_metrics: {
      click_through_rate: 5.4,
      conversion_rate: 3.7
    },
    tags: ['paella', 'recipe', 'traditional', 'valencian cuisine'],
    brand_mention: 'Casa Valencia Spices',
    campaign_id: 'collab-010',
    is_featured: true,
    created_at: '2024-07-14T13:30:00Z',
    updated_at: '2024-07-14T13:30:00Z'
  },
  {
    id: 'portfolio-021',
    creator_id: 'creator-profile-003',
    title: 'Mediterranean Tapas at Home',
    description: 'Creating a Mediterranean tapas spread using simple, fresh ingredients. Perfect for entertaining friends and family.',
    media_url: 'https://images.unsplash.com/photo-1544510808-7c72590ef9a4?w=800&h=600&fit=crop',
    media_type: 'carousel',
    platform: 'instagram',
    engagement_stats: {
      likes: 1890,
      comments: 167,
      shares: 145,
      saves: 567,
      reach: 8900,
      impressions: 14500,
      engagement_rate: 9.8
    },
    performance_metrics: {
      click_through_rate: 4.2,
      conversion_rate: 2.8
    },
    tags: ['tapas', 'mediterranean', 'home cooking', 'entertaining'],
    brand_mention: 'Olive Oil Collective',
    campaign_id: null,
    is_featured: true,
    created_at: '2024-06-30T19:15:00Z',
    updated_at: '2024-06-30T19:15:00Z'
  },
  {
    id: 'portfolio-022',
    creator_id: 'creator-profile-003',
    title: 'Coffee Culture in Valencia',
    description: 'Exploring the best coffee shops in Valencia and the art of Spanish coffee culture. From cortados to café bombón.',
    media_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    media_type: 'reel',
    platform: 'instagram',
    engagement_stats: {
      likes: 1245,
      comments: 89,
      shares: 123,
      saves: 345,
      views: 7800,
      reach: 5600,
      impressions: 9800,
      engagement_rate: 11.2
    },
    performance_metrics: {
      click_through_rate: 5.1,
      conversion_rate: 3.4
    },
    tags: ['coffee', 'valencia', 'culture', 'local spots'],
    brand_mention: null,
    campaign_id: null,
    is_featured: false,
    created_at: '2024-06-12T09:45:00Z',
    updated_at: '2024-06-12T09:45:00Z'
  }
];

// Helper functions for portfolio items
export const getPortfolioItemById = (id: string): MockPortfolioItem | undefined => {
  return mockPortfolioItems.find(item => item.id === id);
};

export const getPortfolioItemsByCreatorId = (creatorId: string): MockPortfolioItem[] => {
  return mockPortfolioItems.filter(item => item.creator_id === creatorId);
};

export const getFeaturedPortfolioItems = (creatorId: string): MockPortfolioItem[] => {
  return mockPortfolioItems.filter(item => 
    item.creator_id === creatorId && item.is_featured
  );
};

export const getPortfolioItemsByPlatform = (platform: string): MockPortfolioItem[] => {
  return mockPortfolioItems.filter(item => item.platform === platform);
};

export const getPortfolioItemsByTag = (tag: string): MockPortfolioItem[] => {
  return mockPortfolioItems.filter(item => 
    item.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

export const getPortfolioItemsByEngagementRate = (minRate: number): MockPortfolioItem[] => {
  return mockPortfolioItems.filter(item => 
    item.engagement_stats.engagement_rate >= minRate
  );
};