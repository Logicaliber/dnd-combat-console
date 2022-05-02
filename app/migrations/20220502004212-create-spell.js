'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spells', {
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
      level: {
        type: Sequelize.INTEGER
      },
      school: {
        type: Sequelize.STRING
      },
      castingTime: {
        type: Sequelize.STRING
      },
      range: {
        type: Sequelize.INTEGER
      },
      components: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING
      },
      saveType: {
        type: Sequelize.STRING
      },
      saveHalf: {
        type: Sequelize.BOOLEAN
      },
      description: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Spells');
  }
};