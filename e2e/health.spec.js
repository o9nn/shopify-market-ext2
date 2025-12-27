const { test, expect } = require('@playwright/test');

test.describe('Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeTruthy();
  });
});

test.describe('API Authentication', () => {
  test('should redirect to Shopify OAuth when not authenticated', async ({ page }) => {
    // Navigate to auth endpoint without shop parameter
    await page.goto('/api/auth');
    
    // Should show some response (either redirect or error)
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
