# Shopify Marketplace Manager

A comprehensive Shopify sales channel app for managing multi-marketplace integrations. Connect your Shopify store to Amazon, eBay, Walmart, and other marketplaces from a single dashboard.

## Features

- **Multi-Marketplace Integration**: Connect to Amazon, eBay, Walmart, Target Plus, and Etsy
- **Sales Channel Management**: Create custom sales channels with B2B-style tenant management
- **Product Catalog System**: Organize products into catalogs with specific pricing and filters
- **Many-to-Many Architecture**: Link tenants, channels, and catalogs similar to B2B company structures
- **Product Listing Management**: Create and sync product listings across all connected marketplaces
- **Order Management**: View and manage orders from all channels in one place
- **Inventory Sync**: Automatic inventory synchronization across all platforms
- **Price Management**: Set marketplace-specific pricing with markup rules
- **Fulfillment Tracking**: Update fulfillment status and sync tracking information

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with PostgreSQL
- **Shopify API** (REST & GraphQL)
- **JWT** for session management

### Frontend
- **React 18** with Vite
- **Shopify Polaris** design system
- **Shopify App Bridge** for embedded app functionality
- **React Router** for navigation

## Project Structure

```
shopify-market-test/
├── server/
│   ├── config/
│   │   ├── database.js      # Database configuration
│   │   └── shopify.js       # Shopify API configuration
│   ├── middleware/
│   │   ├── shopifyAuth.js   # OAuth and session management
│   │   └── verifyRequest.js # Request verification
│   ├── models/
│   │   ├── Shop.js          # Shop model
│   │   ├── Session.js       # Session storage
│   │   ├── MarketplaceConnection.js
│   │   ├── ProductListing.js
│   │   ├── Order.js
│   │   ├── SalesChannel.js  # Custom sales channels
│   │   ├── ProductCatalog.js # Product catalogs
│   │   ├── ChannelCatalogLink.js # M2M channel-catalog
│   │   └── TenantChannelLink.js  # M2M tenant-channel
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── products.js      # Product management
│   │   ├── orders.js        # Order management
│   │   ├── marketplace.js   # Marketplace connections
│   │   ├── salesChannels.js # Sales channel management
│   │   ├── productCatalogs.js # Catalog management
│   │   └── webhooks.js      # Shopify webhooks
│   ├── services/
│   │   ├── ShopifyService.js
│   │   ├── MarketplaceService.js
│   │   └── marketplaces/
│   │       ├── AmazonService.js
│   │       ├── EbayService.js
│   │       └── index.js
│   └── index.js             # Server entry point
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Marketplaces.jsx
│   │   │   ├── SalesChannels.jsx
│   │   │   ├── ProductCatalogs.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   └── useApi.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Shopify Partner account
- Shopify development store

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/o9nn/shopify-market-test.git
   cd shopify-market-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
   HOST=https://your-ngrok-url.ngrok.io
   DATABASE_URL=postgres://user:password@localhost:5432/shopify_marketplace
   ```

4. **Set up the database**
   ```bash
   npm run migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Shopify App Setup

1. Create a new app in your Shopify Partner dashboard
2. Set the App URL to your ngrok URL
3. Set the Allowed redirection URL(s) to `{your-url}/api/auth/callback`
4. Copy the API key and secret to your `.env` file

## API Endpoints

### Authentication
- `GET /api/auth` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/verify` - Verify session

