module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActionPatterns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      creatureTypeId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      priority: {
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
    await queryInterface.dropTable('ActionPatterns');
  },
};
