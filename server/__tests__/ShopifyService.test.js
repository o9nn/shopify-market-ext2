const ShopifyService = require('../services/ShopifyService');

describe('ShopifyService', () => {
  describe('constructor', () => {
    it('should create instance with shop and accessToken', () => {
      const service = new ShopifyService('test-shop.myshopify.com', 'test-token');
      expect(service).toBeDefined();
      expect(service.shop).toBe('test-shop.myshopify.com');
      expect(service.accessToken).toBe('test-token');
    });
  });

  describe('API methods', () => {
    let service;

    beforeEach(() => {
      service = new ShopifyService('test-shop.myshopify.com', 'test-token');
    });

    it('should have required methods', () => {
      expect(typeof service.getProducts).toBe('function');
      expect(typeof service.getProduct).toBe('function');
      expect(typeof service.getOrders).toBe('function');
      expect(typeof service.getOrder).toBe('function');
    });
  });
});
