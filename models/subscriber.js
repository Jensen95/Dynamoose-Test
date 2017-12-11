'use strict'

module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define('Subscriber', {
    zenseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    zenseMac: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    terminationDate: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  return Subscriber
}
