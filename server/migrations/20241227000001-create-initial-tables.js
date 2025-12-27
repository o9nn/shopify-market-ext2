'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create shops table
    await queryInterface.createTable('shops', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      shop_domain: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      access_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      scope: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      shopify_plan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      installed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      uninstalled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create sessions table
    await queryInterface.createTable('sessions', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      shop: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      scope: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      access_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      online_access_info: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create marketplace_connections table
    await queryInterface.createTable('marketplace_connections', {
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
      marketplace: {
        type: Sequelize.ENUM('amazon', 'ebay', 'walmart', 'target', 'etsy', 'other'),
        allowNull: false
      },
      marketplace_account_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      credentials: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'error'),
        defaultValue: 'pending'
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create product_listings table
    await queryInterface.createTable('product_listings', {
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
      connection_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'marketplace_connections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      shopify_product_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shopify_variant_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      marketplace_listing_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      marketplace_sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      compare_at_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      inventory: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'active', 'inactive', 'error'),
        defaultValue: 'draft'
      },
      sync_status: {
        type: Sequelize.ENUM('synced', 'pending', 'error', 'not_synced'),
        defaultValue: 'not_synced'
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create orders table
    await queryInterface.createTable('orders', {
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
      connection_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'marketplace_connections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      shopify_order_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      marketplace_order_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source: {
        type: Sequelize.ENUM('shopify', 'amazon', 'ebay', 'walmart', 'target', 'etsy', 'other'),
        defaultValue: 'shopify'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending'
      },
      financial_status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fulfillment_status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      total_tax: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      total_shipping: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      total_discount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      customer_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shipping_address: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      billing_address: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      line_items: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      tracking_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tracking_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sync_status: {
        type: Sequelize.ENUM('synced', 'pending', 'error', 'not_synced'),
        defaultValue: 'not_synced'
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      ordered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('product_listings', ['shop_id', 'shopify_product_id']);
    await queryInterface.addIndex('product_listings', ['connection_id', 'marketplace_listing_id']);
    await queryInterface.addIndex('orders', ['shop_id', 'shopify_order_id']);
    await queryInterface.addIndex('orders', ['connection_id', 'marketplace_order_id']);
    await queryInterface.addIndex('orders', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('product_listings');
    await queryInterface.dropTable('marketplace_connections');
    await queryInterface.dropTable('sessions');
    await queryInterface.dropTable('shops');
  }
};
