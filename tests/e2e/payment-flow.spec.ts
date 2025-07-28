import { test, expect } from '@playwright/test';

test.describe('Payment Flow E2E Tests', () => {
  // Mock user authentication state
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'creator'
        }
      }));
    });

    await page.goto('/');
  });

  test.describe('Membership Purchase Flow', () => {
    test('should display membership plans correctly', async ({ page }) => {
      await page.goto('/membership');
      
      // Verify all membership tiers are displayed
      await expect(page.locator('text=Basic')).toBeVisible();
      await expect(page.locator('text=Premium')).toBeVisible();
      await expect(page.locator('text=VIP')).toBeVisible();
      
      // Check pricing display
      await expect(page.locator('text=$2,999')).toBeVisible();
      await expect(page.locator('text=$8,999')).toBeVisible();
      await expect(page.locator('text=$19,999')).toBeVisible();
      
      // Check features are listed
      await expect(page.locator('text=*mensual*')).toBeVisible();
      await expect(page.locator('text=*soporte*')).toBeVisible();
    });

    test('should initiate Basic membership purchase', async ({ page }) => {
      await page.goto('/membership');
      
      // Click on Basic plan
      const basicPlanButton = page.locator('text=Elegir Basic').first();
      await basicPlanButton.click();
      
      // Should open payment modal or redirect to payment page
      await expect(
        page.locator('text=*Confirmar Compra*,text=*Pagar*,text=*MercadoPago*')
      ).toBeVisible({ timeout: 5000 });
      
      // Check that the correct amount is displayed
      await expect(page.locator('text=*$2,999*')).toBeVisible();
    });

    test('should initiate Premium membership purchase', async ({ page }) => {
      await page.goto('/membership');
      
      // Click on Premium plan
      const premiumPlanButton = page.locator('text=Elegir Premium').first();
      await premiumPlanButton.click();
      
      // Should open payment modal
      await expect(
        page.locator('text=*Confirmar Compra*,text=*Pagar*')
      ).toBeVisible({ timeout: 5000 });
      
      // Check that the correct amount is displayed
      await expect(page.locator('text=*$8,999*')).toBeVisible();
    });

    test('should initiate VIP membership purchase', async ({ page }) => {
      await page.goto('/membership');
      
      // Click on VIP plan
      const vipPlanButton = page.locator('text=Elegir VIP').first();
      await vipPlanButton.click();
      
      // Should open payment modal
      await expect(
        page.locator('text=*Confirmar Compra*,text=*Pagar*')
      ).toBeVisible({ timeout: 5000 });
      
      // Check that the correct amount is displayed
      await expect(page.locator('text=*$19,999*')).toBeVisible();
    });

    test('should display payment details in modal', async ({ page }) => {
      await page.goto('/membership');
      
      // Click on Basic plan
      await page.click('text=Elegir Basic');
      
      // Payment modal should show all necessary details
      await expect(page.locator('text=URContent Basic')).toBeVisible();
      await expect(page.locator('text=Plan Mensual')).toBeVisible();
      await expect(page.locator('text=$2,999')).toBeVisible();
      await expect(page.locator('text=MercadoPago')).toBeVisible();
      
      // Should have confirm and cancel buttons
      await expect(page.locator('button:has-text("Confirmar")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
    });

    test('should cancel payment modal', async ({ page }) => {
      await page.goto('/membership');
      
      // Open payment modal
      await page.click('text=Elegir Basic');
      await expect(page.locator('text=Confirmar Compra')).toBeVisible();
      
      // Cancel the payment
      await page.click('button:has-text("Cancelar")');
      
      // Modal should close
      await expect(page.locator('text=Confirmar Compra')).not.toBeVisible();
      
      // Should remain on membership page
      await expect(page).toHaveURL('/membership');
    });

    test('should redirect to MercadoPago for payment', async ({ page }) => {
      await page.goto('/membership');
      
      // Open payment modal
      await page.click('text=Elegir Basic');
      
      // Confirm payment
      await page.click('button:has-text("Confirmar")');
      
      // Should show loading state
      await expect(page.locator('text=*Procesando*,text=*Cargando*')).toBeVisible();
      
      // Should redirect to MercadoPago (or show redirect notice)
      await expect(
        page.locator('text=*MercadoPago*,text=*redirigiendo*')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Experience Booking Payment', () => {
    test('should display experience booking form', async ({ page }) => {
      await page.goto('/experiences');
      
      // Select an experience
      const experienceCard = page.locator('[data-testid="experience-card"]').first();
      await experienceCard.click();
      
      // Should show booking modal
      await expect(page.locator('text=*Reservar*')).toBeVisible();
      
      // Check form fields
      await expect(page.locator('input[type="date"]')).toBeVisible();
      await expect(page.locator('input[type="time"]')).toBeVisible();
      await expect(page.locator('input[name="guests"]')).toBeVisible();
    });

    test('should calculate total price correctly', async ({ page }) => {
      await page.goto('/experiences');
      
      // Select an experience
      const experienceCard = page.locator('[data-testid="experience-card"]').first();
      await experienceCard.click();
      
      // Fill booking details
      await page.fill('input[type="date"]', '2024-12-25');
      await page.fill('input[type="time"]', '14:00');
      await page.fill('input[name="guests"]', '2');
      
      // Should show calculated total
      await expect(page.locator('text=*Total*')).toBeVisible();
      await expect(page.locator('text=*$*')).toBeVisible();
    });

    test('should process experience booking payment', async ({ page }) => {
      await page.goto('/experiences');
      
      // Book an experience
      const experienceCard = page.locator('[data-testid="experience-card"]').first();
      await experienceCard.click();
      
      // Fill form
      await page.fill('input[type="date"]', '2024-12-25');
      await page.fill('input[type="time"]', '14:00');
      await page.fill('input[name="guests"]', '1');
      
      // Submit booking
      await page.click('button:has-text("Reservar")');
      
      // Should redirect to payment
      await expect(
        page.locator('text=*Pagar*,text=*MercadoPago*')
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Campaign Deposit Payment', () => {
    test('should allow business to create campaign with deposit', async ({ page }) => {
      // Mock business user
      await page.addInitScript(() => {
        localStorage.setItem('sb-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: {
            id: 'business-user-id',
            email: 'business@example.com',
            role: 'business'
          }
        }));
      });

      await page.goto('/campaigns');
      
      // Click create campaign
      await page.click('button:has-text("Nueva Campaña")');
      
      // Fill campaign details
      await page.fill('input[name="title"]', 'Summer Campaign 2024');
      await page.fill('textarea[name="description"]', 'A great summer campaign');
      await page.fill('input[name="budget"]', '50000');
      
      // Select creator
      await page.click('[data-testid="creator-selector"]');
      await page.click('[data-testid="creator-option"]');
      
      // Submit campaign
      await page.click('button:has-text("Crear Campaña")');
      
      // Should show deposit payment modal
      await expect(page.locator('text=*Depósito Inicial*')).toBeVisible();
      await expect(page.locator('text=*25%*,text=*$12,500*')).toBeVisible();
    });

    test('should process campaign deposit payment', async ({ page }) => {
      // Mock business user
      await page.addInitScript(() => {
        localStorage.setItem('sb-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: {
            id: 'business-user-id',
            email: 'business@example.com',
            role: 'business'
          }
        }));
      });

      await page.goto('/campaigns');
      
      // Create campaign (assuming campaign creation flow)
      await page.click('button:has-text("Nueva Campaña")');
      await page.fill('input[name="title"]', 'Test Campaign');
      await page.fill('input[name="budget"]', '20000');
      await page.click('button:has-text("Crear Campaña")');
      
      // Confirm deposit payment
      await page.click('button:has-text("Pagar Depósito")');
      
      // Should redirect to MercadoPago
      await expect(
        page.locator('text=*MercadoPago*,text=*redirigiendo*')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Payment Success Flow', () => {
    test('should handle successful payment callback', async ({ page }) => {
      // Simulate return from MercadoPago
      await page.goto('/payment/success?payment_id=123456789&status=approved');
      
      // Should show success message
      await expect(page.locator('text=*Pago Exitoso*,text=*Aprobado*')).toBeVisible();
      
      // Should show payment details
      await expect(page.locator('text=*123456789*')).toBeVisible();
      
      // Should have button to continue
      await expect(page.locator('button:has-text("Continuar")')).toBeVisible();
    });

    test('should redirect to appropriate page after success', async ({ page }) => {
      await page.goto('/payment/success?payment_id=123456789&status=approved&type=membership');
      
      // Click continue button
      await page.click('button:has-text("Continuar")');
      
      // Should redirect to dashboard or membership area
      await expect(page).toHaveURL(/\/(dashboard|membership)/);
    });
  });

  test.describe('Payment Failure Flow', () => {
    test('should handle failed payment callback', async ({ page }) => {
      await page.goto('/payment/failure?payment_id=123456789&status=rejected');
      
      // Should show failure message
      await expect(page.locator('text=*Pago Rechazado*,text=*Error*')).toBeVisible();
      
      // Should show retry button
      await expect(page.locator('button:has-text("Reintentar")')).toBeVisible();
      
      // Should show contact support option
      await expect(page.locator('text=*soporte*,text=*contacto*')).toBeVisible();
    });

    test('should allow user to retry payment', async ({ page }) => {
      await page.goto('/payment/failure?payment_id=123456789&status=rejected');
      
      // Click retry button
      await page.click('button:has-text("Reintentar")');
      
      // Should redirect back to payment flow
      await expect(page).toHaveURL(/\/(membership|experiences|campaigns)/);
    });
  });

  test.describe('Payment Pending Flow', () => {
    test('should handle pending payment callback', async ({ page }) => {
      await page.goto('/payment/pending?payment_id=123456789&status=pending');
      
      // Should show pending message
      await expect(page.locator('text=*Pago Pendiente*,text=*Procesando*')).toBeVisible();
      
      // Should show instructions
      await expect(page.locator('text=*recibirás una confirmación*')).toBeVisible();
      
      // Should have button to continue
      await expect(page.locator('button:has-text("Entendido")')).toBeVisible();
    });
  });

  test.describe('Payment History', () => {
    test('should display payment history', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Navigate to payment history
      await page.click('text=Historial de Pagos');
      
      // Should show payment list
      await expect(page.locator('[data-testid="payment-list"]')).toBeVisible();
      
      // Should show payment details
      await expect(page.locator('text=*Membresía*,text=*Colaboración*,text=*Experiencia*')).toBeVisible();
      
      // Should show payment status
      await expect(page.locator('text=*Aprobado*,text=*Pendiente*,text=*Rechazado*')).toBeVisible();
    });

    test('should filter payment history', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('text=Historial de Pagos');
      
      // Filter by payment type
      await page.selectOption('select[name="type"]', 'membership');
      
      // Should update results
      await expect(page.locator('text=Membresía')).toBeVisible();
      
      // Filter by status
      await page.selectOption('select[name="status"]', 'approved');
      
      // Should show only approved payments
      await expect(page.locator('text=Aprobado')).toBeVisible();
    });

    test('should export payment history', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('text=Historial de Pagos');
      
      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Exportar")');
      
      // Verify download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('payments');
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test.describe('Mobile Payment Flow', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/membership');
      
      // Select membership plan
      await page.click('text=Elegir Basic');
      
      // Payment modal should be mobile-friendly
      await expect(page.locator('text=Confirmar Compra')).toBeVisible();
      
      // Confirm payment
      await page.click('button:has-text("Confirmar")');
      
      // Should redirect to MercadoPago mobile version
      await expect(
        page.locator('text=*MercadoPago*')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during payment', async ({ page }) => {
      // Mock network error
      await page.route('**/api/payments/**', route => route.abort('failed'));
      
      await page.goto('/membership');
      await page.click('text=Elegir Basic');
      await page.click('button:has-text("Confirmar")');
      
      // Should show error message
      await expect(page.locator('text=*Error*,text=*conexión*')).toBeVisible();
      
      // Should allow retry
      await expect(page.locator('button:has-text("Reintentar")')).toBeVisible();
    });

    test('should handle API errors during payment', async ({ page }) => {
      // Mock API error response
      await page.route('**/api/payments/**', route => 
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      );
      
      await page.goto('/membership');
      await page.click('text=Elegir Basic');
      await page.click('button:has-text("Confirmar")');
      
      // Should show error message
      await expect(page.locator('text=*Error*')).toBeVisible();
    });
  });
});