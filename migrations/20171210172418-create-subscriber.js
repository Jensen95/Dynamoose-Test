'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Subscribers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      zenseId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      zenseMac: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deviceToken: {
        type: Sequelize.STRING,
        allowNull: false
      },
      terminationDate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('Subscribers')
}
