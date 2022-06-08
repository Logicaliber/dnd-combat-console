module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Actions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      actionPatternId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      index: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      weaponId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      times: {
        defaultValue: 1,
        type: Sequelize.INTEGER,
      },
      spellId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      restrictions: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      other: {
        allowNull: true,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Actions');
  },
};
