import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '@/components/auth/LoginForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { hybridAuthService } from '@/services/hybridAuth'
import { mockAuthService } from '@/services/mockAuth'

// Mock the auth services
vi.mock('@/services/hybridAuth', () => ({
  hybridAuthService: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
  }
}))

vi.mock('@/services/mockAuth', () => ({
  mockAuthService: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
  },
  shouldUseMockAuthForUser: vi.fn((email) => {
    const mockEmails = ['creator@urcontent.com', 'venue@urcontent.com', 'admin@urcontent.com']
    return mockEmails.includes(email.toLowerCase())
  }),
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div>Redirected to {to}</div>,
  }
})

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Authentication System - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '', pathname: '/' } as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Guest Mode Testing', () => {
    it('should allow access to dashboard without login', async () => {
      // Mock no session
      vi.mocked(hybridAuthService.getSession).mockResolvedValue({
        user: null,
        session: null,
        profile: null,
        authType: 'supabase'
      })

      render(
        <TestWrapper>
          <ProtectedRoute allowAnonymous={true}>
            <div>Dashboard Content</div>
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should show content
      await waitFor(() => {
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })
    })

    it('should display guest mode banner when accessing without auth', async () => {
      vi.mocked(hybridAuthService.getSession).mockResolvedValue({
        user: null,
        session: null,
        profile: null,
        authType: 'supabase'
      })

      render(
        <TestWrapper>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      )

      // Wait for emergency access
      await waitFor(() => {
        expect(screen.getByText(/Modo Invitado/)).toBeInTheDocument()
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should navigate to creator dashboard when clicking "Explorar como Invitado"', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      const guestButton = screen.getByRole('button', { name: /Explorar como Invitado/i })
      fireEvent.click(guestButton)

      expect(window.location.href).toBe('/dashboard/creator')
    })
  })

  describe('2. Creator Authentication', () => {
    const creatorUser = {
      id: 'creator-123',
      email: 'creator@urcontent.com',
      user_metadata: { role: 'creator', full_name: 'Test Creator' }
    }

    const creatorSession = {
      access_token: 'creator-token',
      user: creatorUser,
      expires_at: Date.now() + 3600000
    }

    it('should login with creator credentials successfully', async () => {
      vi.mocked(hybridAuthService.signIn).mockResolvedValue({
        user: creatorUser,
        session: creatorSession,
        profile: { ...creatorUser, role: 'creator' },
        authType: 'mock'
      })

      const user = userEvent.setup()
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Fill form
      await user.type(screen.getByLabelText(/Email/i), 'creator@urcontent.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'creator123')
      
      // Submit
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

      await waitFor(() => {
        expect(hybridAuthService.signIn).toHaveBeenCalledWith('creator@urcontent.com', 'creator123')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/creator')
      })
    })

    it('should display real creator data after login', async () => {
      // Mock authenticated state
      vi.mocked(hybridAuthService.getSession).mockResolvedValue({
        user: creatorUser,
        session: creatorSession,
        profile: { ...creatorUser, role: 'creator' },
        authType: 'mock'
      })

      const DashboardTest = () => {
        const { user, profile } = useAuth()
        return (
          <div>
            <h1>Creator Dashboard</h1>
            <p>Email: {user?.email}</p>
            <p>Role: {profile?.role}</p>
            <p>Name: {profile?.user_metadata?.full_name || profile?.full_name}</p>
          </div>
        )
      }

      render(
        <TestWrapper>
          <DashboardTest />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Email: creator@urcontent.com')).toBeInTheDocument()
        expect(screen.getByText('Role: creator')).toBeInTheDocument()
      })
    })
  })

  describe('3. Business/Venue Authentication', () => {
    const venueUser = {
      id: 'venue-123',
      email: 'venue@urcontent.com',
      user_metadata: { role: 'business', full_name: 'Test Venue' }
    }

    const venueSession = {
      access_token: 'venue-token',
      user: venueUser,
      expires_at: Date.now() + 3600000
    }

    it('should login with venue credentials and redirect to business dashboard', async () => {
      vi.mocked(hybridAuthService.signIn).mockResolvedValue({
        user: venueUser,
        session: venueSession,
        profile: { ...venueUser, role: 'business' },
        authType: 'mock'
      })

      const user = userEvent.setup()
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/Email/i), 'venue@urcontent.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'venue123')
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/business')
      })
    })

    it('should verify business data appears correctly', async () => {
      vi.mocked(hybridAuthService.getSession).mockResolvedValue({
        user: venueUser,
        session: venueSession,
        profile: { ...venueUser, role: 'business' },
        authType: 'mock'
      })

      const BusinessDashboard = () => {
        const { profile } = useAuth()
        return (
          <div>
            <h1>Business Dashboard</h1>
            <p>Business Role: {profile?.role}</p>
            <p>Business Email: {profile?.email}</p>
          </div>
        )
      }

      render(
        <TestWrapper>
          <BusinessDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Business Role: business')).toBeInTheDocument()
        expect(screen.getByText('Business Email: venue@urcontent.com')).toBeInTheDocument()
      })
    })
  })

  describe('4. Admin Authentication', () => {
    const adminUser = {
      id: 'admin-123',
      email: 'admin@urcontent.com',
      user_metadata: { role: 'admin', full_name: 'Test Admin' }
    }

    const adminSession = {
      access_token: 'admin-token',
      user: adminUser,
      expires_at: Date.now() + 3600000
    }

    it('should login with admin credentials and redirect to admin dashboard', async () => {
      vi.mocked(hybridAuthService.signIn).mockResolvedValue({
        user: adminUser,
        session: adminSession,
        profile: { ...adminUser, role: 'admin' },
        authType: 'mock'
      })

      const user = userEvent.setup()
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/Email/i), 'admin@urcontent.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'admin123')
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin')
      })
    })

    it('should enforce admin role requirements', async () => {
      vi.mocked(hybridAuthService.getSession).mockResolvedValue({
        user: adminUser,
        session: adminSession,
        profile: { ...adminUser, role: 'admin' },
        authType: 'mock'
      })

      render(
        <TestWrapper>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Only Content</div>
          </ProtectedRoute>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
      })
    })
  })

  describe('5. Error Handling', () => {
    it('should display error with invalid credentials', async () => {
      vi.mocked(hybridAuthService.signIn).mockResolvedValue({
        error: { message: 'Invalid email or password' },
        authType: 'mock'
      })

      const user = userEvent.setup()
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/Email/i), 'invalid@example.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
    })

    it('should handle logout functionality', async () => {
      vi.mocked(hybridAuthService.signOut).mockResolvedValue(undefined)

      const LogoutTest = () => {
        const { signOut } = useAuth()
        return <button onClick={signOut}>Logout</button>
      }

      render(
        <TestWrapper>
          <LogoutTest />
        </TestWrapper>
      )

      await userEvent.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(hybridAuthService.signOut).toHaveBeenCalled()
      })
    })

    it('should clear errors when switching between accounts', async () => {
      // First failed attempt
      vi.mocked(hybridAuthService.signIn).mockResolvedValueOnce({
        error: { message: 'Invalid credentials' },
        authType: 'mock'
      })

      const user = userEvent.setup()
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // First attempt - fail
      await user.type(screen.getByLabelText(/Email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'wrong')
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Clear and try again
      vi.mocked(hybridAuthService.signIn).mockResolvedValueOnce({
        user: { id: '123', email: 'creator@urcontent.com' },
        session: { access_token: 'token', expires_at: Date.now() + 3600000 },
        profile: { role: 'creator' },
        authType: 'mock'
      })

      await user.clear(screen.getByLabelText(/Email/i))
      await user.clear(screen.getByLabelText(/Contraseña/i))
      await user.type(screen.getByLabelText(/Email/i), 'creator@urcontent.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'creator123')
      
      // Error should be cleared when typing
      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
      })
    })
  })

  describe('Test Account Quick Access', () => {
    it('should show test accounts when toggle button is clicked', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      const toggleButton = screen.getByRole('button', { name: /Mostrar Cuentas de Prueba/i })
      await userEvent.click(toggleButton)

      // Should show all test accounts
      expect(screen.getByText('Content Creator')).toBeInTheDocument()
      expect(screen.getByText('creator@urcontent.com')).toBeInTheDocument()
      expect(screen.getByText('Venue/Business')).toBeInTheDocument()
      expect(screen.getByText('venue@urcontent.com')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('admin@urcontent.com')).toBeInTheDocument()
    })

    it('should fill form when "Usar" button is clicked', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Show test accounts
      await userEvent.click(screen.getByRole('button', { name: /Mostrar Cuentas de Prueba/i }))
      
      // Click "Usar" for creator account
      const usarButtons = screen.getAllByRole('button', { name: /Usar/i })
      await userEvent.click(usarButtons[0])

      // Check form is filled
      expect(screen.getByLabelText(/Email/i)).toHaveValue('creator@urcontent.com')
      expect(screen.getByLabelText(/Contraseña/i)).toHaveValue('creator123')
    })

    it('should provide instant access when clicking instant access button', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      // Show test accounts
      await userEvent.click(screen.getByRole('button', { name: /Mostrar Cuentas de Prueba/i }))
      
      // Click instant access for creator
      const instantButtons = screen.getAllByRole('button', { name: /Instant Access/i })
      fireEvent.click(instantButtons[0])

      expect(window.location.href).toBe('/dashboard/creator')
    })
  })
})