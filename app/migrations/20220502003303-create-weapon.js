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
      damage: {
        type: Sequelize.JSON
      },
      properties: {
        type: Sequelize.JSON
      },
      normalRange: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      longRange: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      attackShape: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      save: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      saveType: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      saveStillHalf: {
        type: Sequelize.BOOLEAN,
        defaultValue: null,
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