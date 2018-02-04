'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      service: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false
      },
      build: {
        type: Sequelize.STRING,
        allowNull: false
      },
      changelog: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      downloads: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0
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

  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('Services')
}
