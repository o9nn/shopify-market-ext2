'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProductCatalog = sequelize.define('ProductCatalog', {
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
    catalogType: {
      type: DataTypes.ENUM('standard', 'seasonal', 'promotional', 'custom'),
      allowNull: false,
      defaultValue: 'standard',
      field: 'catalog_type'
    },
    filters: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Product filters like collections, tags, vendor'
    },
    pricingStrategy: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        markupType: 'percentage',
        markupValue: 0,
        roundingRule: 'none'
      },
      field: 'pricing_strategy'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'product_catalogs',
    timestamps: true,
    underscored: true
  });

  ProductCatalog.associate = function(models) {
    // M2M with SalesChannels through ChannelCatalogLink
    ProductCatalog.belongsToMany(models.SalesChannel, {
      through: models.ChannelCatalogLink,
      foreignKey: 'catalog_id',
      otherKey: 'channel_id',
      as: 'channels'
    });
    
    // Direct relationship
    ProductCatalog.hasMany(models.ChannelCatalogLink, {
      foreignKey: 'catalog_id',
      as: 'channelLinks'
    });
  };

  return ProductCatalog;
};
