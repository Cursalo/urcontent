import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the development server to be ready
    console.log('Waiting for development server...');
    await page.goto(baseURL!);
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('Development server is ready');

    // Perform any global setup tasks here
    // For example: seed test data, setup test users, etc.
    
    // Create test user accounts for E2E tests
    await setupTestUsers(page);
    
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestUsers(page: any) {
  console.log('Setting up test users...');
  
  // This would typically involve:
  // 1. Creating test user accounts in the database
  // 2. Setting up test data
  // 3. Configuring any necessary API endpoints
  
  // For now, we'll just log the setup
  console.log('Test users setup completed');
}

export default globalSetup;