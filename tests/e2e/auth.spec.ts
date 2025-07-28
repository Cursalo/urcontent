import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('should display login form correctly', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Check that we're on the login page
      await expect(page).toHaveURL('/login');
      
      // Verify form elements are present
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Iniciar Sesión")')).toBeVisible();
      
      // Check for forgot password link
      await expect(page.locator('text=¿Olvidaste tu contraseña?')).toBeVisible();
      
      // Check for register link
      await expect(page.locator('text=Regístrate aquí')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Try to submit empty form
      await page.click('button:has-text("Iniciar Sesión")');
      
      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('required');
      
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      const passwordInput = page.locator('input[name="password"]');
      const toggleButton = page.locator('button[type="button"]').first();
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should handle invalid credentials', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Fill form with invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Should show error message (this depends on your error handling)
      await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
      
      // Should remain on login page
      await expect(page).toHaveURL('/login');
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Fill form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      // Submit form and check for loading state
      const submitButton = page.locator('button:has-text("Iniciar Sesión")');
      await submitButton.click();
      
      // Button should be disabled during loading
      await expect(submitButton).toBeDisabled();
      
      // Should show loading indicator
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
    });
  });

  test.describe('Registration Flow', () => {
    test('should display registration form correctly', async ({ page }) => {
      await page.click('text=Regístrate');
      
      // Check that we're on the registration page
      await expect(page).toHaveURL('/registro');
      
      // Verify form elements are present
      await expect(page.locator('input[name="fullName"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      
      // Check role selection
      await expect(page.locator('input[value="creator"]')).toBeVisible();
      await expect(page.locator('input[value="business"]')).toBeVisible();
      
      // Submit button
      await expect(page.locator('button:has-text("Crear Cuenta")')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Regístrate');
      
      // Try to submit empty form
      await page.click('button:has-text("Crear Cuenta")');
      
      // HTML5 validation should prevent submission
      const requiredFields = [
        'input[name="fullName"]',
        'input[type="email"]',
        'input[type="password"]',
        'input[name="confirmPassword"]'
      ];
      
      for (const field of requiredFields) {
        await expect(page.locator(field)).toHaveAttribute('required');
      }
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.click('text=Regístrate');
      
      // Fill form with mismatched passwords
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'differentpassword');
      await page.click('input[value="creator"]');
      
      // Submit form
      await page.click('button:has-text("Crear Cuenta")');
      
      // Should show password mismatch error
      await expect(page.locator('text=*contraseñas no coinciden*')).toBeVisible();
    });

    test('should register creator successfully', async ({ page }) => {
      await page.click('text=Regístrate');
      
      // Fill form completely
      await page.fill('input[name="fullName"]', 'Test Creator');
      await page.fill('input[type="email"]', 'creator@example.com');
      await page.fill('input[type="password"]', 'SecurePass123');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123');
      await page.click('input[value="creator"]');
      
      // Submit form
      await page.click('button:has-text("Crear Cuenta")');
      
      // Should redirect to success page or onboarding
      await expect(page).toHaveURL(/\/(onboarding|success|verify)/);
      
      // Should show success message
      await expect(
        page.locator('text=*cuenta creada*,text=*verifica tu email*,text=*exitosamente*')
      ).toBeVisible({ timeout: 10000 });
    });

    test('should register business successfully', async ({ page }) => {
      await page.click('text=Regístrate');
      
      // Fill form for business registration
      await page.fill('input[name="fullName"]', 'Business Owner');
      await page.fill('input[type="email"]', 'business@example.com');
      await page.fill('input[type="password"]', 'SecurePass123');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123');
      await page.click('input[value="business"]');
      
      // Submit form
      await page.click('button:has-text("Crear Cuenta")');
      
      // Should redirect to business onboarding
      await expect(page).toHaveURL(/\/onboarding\/business/);
    });
  });

  test.describe('Forgot Password Flow', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      // Check that we're on the forgot password page
      await expect(page).toHaveURL('/forgot-password');
      
      // Verify form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Enviar")')).toBeVisible();
      
      // Back to login link
      await expect(page.locator('text=*Volver al inicio de sesión*')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button:has-text("Enviar")');
      
      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('should submit password reset request', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      // Enter valid email
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button:has-text("Enviar")');
      
      // Should show success message
      await expect(
        page.locator('text=*enviado*,text=*instrucciones*,text=*email*')
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between auth pages correctly', async ({ page }) => {
      // Start at home
      await expect(page).toHaveURL('/');
      
      // Go to login
      await page.click('text=Iniciar Sesión');
      await expect(page).toHaveURL('/login');
      
      // Go to register from login
      await page.click('text=Regístrate aquí');
      await expect(page).toHaveURL('/registro');
      
      // Go back to login from register
      await page.click('text=*Ya tienes cuenta*');
      await expect(page).toHaveURL('/login');
      
      // Go to forgot password
      await page.click('text=¿Olvidaste tu contraseña?');
      await expect(page).toHaveURL('/forgot-password');
      
      // Go back to login from forgot password
      await page.click('text=*Volver al inicio de sesión*');
      await expect(page).toHaveURL('/login');
    });

    test('should handle browser back/forward buttons', async ({ page }) => {
      // Navigate to login
      await page.click('text=Iniciar Sesión');
      await expect(page).toHaveURL('/login');
      
      // Navigate to register
      await page.click('text=Regístrate aquí');
      await expect(page).toHaveURL('/registro');
      
      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL('/login');
      
      // Use browser forward button
      await page.goForward();
      await expect(page).toHaveURL('/registro');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('text=Iniciar Sesión');
      
      // Form should be visible and properly sized
      await expect(page.locator('form')).toBeVisible();
      
      // Inputs should be touch-friendly
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      
      // Submit button should be appropriately sized
      const submitButton = page.locator('button:has-text("Iniciar Sesión")');
      await expect(submitButton).toBeVisible();
      
      // Test form interaction on mobile
      await emailInput.fill('mobile@test.com');
      await passwordInput.fill('password123');
      
      await expect(emailInput).toHaveValue('mobile@test.com');
      await expect(passwordInput).toHaveValue('password123');
    });

    test('should display correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.click('text=Regístrate');
      
      // Form should adapt to tablet layout
      await expect(page.locator('form')).toBeVisible();
      
      // All form elements should be visible and accessible
      await expect(page.locator('input[name="fullName"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Check for proper labels
      await expect(page.locator('label[for="email"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
      
      // Check input associations
      const emailInput = page.locator('input#email');
      const passwordInput = page.locator('input#password');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="button"]')).toBeFocused(); // Password toggle
      
      await page.keyboard.press('Tab');
      await expect(page.locator('a:has-text("¿Olvidaste tu contraseña?")')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button:has-text("Iniciar Sesión")')).toBeFocused();
    });

    test('should announce errors to screen readers', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Fill invalid credentials and submit
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Error should have proper ARIA attributes
      const errorElement = page.locator('[role="alert"]');
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    });
  });
});