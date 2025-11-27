/**
 * Playwright Global Setup
 *
 * Runs once before all tests to prepare the test environment
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright Global Setup...');

  // Create browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for application to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    console.log(`📡 Waiting for application at ${baseURL}...`);

    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✅ Application is ready');

    // Clear any existing test data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear IndexedDB if used
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => db.name && indexedDB.deleteDatabase(db.name));
      });
    });
    console.log('🧹 Cleared browser storage');

    // Seed test database if needed
    // await seedTestDatabase();

    // Setup Stripe test mode
    process.env.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_TEST_PUBLISHABLE_KEY || 'pk_test_51234567890';
    console.log('💳 Stripe test mode configured');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global Setup Complete\n');
}

export default globalSetup;
