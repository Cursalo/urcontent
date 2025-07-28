import { http, HttpResponse } from 'msw'

// Mock Supabase API responses
export const handlers = [
  // Auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          role: 'creator'
        }
      }
    })
  }),

  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          role: 'creator'
        }
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      }
    })
  }),

  // Users API
  http.get('*/rest/v1/users', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'creator',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  // Creator profiles API
  http.get('*/rest/v1/creator_profiles', () => {
    return HttpResponse.json([
      {
        id: 'mock-creator-id',
        user_id: 'mock-user-id',
        bio: 'Test creator bio',
        instagram_handle: '@testcreator',
        instagram_followers: 10000,
        specialties: ['fitness', 'lifestyle'],
        ur_score: 85,
        is_available: true
      }
    ])
  }),

  // Business profiles API
  http.get('*/rest/v1/business_profiles', () => {
    return HttpResponse.json([
      {
        id: 'mock-business-id',
        user_id: 'mock-business-user-id',
        company_name: 'Test Business',
        industry: 'Beauty',
        description: 'Test business description',
        is_verified_business: true
      }
    ])
  }),

  // Collaborations API
  http.get('*/rest/v1/collaborations', () => {
    return HttpResponse.json([
      {
        id: 'mock-collaboration-id',
        business_id: 'mock-business-id',
        creator_id: 'mock-creator-id',
        title: 'Test Collaboration',
        description: 'Test collaboration description',
        budget: 1000,
        status: 'proposed',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  // MercadoPago Mock (for testing payment flows)
  http.post('https://api.mercadopago.com/checkout/preferences', () => {
    return HttpResponse.json({
      id: 'mock-preference-id',
      init_point: 'https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=mock-preference-id',
      sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=mock-preference-id'
    })
  }),

  // Default fallback for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`)
    return HttpResponse.json({ message: 'Not mocked' }, { status: 404 })
  })
]