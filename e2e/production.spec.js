const { test, expect } = require('@playwright/test');

test.describe('Production Build', () => {
  test('should serve static files in production', async ({ page }) => {
    // This test assumes production build
    await page.goto('/');
    
    // Check if page loads
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should serve index.html for client routes', async ({ page }) => {
    await page.goto('/products');
    
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
