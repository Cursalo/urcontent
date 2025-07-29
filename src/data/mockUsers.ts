// Mock user data for testing authentication system
// This bypasses Supabase issues and provides immediate testing capability

export interface MockUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'creator' | 'business' | 'admin';
  username: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  timezone: string | null;
  language: string | null;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string | null;
  last_seen_at: string | null;
  // Additional metadata for each role
  metadata?: any;
}

export const mockUsers: MockUser[] = [
  {
    id: 'creator-user-001',
    email: 'creator@urcontent.com',
    password: 'creator123',
    full_name: 'Sofia Martinez',
    role: 'creator',
    username: 'sofia_creator',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b332f1c5?w=150&h=150&fit=crop&crop=face',
    phone: '+1 555-0101',
    location: 'Barcelona, Spain',
    timezone: 'Europe/Madrid',
    language: 'es',
    is_verified: true,
    verification_status: 'verified',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-07-29T10:00:00Z',
    last_seen_at: '2024-07-29T10:00:00Z',
    metadata: {
      specialties: ['Fashion', 'Lifestyle', 'Travel'],
      followers: 15000,
      engagement_rate: 4.2,
      portfolio_items: 45,
      total_campaigns: 23,
      rating: 4.8,
      bio: 'Creative content creator specializing in fashion and lifestyle photography. Based in Barcelona, available for collaborations worldwide.',
      social_links: {
        instagram: '@sofia_creator',
        tiktok: '@sofiacreative',
        youtube: 'Sofia Martinez'
      }
    }
  },
  {
    id: 'business-user-001',
    email: 'venue@urcontent.com',
    password: 'venue123',
    full_name: 'Restaurant La Plaza',
    role: 'business',
    username: 'restaurant_laplaza',
    avatar_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop',
    phone: '+34 93 123 4567',
    location: 'Madrid, Spain',
    timezone: 'Europe/Madrid',
    language: 'es',
    is_verified: true,
    verification_status: 'verified',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-07-29T09:00:00Z',
    last_seen_at: '2024-07-29T09:00:00Z',
    metadata: {
      business_type: 'Restaurant',
      cuisine_type: 'Mediterranean',
      capacity: 80,
      price_range: '€€€',
      rating: 4.6,
      total_campaigns: 12,
      active_offers: 3,
      description: 'Authentic Mediterranean restaurant in the heart of Madrid. Specializing in traditional Spanish cuisine with a modern twist.',
      amenities: ['Outdoor Seating', 'Wine Bar', 'Private Events', 'Vegan Options'],
      operating_hours: {
        monday: '12:00-24:00',
        tuesday: '12:00-24:00',
        wednesday: '12:00-24:00',
        thursday: '12:00-24:00',
        friday: '12:00-01:00',
        saturday: '12:00-01:00',
        sunday: '12:00-23:00'
      }
    }
  },
  {
    id: 'admin-user-001',
    email: 'admin@urcontent.com',
    password: 'admin123',
    full_name: 'Carlos Rodriguez',
    role: 'admin',
    username: 'admin_carlos',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+34 91 987 6543',
    location: 'Madrid, Spain',
    timezone: 'Europe/Madrid',
    language: 'es',
    is_verified: true,
    verification_status: 'verified',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-07-29T08:00:00Z',
    last_seen_at: '2024-07-29T08:00:00Z',
    metadata: {
      admin_level: 'super_admin',
      permissions: [
        'user_management',
        'content_moderation',
        'platform_analytics',
        'financial_reports',
        'system_configuration'
      ],
      department: 'Platform Operations',
      employee_id: 'ADM-001',
      hire_date: '2024-01-01T08:00:00Z',
      last_login: '2024-07-29T08:00:00Z'
    }
  }
];

// Helper functions for mock authentication
export const findUserByEmail = (email: string): MockUser | undefined => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

export const validateCredentials = (email: string, password: string): MockUser | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Mock session data
export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
      role: string;
    };
    created_at: string;
  };
}

export const createMockSession = (user: MockUser): MockSession => {
  const now = Date.now();
  const expiresIn = 3600; // 1 hour
  
  return {
    access_token: `mock_token_${user.id}_${now}`,
    refresh_token: `mock_refresh_${user.id}_${now}`,
    expires_in: expiresIn,
    expires_at: now + (expiresIn * 1000),
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.full_name,
        role: user.role
      },
      created_at: user.created_at
    }
  };
};