'use strict';

module.exports = (sequelize, DataTypes) => {
  const SalesChannel = sequelize.define('SalesChannel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    channelType: {
      type: DataTypes.ENUM('marketplace', 'retail', 'wholesale', 'b2b', 'custom'),
      allowNull: false,
      defaultValue: 'custom',
      field: 'channel_type'
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        pricingRules: {},
        inventorySettings: {},
        fulfillmentSettings: {}
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Higher priority channels are synced first'
    }
  }, {
    tableName: 'sales_channels',
    timestamps: true,
    underscored: true
  });

  SalesChannel.associate = function(models) {
    // M2M with ProductCatalogs through ChannelCatalogLink
    SalesChannel.belongsToMany(models.ProductCatalog, {
      through: models.ChannelCatalogLink,
      foreignKey: 'channel_id',
      otherKey: 'catalog_id',
      as: 'catalogs'
    });
    
    // M2M with Shops (tenants) through TenantChannelLink
    SalesChannel.belongsToMany(models.Shop, {
      through: models.TenantChannelLink,
      foreignKey: 'channel_id',
      otherKey: 'shop_id',
      as: 'tenants'
    });
    
    // Direct relationships
    SalesChannel.hasMany(models.ChannelCatalogLink, {
      foreignKey: 'channel_id',
      as: 'catalogLinks'
    });
    
    SalesChannel.hasMany(models.TenantChannelLink, {
      foreignKey: 'channel_id',
      as: 'tenantLinks'
    });
  };

  return SalesChannel;
};
