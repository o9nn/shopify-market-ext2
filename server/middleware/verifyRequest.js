const jwt = require('jsonwebtoken');
const shopify = require('../config/shopify');
const { sessionStorage } = require('./shopifyAuth');
const { Shop } = require('../models');

/**
 * Verify that the request is coming from a valid Shopify session
 */
const verifyRequest = async (req, res, next) => {
  try {
    // Check for session token in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session token
    const payload = jwt.decode(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    const { dest, iss } = payload;
    const shop = dest?.replace('https://', '') || iss?.replace('https://', '');
    
    if (!shop) {
      return res.status(401).json({ error: 'Could not determine shop from token' });
    }

    // Load session from storage
    const sessionId = shopify.session.getOfflineId(shop);
    const session = await sessionStorage.loadSession(sessionId);
    
    if (!session || !session.accessToken) {
      return res.status(401).json({ 
        error: 'Session not found',
        redirect: `/api/auth?shop=${shop}`
      });
    }

    // Check if session has expired
    if (session.expires && new Date(session.expires) < new Date()) {
      return res.status(401).json({ 
        error: 'Session expired',
        redirect: `/api/auth?shop=${shop}`
      });
    }

    // Load shop data
    const shopData = await Shop.findOne({ where: { shopDomain: shop } });
    
    if (!shopData || !shopData.isActive) {
      return res.status(401).json({ 
        error: 'Shop not found or inactive',
        redirect: `/api/auth?shop=${shop}`
      });
    }

    // Attach session and shop to request
    req.session = session;
    req.shop = shopData;
    req.shopDomain = shop;

    next();
  } catch (error) {
    console.error('Verify request error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Verify webhook requests from Shopify
 */
const verifyWebhook = async (req, res, next) => {
  try {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];
    
    if (!hmac || !topic || !shop) {
      return res.status(401).json({ error: 'Missing webhook headers' });
    }

    // Verify HMAC
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(req.rawBody || '')
      .digest('base64');

    if (hash !== hmac) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    req.webhookTopic = topic;
    req.shopDomain = shop;
    
    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    res.status(401).json({ error: 'Webhook verification failed' });
  }
};

module.exports = {
  verifyRequest,
  verifyWebhook
};
