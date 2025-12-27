const shopify = require('../config/shopify');

/**
 * Service class for interacting with Shopify APIs
 */
class ShopifyService {
  constructor(session) {
    this.session = session;
    this.client = new shopify.clients.Graphql({ session });
    this.restClient = new shopify.clients.Rest({ session });
  }

  /**
   * Get products from Shopify using GraphQL
   */
  async getProducts({ limit = 50, cursor = null }) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              status
              vendor
              productType
              tags
              createdAt
              updatedAt
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    barcode
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.client.query({
      data: {
        query,
        variables: { first: parseInt(limit), after: cursor }
      }
    });

    const { products } = response.body.data;
    
    return {
      products: products.edges.map(edge => this.formatProduct(edge.node)),
      pageInfo: products.pageInfo
    };
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id) {
    // Ensure ID is in GID format
    const gid = id.includes('gid://') ? id : `gid://shopify/Product/${id}`;
    
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          descriptionHtml
          status
          vendor
          productType
          tags
          createdAt
          updatedAt
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                barcode
                weight
                weightUnit
              }
            }
          }
        }
      }
    `;

    const response = await this.client.query({
      data: {
        query,
        variables: { id: gid }
      }
    });

    return this.formatProduct(response.body.data.product);
  }

  /**
   * Get orders from Shopify using GraphQL
   */
  async getOrders({ limit = 50, cursor = null, status = null }) {
    let queryFilter = '';
    if (status) {
      queryFilter = `query: "fulfillment_status:${status}"`;
    }

    const query = `
      query getOrders($first: Int!, $after: String) {
        orders(first: $first, after: $after, ${queryFilter}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              email
              createdAt
              updatedAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                }
              }
              totalShippingPriceSet {
                shopMoney {
                  amount
                }
              }
              customer {
                firstName
                lastName
                email
              }
              shippingAddress {
                address1
                address2
                city
                province
                country
                zip
              }
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      id
                      sku
                      price
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.client.query({
      data: {
        query,
        variables: { first: parseInt(limit), after: cursor }
      }
    });

    const { orders } = response.body.data;
    
    return {
      orders: orders.edges.map(edge => this.formatOrder(edge.node)),
      pageInfo: orders.pageInfo
    };
  }

  /**
   * Create a fulfillment for an order
   */
  async createFulfillment(orderId, { trackingNumber, trackingUrl, carrier }) {
    // Get fulfillment order ID first
    const gid = orderId.includes('gid://') ? orderId : `gid://shopify/Order/${orderId}`;
    
    const fulfillmentOrderQuery = `
      query getFulfillmentOrders($orderId: ID!) {
        order(id: $orderId) {
          fulfillmentOrders(first: 10) {
            edges {
              node {
                id
                status
              }
            }
          }
        }
      }
    `;

    const foResponse = await this.client.query({
      data: {
        query: fulfillmentOrderQuery,
        variables: { orderId: gid }
      }
    });

    const fulfillmentOrders = foResponse.body.data.order.fulfillmentOrders.edges;
    const openFO = fulfillmentOrders.find(fo => fo.node.status === 'OPEN');
    
    if (!openFO) {
      throw new Error('No open fulfillment order found');
    }

    const mutation = `
      mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.query({
      data: {
        query: mutation,
        variables: {
          fulfillment: {
            lineItemsByFulfillmentOrder: [{
              fulfillmentOrderId: openFO.node.id
            }],
            trackingInfo: {
              number: trackingNumber,
              url: trackingUrl,
              company: carrier
            }
          }
        }
      }
    });

    if (response.body.data.fulfillmentCreateV2.userErrors.length > 0) {
      throw new Error(response.body.data.fulfillmentCreateV2.userErrors[0].message);
    }

    return response.body.data.fulfillmentCreateV2.fulfillment;
  }

  /**
   * Get inventory levels for a product
   */
  async getInventoryLevels(inventoryItemId) {
    const response = await this.restClient.get({
      path: `inventory_levels`,
      query: { inventory_item_ids: inventoryItemId }
    });

    return response.body.inventory_levels;
  }

  /**
   * Update inventory level
   */
  async updateInventoryLevel(inventoryItemId, locationId, available) {
    const response = await this.restClient.post({
      path: 'inventory_levels/set',
      data: {
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available: available
      }
    });

    return response.body.inventory_level;
  }

  /**
   * Register webhooks for the shop
   */
  async registerWebhooks(webhooks) {
    const results = [];
    
    for (const webhook of webhooks) {
      try {
        const response = await this.restClient.post({
          path: 'webhooks',
          data: {
            webhook: {
              topic: webhook.topic,
              address: webhook.address,
              format: 'json'
            }
          }
        });
        results.push({ topic: webhook.topic, success: true, id: response.body.webhook.id });
      } catch (error) {
        results.push({ topic: webhook.topic, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Format product data from GraphQL response
   */
  formatProduct(product) {
    if (!product) return null;
    
    const numericId = product.id.replace('gid://shopify/Product/', '');
    
    return {
      id: numericId,
      gid: product.id,
      title: product.title,
      handle: product.handle,
      description: product.descriptionHtml,
      status: product.status,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images?.edges?.map(e => ({
        url: e.node.url,
        altText: e.node.altText
      })) || [],
      variants: product.variants?.edges?.map(e => ({
        id: e.node.id.replace('gid://shopify/ProductVariant/', ''),
        gid: e.node.id,
        title: e.node.title,
        sku: e.node.sku,
        price: e.node.price,
        compareAtPrice: e.node.compareAtPrice,
        inventoryQuantity: e.node.inventoryQuantity,
        barcode: e.node.barcode,
        weight: e.node.weight,
        weightUnit: e.node.weightUnit
      })) || []
    };
  }

  /**
   * Format order data from GraphQL response
   */
  formatOrder(order) {
    if (!order) return null;
    
    const numericId = order.id.replace('gid://shopify/Order/', '');
    
    return {
      id: numericId,
      gid: order.id,
      name: order.name,
      email: order.email,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      financialStatus: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
      total: order.totalPriceSet?.shopMoney?.amount,
      subtotal: order.subtotalPriceSet?.shopMoney?.amount,
      totalTax: order.totalTaxSet?.shopMoney?.amount,
      totalShipping: order.totalShippingPriceSet?.shopMoney?.amount,
      currency: order.totalPriceSet?.shopMoney?.currencyCode,
      customer: order.customer ? {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email
      } : null,
      shippingAddress: order.shippingAddress,
      lineItems: order.lineItems?.edges?.map(e => ({
        title: e.node.title,
        quantity: e.node.quantity,
        variantId: e.node.variant?.id,
        sku: e.node.variant?.sku,
        price: e.node.variant?.price
      })) || []
    };
  }
}

module.exports = ShopifyService;
