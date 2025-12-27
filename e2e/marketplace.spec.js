const { test, expect } = require('@playwright/test');

test.describe('Marketplace API', () => {
  test('should require authentication for marketplace endpoints', async ({ request }) => {
    const response = await request.get('/api/marketplace/supported');
    
    // Without authentication, should get 401 or redirect
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
