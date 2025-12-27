const express = require('express');
const router = express.Router();
const { Shop, Order, ProductListing } = require('../models');

// Raw body parser for webhook verification
router.use(express.raw({ type: 'application/json' }));

/**
 * Middleware to capture raw body for HMAC verification
 */
router.use((req, res, next) => {
  req.rawBody = req.body;
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
});

/**
 * @route POST /api/webhooks/app/uninstalled
 * @desc Handle app uninstall webhook
 */
router.post('/app/uninstalled', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    
    console.log(`App uninstalled for shop: ${shopDomain}`);
    
    await Shop.update(
      { 
        isActive: false, 
        uninstalledAt: new Date(),
        accessToken: null 
      },
      { where: { shopDomain } }
    );
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Uninstall webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * @route POST /api/webhooks/orders/create
 * @desc Handle new order creation webhook
 */
router.post('/orders/create', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const orderData = req.body;
    
    console.log(`New order ${orderData.id} for shop: ${shopDomain}`);
    
    const shop = await Shop.findOne({ where: { shopDomain } });
    
    if (shop) {
      await Order.create({
        shopId: shop.id,
        shopifyOrderId: String(orderData.id),
        orderNumber: orderData.order_number,
        source: 'shopify',
        status: 'pending',
        financialStatus: orderData.financial_status,
        fulfillmentStatus: orderData.fulfillment_status,
        currency: orderData.currency,
        subtotal: orderData.subtotal_price,
        totalTax: orderData.total_tax,
        totalShipping: orderData.total_shipping_price_set?.shop_money?.amount || 0,
        totalDiscount: orderData.total_discounts,
        total: orderData.total_price,
        customerEmail: orderData.email,
        customerName: `${orderData.customer?.first_name || ''} ${orderData.customer?.last_name || ''}`.trim(),
        shippingAddress: orderData.shipping_address,
        billingAddress: orderData.billing_address,
        lineItems: orderData.line_items,
        orderedAt: orderData.created_at,
        syncStatus: 'synced',
        lastSyncAt: new Date()
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order create webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * @route POST /api/webhooks/orders/updated
 * @desc Handle order update webhook
 */
router.post('/orders/updated', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const orderData = req.body;
    
    console.log(`Order ${orderData.id} updated for shop: ${shopDomain}`);
    
    const shop = await Shop.findOne({ where: { shopDomain } });
    
    if (shop) {
      await Order.update(
        {
          financialStatus: orderData.financial_status,
          fulfillmentStatus: orderData.fulfillment_status,
          status: mapOrderStatus(orderData),
          lastSyncAt: new Date()
        },
        { where: { shopId: shop.id, shopifyOrderId: String(orderData.id) } }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order update webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * @route POST /api/webhooks/orders/fulfilled
 * @desc Handle order fulfillment webhook
 */
router.post('/orders/fulfilled', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const orderData = req.body;
    
    console.log(`Order ${orderData.id} fulfilled for shop: ${shopDomain}`);
    
    const shop = await Shop.findOne({ where: { shopDomain } });
    
    if (shop) {
      const fulfillment = orderData.fulfillments?.[0];
      
      await Order.update(
        {
          status: 'shipped',
          fulfillmentStatus: 'fulfilled',
          trackingNumber: fulfillment?.tracking_number,
          trackingUrl: fulfillment?.tracking_url,
          carrier: fulfillment?.tracking_company,
          lastSyncAt: new Date()
        },
        { where: { shopId: shop.id, shopifyOrderId: String(orderData.id) } }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order fulfilled webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * @route POST /api/webhooks/products/update
 * @desc Handle product update webhook
 */
router.post('/products/update', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const productData = req.body;
    
    console.log(`Product ${productData.id} updated for shop: ${shopDomain}`);
    
    const shop = await Shop.findOne({ where: { shopDomain } });
    
    if (shop) {
      // Update all listings for this product
      await ProductListing.update(
        {
          title: productData.title,
          syncStatus: 'pending',
          lastSyncAt: new Date()
        },
        { where: { shopId: shop.id, shopifyProductId: String(productData.id) } }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Product update webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * @route POST /api/webhooks/products/delete
 * @desc Handle product deletion webhook
 */
router.post('/products/delete', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const productData = req.body;
    
    console.log(`Product ${productData.id} deleted for shop: ${shopDomain}`);
    
    const shop = await Shop.findOne({ where: { shopDomain } });
    
    if (shop) {
      // Mark listings as inactive
      await ProductListing.update(
        { status: 'inactive', syncStatus: 'pending' },
        { where: { shopId: shop.id, shopifyProductId: String(productData.id) } }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Product delete webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * @route POST /api/webhooks/inventory/update
 * @desc Handle inventory level update webhook
 */
router.post('/inventory/update', async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const inventoryData = req.body;
    
    console.log(`Inventory updated for shop: ${shopDomain}`);
    
    // TODO: Update inventory in product listings
    // This requires mapping inventory_item_id to product variants
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Inventory update webhook error:', error);
    res.status(500).send('Error');
  }
});

/**
 * Helper function to map Shopify order status
 */
function mapOrderStatus(orderData) {
  if (orderData.cancelled_at) return 'cancelled';
  if (orderData.fulfillment_status === 'fulfilled') return 'shipped';
  if (orderData.financial_status === 'refunded') return 'refunded';
  if (orderData.financial_status === 'paid') return 'processing';
  return 'pending';
}

module.exports = router;
