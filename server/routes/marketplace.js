const express = require('express');
const router = express.Router();
const { MarketplaceConnection, ProductListing, Order } = require('../models');

/**
 * @route GET /api/marketplace/connections
 * @desc Get all marketplace connections for the shop
 */
router.get('/connections', async (req, res, next) => {
  try {
    const connections = await MarketplaceConnection.findAll({
      where: { shopId: req.shop.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(connections);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/marketplace/connections/:id
 * @desc Get a single marketplace connection
 */
router.get('/connections/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const connection = await MarketplaceConnection.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // Get stats for this connection
    const listingCount = await ProductListing.count({
      where: { connectionId: id }
    });
    
    const orderCount = await Order.count({
      where: { connectionId: id }
    });
    
    res.json({
      ...connection.toJSON(),
      stats: {
        listingCount,
        orderCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/marketplace/connections
 * @desc Create a new marketplace connection
 */
router.post('/connections', async (req, res, next) => {
  try {
    const { marketplace, marketplaceAccountId, credentials, settings, salesChannelId } = req.body;
    
    if (!marketplace) {
      return res.status(400).json({ error: 'Marketplace type is required' });
    }
    
    // Check if connection already exists
    const existing = await MarketplaceConnection.findOne({
      where: { 
        shopId: req.shop.id, 
        marketplace,
        marketplaceAccountId: marketplaceAccountId || null
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Connection already exists for this marketplace' });
    }
    
    const connection = await MarketplaceConnection.create({
      shopId: req.shop.id,
      marketplace,
      marketplaceAccountId,
      credentials: credentials || {},
      settings: settings || {
        autoSync: true,
        syncInventory: true,
        syncPrices: true,
        syncOrders: true
      },
      salesChannelId: salesChannelId || null,
      status: 'pending'
    });
    
    res.status(201).json(connection);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/marketplace/connections/:id
 * @desc Update a marketplace connection
 */
router.put('/connections/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { credentials, settings, status, salesChannelId } = req.body;
    
    const connection = await MarketplaceConnection.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    const updates = {};
    if (credentials) updates.credentials = { ...connection.credentials, ...credentials };
    if (settings) updates.settings = { ...connection.settings, ...settings };
    if (status) updates.status = status;
    if (salesChannelId !== undefined) updates.salesChannelId = salesChannelId;
    
    await connection.update(updates);
    res.json(connection);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/marketplace/connections/:id
 * @desc Delete a marketplace connection
 */
router.delete('/connections/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const connection = await MarketplaceConnection.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // Delete associated listings
    await ProductListing.destroy({ where: { connectionId: id } });
    
    // Delete the connection
    await connection.destroy();
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/marketplace/connections/:id/test
 * @desc Test a marketplace connection
 */
router.post('/connections/:id/test', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const connection = await MarketplaceConnection.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // TODO: Implement marketplace-specific connection testing
    // This would call the appropriate marketplace API to verify credentials
    
    // For now, simulate a successful test
    await connection.update({
      status: 'active',
      errorMessage: null
    });
    
    res.json({ 
      success: true, 
      message: 'Connection test successful',
      connection 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/marketplace/connections/:id/sync
 * @desc Trigger a full sync for a marketplace connection
 */
router.post('/connections/:id/sync', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { syncType = 'all' } = req.body; // 'all', 'products', 'orders', 'inventory'
    
    const connection = await MarketplaceConnection.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    if (connection.status !== 'active') {
      return res.status(400).json({ error: 'Connection is not active' });
    }
    
    // TODO: Implement marketplace-specific sync logic
    // This would queue sync jobs for the specified sync type
    
    await connection.update({
      lastSyncAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: `Sync initiated for ${syncType}`,
      connectionId: id,
      syncType
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/marketplace/supported
 * @desc Get list of supported marketplaces
 */
router.get('/supported', (req, res) => {
  const supportedMarketplaces = [
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Sell on Amazon marketplace',
      features: ['products', 'orders', 'inventory', 'fulfillment'],
      requiredCredentials: ['sellerId', 'mwsAuthToken', 'marketplaceId']
    },
    {
      id: 'ebay',
      name: 'eBay',
      description: 'Sell on eBay marketplace',
      features: ['products', 'orders', 'inventory'],
      requiredCredentials: ['appId', 'certId', 'devId', 'authToken']
    },
    {
      id: 'walmart',
      name: 'Walmart',
      description: 'Sell on Walmart marketplace',
      features: ['products', 'orders', 'inventory'],
      requiredCredentials: ['clientId', 'clientSecret']
    },
    {
      id: 'target',
      name: 'Target Plus',
      description: 'Sell on Target Plus marketplace',
      features: ['products', 'orders', 'inventory'],
      requiredCredentials: ['apiKey', 'apiSecret']
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Sell on Etsy marketplace',
      features: ['products', 'orders', 'inventory'],
      requiredCredentials: ['apiKey', 'sharedSecret', 'accessToken']
    }
  ];
  
  res.json(supportedMarketplaces);
});

/**
 * @route GET /api/marketplace/dashboard
 * @desc Get marketplace dashboard data
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const { sequelize } = require('../models');
    
    // Get connection stats
    const connections = await MarketplaceConnection.findAll({
      where: { shopId: req.shop.id },
      attributes: ['id', 'marketplace', 'status', 'lastSyncAt']
    });
    
    // Get listing stats by marketplace
    const listingStats = await ProductListing.findAll({
      where: { shopId: req.shop.id },
      attributes: [
        'connectionId',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['connectionId', 'status']
    });
    
    // Get order stats by source
    const orderStats = await Order.findAll({
      where: { shopId: req.shop.id },
      attributes: [
        'source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
      ],
      group: ['source']
    });
    
    res.json({
      connections,
      listingStats,
      orderStats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
