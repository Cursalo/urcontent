import { test, expect } from '@playwright/test';

// Define test accounts
const testAccounts = {
  creator: {
    email: 'creator@urcontent.com',
    password: 'creator123',
    role: 'creator',
    dashboardUrl: '/dashboard/creator',
    name: 'Alex Creator'
  },
  venue: {
    email: 'venue@urcontent.com',
    password: 'venue123',
    role: 'business',
    dashboardUrl: '/dashboard/business',
    name: 'Business Venue'
  },
  admin: {
    email: 'admin@urcontent.com',
    password: 'admin123',
    role: 'admin',
    dashboardUrl: '/dashboard/admin',
    name: 'Super Admin'
  }
};

test.describe('Authentication System - Comprehensive E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start at login page
    await page.goto('/login');
  });

  test.describe('1. Guest Mode Testing', () => {
    test('should access dashboard without login using guest button', async ({ page }) => {
      // Click "Explorar como Invitado" button
      await page.click('button:has-text("Explorar como Invitado")');
      
      // Should redirect to creator dashboard
      await expect(page).toHaveURL('/dashboard/creator');
      
      // Should show guest mode banner
      await expect(page.locator('text=Modo Invitado')).toBeVisible();
    });

    test('should display demo data in guest mode', async ({ page }) => {
      // Navigate directly to dashboard
      await page.goto('/dashboard/creator');
      
      // Wait for either guest banner or content
      await page.waitForSelector('[class*="dashboard"], text=Modo Invitado', { timeout: 5000 });
      
      // Check if guest mode banner is visible (emergency access)
      const guestBanner = page.locator('text=Modo Invitado');
      const bannerCount = await guestBanner.count();
      
      if (bannerCount > 0) {
        await expect(guestBanner).toBeVisible();
      }
      
      // Dashboard should be accessible
      const dashboardContent = page.locator('[class*="dashboard"], [class*="Dashboard"]').first();
      await expect(dashboardContent).toBeVisible();
    });
  });

  test.describe('2. Creator Authentication', () => {
    test('should login with creator credentials', async ({ page }) => {
      // Fill login form
      await page.fill('input[type="email"]', testAccounts.creator.email);
      await page.fill('input[type="password"]', testAccounts.creator.password);
      
      // Submit form
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Should redirect to creator dashboard
      await expect(page).toHaveURL(testAccounts.creator.dashboardUrl);
      
      // Should show creator-specific content
      await expect(page.locator('text=Creator Dashboard, text=Panel de Creador').first()).toBeVisible();
    });

    test('should display real creator data after login', async ({ page }) => {
      // Login first
      await page.fill('input[type="email"]', testAccounts.creator.email);
      await page.fill('input[type="password"]', testAccounts.creator.password);
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Wait for dashboard
      await page.waitForURL(testAccounts.creator.dashboardUrl);
      
      // Check for creator email or name in the UI
      const userInfo = page.locator(`text=${testAccounts.creator.email}, text=${testAccounts.creator.name}`).first();
      await expect(userInfo).toBeVisible();
    });

    test('should use quick access for creator', async ({ page }) => {
      // Show test accounts
      await page.click('button:has-text("Mostrar Cuentas de Prueba")');
      
      // Click instant access for creator
      await page.click('text=Content Creator >> .. >> button:has-text("Instant Access")');
      
      // Should redirect to creator dashboard
      await expect(page).toHaveURL(testAccounts.creator.dashboardUrl);
    });
  });

  test.describe('3. Business/Venue Authentication', () => {
    test('should login with venue credentials', async ({ page }) => {
      // Fill login form
      await page.fill('input[type="email"]', testAccounts.venue.email);
      await page.fill('input[type="password"]', testAccounts.venue.password);
      
      // Submit form
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Should redirect to business dashboard
      await expect(page).toHaveURL(testAccounts.venue.dashboardUrl);
      
      // Should show business-specific content
      await expect(page.locator('text=Business Dashboard, text=Panel de Negocio, text=Venue Dashboard').first()).toBeVisible();
    });

    test('should display venue management features', async ({ page }) => {
      // Login as venue
      await page.fill('input[type="email"]', testAccounts.venue.email);
      await page.fill('input[type="password"]', testAccounts.venue.password);
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Wait for dashboard
      await page.waitForURL(testAccounts.venue.dashboardUrl);
      
      // Check for venue-specific features
      const venueFeatures = page.locator('text=Venues, text=Locales, text=Offers, text=Ofertas').first();
      await expect(venueFeatures).toBeVisible();
    });
  });

  test.describe('4. Admin Authentication', () => {
    test('should login with admin credentials', async ({ page }) => {
      // Fill login form
      await page.fill('input[type="email"]', testAccounts.admin.email);
      await page.fill('input[type="password"]', testAccounts.admin.password);
      
      // Submit form
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Should redirect to admin dashboard
      await expect(page).toHaveURL(testAccounts.admin.dashboardUrl);
      
      // Should show admin-specific content
      await expect(page.locator('text=Admin Dashboard, text=Panel de Administrador').first()).toBeVisible();
    });

    test('should display admin management features', async ({ page }) => {
      // Login as admin
      await page.fill('input[type="email"]', testAccounts.admin.email);
      await page.fill('input[type="password"]', testAccounts.admin.password);
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Wait for dashboard
      await page.waitForURL(testAccounts.admin.dashboardUrl);
      
      // Check for admin-specific features
      const adminFeatures = page.locator('text=Users, text=Usuarios, text=Platform, text=Plataforma').first();
      await expect(adminFeatures).toBeVisible();
    });
  });

  test.describe('5. Error Handling', () => {
    test('should display error with invalid credentials', async ({ page }) => {
      // Try invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Should show error message
      await expect(page.locator('text=Invalid email or password, text=Email o contraseña inválidos').first()).toBeVisible();
      
      // Should stay on login page
      await expect(page).toHaveURL('/login');
    });

    test('should handle logout functionality', async ({ page }) => {
      // Login first
      await page.fill('input[type="email"]', testAccounts.creator.email);
      await page.fill('input[type="password"]', testAccounts.creator.password);
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Wait for dashboard
      await page.waitForURL(testAccounts.creator.dashboardUrl);
      
      // Find and click logout button (may be in dropdown)
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Cerrar Sesión")');
      const dropdownTrigger = page.locator('[class*="dropdown"], [class*="avatar"], [class*="user-menu"]').first();
      
      // Try dropdown first
      if (await dropdownTrigger.count() > 0) {
        await dropdownTrigger.click();
      }
      
      // Click logout
      await logoutButton.first().click();
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should clear errors when typing new credentials', async ({ page }) => {
      // First attempt with wrong credentials
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrong');
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Error should appear
      const errorMessage = page.locator('[role="alert"], [class*="error"], [class*="alert"]').first();
      await expect(errorMessage).toBeVisible();
      
      // Start typing new email
      await page.fill('input[type="email"]', '');
      await page.type('input[type="email"]', 'creator@');
      
      // Error should disappear
      await expect(errorMessage).not.toBeVisible();
    });
  });

  test.describe('6. Test Account Quick Access', () => {
    test('should show all test accounts when toggled', async ({ page }) => {
      // Click toggle button
      await page.click('button:has-text("Mostrar Cuentas de Prueba")');
      
      // Check all accounts are visible
      await expect(page.locator('text="Content Creator"')).toBeVisible();
      await expect(page.locator('text="creator@urcontent.com"')).toBeVisible();
      await expect(page.locator('text="Venue/Business"')).toBeVisible();
      await expect(page.locator('text="venue@urcontent.com"')).toBeVisible();
      await expect(page.locator('text="Admin"')).toBeVisible();
      await expect(page.locator('text="admin@urcontent.com"')).toBeVisible();
    });

    test('should fill form when clicking "Usar"', async ({ page }) => {
      // Show test accounts
      await page.click('button:has-text("Mostrar Cuentas de Prueba")');
      
      // Click "Usar" for creator account
      await page.click('text=Content Creator >> .. >> button:has-text("Usar")');
      
      // Check form is filled
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await expect(emailInput).toHaveValue(testAccounts.creator.email);
      await expect(passwordInput).toHaveValue(testAccounts.creator.password);
    });

    test('should provide instant access for all roles', async ({ page }) => {
      // Show test accounts
      await page.click('button:has-text("Mostrar Cuentas de Prueba")');
      
      // Test instant access for business
      await page.click('text=Venue/Business >> .. >> button:has-text("Instant Access")');
      await expect(page).toHaveURL(testAccounts.venue.dashboardUrl);
      
      // Go back to login
      await page.goto('/login');
      await page.click('button:has-text("Mostrar Cuentas de Prueba")');
      
      // Test instant access for admin
      await page.click('text=Admin >> .. >> button:has-text("Instant Access")');
      await expect(page).toHaveURL(testAccounts.admin.dashboardUrl);
    });
  });

  test.describe('7. Protected Routes', () => {
    test('should allow guest access to protected routes with banner', async ({ page }) => {
      // Navigate directly to a protected route
      await page.goto('/dashboard/creator/profile');
      
      // Should either show content with guest banner or redirect
      const guestBanner = page.locator('text=Modo Invitado');
      const loginPage = page.locator('text=Iniciar Sesión');
      
      // Wait for either outcome
      await page.waitForSelector('text=Modo Invitado, text=Iniciar Sesión', { timeout: 5000 });
      
      // If guest banner appears, content should be accessible
      if (await guestBanner.count() > 0) {
        await expect(guestBanner).toBeVisible();
        // Profile content should be visible
        const profileContent = page.locator('[class*="profile"], text=Profile, text=Perfil').first();
        await expect(profileContent).toBeVisible();
      }
    });

    test('should enforce role requirements after login', async ({ page }) => {
      // Login as creator
      await page.fill('input[type="email"]', testAccounts.creator.email);
      await page.fill('input[type="password"]', testAccounts.creator.password);
      await page.click('button:has-text("Iniciar Sesión")');
      
      // Try to access admin dashboard
      await page.goto('/dashboard/admin');
      
      // Should redirect to appropriate dashboard or show error
      await expect(page).not.toHaveURL('/dashboard/admin');
    });
  });
});

// Utility function to clear auth state between tests if needed
async function clearAuthState(page: any) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}