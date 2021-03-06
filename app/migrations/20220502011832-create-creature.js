module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Creatures', {
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
      creatureTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      maxHP: {
        type: Sequelize.INTEGER,
      },
      currentHP: {
        type: Sequelize.INTEGER,
      },
      slotsFirst: {
        type: Sequelize.INTEGER,
      },
      slotsSecond: {
        type: Sequelize.INTEGER,
      },
      slotsThird: {
        type: Sequelize.INTEGER,
      },
      slotsFourth: {
        type: Sequelize.INTEGER,
      },
      slotsFifth: {
        type: Sequelize.INTEGER,
      },
      slotsSixth: {
        type: Sequelize.INTEGER,
      },
      slotsSeventh: {
        type: Sequelize.INTEGER,
      },
      slotsEigth: {
        type: Sequelize.INTEGER,
      },
      slotsNinth: {
        type: Sequelize.INTEGER,
      },
      currentLegendaryResistances: {
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
    await queryInterface.dropTable('Creatures');
  },
};
