'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Subscribers', {
      zenseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
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
