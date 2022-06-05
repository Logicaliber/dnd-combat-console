module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CreatureTypes', {
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
      size: {
        defaultValue: 'medium',
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.JSON,
      },
      tags: {
        type: Sequelize.JSON,
      },
      alignment: {
        type: Sequelize.JSON,
      },
      armorId: {
        type: Sequelize.INTEGER,
      },
      hasShield: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      hitDie: {
        type: Sequelize.INTEGER,
      },
      numDice: {
        type: Sequelize.INTEGER,
      },
      maxHP: {
        type: Sequelize.INTEGER,
      },
      speed: {
        defaultValue: 30,
        type: Sequelize.INTEGER,
      },
      flySpeed: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      swimSpeed: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      climbSpeed: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      burrowSpeed: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      hover: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      str: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      dex: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      con: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      int: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      wis: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      cha: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      savingThrows: {
        type: Sequelize.JSON,
      },
      skills: {
        type: Sequelize.JSON,
      },
      resistances: {
        type: Sequelize.JSON,
      },
      senses: {
        type: Sequelize.JSON,
      },
      passivePerception: {
        defaultValue: 10,
        type: Sequelize.INTEGER,
      },
      languages: {
        type: Sequelize.JSON,
      },
      challengeRating: {
        type: Sequelize.INTEGER,
      },
      proficiencyBonus: {
        defaultValue: 2,
        type: Sequelize.INTEGER,
      },
      legendaryResistances: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      specialAbilities: {
        type: Sequelize.JSON,
      },
      spellcasting: {
        type: Sequelize.STRING,
      },
      spellSlots: {
        type: Sequelize.JSON,
      },
      innateSpells: {
        type: Sequelize.JSON,
      },
      legendaryActions: {
        type: Sequelize.JSON,
      },
      reactions: {
        type: Sequelize.JSON,
      },
      lairActions: {
        type: Sequelize.JSON,
      },
      regionalEffects: {
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CreatureTypes');
  },
};
