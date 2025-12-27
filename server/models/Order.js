'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shopId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'shop_id',
      references: {
        model: 'shops',
        key: 'id'
      }
    },
    connectionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'connection_id',
      references: {
        model: 'marketplace_connections',
        key: 'id'
      }
    },
    shopifyOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'shopify_order_id'
    },
    marketplaceOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'marketplace_order_id'
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'order_number'
    },
    source: {
      type: DataTypes.ENUM('shopify', 'amazon', 'ebay', 'walmart', 'target', 'etsy', 'other'),
      defaultValue: 'shopify'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      defaultValue: 'pending'
    },
    financialStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'financial_status'
    },
    fulfillmentStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'fulfillment_status'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    totalTax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_tax'
    },
    totalShipping: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_shipping'
    },
    totalDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_discount'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'customer_email'
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'customer_name'
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'shipping_address'
    },
    billingAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'billing_address'
    },
    lineItems: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'line_items'
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tracking_number'
    },
    trackingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tracking_url'
    },
    carrier: {
      type: DataTypes.STRING,
      allowNull: true
    },
    syncStatus: {
      type: DataTypes.ENUM('synced', 'pending', 'error', 'not_synced'),
      defaultValue: 'not_synced',
      field: 'sync_status'
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_sync_at'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    orderedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ordered_at'
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['shop_id', 'shopify_order_id']
      },
      {
        fields: ['connection_id', 'marketplace_order_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  Order.associate = function(models) {
    Order.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      as: 'shop'
    });
    Order.belongsTo(models.MarketplaceConnection, {
      foreignKey: 'connection_id',
      as: 'connection'
    });
  };

  return Order;
};
