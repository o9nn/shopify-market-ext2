const express = require('express');
const router = express.Router();
const { ProductListing, MarketplaceConnection } = require('../models');
const ShopifyService = require('../services/ShopifyService');

/**
 * @route GET /api/products
 * @desc Get all products from Shopify
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, cursor } = req.query;
    const shopifyService = new ShopifyService(req.session);
    
    const products = await shopifyService.getProducts({ limit, cursor });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/products/:id
 * @desc Get a single product by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopifyService = new ShopifyService(req.session);
    
    const product = await shopifyService.getProduct(id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/products/listings
 * @desc Get all product listings for marketplace connections
 */
router.get('/listings/all', async (req, res, next) => {
  try {
    const { connectionId, status, page = 1, limit = 50 } = req.query;
    
    const where = { shopId: req.shop.id };
    if (connectionId) where.connectionId = connectionId;
    if (status) where.status = status;
    
    const listings = await ProductListing.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [{
        model: MarketplaceConnection,
        as: 'connection',
        attributes: ['id', 'marketplace', 'status']
      }],
      order: [['updatedAt', 'DESC']]
    });
    
    res.json({
      listings: listings.rows,
      total: listings.count,
      page: parseInt(page),
      totalPages: Math.ceil(listings.count / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/products/listings
 * @desc Create a new product listing for a marketplace
 */
router.post('/listings', async (req, res, next) => {
  try {
    const { connectionId, shopifyProductId, shopifyVariantId, price, compareAtPrice } = req.body;
    
    // Verify connection belongs to shop
    const connection = await MarketplaceConnection.findOne({
      where: { id: connectionId, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Marketplace connection not found' });
    }
    
    // Get product details from Shopify
    const shopifyService = new ShopifyService(req.session);
    const product = await shopifyService.getProduct(shopifyProductId);
    
    const listing = await ProductListing.create({
      shopId: req.shop.id,
      connectionId,
      shopifyProductId,
      shopifyVariantId,
      title: product.title,
      price: price || product.variants?.[0]?.price,
      compareAtPrice: compareAtPrice || product.variants?.[0]?.compare_at_price,
      inventory: product.variants?.[0]?.inventory_quantity || 0,
      status: 'draft'
    });
    
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/products/listings/:id
 * @desc Update a product listing
 */
router.put('/listings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const listing = await ProductListing.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    await listing.update(updates);
    res.json(listing);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/products/listings/:id
 * @desc Delete a product listing
 */
router.delete('/listings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const listing = await ProductListing.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    await listing.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/products/listings/:id/sync
 * @desc Sync a product listing to the marketplace
 */
router.post('/listings/:id/sync', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const listing = await ProductListing.findOne({
      where: { id, shopId: req.shop.id },
      include: [{ model: MarketplaceConnection, as: 'connection' }]
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // TODO: Implement marketplace-specific sync logic
    // This would call the appropriate marketplace service based on listing.connection.marketplace
    
    await listing.update({
      syncStatus: 'synced',
      lastSyncAt: new Date()
    });
    
    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/products/listings/bulk-sync
 * @desc Bulk sync multiple product listings
 */
router.post('/listings/bulk-sync', async (req, res, next) => {
  try {
    const { listingIds } = req.body;
    
    if (!listingIds || !Array.isArray(listingIds)) {
      return res.status(400).json({ error: 'listingIds array is required' });
    }
    
    const listings = await ProductListing.findAll({
      where: { 
        id: listingIds,
        shopId: req.shop.id 
      }
    });
    
    // TODO: Implement bulk sync logic
    const results = await Promise.all(
      listings.map(async (listing) => {
        try {
          await listing.update({
            syncStatus: 'synced',
            lastSyncAt: new Date()
          });
          return { id: listing.id, success: true };
        } catch (error) {
          return { id: listing.id, success: false, error: error.message };
        }
      })
    );
    
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
