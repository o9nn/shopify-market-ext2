'use strict';

module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shopDomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'shop_domain'
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'access_token'
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    shopifyPlan: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'shopify_plan'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    installedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'installed_at'
    },
    uninstalledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'uninstalled_at'
    }
  }, {
    tableName: 'shops',
    timestamps: true,
    underscored: true
  });

  Shop.associate = function(models) {
    Shop.hasMany(models.MarketplaceConnection, {
      foreignKey: 'shop_id',
      as: 'marketplaceConnections'
    });
    Shop.hasMany(models.ProductListing, {
      foreignKey: 'shop_id',
      as: 'productListings'
    });
    Shop.hasMany(models.Order, {
      foreignKey: 'shop_id',
      as: 'orders'
    });
  };

  return Shop;
};
