const shopify = require('../config/shopify');
const { Shop, Session } = require('../models');

/**
 * Custom session storage using Sequelize
 */
class SessionStorage {
  async storeSession(session) {
    await Session.upsert({
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope,
      accessToken: session.accessToken,
      expires: session.expires,
      onlineAccessInfo: session.onlineAccessInfo
    });
    return true;
  }

  async loadSession(id) {
    const session = await Session.findByPk(id);
    if (!session) return undefined;
    
    return {
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope,
      accessToken: session.accessToken,
      expires: session.expires ? new Date(session.expires) : undefined,
      onlineAccessInfo: session.onlineAccessInfo
    };
  }

  async deleteSession(id) {
    await Session.destroy({ where: { id } });
    return true;
  }

  async deleteSessions(ids) {
    await Session.destroy({ where: { id: ids } });
    return true;
  }

  async findSessionsByShop(shop) {
    const sessions = await Session.findAll({ where: { shop } });
    return sessions.map(s => ({
      id: s.id,
      shop: s.shop,
      state: s.state,
      isOnline: s.isOnline,
      scope: s.scope,
      accessToken: s.accessToken,
      expires: s.expires ? new Date(s.expires) : undefined,
      onlineAccessInfo: s.onlineAccessInfo
    }));
  }
}

const sessionStorage = new SessionStorage();

/**
 * Middleware to handle Shopify OAuth flow
 */
const shopifyAuth = async (req, res, next) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Missing shop parameter' });
    }

    // Generate auth URL
    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: '/api/auth/callback',
      isOnline: false
    });

    res.redirect(authRoute);
  } catch (error) {
    console.error('Auth error:', error);
    next(error);
  }
};

/**
 * Handle OAuth callback
 */
const shopifyAuthCallback = async (req, res, next) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res
    });

    const { session } = callback;
    
    // Store session
    await sessionStorage.storeSession(session);

    // Create or update shop record
    await Shop.upsert({
      shopDomain: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      isActive: true,
      installedAt: new Date()
    });

    // Redirect to app
    const host = req.query.host;
    res.redirect(`/?shop=${session.shop}&host=${host}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    next(error);
  }
};

module.exports = {
  shopifyAuth,
  shopifyAuthCallback,
  sessionStorage,
  SessionStorage
};
