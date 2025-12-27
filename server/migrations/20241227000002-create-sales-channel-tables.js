'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create sales_channels table
    await queryInterface.createTable('sales_channels', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      channel_type: {
        type: Sequelize.ENUM('marketplace', 'retail', 'wholesale', 'b2b', 'custom'),
        allowNull: false,
        defaultValue: 'custom'
      },
      configuration: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create product_catalogs table
    await queryInterface.createTable('product_catalogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      catalog_type: {
        type: Sequelize.ENUM('standard', 'seasonal', 'promotional', 'custom'),
        allowNull: false,
        defaultValue: 'standard'
      },
      filters: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      pricing_strategy: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create channel_catalog_links table (M2M between channels and catalogs)
    await queryInterface.createTable('channel_catalog_links', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      channel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sales_channels',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      catalog_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'product_catalogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      overrides: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create tenant_channel_links table (M2M between shops/tenants and channels)
    await queryInterface.createTable('tenant_channel_links', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      shop_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      channel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sales_channels',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('owner', 'manager', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer'
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('channel_catalog_links', ['channel_id', 'catalog_id'], {
      unique: true,
      name: 'channel_catalog_unique_idx'
    });

    await queryInterface.addIndex('tenant_channel_links', ['shop_id', 'channel_id'], {
      unique: true,
      name: 'tenant_channel_unique_idx'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('sales_channels', ['is_active']);
    await queryInterface.addIndex('product_catalogs', ['is_active']);
    await queryInterface.addIndex('channel_catalog_links', ['channel_id']);
    await queryInterface.addIndex('channel_catalog_links', ['catalog_id']);
    await queryInterface.addIndex('tenant_channel_links', ['shop_id']);
    await queryInterface.addIndex('tenant_channel_links', ['channel_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order due to foreign key constraints
    await queryInterface.dropTable('tenant_channel_links');
    await queryInterface.dropTable('channel_catalog_links');
    await queryInterface.dropTable('product_catalogs');
    await queryInterface.dropTable('sales_channels');
  }
};
