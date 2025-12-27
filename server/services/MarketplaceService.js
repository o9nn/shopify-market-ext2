/**
 * Base class for marketplace integrations
 * Extend this class to implement specific marketplace APIs
 */
class MarketplaceService {
  constructor(connection) {
    this.connection = connection;
    this.credentials = connection.credentials || {};
    this.settings = connection.settings || {};
  }

  /**
   * Test the marketplace connection
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }

  /**
   * Get products/listings from the marketplace
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<{listings: Array, pageInfo: Object}>}
   */
  async getListings(options = {}) {
    throw new Error('getListings must be implemented by subclass');
  }

  /**
   * Create a new listing on the marketplace
   * @param {Object} productData - Product data to list
   * @returns {Promise<Object>} - Created listing data
   */
  async createListing(productData) {
    throw new Error('createListing must be implemented by subclass');
  }

  /**
   * Update an existing listing on the marketplace
   * @param {string} listingId - Marketplace listing ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated listing data
   */
  async updateListing(listingId, updates) {
    throw new Error('updateListing must be implemented by subclass');
  }

  /**
   * Delete a listing from the marketplace
   * @param {string} listingId - Marketplace listing ID
   * @returns {Promise<boolean>}
   */
  async deleteListing(listingId) {
    throw new Error('deleteListing must be implemented by subclass');
  }

  /**
   * Update inventory for a listing
   * @param {string} listingId - Marketplace listing ID
   * @param {number} quantity - New inventory quantity
   * @returns {Promise<Object>}
   */
  async updateInventory(listingId, quantity) {
    throw new Error('updateInventory must be implemented by subclass');
  }

  /**
   * Update price for a listing
   * @param {string} listingId - Marketplace listing ID
   * @param {number} price - New price
   * @returns {Promise<Object>}
   */
  async updatePrice(listingId, price) {
    throw new Error('updatePrice must be implemented by subclass');
  }

  /**
   * Get orders from the marketplace
   * @param {Object} options - Date range and filter options
   * @returns {Promise<{orders: Array, pageInfo: Object}>}
   */
  async getOrders(options = {}) {
    throw new Error('getOrders must be implemented by subclass');
  }

  /**
   * Acknowledge/confirm an order
   * @param {string} orderId - Marketplace order ID
   * @returns {Promise<Object>}
   */
  async acknowledgeOrder(orderId) {
    throw new Error('acknowledgeOrder must be implemented by subclass');
  }

  /**
   * Ship an order (provide tracking info)
   * @param {string} orderId - Marketplace order ID
   * @param {Object} shipmentData - Tracking number, carrier, etc.
   * @returns {Promise<Object>}
   */
  async shipOrder(orderId, shipmentData) {
    throw new Error('shipOrder must be implemented by subclass');
  }

  /**
   * Cancel an order
   * @param {string} orderId - Marketplace order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderId, reason) {
    throw new Error('cancelOrder must be implemented by subclass');
  }

  /**
   * Process a refund
   * @param {string} orderId - Marketplace order ID
   * @param {Object} refundData - Refund amount, reason, etc.
   * @returns {Promise<Object>}
   */
  async refundOrder(orderId, refundData) {
    throw new Error('refundOrder must be implemented by subclass');
  }

  /**
   * Transform Shopify product to marketplace format
   * @param {Object} shopifyProduct - Product from Shopify
   * @returns {Object} - Product in marketplace format
   */
  transformProductToMarketplace(shopifyProduct) {
    throw new Error('transformProductToMarketplace must be implemented by subclass');
  }

  /**
   * Transform marketplace order to internal format
   * @param {Object} marketplaceOrder - Order from marketplace
   * @returns {Object} - Order in internal format
   */
  transformOrderFromMarketplace(marketplaceOrder) {
    throw new Error('transformOrderFromMarketplace must be implemented by subclass');
  }
}

module.exports = MarketplaceService;
