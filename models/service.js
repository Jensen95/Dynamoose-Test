'use strict'

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    build: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    changelog: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    downloads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  })

  return Service
}
