'use strict';

module.exports = (sequelize, DataTypes) => {
  const TenantChannelLink = sequelize.define('TenantChannelLink', {
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
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'channel_id',
      references: {
        model: 'sales_channels',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('owner', 'manager', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer',
      comment: 'Tenant role for this channel (similar to B2B staff roles)'
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        canManageProducts: false,
        canManageOrders: false,
        canManageSettings: false,
        canViewReports: true
      }
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Tenant-specific channel settings'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'tenant_channel_links',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['shop_id', 'channel_id']
      }
    ]
  });

  TenantChannelLink.associate = function(models) {
    TenantChannelLink.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      as: 'shop'
    });
    
    TenantChannelLink.belongsTo(models.SalesChannel, {
      foreignKey: 'channel_id',
      as: 'channel'
    });
  };

  return TenantChannelLink;
};
