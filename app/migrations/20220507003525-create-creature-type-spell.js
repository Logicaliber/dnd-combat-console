module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CreatureTypeSpells', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      creatureTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      spellId: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('CreatureTypeSpells');
  },
};
