const axios = require('axios');
const crypto = require('crypto');
const MarketplaceService = require('../MarketplaceService');

/**
 * Amazon Seller Central / SP-API Integration
 * Documentation: https://developer-docs.amazon.com/sp-api/
 */
class AmazonService extends MarketplaceService {
  constructor(connection) {
    super(connection);
    this.baseUrl = 'https://sellingpartnerapi-na.amazon.com';
    this.sellerId = this.credentials.sellerId;
    this.marketplaceId = this.credentials.marketplaceId || 'ATVPDKIKX0DER'; // US marketplace
  }

  /**
   * Get access token using LWA (Login with Amazon)
   */
  async getAccessToken() {
    const response = await axios.post('https://api.amazon.com/auth/o2/token', {
      grant_type: 'refresh_token',
      refresh_token: this.credentials.refreshToken,
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret
    });
    
    return response.data.access_token;
  }

  /**
   * Make authenticated request to SP-API
   */
  async makeRequest(method, path, data = null) {
    const accessToken = await this.getAccessToken();
    
    const config = {
      method,
      url: `${this.baseUrl}${path}`,
      headers: {
        'x-amz-access-token': accessToken,
        'Content-Type': 'application/json'
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
      await this.makeRequest('GET', '/sellers/v1/marketplaceParticipations');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getListings(options = {}) {
    const { nextToken, limit = 50 } = options;
    
    let path = `/listings/2021-08-01/items/${this.sellerId}?marketplaceIds=${this.marketplaceId}&pageSize=${limit}`;
    if (nextToken) {
      path += `&pageToken=${nextToken}`;
    }
    
    const response = await this.makeRequest('GET', path);
    
    return {
      listings: response.items || [],
      pageInfo: {
        hasNextPage: !!response.nextToken,
        nextToken: response.nextToken
      }
    };
  }

  async createListing(productData) {
    const listing = this.transformProductToMarketplace(productData);
    
    const response = await this.makeRequest(
      'PUT',
      `/listings/2021-08-01/items/${this.sellerId}/${listing.sku}?marketplaceIds=${this.marketplaceId}`,
      listing
    );
    
    return response;
  }

  async updateListing(sku, updates) {
    const patches = Object.entries(updates).map(([key, value]) => ({
      op: 'replace',
      path: `/${key}`,
      value
    }));
    
    const response = await this.makeRequest(
      'PATCH',
      `/listings/2021-08-01/items/${this.sellerId}/${sku}?marketplaceIds=${this.marketplaceId}`,
      { patches }
    );
    
    return response;
  }

  async deleteListing(sku) {
    await this.makeRequest(
      'DELETE',
      `/listings/2021-08-01/items/${this.sellerId}/${sku}?marketplaceIds=${this.marketplaceId}`
    );
    return true;
  }

  async updateInventory(sku, quantity) {
    const response = await this.makeRequest(
      'PUT',
      `/fba/inventory/v1/items/${sku}`,
      {
        sellingPartnerId: this.sellerId,
        marketplaceId: this.marketplaceId,
        quantity: quantity
      }
    );
    
    return response;
  }

  async updatePrice(sku, price) {
    return this.updateListing(sku, {
      attributes: {
        purchasable_offer: [{
          marketplace_id: this.marketplaceId,
          currency: 'USD',
          our_price: [{ schedule: [{ value_with_tax: price }] }]
        }]
      }
    });
  }

  async getOrders(options = {}) {
    const { createdAfter, createdBefore, nextToken, limit = 50 } = options;
    
    let path = `/orders/v0/orders?MarketplaceIds=${this.marketplaceId}&MaxResultsPerPage=${limit}`;
    
    if (createdAfter) {
      path += `&CreatedAfter=${new Date(createdAfter).toISOString()}`;
    }
    if (createdBefore) {
      path += `&CreatedBefore=${new Date(createdBefore).toISOString()}`;
    }
    if (nextToken) {
      path += `&NextToken=${nextToken}`;
    }
    
    const response = await this.makeRequest('GET', path);
    
    return {
      orders: (response.Orders || []).map(o => this.transformOrderFromMarketplace(o)),
      pageInfo: {
        hasNextPage: !!response.NextToken,
        nextToken: response.NextToken
      }
    };
  }

  async acknowledgeOrder(orderId) {
    // Amazon orders are auto-acknowledged
    return { success: true, orderId };
  }

  async shipOrder(orderId, shipmentData) {
    const response = await this.makeRequest(
      'POST',
      `/orders/v0/orders/${orderId}/shipment`,
      {
        marketplaceId: this.marketplaceId,
        shipmentStatus: 'Shipped',
        trackingNumber: shipmentData.trackingNumber,
        carrierCode: this.mapCarrier(shipmentData.carrier)
      }
    );
    
    return response;
  }

  async cancelOrder(orderId, reason) {
    // Note: Amazon has specific cancellation requirements
    const response = await this.makeRequest(
      'POST',
      `/orders/v0/orders/${orderId}/cancel`,
      {
        cancellationReasonCode: reason
      }
    );
    
    return response;
  }

  async refundOrder(orderId, refundData) {
    // Refunds are typically handled through Amazon Seller Central
    throw new Error('Refunds must be processed through Amazon Seller Central');
  }

  transformProductToMarketplace(shopifyProduct) {
    const variant = shopifyProduct.variants?.[0] || {};
    
    return {
      sku: variant.sku || shopifyProduct.handle,
      productType: 'PRODUCT',
      requirements: 'LISTING',
      attributes: {
        item_name: [{ value: shopifyProduct.title }],
        brand: [{ value: shopifyProduct.vendor || 'Generic' }],
        bullet_point: shopifyProduct.tags?.slice(0, 5).map(tag => ({ value: tag })) || [],
        manufacturer: [{ value: shopifyProduct.vendor || 'Generic' }],
        item_type_keyword: [{ value: shopifyProduct.productType || 'general' }],
        purchasable_offer: [{
          marketplace_id: this.marketplaceId,
          currency: 'USD',
          our_price: [{ schedule: [{ value_with_tax: parseFloat(variant.price) || 0 }] }]
        }],
        fulfillment_availability: [{
          fulfillment_channel_code: 'DEFAULT',
          quantity: variant.inventoryQuantity || 0
        }]
      }
    };
  }

  transformOrderFromMarketplace(amazonOrder) {
    return {
      marketplaceOrderId: amazonOrder.AmazonOrderId,
      orderNumber: amazonOrder.AmazonOrderId,
      source: 'amazon',
      status: this.mapOrderStatus(amazonOrder.OrderStatus),
      financialStatus: amazonOrder.PaymentMethod ? 'paid' : 'pending',
      fulfillmentStatus: amazonOrder.FulfillmentChannel === 'AFN' ? 'fulfilled' : null,
      currency: amazonOrder.OrderTotal?.CurrencyCode || 'USD',
      total: parseFloat(amazonOrder.OrderTotal?.Amount || 0),
      customerEmail: amazonOrder.BuyerInfo?.BuyerEmail,
      customerName: amazonOrder.BuyerInfo?.BuyerName,
      shippingAddress: amazonOrder.ShippingAddress ? {
        address1: amazonOrder.ShippingAddress.AddressLine1,
        address2: amazonOrder.ShippingAddress.AddressLine2,
        city: amazonOrder.ShippingAddress.City,
        province: amazonOrder.ShippingAddress.StateOrRegion,
        country: amazonOrder.ShippingAddress.CountryCode,
        zip: amazonOrder.ShippingAddress.PostalCode
      } : null,
      orderedAt: amazonOrder.PurchaseDate,
      metadata: {
        fulfillmentChannel: amazonOrder.FulfillmentChannel,
        shipServiceLevel: amazonOrder.ShipServiceLevel,
        isPrime: amazonOrder.IsPrime
      }
    };
  }

  mapOrderStatus(amazonStatus) {
    const statusMap = {
      'Pending': 'pending',
      'Unshipped': 'processing',
      'PartiallyShipped': 'processing',
      'Shipped': 'shipped',
      'Canceled': 'cancelled',
      'Unfulfillable': 'cancelled'
    };
    return statusMap[amazonStatus] || 'pending';
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

module.exports = AmazonService;
