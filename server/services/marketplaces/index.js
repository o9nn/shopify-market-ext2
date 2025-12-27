const AmazonService = require('./AmazonService');
const EbayService = require('./EbayService');

/**
 * Factory function to get the appropriate marketplace service
 * @param {Object} connection - MarketplaceConnection model instance
 * @returns {MarketplaceService} - Marketplace service instance
 */
function getMarketplaceService(connection) {
  switch (connection.marketplace) {
    case 'amazon':
      return new AmazonService(connection);
    case 'ebay':
      return new EbayService(connection);
    case 'walmart':
      // TODO: Implement WalmartService
      throw new Error('Walmart integration not yet implemented');
    case 'target':
      // TODO: Implement TargetService
      throw new Error('Target Plus integration not yet implemented');
    case 'etsy':
      // TODO: Implement EtsyService
      throw new Error('Etsy integration not yet implemented');
    default:
      throw new Error(`Unknown marketplace: ${connection.marketplace}`);
  }
}

module.exports = {
  getMarketplaceService,
  AmazonService,
  EbayService
};
