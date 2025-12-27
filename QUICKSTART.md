# Quick Start Guide

Get up and running with Shopify Marketplace Manager in minutes.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn
- Shopify Partner account
- Development store (or production store for testing)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/o9nn/shopify-market-ext2.git
cd shopify-market-ext2
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required variables:
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
HOST=https://your-ngrok-url.ngrok.io
DATABASE_URL=postgres://user:password@localhost:5432/shopify_marketplace
JWT_SECRET=your_random_secret_here
```

### 4. Set Up Database

```bash
# Create database
createdb shopify_marketplace

# Run migrations
npm run migrate

# (Optional) Seed with sample data
npm run seed
```

### 5. Start Development Server

```bash
# Start both backend and frontend
npm run dev
```

This starts:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

## Running Tests

```bash
# Run all tests
npm run test:all

# Or run individually
npm test              # Backend tests
npm run test:client   # Frontend tests
npm run test:e2e      # E2E tests
```

## Building for Production

### Web App

```bash
# Build client
npm run build:prod

# Start production server
NODE_ENV=production npm start
```

### Docker

```bash
# Using Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate
```

### Electron Desktop App

```bash
# Build for current platform
npm run electron:build

# Build for all platforms
npm run electron:build:all
```

## Shopify App Setup

### 1. Create App in Partner Dashboard

1. Go to https://partners.shopify.com
2. Navigate to Apps → Create app
3. Choose "Custom app"
4. Fill in app details

### 2. Configure App URLs

- **App URL**: `https://your-ngrok-url.ngrok.io`
- **Allowed redirection URL(s)**: `https://your-ngrok-url.ngrok.io/api/auth/callback`

### 3. Set API Scopes

Required scopes:
- `read_products`
- `write_products`
- `read_orders`
- `write_orders`
- `read_inventory`
- `write_inventory`

### 4. Get API Credentials

Copy API key and secret to your `.env` file.

### 5. Install on Development Store

1. Click "Select store" in your app
2. Choose your development store
3. Approve the installation
4. You'll be redirected to your app

## Using ngrok (Development)

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy HTTPS URL to .env as HOST
# Update Shopify app URLs with ngrok URL
```

## Marketplace Integration

### Amazon

1. Register for Amazon SP-API
2. Create an app
3. Get credentials:
   - Seller ID
   - Refresh Token
   - Client ID
   - Client Secret
   - Marketplace ID
4. Add connection in app

### eBay

1. Register for eBay Developer account
2. Create an application
3. Get credentials:
   - Client ID
   - Client Secret
   - Refresh Token
4. Set up business policies:
   - Fulfillment Policy
   - Payment Policy
   - Return Policy
5. Add connection in app

## Common Issues

### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env
# Check username, password, host, and database name
```

### Shopify OAuth Redirect Error

- Verify `HOST` in `.env` matches app URL
- Check allowed redirect URLs in Shopify Partner dashboard
- Ensure using HTTPS (ngrok or production)

### Build Errors

```bash
# Clear caches and reinstall
rm -rf node_modules client/node_modules
rm package-lock.json client/package-lock.json
npm install
cd client && npm install
```

## Next Steps

1. **Read the Documentation**
   - [README.md](README.md) - Full documentation
   - [TESTING.md](TESTING.md) - Testing guide
   - [ELECTRON.md](ELECTRON.md) - Desktop app guide
   - [DOCKER.md](DOCKER.md) - Docker deployment
   - [CICD.md](CICD.md) - CI/CD pipeline

2. **Explore the App**
   - Dashboard - Overview and statistics
   - Products - Manage product listings
   - Orders - View and fulfill orders
   - Marketplaces - Connect to Amazon, eBay, etc.
   - Sales Channels - Configure B2B channels
   - Product Catalogs - Organize products

3. **Customize**
   - Add your branding
   - Configure marketplace credentials
   - Set up webhooks
   - Customize pricing rules

4. **Deploy**
   - Choose deployment method (Docker, VPS, cloud)
   - Set up production database
   - Configure SSL/TLS
   - Set up monitoring

## Support

- **Issues**: https://github.com/o9nn/shopify-market-ext2/issues
- **Discussions**: https://github.com/o9nn/shopify-market-ext2/discussions
- **Email**: support@example.com (update with actual email)

## Resources

- [Shopify App Development](https://shopify.dev/docs/apps)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Amazon SP-API Docs](https://developer-docs.amazon.com/sp-api/)
- [eBay Developers](https://developer.ebay.com/)
