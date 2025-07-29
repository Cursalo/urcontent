import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/test-utils'
import App from '@/App'
import { server } from '@/__mocks__/server'
import { http, HttpResponse } from 'msw'

describe('Authentication Flow Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset any localStorage/sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Login Flow', () => {
    it('allows user to navigate to login and sign in successfully', async () => {
      // Mock successful authentication
      server.use(
        http.post('*/auth/v1/token', () => {
          return HttpResponse.json({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: {
                full_name: 'Test User',
                role: 'creator',
              },
            },
          })
        }),
        http.get('*/rest/v1/users*', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'creator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        })
      )

      render(<App />)

      // Navigate to login page
      const loginLink = screen.getByText(/iniciar sesión/i)
      await user.click(loginLink)

      // Fill out login form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should redirect to dashboard after successful login
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('displays error message for invalid credentials', async () => {
      // Mock authentication failure
      server.use(
        http.post('*/auth/v1/token', () => {
          return HttpResponse.json(
            { message: 'Invalid login credentials' },
            { status: 400 }
          )
        })
      )

      render(<App />)

      // Navigate to login page
      const loginLink = screen.getByText(/iniciar sesión/i)
      await user.click(loginLink)

      // Fill out login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
      })

      // Should remain on login page
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    })

    it('handles network errors gracefully', async () => {
      // Mock network error
      server.use(
        http.post('*/auth/v1/token', () => {
          return HttpResponse.error()
        })
      )

      render(<App />)

      // Navigate to login page
      const loginLink = screen.getByText(/iniciar sesión/i)
      await user.click(loginLink)

      // Fill out login form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should display network error message
      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
      })
    })
  })

  describe('Registration Flow', () => {
    it('allows user to register as creator successfully', async () => {
      // Mock successful registration
      server.use(
        http.post('*/auth/v1/signup', () => {
          return HttpResponse.json({
            user: {
              id: 'new-user-id',
              email: 'newuser@example.com',
              user_metadata: {
                full_name: 'New User',
                role: 'creator',
              },
            },
            session: null, // Email confirmation required
          })
        }),
        http.post('*/rest/v1/users', () => {
          return HttpResponse.json({
            id: 'new-user-id',
            email: 'newuser@example.com',
            full_name: 'New User',
            role: 'creator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        })
      )

      render(<App />)

      // Navigate to registration page
      const registerLink = screen.getByText(/regístrate/i)
      await user.click(registerLink)

      // Fill out registration form
      const fullNameInput = screen.getByLabelText(/nombre completo/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const creatorRadio = screen.getByLabelText(/creador de contenido/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(fullNameInput, 'New User')
      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'SecurePass123')
      await user.type(confirmPasswordInput, 'SecurePass123')
      await user.click(creatorRadio)
      await user.click(submitButton)

      // Should show success message or redirect to confirmation page
      await waitFor(() => {
        expect(
          screen.getByText(/verifica tu email/i) || 
          screen.getByText(/cuenta creada exitosamente/i)
        ).toBeInTheDocument()
      })
    })

    it('displays validation errors for invalid form data', async () => {
      render(<App />)

      // Navigate to registration page
      const registerLink = screen.getByText(/regístrate/i)
      await user.click(registerLink)

      // Submit form without filling required fields
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
      await user.click(submitButton)

      // Should display validation errors
      await waitFor(() => {
        expect(screen.getByText(/nombre.*requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/email.*requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/contraseña.*requerida/i)).toBeInTheDocument()
      })
    })

    it('validates password confirmation match', async () => {
      render(<App />)

      // Navigate to registration page
      const registerLink = screen.getByText(/regístrate/i)
      await user.click(registerLink)

      // Fill form with mismatched passwords
      const fullNameInput = screen.getByLabelText(/nombre completo/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const creatorRadio = screen.getByLabelText(/creador de contenido/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(fullNameInput, 'New User')
      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'SecurePass123')
      await user.type(confirmPasswordInput, 'DifferentPass123')
      await user.click(creatorRadio)
      await user.click(submitButton)

      // Should display password mismatch error
      await waitFor(() => {
        expect(screen.getByText(/contraseñas no coinciden/i)).toBeInTheDocument()
      })
    })
  })

  describe('Logout Flow', () => {
    it('allows authenticated user to logout successfully', async () => {
      // Mock authenticated state
      server.use(
        http.get('*/auth/v1/user', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
              role: 'creator',
            },
          })
        }),
        http.post('*/auth/v1/signout', () => {
          return HttpResponse.json({})
        })
      )

      // Render app with authenticated user
      render(<App />)

      // Wait for authentication to load
      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument()
      })

      // Find and click logout button
      const logoutButton = screen.getByText(/cerrar sesión/i)
      await user.click(logoutButton)

      // Should redirect to home page and show login link
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
        expect(screen.queryByText(/test user/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Password Reset Flow', () => {
    it('allows user to request password reset', async () => {
      // Mock password reset request
      server.use(
        http.post('*/auth/v1/recover', () => {
          return HttpResponse.json({})
        })
      )

      render(<App />)

      // Navigate to login page and then to forgot password
      const loginLink = screen.getByText(/iniciar sesión/i)
      await user.click(loginLink)

      const forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i)
      await user.click(forgotPasswordLink)

      // Fill out forgot password form
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      // Should show success message
      await waitFor(() => {
        expect(
          screen.getByText(/instrucciones enviadas/i) ||
          screen.getByText(/email enviado/i)
        ).toBeInTheDocument()
      })
    })

    it('handles invalid email for password reset', async () => {
      render(<App />)

      // Navigate to forgot password page
      const loginLink = screen.getByText(/iniciar sesión/i)
      await user.click(loginLink)

      const forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i)
      await user.click(forgotPasswordLink)

      // Submit form with invalid email
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      // Should display validation error
      await waitFor(() => {
        expect(screen.getByText(/email.*válido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Protected Routes', () => {
    it('redirects unauthenticated users to login', async () => {
      render(<App />)

      // Try to navigate to protected route
      window.history.pushState({}, '', '/dashboard')

      // Should redirect to login page
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
        expect(window.location.pathname).toBe('/login')
      })
    })

    it('allows authenticated users to access protected routes', async () => {
      // Mock authenticated state
      server.use(
        http.get('*/auth/v1/user', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
              role: 'creator',
            },
          })
        }),
        http.get('*/rest/v1/users*', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'creator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        })
      )

      render(<App />)

      // Navigate to protected route
      window.history.pushState({}, '', '/dashboard')

      // Should allow access to dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })

    it('enforces role-based access control', async () => {
      // Mock authenticated creator trying to access business-only route
      server.use(
        http.get('*/auth/v1/user', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test Creator',
              role: 'creator',
            },
          })
        }),
        http.get('*/rest/v1/users*', () => {
          return HttpResponse.json({
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test Creator',
            role: 'creator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        })
      )

      render(<App />)

      // Try to navigate to business-only route
      window.history.pushState({}, '', '/content-review')

      // Should redirect or show access denied
      await waitFor(() => {
        expect(
          screen.getByText(/acceso denegado/i) ||
          screen.getByText(/no autorizado/i) ||
          screen.queryByText(/content review/i)
        ).toBeTruthy()
      })
    })
  })

  describe('Session Management', () => {
    it('handles expired sessions gracefully', async () => {
      // Mock session expiration
      server.use(
        http.get('*/auth/v1/user', () => {
          return HttpResponse.json(
            { message: 'JWT expired' },
            { status: 401 }
          )
        })
      )

      render(<App />)

      // Should redirect to login when session expires
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
      })
    })

    it('refreshes tokens automatically', async () => {
      let tokenRefreshed = false

      server.use(
        http.post('*/auth/v1/token', () => {
          if (!tokenRefreshed) {
            tokenRefreshed = true
            return HttpResponse.json({
              access_token: 'new-access-token',
              refresh_token: 'new-refresh-token',
              user: {
                id: 'test-user-id',
                email: 'test@example.com',
              },
            })
          }
          return HttpResponse.json({
            access_token: 'refreshed-access-token',
            refresh_token: 'refreshed-refresh-token',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
            },
          })
        })
      )

      render(<App />)

      // Simulate token refresh trigger
      // This would normally happen automatically via Supabase auth
      await waitFor(() => {
        expect(tokenRefreshed).toBe(true)
      })
    })
  })
})