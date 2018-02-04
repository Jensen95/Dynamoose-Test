'use strict'

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    service: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    build: {
      type: DataTypes.STRING,
      allowNull: false
    },
    changelog: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    downloads: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })

  return Service
}
