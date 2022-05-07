module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Armors', {
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
      type: {
        type: Sequelize.STRING,
      },
      baseAC: {
        type: Sequelize.INTEGER,
      },
      disadvantage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('Armors');
  },
};
