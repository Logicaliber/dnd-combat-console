module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spells', {
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
      level: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      school: {
        type: Sequelize.STRING,
      },
      castingTime: {
        defaultValue: '1 action',
        type: Sequelize.STRING,
      },
      range: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      components: {
        defaultValue: 'V, S',
        type: Sequelize.STRING,
      },
      duration: {
        defaultValue: 'instantaneous',
        type: Sequelize.STRING,
      },
      saveType: {
        type: Sequelize.STRING,
      },
      saveStillHalf: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      damages: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('Spells');
  },
};
