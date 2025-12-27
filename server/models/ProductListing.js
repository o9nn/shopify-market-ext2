'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProductListing = sequelize.define('ProductListing', {
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
      allowNull: false,
      field: 'connection_id',
      references: {
        model: 'marketplace_connections',
        key: 'id'
      }
    },
    shopifyProductId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'shopify_product_id'
    },
    shopifyVariantId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'shopify_variant_id'
    },
    marketplaceListingId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'marketplace_listing_id'
    },
    marketplaceSku: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'marketplace_sku'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    compareAtPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'compare_at_price'
    },
    inventory: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'inactive', 'error'),
      defaultValue: 'draft'
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
    }
  }, {
    tableName: 'product_listings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['shop_id', 'shopify_product_id']
      },
      {
        fields: ['connection_id', 'marketplace_listing_id']
      }
    ]
  });

  ProductListing.associate = function(models) {
    ProductListing.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      as: 'shop'
    });
    ProductListing.belongsTo(models.MarketplaceConnection, {
      foreignKey: 'connection_id',
      as: 'connection'
    });
  };

  return ProductListing;
};
