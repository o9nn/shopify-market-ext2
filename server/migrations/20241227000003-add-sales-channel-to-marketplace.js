'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add sales_channel_id to marketplace_connections
    await queryInterface.addColumn('marketplace_connections', 'sales_channel_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'sales_channels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better query performance
    await queryInterface.addIndex('marketplace_connections', ['sales_channel_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('marketplace_connections', ['sales_channel_id']);
    
    // Remove column
    await queryInterface.removeColumn('marketplace_connections', 'sales_channel_id');
  }
};
