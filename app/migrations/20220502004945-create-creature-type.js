'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CreatureTypes', {
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
      size: {
        type: Sequelize.STRING,
        defaultValue: 'medium',
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
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      flySpeed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      swimSpeed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      climbSpeed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      burrowSpeed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      hover: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      str: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      dex: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      con: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      int: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      wis: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      cha: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      savingThrows: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      skills: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      resistances: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      senses: {
        type: Sequelize.JSON,
      },
      passivePerception: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      languages: {
        type: Sequelize.JSON,
      },
      challengeRating: {
        type: Sequelize.INTEGER,
      },
      proficiencyBonus: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
      },
      legendaryResistances: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      specialAbilities: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      spellcasting: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      spellSlots: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      innateSpells: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      actionPatterns: {
        type: Sequelize.JSON,
      },
      legendaryActions: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      reactions: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      lairActions: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      regionalEffects: {
        type: Sequelize.JSON,
        defaultValue: null,
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
    await queryInterface.dropTable('CreatureTypes');
  }
};