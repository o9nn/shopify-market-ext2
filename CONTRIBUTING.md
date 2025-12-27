# Contributing to Shopify Marketplace Manager

Thank you for considering contributing to Shopify Marketplace Manager! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/shopify-market-ext2.git
   cd shopify-market-ext2
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/o9nn/shopify-market-ext2.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Set up database**
   ```bash
   createdb shopify_marketplace_dev
   npm run migrate
   ```

6. **Run tests**
   ```bash
   npm run test:all
   ```

## Development Process

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, maintainable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test              # Backend tests
npm run test:client   # Frontend tests
npm run test:e2e      # E2E tests

# Check coverage
npm run test:coverage
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new marketplace integration"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### JavaScript/JSX

- **ES6+ syntax** preferred
- **Semicolons** required
- **Single quotes** for strings
- **2 spaces** for indentation
- **No unused variables** or imports

### React Components

```javascript
// Functional components preferred
import React from 'react';

function MyComponent({ prop1, prop2 }) {
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default MyComponent;
```

### Backend Code

```javascript
// Use async/await
async function fetchData() {
  try {
    const result = await database.query('...');
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Proper error handling
app.get('/api/resource', async (req, res, next) => {
  try {
    // Logic here
    res.json(data);
  } catch (error) {
    next(error);
  }
});
```

### File Organization

```
server/
├── routes/        # API route handlers
├── models/        # Database models
├── services/      # Business logic
├── middleware/    # Express middleware
└── __tests__/     # Test files

client/src/
├── components/    # Reusable components
├── pages/         # Page components
├── hooks/         # Custom React hooks
└── __tests__/     # Test files
```

## Testing Requirements

### All Contributions Must Include Tests

1. **Unit Tests**
   - Test individual functions and components
   - Mock external dependencies
   - Aim for >80% code coverage

2. **Integration Tests**
   - Test API endpoints
   - Test database interactions
   - Test service integrations

3. **E2E Tests** (for major features)
   - Test complete user workflows
   - Test critical business logic

### Writing Tests

**Backend (Jest):**
```javascript
describe('API Endpoint', () => {
  it('should return expected data', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toEqual(expectedData);
  });
});
```

**Frontend (Vitest):**
```javascript
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Self-review completed

### PR Description

Include:
1. **Description** of changes
2. **Type of change** (bug fix, feature, etc.)
3. **Related issue** number
4. **Testing** performed
5. **Screenshots** (for UI changes)

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainer
3. **Requested changes** addressed
4. **Approval** and merge

### After Merge

```bash
# Update your local repository
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Simple feature
git commit -m "feat: add eBay marketplace integration"

# Bug fix with scope
git commit -m "fix(auth): resolve OAuth redirect issue"

# With body and footer
git commit -m "feat(orders): add bulk order processing

Implement batch processing for orders to improve performance
when handling large volumes.

Closes #123"
```

### Rules

- Use imperative mood ("add" not "added")
- First line max 72 characters
- Reference issues in footer
- Include breaking changes in footer

## Questions?

- **Issues**: Open an issue for bugs or features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers directly

## Thank You!

Your contributions help make this project better for everyone!
