# Shopify Marketplace Manager - Docker Deployment

## Quick Start with Docker

### Using Docker Compose (Recommended)

1. **Create a `.env` file** with your credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec app npm run migrate
   ```

4. **Access the application**:
   - Web App: http://localhost:3000

### Using Docker Only

1. **Build the image**:
   ```bash
   docker build -t shopify-marketplace .
   ```

2. **Run PostgreSQL**:
   ```bash
   docker run -d \
     --name shopify-db \
     -e POSTGRES_USER=shopify \
     -e POSTGRES_PASSWORD=shopify \
     -e POSTGRES_DB=shopify_marketplace \
     -p 5432:5432 \
     postgres:15-alpine
   ```

3. **Run the application**:
   ```bash
   docker run -d \
     --name shopify-app \
     --link shopify-db:db \
     -p 3000:3000 \
     -e DATABASE_URL=postgres://shopify:shopify@db:5432/shopify_marketplace \
     -e SHOPIFY_API_KEY=your_api_key \
     -e SHOPIFY_API_SECRET=your_api_secret \
     -e HOST=https://your-domain.com \
     -e JWT_SECRET=your_jwt_secret \
     shopify-marketplace
   ```

## Docker Commands

### View logs
```bash
docker-compose logs -f app
```

### Stop the application
```bash
docker-compose down
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Access the container shell
```bash
docker-compose exec app sh
```

## Production Deployment

For production deployments, consider:

1. **Use environment-specific compose files**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Set up SSL/TLS** with a reverse proxy (nginx, Caddy, or Traefik)

3. **Configure backup** for PostgreSQL data volume

4. **Set up monitoring** with health checks and alerting

5. **Use secrets management** for sensitive environment variables
