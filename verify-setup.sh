#!/bin/bash
# Verification script for CI/CD setup

set -e

echo "🔍 Verifying CI/CD and Testing Setup..."

# Check for required files
echo ""
echo "📁 Checking required files..."
files=(
  "jest.config.js"
  "playwright.config.js"
  "client/vitest.config.js"
  ".github/workflows/ci.yml"
  ".github/workflows/release.yml"
  "Dockerfile"
  "docker-compose.yml"
  "electron/main.js"
  "electron/preload.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
    exit 1
  fi
done

# Check for test directories
echo ""
echo "📂 Checking test directories..."
dirs=(
  "server/__tests__"
  "client/src/__tests__"
  "e2e"
)

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir exists"
  else
    echo "✗ $dir missing"
    exit 1
  fi
done

# Check for test files
echo ""
echo "📝 Checking test files..."
test_files=$(find . -name "*.test.js" -o -name "*.test.jsx" -o -name "*.spec.js" | wc -l)
echo "✓ Found $test_files test files"

# Check package.json scripts
echo ""
echo "🔧 Checking package.json scripts..."
required_scripts=(
  "test"
  "test:watch"
  "test:coverage"
  "test:client"
  "test:e2e"
  "test:all"
  "build:prod"
  "electron:dev"
  "electron:build"
)

for script in "${required_scripts[@]}"; do
  if grep -q "\"$script\"" package.json; then
    echo "✓ Script '$script' exists"
  else
    echo "✗ Script '$script' missing"
    exit 1
  fi
done

echo ""
echo "✅ All verifications passed!"
echo ""
echo "📋 Next steps:"
echo "1. Install dependencies: npm ci && cd client && npm ci"
echo "2. Run tests: npm run test:all"
echo "3. Build for production: npm run build:prod"
echo "4. Build Electron app: npm run electron:build"
echo "5. Push to trigger CI: git push origin main"
