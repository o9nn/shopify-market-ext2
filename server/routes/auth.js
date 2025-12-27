const express = require('express');
const router = express.Router();
const { shopifyAuth, shopifyAuthCallback } = require('../middleware/shopifyAuth');

/**
 * @route GET /api/auth
 * @desc Initiate Shopify OAuth flow
 */
router.get('/', shopifyAuth);

/**
 * @route GET /api/auth/callback
 * @desc Handle Shopify OAuth callback
 */
router.get('/callback', shopifyAuthCallback);

/**
 * @route GET /api/auth/verify
 * @desc Verify current session
 */
router.get('/verify', async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ verified: false, error: 'Missing shop parameter' });
    }

    const { sessionStorage } = require('../middleware/shopifyAuth');
    const shopify = require('../config/shopify');
    
    const sessionId = shopify.session.getOfflineId(shop);
    const session = await sessionStorage.loadSession(sessionId);
    
    if (session && session.accessToken) {
      return res.json({ verified: true, shop });
    }
    
    res.json({ verified: false, redirect: `/api/auth?shop=${shop}` });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ verified: false, error: error.message });
  }
});

module.exports = router;
