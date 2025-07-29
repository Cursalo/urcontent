// Mock Business Profile data - database-ready structure
import { MockBusinessProfile, mockUsers } from './mockUsers';

export const mockBusinessProfiles: MockBusinessProfile[] = [
  {
    id: 'business-profile-001',
    user_id: 'business-user-001',
    company_name: 'Restaurant La Plaza',
    description: 'Authentic Mediterranean restaurant in the heart of Madrid. Specializing in traditional Spanish cuisine with a modern twist. Perfect venue for food content creation.',
    industry: 'Food & Beverage',
    company_size: '11-50',
    website_url: 'https://www.laplazarestaurant.com',
    logo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    address: 'Calle Mayor 15, 28013 Madrid',
    city: 'Madrid',
    country: 'Spain',
    is_verified_business: true,
    verification_documents: ['business_license.pdf', 'tax_certificate.pdf'],
    tax_id: 'ES-B12345678',
    business_registration: '2019-MAD-001234',
    contact_email: 'contact@laplazarestaurant.com',
    contact_phone: '+34 91 234 5678',
    social_media: {
      instagram: '@laplazarestaurant',
      facebook: 'RestaurantLaPlaza',
      website: 'https://www.laplazarestaurant.com'
    },
    campaign_budget_range: {
      min: 50000, // €500 in cents
      max: 300000 // €3000 in cents
    },
    preferred_creator_tiers: ['micro', 'macro'],
    target_audience: {
      age_range: [25, 45],
      genders: ['male', 'female'],
      interests: ['food', 'dining', 'lifestyle', 'travel'],
      locations: ['Madrid', 'Barcelona', 'Valencia', 'Spain']
    },
    collaboration_history: {
      total_campaigns: 24,
      successful_campaigns: 22,
      average_rating: 4.7,
      total_spent: 1850000 // €18,500 in cents
    },
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-07-29T09:00:00Z'
  },
  {
    id: 'business-profile-002',
    user_id: 'business-user-002',
    company_name: 'Bella Fashion',
    description: 'Contemporary fashion brand creating sustainable and stylish clothing for the modern woman. Committed to ethical fashion and environmental responsibility.',
    industry: 'Fashion & Apparel',
    company_size: '51-200',
    website_url: 'https://www.bellafashion.es',
    logo_url: 'https://images.unsplash.com/photo-1445205170230-053b444c0d82?w=200&h=200&fit=crop',
    address: 'Passeig de Gracia 84, 08008 Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    is_verified_business: true,
    verification_documents: ['business_license.pdf', 'sustainability_cert.pdf'],
    tax_id: 'ES-A87654321',
    business_registration: '2020-BCN-005678',
    contact_email: 'marketing@bellafashion.com',
    contact_phone: '+34 93 456 7890',
    social_media: {
      instagram: '@bellafashionofficial',
      facebook: 'BellaFashionSpain',
      twitter: '@BellaFashionES',
      linkedin: 'bella-fashion',
      website: 'https://www.bellafashion.es'
    },
    campaign_budget_range: {
      min: 100000, // €1000 in cents
      max: 500000 // €5000 in cents
    },
    preferred_creator_tiers: ['micro', 'macro', 'mega'],
    target_audience: {
      age_range: [18, 35],
      genders: ['female'],
      interests: ['fashion', 'sustainability', 'lifestyle', 'beauty'],
      locations: ['Spain', 'Portugal', 'France', 'Italy']
    },
    collaboration_history: {
      total_campaigns: 45,
      successful_campaigns: 41,
      average_rating: 4.8,
      total_spent: 6780000 // €67,800 in cents
    },
    created_at: '2024-01-20T11:30:00Z',
    updated_at: '2024-07-29T11:30:00Z'
  },
  {
    id: 'business-profile-003',
    user_id: 'business-user-003',
    company_name: 'Paradise Resort',
    description: 'Luxury beachfront resort in the Balearic Islands offering world-class amenities and unforgettable experiences. Perfect destination for travel and lifestyle content.',
    industry: 'Hospitality & Travel',
    company_size: '201-1000',
    website_url: 'https://www.paradiseresort.com',
    logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
    address: 'Playa de Palma s/n, 07610 Palma',
    city: 'Palma',
    country: 'Spain',
    is_verified_business: true,
    verification_documents: ['hotel_license.pdf', 'tourism_cert.pdf'],
    tax_id: 'ES-B11223344',
    business_registration: '2018-BAL-009876',
    contact_email: 'partnerships@paradiseresort.com',
    contact_phone: '+34 971 123 456',
    social_media: {
      instagram: '@paradiseresortofficial',
      facebook: 'ParadiseResortPalma',
      twitter: '@ParadiseResort',
      linkedin: 'paradise-resort',
      website: 'https://www.paradiseresort.com'
    },
    campaign_budget_range: {
      min: 200000, // €2000 in cents
      max: 1000000 // €10000 in cents
    },
    preferred_creator_tiers: ['macro', 'mega'],
    target_audience: {
      age_range: [25, 55],
      genders: ['male', 'female'],
      interests: ['travel', 'luxury', 'wellness', 'lifestyle', 'photography'],
      locations: ['Europe', 'United States', 'United Kingdom']
    },
    collaboration_history: {
      total_campaigns: 18,
      successful_campaigns: 16,
      average_rating: 4.9,
      total_spent: 4230000 // €42,300 in cents
    },
    created_at: '2024-03-05T16:45:00Z',
    updated_at: '2024-07-29T16:45:00Z'
  },
  {
    id: 'business-profile-004',
    user_id: 'business-user-004',
    company_name: 'GlowUp Cosmetics',
    description: 'Innovative beauty brand focused on natural, cruelty-free cosmetics that enhance your natural glow. Perfect for beauty content creators and makeup enthusiasts.',
    industry: 'Beauty & Cosmetics',
    company_size: '1-10',
    website_url: 'https://www.glowupcosmetics.com',
    logo_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
    address: 'Calle Colón 28, 46004 Valencia',
    city: 'Valencia',
    country: 'Spain',
    is_verified_business: false,
    verification_documents: null,
    tax_id: 'ES-B99887766',
    business_registration: '2023-VAL-012345',
    contact_email: 'influencer@glowupcosmetics.com',
    contact_phone: '+34 96 789 0123',
    social_media: {
      instagram: '@glowupcosmetics',
      tiktok: '@glowupbeauty',
      website: 'https://www.glowupcosmetics.com'
    },
    campaign_budget_range: {
      min: 30000, // €300 in cents
      max: 150000 // €1500 in cents
    },
    preferred_creator_tiers: ['nano', 'micro'],
    target_audience: {
      age_range: [16, 35],
      genders: ['female'],
      interests: ['beauty', 'makeup', 'skincare', 'wellness'],
      locations: ['Spain', 'Europe']
    },
    collaboration_history: {
      total_campaigns: 6,
      successful_campaigns: 5,
      average_rating: 4.4,
      total_spent: 890000 // €8,900 in cents
    },
    created_at: '2024-05-12T13:20:00Z',
    updated_at: '2024-07-29T13:20:00Z'
  }
];

// Helper functions for business profiles
export const getBusinessProfileById = (id: string): MockBusinessProfile | undefined => {
  return mockBusinessProfiles.find(profile => profile.id === id);
};

export const getBusinessProfileByUserId = (userId: string): MockBusinessProfile | undefined => {
  return mockBusinessProfiles.find(profile => profile.user_id === userId);
};

export const getBusinessProfilesByIndustry = (industry: string): MockBusinessProfile[] => {
  return mockBusinessProfiles.filter(profile => 
    profile.industry.toLowerCase().includes(industry.toLowerCase())
  );
};

export const getVerifiedBusinessProfiles = (): MockBusinessProfile[] => {
  return mockBusinessProfiles.filter(profile => profile.is_verified_business);
};