### Products
- `GET /api/products` - Get Shopify products
- `GET /api/products/:id` - Get single product
- `GET /api/products/listings/all` - Get all marketplace listings
- `POST /api/products/listings` - Create listing
- `PUT /api/products/listings/:id` - Update listing
- `DELETE /api/products/listings/:id` - Delete listing
- `POST /api/products/listings/:id/sync` - Sync listing
- `POST /api/products/listings/bulk-sync` - Bulk sync listings

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/shopify` - Get Shopify orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/import` - Import marketplace orders
- `PUT /api/orders/:id/fulfill` - Fulfill order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats/summary` - Order statistics

### Marketplaces
- `GET /api/marketplace/connections` - Get connections
- `GET /api/marketplace/connections/:id` - Get single connection
- `POST /api/marketplace/connections` - Create connection
- `PUT /api/marketplace/connections/:id` - Update connection
- `DELETE /api/marketplace/connections/:id` - Delete connection
- `POST /api/marketplace/connections/:id/test` - Test connection
- `POST /api/marketplace/connections/:id/sync` - Trigger sync
- `GET /api/marketplace/supported` - Get supported marketplaces
- `GET /api/marketplace/dashboard` - Dashboard data

### Sales Channels
- `GET /api/sales-channels` - Get all sales channels
- `GET /api/sales-channels/:id` - Get single channel with details
- `POST /api/sales-channels` - Create new sales channel
- `PUT /api/sales-channels/:id` - Update sales channel
- `DELETE /api/sales-channels/:id` - Delete sales channel
- `POST /api/sales-channels/:id/catalogs` - Link catalog to channel
- `DELETE /api/sales-channels/:id/catalogs/:catalogId` - Unlink catalog
- `POST /api/sales-channels/:id/tenants` - Link tenant to channel
- `PUT /api/sales-channels/:id/tenants/:shopId` - Update tenant link
- `DELETE /api/sales-channels/:id/tenants/:shopId` - Unlink tenant

### Product Catalogs
- `GET /api/product-catalogs` - Get all catalogs
- `GET /api/product-catalogs/:id` - Get single catalog with details
- `POST /api/product-catalogs` - Create new catalog
- `PUT /api/product-catalogs/:id` - Update catalog
- `DELETE /api/product-catalogs/:id` - Delete catalog
- `GET /api/product-catalogs/:id/products` - Get catalog products

### Webhooks
- `POST /api/webhooks/app/uninstalled` - App uninstall
- `POST /api/webhooks/orders/create` - New order
- `POST /api/webhooks/orders/updated` - Order updated
- `POST /api/webhooks/orders/fulfilled` - Order fulfilled
- `POST /api/webhooks/products/update` - Product updated
- `POST /api/webhooks/products/delete` - Product deleted
- `POST /api/webhooks/inventory/update` - Inventory updated

## Marketplace Integration

### Amazon (SP-API)
Required credentials:
- Seller ID
- Refresh Token
- Client ID
- Client Secret
- Marketplace ID

### eBay
Required credentials:
- Client ID
- Client Secret
- Refresh Token
- Fulfillment Policy ID
- Payment Policy ID
- Return Policy ID

### Walmart (Coming Soon)
### Target Plus (Coming Soon)
### Etsy (Coming Soon)

## Sales Channel Architecture

This app implements a sophisticated M2M (many-to-many) architecture inspired by Shopify's B2B company structure, enabling advanced marketplace and channel management.

### Key Concepts

1. **Sales Channels**: Represent different selling environments (marketplaces, retail, wholesale, B2B)
2. **Product Catalogs**: Group products with specific filters and pricing strategies
3. **Tenant Links**: Connect Shopify stores (tenants) to channels with role-based permissions
4. **Catalog Links**: Associate catalogs with channels for product availability control

### Architecture Benefits

- **Flexible Configuration**: Each channel can have multiple catalogs with different pricing
- **Role-Based Access**: Tenants can be assigned as owners, managers, or viewers
- **Centralized Management**: Administer all channels from a B2B-style interface
- **Scalable Design**: Support complex multi-tenant, multi-marketplace scenarios

### Use Cases

- **Multi-Brand Retailers**: Manage different product lines across various marketplaces
- **B2B Wholesalers**: Create customer-specific catalogs with custom pricing
- **Seasonal Campaigns**: Deploy promotional catalogs to specific channels
- **Regional Distribution**: Configure location-based channel and catalog assignments

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Migrations
```bash
# Run migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Run seeds
npm run seed
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a production PostgreSQL database
- Configure SSL for database connection
- Set up proper CORS origins

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Resources

- [Shopify App Development](https://shopify.dev/docs/apps)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Amazon SP-API](https://developer-docs.amazon.com/sp-api/)
- [eBay Developers](https://developer.ebay.com/)
