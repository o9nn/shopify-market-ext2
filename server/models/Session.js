'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    shop: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_online'
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'access_token'
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    onlineAccessInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'online_access_info'
    }
  }, {
    tableName: 'sessions',
    timestamps: true,
    underscored: true
  });

  return Session;
};
