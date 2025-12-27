# Testing Guide

## Overview

This project includes comprehensive testing at multiple levels:
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test API endpoints and services
- **E2E Tests**: Test complete user workflows

## Backend Testing (Jest)

### Running Tests

```bash
# Run all backend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Writing Tests

Backend tests are located in `server/__tests__/` and use Jest with supertest for API testing.

Example test:
```javascript
const request = require('supertest');
const app = require('../index');

describe('GET /api/marketplace/connections', () => {
  it('should return marketplace connections', async () => {
    const response = await request(app)
      .get('/api/marketplace/connections')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

### Test Structure
- `server/__tests__/setup.js` - Global test setup
- `server/__tests__/*.test.js` - Test files
- Mock database connections and external APIs

## Frontend Testing (Vitest + React Testing Library)

### Running Tests

```bash
# Run all frontend tests
npm run test:client

# Run in watch mode
cd client && npm run test:watch

# Run with UI
cd client && npm run test:ui

# Run with coverage
cd client && npm run test:coverage
```

### Writing Tests

Frontend tests are located in `client/src/__tests__/` and use Vitest with React Testing Library.

Example test:
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
```

### Test Structure
- `client/src/__tests__/setup.js` - Global test setup
- `client/src/__tests__/*.test.jsx` - Test files
- Mock Shopify Polaris and App Bridge components

## E2E Testing (Playwright)

### Running Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/health.spec.js
```

### Writing Tests

E2E tests are located in `e2e/` and use Playwright.

Example test:
```javascript
const { test, expect } = require('@playwright/test');

test('user can login', async ({ page }) => {
  await page.goto('/');
  await page.fill('#username', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Test Structure
- `playwright.config.js` - Playwright configuration
- `e2e/*.spec.js` - E2E test files
- Tests run against production build

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- Backend: `coverage/`
- Frontend: `client/coverage/`

Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

## CI Testing

All tests run automatically in GitHub Actions on:
- Every push to main/develop branches
- Every pull request
- Tag pushes (release builds)

See `.github/workflows/ci.yml` for CI configuration.

## Best Practices

1. **Write tests first** (TDD) when possible
2. **Keep tests simple** and focused
3. **Use descriptive test names** that explain what is being tested
4. **Mock external dependencies** (APIs, databases)
5. **Test error cases** as well as success cases
6. **Maintain good coverage** (aim for >80%)
7. **Run tests before committing** code

## Troubleshooting

### Tests are slow
- Use `test.only()` to run specific tests during development
- Mock heavy operations (database, external APIs)
- Use `--maxWorkers=1` for sequential execution if needed

### Tests fail in CI but pass locally
- Check environment variables
- Verify database setup
- Check for race conditions
- Review CI logs carefully

### Playwright issues
- Run `npx playwright install` to install browsers
- Use `--headed` flag to see browser during tests
- Check `playwright-report/` for detailed failure info
