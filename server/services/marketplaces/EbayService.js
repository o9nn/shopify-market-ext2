const axios = require('axios');
const MarketplaceService = require('../MarketplaceService');

/**
 * eBay API Integration
 * Documentation: https://developer.ebay.com/docs
 */
class EbayService extends MarketplaceService {
  constructor(connection) {
    super(connection);
    this.baseUrl = 'https://api.ebay.com';
    this.sandboxUrl = 'https://api.sandbox.ebay.com';
    this.isSandbox = this.credentials.sandbox || false;
  }

  get apiUrl() {
    return this.isSandbox ? this.sandboxUrl : this.baseUrl;
  }

  /**
   * Refresh OAuth token
   */
  async refreshAccessToken() {
    const response = await axios.post(
      `${this.apiUrl}/identity/v1/oauth2/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken,
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64')}`
        }
      }
    );
    
    return response.data.access_token;
  }

  /**
   * Make authenticated request to eBay API
   */
  async makeRequest(method, path, data = null, headers = {}) {
    const accessToken = await this.refreshAccessToken();
    
    const config = {
      method,
      url: `${this.apiUrl}${path}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  }

  async testConnection() {
    try {
      await this.makeRequest('GET', '/sell/inventory/v1/inventory_item?limit=1');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.response?.data?.errors?.[0]?.message || error.message };
    }
  }

  async getListings(options = {}) {
    const { offset = 0, limit = 50 } = options;
    
    const response = await this.makeRequest(
      'GET',
      `/sell/inventory/v1/inventory_item?limit=${limit}&offset=${offset}`
    );
    
    return {
      listings: response.inventoryItems || [],
      pageInfo: {
        hasNextPage: (offset + limit) < response.total,
        offset: offset + limit,
        total: response.total
      }
    };
  }

  async createListing(productData) {
    const inventoryItem = this.transformProductToMarketplace(productData);
    const sku = inventoryItem.sku;
    
    // Create inventory item
    await this.makeRequest(
      'PUT',
      `/sell/inventory/v1/inventory_item/${sku}`,
      inventoryItem
    );
    
    // Create offer
    const offer = {
      sku,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      listingDescription: productData.description || productData.title,
      availableQuantity: inventoryItem.availability.shipToLocationAvailability.quantity,
      pricingSummary: {
        price: {
          value: inventoryItem.product.aspects?.price || '0.00',
          currency: 'USD'
        }
      },
      listingPolicies: {
        fulfillmentPolicyId: this.credentials.fulfillmentPolicyId,
        paymentPolicyId: this.credentials.paymentPolicyId,
        returnPolicyId: this.credentials.returnPolicyId
      }
    };
    
    const offerResponse = await this.makeRequest(
      'POST',
      '/sell/inventory/v1/offer',
      offer
    );
    
    // Publish the offer
    await this.makeRequest(
      'POST',
      `/sell/inventory/v1/offer/${offerResponse.offerId}/publish`
    );
    
    return { sku, offerId: offerResponse.offerId };
  }

  async updateListing(sku, updates) {
    // Get current inventory item
    const current = await this.makeRequest(
      'GET',
      `/sell/inventory/v1/inventory_item/${sku}`
    );
    
    // Merge updates
    const updated = { ...current, ...updates };
    
    await this.makeRequest(
      'PUT',
      `/sell/inventory/v1/inventory_item/${sku}`,
      updated
    );
    
    return updated;
  }

  async deleteListing(sku) {
    // Get offers for this SKU
    const offers = await this.makeRequest(
      'GET',
      `/sell/inventory/v1/offer?sku=${sku}`
    );
    
    // Withdraw and delete each offer
    for (const offer of offers.offers || []) {
      await this.makeRequest(
        'POST',
        `/sell/inventory/v1/offer/${offer.offerId}/withdraw`
      );
      await this.makeRequest(
        'DELETE',
        `/sell/inventory/v1/offer/${offer.offerId}`
      );
    }
    
    // Delete inventory item
    await this.makeRequest(
      'DELETE',
      `/sell/inventory/v1/inventory_item/${sku}`
    );
    
    return true;
  }

  async updateInventory(sku, quantity) {
    const current = await this.makeRequest(
      'GET',
      `/sell/inventory/v1/inventory_item/${sku}`
    );
    
    current.availability = {
      shipToLocationAvailability: {
        quantity
      }
    };
    
    await this.makeRequest(
      'PUT',
      `/sell/inventory/v1/inventory_item/${sku}`,
      current
    );
    
    return { sku, quantity };
  }

  async updatePrice(sku, price) {
    // Get offers for this SKU
    const offers = await this.makeRequest(
      'GET',
      `/sell/inventory/v1/offer?sku=${sku}`
    );
    
    for (const offer of offers.offers || []) {
      offer.pricingSummary.price.value = price.toString();
      
      await this.makeRequest(
        'PUT',
        `/sell/inventory/v1/offer/${offer.offerId}`,
        offer
      );
    }
    
    return { sku, price };
  }

  async getOrders(options = {}) {
    const { createdAfter, createdBefore, offset = 0, limit = 50 } = options;
    
    let path = `/sell/fulfillment/v1/order?limit=${limit}&offset=${offset}`;
    
    if (createdAfter) {
      path += `&filter=creationdate:[${new Date(createdAfter).toISOString()}..]`;
    }
    
    const response = await this.makeRequest('GET', path);
    
    return {
      orders: (response.orders || []).map(o => this.transformOrderFromMarketplace(o)),
      pageInfo: {
        hasNextPage: (offset + limit) < response.total,
        offset: offset + limit,
        total: response.total
      }
    };
  }

  async acknowledgeOrder(orderId) {
    // eBay orders don't require explicit acknowledgment
    return { success: true, orderId };
  }

  async shipOrder(orderId, shipmentData) {
    const response = await this.makeRequest(
      'POST',
      `/sell/fulfillment/v1/order/${orderId}/shipping_fulfillment`,
      {
        lineItems: shipmentData.lineItems || [],
        shippedDate: new Date().toISOString(),
        shippingCarrierCode: this.mapCarrier(shipmentData.carrier),
        trackingNumber: shipmentData.trackingNumber
      }
    );
    
    return response;
  }

  async cancelOrder(orderId, reason) {
    const response = await this.makeRequest(
      'POST',
      `/sell/fulfillment/v1/order/${orderId}/cancel`,
      {
        cancelReason: reason
      }
    );
    
    return response;
  }

  async refundOrder(orderId, refundData) {
    const response = await this.makeRequest(
      'POST',
      `/sell/fulfillment/v1/order/${orderId}/issue_refund`,
      {
        reasonForRefund: refundData.reason,
        comment: refundData.comment,
        refundItems: refundData.items,
        orderLevelRefundAmount: refundData.amount ? {
          value: refundData.amount.toString(),
          currency: 'USD'
        } : undefined
      }
    );
    
    return response;
  }

  transformProductToMarketplace(shopifyProduct) {
    const variant = shopifyProduct.variants?.[0] || {};
    
    return {
      sku: variant.sku || shopifyProduct.handle,
      product: {
        title: shopifyProduct.title,
        description: shopifyProduct.description || shopifyProduct.title,
        aspects: {
          Brand: [shopifyProduct.vendor || 'Unbranded'],
          price: variant.price
        },
        imageUrls: shopifyProduct.images?.map(img => img.url) || []
      },
      condition: 'NEW',
      availability: {
        shipToLocationAvailability: {
          quantity: variant.inventoryQuantity || 0
        }
      }
    };
  }

  transformOrderFromMarketplace(ebayOrder) {
    const buyer = ebayOrder.buyer || {};
    const fulfillmentStartInstructions = ebayOrder.fulfillmentStartInstructions?.[0] || {};
    const shippingAddress = fulfillmentStartInstructions.shippingStep?.shipTo?.contactAddress || {};
    
    return {
      marketplaceOrderId: ebayOrder.orderId,
      orderNumber: ebayOrder.orderId,
      source: 'ebay',
      status: this.mapOrderStatus(ebayOrder.orderFulfillmentStatus),
      financialStatus: ebayOrder.orderPaymentStatus === 'PAID' ? 'paid' : 'pending',
      fulfillmentStatus: ebayOrder.orderFulfillmentStatus,
      currency: ebayOrder.pricingSummary?.total?.currency || 'USD',
      total: parseFloat(ebayOrder.pricingSummary?.total?.value || 0),
      subtotal: parseFloat(ebayOrder.pricingSummary?.priceSubtotal?.value || 0),
      totalTax: parseFloat(ebayOrder.pricingSummary?.tax?.value || 0),
      totalShipping: parseFloat(ebayOrder.pricingSummary?.deliveryCost?.value || 0),
      customerEmail: buyer.buyerRegistrationAddress?.email,
      customerName: `${buyer.buyerRegistrationAddress?.fullName || ''}`.trim(),
      shippingAddress: {
        address1: shippingAddress.addressLine1,
        address2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        province: shippingAddress.stateOrProvince,
        country: shippingAddress.countryCode,
        zip: shippingAddress.postalCode
      },
      lineItems: (ebayOrder.lineItems || []).map(item => ({
        title: item.title,
        quantity: item.quantity,
        sku: item.sku,
        price: item.lineItemCost?.value
      })),
      orderedAt: ebayOrder.creationDate,
      metadata: {
        legacyOrderId: ebayOrder.legacyOrderId,
        salesRecordReference: ebayOrder.salesRecordReference
      }
    };
  }

  mapOrderStatus(ebayStatus) {
    const statusMap = {
      'NOT_STARTED': 'pending',
      'IN_PROGRESS': 'processing',
      'FULFILLED': 'shipped'
    };
    return statusMap[ebayStatus] || 'pending';
  }

  mapCarrier(carrier) {
    const carrierMap = {
      'USPS': 'USPS',
      'UPS': 'UPS',
      'FedEx': 'FEDEX',
      'DHL': 'DHL'
    };
    return carrierMap[carrier] || 'OTHER';
  }
}

module.exports = EbayService;
