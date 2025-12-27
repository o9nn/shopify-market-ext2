'use strict';

module.exports = (sequelize, DataTypes) => {
  const ChannelCatalogLink = sequelize.define('ChannelCatalogLink', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'channel_id',
      references: {
        model: 'sales_channels',
        key: 'id'
      }
    },
    catalogId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'catalog_id',
      references: {
        model: 'product_catalogs',
        key: 'id'
      }
    },
    overrides: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Channel-specific catalog overrides for pricing, inventory, etc.'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Display priority for this catalog on the channel'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'channel_catalog_links',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['channel_id', 'catalog_id']
      }
    ]
  });

  ChannelCatalogLink.associate = function(models) {
    ChannelCatalogLink.belongsTo(models.SalesChannel, {
      foreignKey: 'channel_id',
      as: 'channel'
    });
    
    ChannelCatalogLink.belongsTo(models.ProductCatalog, {
      foreignKey: 'catalog_id',
      as: 'catalog'
    });
  };

  return ChannelCatalogLink;
};
