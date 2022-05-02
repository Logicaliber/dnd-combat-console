'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Weapons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
      },
      properties: {
        type: Sequelize.JSON
      },
      normalRange: {
        type: Sequelize.INTEGER
      },
      longRange: {
        type: Sequelize.INTEGER
      },
      attackShape: {
        type: Sequelize.STRING
      },
      save: {
        type: Sequelize.INTEGER
      },
      saveType: {
        type: Sequelize.STRING
      },
      saveHalf: {
        type: Sequelize.BOOLEAN
      },
      damage: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Weapons');
  }
};