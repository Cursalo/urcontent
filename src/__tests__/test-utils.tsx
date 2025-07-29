import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { vi } from 'vitest'

// Mock navigate function globally
const mockNavigate = vi.fn()

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
    useParams: () => ({}),
  }
})

// Mock AuthContext for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthContext = {
    user: null,
    profile: null,
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

const AllTheProviders = ({ children, queryClient }: AllTheProvidersProps) => {
  const testQueryClient = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <MockAuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </MockAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { queryClient, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Auth-specific render functions
interface AuthenticatedRenderOptions extends CustomRenderOptions {
  user?: any
  profile?: any
}

const renderWithAuth = (
  ui: ReactElement,
  options?: AuthenticatedRenderOptions
) => {
  const { user, profile, ...restOptions } = options || {}
  
  // Mock authenticated state
  vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
      user: user || {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      profile: profile || {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'creator',
      },
      session: {
        access_token: 'mock-token',
        user: user || { id: 'test-user-id' },
      },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  }))

  return customRender(ui, restOptions)
}

const renderWithoutAuth = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  // Mock unauthenticated state
  vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
      user: null,
      profile: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  }))

  return customRender(ui, options)
}

// Helper function to wait for loading states
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

// Helper to mock router params
export const mockRouter = (overrides: any = {}) => {
  const mockNavigate = vi.fn()
  const mockLocation = {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    ...overrides.location,
  }
  const mockParams = overrides.params || {}

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
      ...actual,
      useNavigate: () => mockNavigate,
      useLocation: () => mockLocation,
      useParams: () => mockParams,
    }
  })

  return { mockNavigate, mockLocation, mockParams }
}

// Form testing helpers
export const fillFormField = async (
  element: HTMLElement,
  value: string,
  userEvent: any
) => {
  await userEvent.clear(element)
  await userEvent.type(element, value)
}

export const selectOption = async (
  selectElement: HTMLElement,
  optionText: string,
  userEvent: any
) => {
  await userEvent.click(selectElement)
  const option = document.querySelector(`[role="option"][data-value="${optionText}"]`)
  if (option) {
    await userEvent.click(option)
  }
}

// API mock helpers
export const mockApiSuccess = (data: any) => {
  return Promise.resolve({
    data,
    error: null,
  })
}

export const mockApiError = (message: string, code?: string) => {
  return Promise.resolve({
    data: null,
    error: {
      message,
      code,
    },
  })
}

// Local storage helpers
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    }),
  }
}

// Payment testing helpers
export const createMockPaymentPreference = () => ({
  id: 'mock-preference-id',
  init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock-preference-id',
  sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock-preference-id',
})

export const createMockPayment = (overrides = {}) => ({
  id: 'payment-test-id',
  user_id: 'user-test-id',
  type: 'membership',
  status: 'pending',
  amount: 29990,
  currency: 'ARS',
  description: 'Test Payment',
  payment_method: 'MercadoPago',
  transaction_id: 'TXN-123456789',
  mercadopago_payment_id: null,
  reference_id: null,
  reference_type: null,
  metadata: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  processed_at: null,
  failed_at: null,
  refunded_at: null,
  failure_reason: null,
  ...overrides,
})

// File upload helpers
export const createMockFile = (
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
) => {
  const file = new File(['mock content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Media query helpers
export const mockMediaQuery = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render, renderWithAuth, renderWithoutAuth }
export { createTestQueryClient, mockNavigate }