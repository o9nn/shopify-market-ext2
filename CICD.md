# CI/CD Pipeline Documentation

## Overview

This project includes comprehensive CI/CD pipelines using GitHub Actions for automated testing, building, and releasing.

## Workflows

### 1. CI - Build and Test (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Lint Job
- Runs ESLint on all JavaScript/JSX files
- Ensures code style consistency
- Fast feedback on code quality issues

#### Test Backend Job
- Spins up PostgreSQL service container
- Runs Jest unit tests for backend
- Generates code coverage reports
- Uploads coverage to Codecov

#### Test Frontend Job
- Runs Vitest tests for React components
- Tests with jsdom environment
- Generates frontend coverage reports
- Uploads coverage to Codecov

#### Build Job
- Depends on lint and test jobs
- Installs all dependencies
- Builds production client bundle
- Uploads build artifacts for use in E2E tests

#### E2E Test Job
- Depends on build job
- Spins up PostgreSQL service
- Downloads production build artifacts
- Installs Playwright browsers
- Runs end-to-end tests
- Uploads test reports and screenshots

**Environment Variables Required:**
- `VITE_SHOPIFY_API_KEY` (secret)

### 2. Release Build (`.github/workflows/release.yml`)

**Triggers:**
- Git tags matching `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**Jobs:**

#### Build Web Job
- Builds production web application
- Creates tar.gz archive with:
  - Server code
  - Built client
  - Dependencies list
  - Documentation
- Uploads web release artifact

#### Build Electron Job
- Matrix strategy for multiple platforms:
  - Ubuntu (Linux builds)
  - Windows
  - macOS
- Builds platform-specific installers:
  - **Linux**: AppImage, .deb
  - **Windows**: NSIS installer, portable .exe
  - **macOS**: .dmg, .zip
- Uploads platform-specific artifacts

#### Create Release Job
- Runs only on tag pushes
- Downloads all build artifacts
- Creates GitHub release
- Attaches all build artifacts
- Generates release notes automatically

**Environment Variables Required:**
- `VITE_SHOPIFY_API_KEY` (secret)
- `GITHUB_TOKEN` (automatic)

## Secrets Configuration

Required secrets in GitHub repository settings:

1. **VITE_SHOPIFY_API_KEY**
   - Shopify API key for frontend
   - Used during build process
   - Path: Settings → Secrets → Actions

2. **CODECOV_TOKEN** (optional)
   - For code coverage reporting
   - Get from codecov.io

3. Code signing certificates (optional, for production releases):
   - **CSC_LINK**: Certificate file (base64 encoded)
   - **CSC_KEY_PASSWORD**: Certificate password
   - **APPLE_ID**: For macOS notarization
   - **APPLE_ID_PASSWORD**: App-specific password

## Creating a Release

### Version Tagging

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Create and push tag
git tag v1.0.0
git push origin v1.0.0
```

### Release Process

1. **Tag is pushed** → Release workflow triggers
2. **Web build** creates tarball
3. **Electron builds** create platform installers
4. **Release created** with all artifacts attached
5. **Release notes** generated from commits

## Local Testing

### Test CI workflow locally

```bash
# Install act (GitHub Actions local runner)
# https://github.com/nektos/act

# Run CI workflow
act push

# Run specific job
act -j test-backend
```

### Test builds locally

```bash
# Test web build
npm run build:prod

# Test Electron build
npm run electron:build
```

## Monitoring

### Build Status

Check workflow runs at:
```
https://github.com/o9nn/shopify-market-ext2/actions
```

### Coverage Reports

View coverage at:
```
https://codecov.io/gh/o9nn/shopify-market-ext2
```

### Build Artifacts

Download from workflow runs:
1. Go to Actions tab
2. Click on workflow run
3. Scroll to Artifacts section
4. Download desired artifact

## Troubleshooting

### Build Failures

**Frontend tests fail:**
- Check Node.js version (should be 18+)
- Verify all dependencies installed
- Check for environment variable issues

**Backend tests fail:**
- Verify PostgreSQL service is healthy
- Check database connection string
- Review test logs for specific errors

**E2E tests fail:**
- Check if build artifacts downloaded correctly
- Verify Playwright browsers installed
- Review screenshots in test results

**Electron build fails:**
- Check platform-specific dependencies
- Verify electron-builder configuration
- Check available disk space

### Release Issues

**Tag push doesn't trigger release:**
- Verify tag matches pattern `v*`
- Check workflow file is on default branch
- Review workflow permissions

**Missing artifacts in release:**
- Check if all build jobs completed
- Verify artifact upload paths
- Review job dependencies

**Code signing fails:**
- Verify certificate secrets are set
- Check certificate validity
- Review signing configuration

## Best Practices

1. **Always test locally** before pushing
2. **Use feature branches** for development
3. **Create PRs** for code review
4. **Tag releases** from main branch only
5. **Monitor CI status** after pushing
6. **Fix broken builds** immediately
7. **Keep dependencies updated**
8. **Review coverage reports** regularly

## Maintenance

### Updating Dependencies

```bash
# Update GitHub Actions
# Edit .github/workflows/*.yml
# Bump action versions (e.g., actions/checkout@v4)

# Update Node.js version
# Edit workflows and package.json engines
```

### Workflow Optimization

- **Cache dependencies** to speed up builds
- **Use matrix strategy** for parallel execution
- **Split large jobs** into smaller ones
- **Skip redundant steps** with conditionals

### Cost Optimization

GitHub Actions minutes usage:
- **Public repos**: Unlimited for public repositories
- **Private repos**: 2,000 minutes/month free (Pro), 3,000 (Team)

Tips to reduce usage:
- Cache node_modules
- Use smaller runner images
- Skip unnecessary jobs
- Use conditions to avoid redundant runs

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-builder CI](https://www.electron.build/configuration/publish)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Jest CI Configuration](https://jestjs.io/docs/continuous-integration)
