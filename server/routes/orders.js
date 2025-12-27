const express = require('express');
const router = express.Router();
const { Order, MarketplaceConnection } = require('../models');
const ShopifyService = require('../services/ShopifyService');

/**
 * @route GET /api/orders
 * @desc Get all orders (combined from Shopify and marketplaces)
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      source, 
      status, 
      connectionId,
      startDate, 
      endDate,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const where = { shopId: req.shop.id };
    
    if (source) where.source = source;
    if (status) where.status = status;
    if (connectionId) where.connectionId = connectionId;
    
    if (startDate || endDate) {
      where.orderedAt = {};
      if (startDate) where.orderedAt.$gte = new Date(startDate);
      if (endDate) where.orderedAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [{
        model: MarketplaceConnection,
        as: 'connection',
        attributes: ['id', 'marketplace', 'status']
      }],
      order: [['orderedAt', 'DESC']]
    });
    
    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      totalPages: Math.ceil(orders.count / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/orders/shopify
 * @desc Get orders directly from Shopify
 */
router.get('/shopify', async (req, res, next) => {
  try {
    const { limit = 50, cursor, status } = req.query;
    const shopifyService = new ShopifyService(req.session);
    
    const orders = await shopifyService.getOrders({ limit, cursor, status });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/orders/:id
 * @desc Get a single order by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, shopId: req.shop.id },
      include: [{
        model: MarketplaceConnection,
        as: 'connection',
        attributes: ['id', 'marketplace', 'status']
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/orders/import
 * @desc Import orders from a marketplace
 */
router.post('/import', async (req, res, next) => {
  try {
    const { connectionId, startDate, endDate } = req.body;
    
    const connection = await MarketplaceConnection.findOne({
      where: { id: connectionId, shopId: req.shop.id }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Marketplace connection not found' });
    }
    
    // TODO: Implement marketplace-specific order import logic
    // This would call the appropriate marketplace service based on connection.marketplace
    
    res.json({ 
      success: true, 
      message: 'Order import initiated',
      connectionId,
      marketplace: connection.marketplace
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/orders/:id/fulfill
 * @desc Mark an order as fulfilled and sync to marketplace
 */
router.put('/:id/fulfill', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackingNumber, trackingUrl, carrier } = req.body;
    
    const order = await Order.findOne({
      where: { id, shopId: req.shop.id },
      include: [{ model: MarketplaceConnection, as: 'connection' }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order with fulfillment info
    await order.update({
      status: 'shipped',
      fulfillmentStatus: 'fulfilled',
      trackingNumber,
      trackingUrl,
      carrier
    });
    
    // If order is from Shopify, create fulfillment in Shopify
    if (order.shopifyOrderId) {
      const shopifyService = new ShopifyService(req.session);
      await shopifyService.createFulfillment(order.shopifyOrderId, {
        trackingNumber,
        trackingUrl,
        carrier
      });
    }
    
    // TODO: Sync fulfillment to marketplace if applicable
    
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/orders/:id/cancel
 * @desc Cancel an order
 */
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({
      where: { id, shopId: req.shop.id }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await order.update({
      status: 'cancelled',
      metadata: {
        ...order.metadata,
        cancellationReason: reason,
        cancelledAt: new Date()
      }
    });
    
    // TODO: Sync cancellation to Shopify and/or marketplace
    
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/orders/stats/summary
 * @desc Get order statistics summary
 */
router.get('/stats/summary', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const { sequelize } = require('../models');
    
    const where = { shopId: req.shop.id };
    if (startDate || endDate) {
      where.orderedAt = {};
      if (startDate) where.orderedAt.$gte = new Date(startDate);
      if (endDate) where.orderedAt.$lte = new Date(endDate);
    }
    
    const stats = await Order.findAll({
      where,
      attributes: [
        'source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
      ],
      group: ['source']
    });
    
    const statusCounts = await Order.findAll({
      where: { shopId: req.shop.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    res.json({
      bySource: stats,
      byStatus: statusCounts
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
