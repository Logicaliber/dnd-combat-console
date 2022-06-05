module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Weapons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
      },
      damages: {
        type: Sequelize.JSON,
      },
      properties: {
        type: Sequelize.JSON,
      },
      normalRange: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      longRange: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      attackShape: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      save: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      saveType: {
        type: Sequelize.STRING,
      },
      saveStillHalf: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Weapons');
  },
};
