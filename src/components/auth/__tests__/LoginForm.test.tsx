import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/test-utils'
import { LoginForm } from '../LoginForm'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the auth context
const mockSignIn = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    user: null,
    profile: null,
    session: null,
    loading: false,
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
  }),
}))

describe('LoginForm', () => {
  const user = userEvent.setup()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toBeInTheDocument()
      expect(screen.getByText(/¿no tienes cuenta\?/i)).toBeInTheDocument()
    })

    it('shows password toggle button', () => {
      render(<LoginForm />)

      const passwordToggle = screen.getByRole('button', { name: '' })
      expect(passwordToggle).toBeInTheDocument()
    })

    it('has proper form attributes', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
    })
  })

  describe('Form Interaction', () => {
    it('updates email field when typing', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('updates password field when typing', async () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/contraseña/i)
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })

    it('toggles password visibility when clicking eye icon', async () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/contraseña/i)
      const toggleButton = screen.getByRole('button', { name: '' })

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('prevents form submission with empty fields', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(submitButton)

      // Form validation should prevent submission
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('calls signIn with correct credentials on successful submission', async () => {
      mockSignIn.mockResolvedValue({ error: null })
      render(<LoginForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('calls onSuccess callback after successful login', async () => {
      mockSignIn.mockResolvedValue({ error: null })
      render(<LoginForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('shows loading state during submission', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)))
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByRole('progressbar')).toBeInTheDocument() // Loading spinner

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('disables form inputs during submission', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)))
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(passwordInput).not.toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on authentication failure', async () => {
      const errorMessage = 'Invalid login credentials'
      mockSignIn.mockResolvedValue({ error: { message: errorMessage } })
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('clears error message when starting new submission', async () => {
      const errorMessage = 'Invalid login credentials'
      mockSignIn.mockResolvedValueOnce({ error: { message: errorMessage } })
        .mockResolvedValueOnce({ error: null })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      // First submission with error
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      // Second submission should clear error
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })

    it('handles unexpected errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('shows error with proper ARIA attributes', async () => {
      const errorMessage = 'Invalid login credentials'
      mockSignIn.mockResolvedValue({ error: { message: errorMessage } })
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByText(errorMessage)
        expect(errorElement).toBeInTheDocument()
        expect(errorElement.closest('[role="alert"]')).toBeInTheDocument()
      })
    })

    it('has keyboard navigation support', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      // Tab navigation
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: '' })).toHaveFocus() // Password toggle

      await user.tab()
      expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Links', () => {
    it('has correct forgot password link', () => {
      render(<LoginForm />)

      const forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i)
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })

    it('has correct registration link', () => {
      render(<LoginForm />)

      const registerLink = screen.getByText(/regístrate aquí/i)
      expect(registerLink).toHaveAttribute('href', '/registro')
    })
  })
})