module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CreatureTypeWeapons', {
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
      weaponId: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CreatureTypeWeapons');
  },
};
