const request = require('supertest');
const express = require('express');
const marketplaceRoutes = require('../routes/marketplace');
const { MarketplaceConnection, ProductListing, Order } = require('../models');

// Mock the models
jest.mock('../models', () => ({
  MarketplaceConnection: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  ProductListing: {
    count: jest.fn()
  },
  Order: {
    count: jest.fn()
  }
}));

describe('Marketplace Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock verifyRequest middleware
    app.use((req, res, next) => {
      req.shop = { id: 1, domain: 'test-shop.myshopify.com' };
      next();
    });
    
    app.use('/api/marketplace', marketplaceRoutes);
    
    jest.clearAllMocks();
  });

  describe('GET /api/marketplace/connections', () => {
    it('should return all marketplace connections for a shop', async () => {
      const mockConnections = [
        { id: 1, marketplace: 'amazon', status: 'active', shopId: 1 },
        { id: 2, marketplace: 'ebay', status: 'active', shopId: 1 }
      ];
      
      MarketplaceConnection.findAll.mockResolvedValue(mockConnections);
      
      const response = await request(app)
        .get('/api/marketplace/connections')
        .expect(200);
      
      expect(response.body).toEqual(mockConnections);
      expect(MarketplaceConnection.findAll).toHaveBeenCalledWith({
        where: { shopId: 1 },
        order: [['createdAt', 'DESC']]
      });
    });

    it('should handle errors', async () => {
      MarketplaceConnection.findAll.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/marketplace/connections')
        .expect(500);
      
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/marketplace/connections/:id', () => {
    it('should return a single marketplace connection with stats', async () => {
      const mockConnection = {
        id: 1,
        marketplace: 'amazon',
        status: 'active',
        shopId: 1,
        toJSON: () => ({ id: 1, marketplace: 'amazon', status: 'active', shopId: 1 })
      };
      
      MarketplaceConnection.findOne.mockResolvedValue(mockConnection);
      ProductListing.count.mockResolvedValue(10);
      Order.count.mockResolvedValue(5);
      
      const response = await request(app)
        .get('/api/marketplace/connections/1')
        .expect(200);
      
      expect(response.body).toMatchObject({
        id: 1,
        marketplace: 'amazon',
        stats: {
          listingCount: 10,
          orderCount: 5
        }
      });
    });

    it('should return 404 if connection not found', async () => {
      MarketplaceConnection.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/marketplace/connections/999')
        .expect(404);
      
      expect(response.body.error).toBe('Connection not found');
    });
  });

  describe('GET /api/marketplace/supported', () => {
    it('should return list of supported marketplaces', async () => {
      const response = await request(app)
        .get('/api/marketplace/supported')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });
});
