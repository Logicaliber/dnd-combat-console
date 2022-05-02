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
      type: {
        type: Sequelize.JSON
      },
      tags: {
        type: Sequelize.JSON
      },
      alignment: {
        type: Sequelize.JSON
      },
      hitDie: {
        type: Sequelize.INTEGER
      },
      numDice: {
        type: Sequelize.INTEGER
      },
      maxHP: {
        type: Sequelize.INTEGER
      },
      hasShield: {
        type: Sequelize.BOOLEAN
      },
      speed: {
        type: Sequelize.INTEGER
      },
      flySpeed: {
        type: Sequelize.INTEGER
      },
      swimSpeed: {
        type: Sequelize.INTEGER
      },
      climbSpeed: {
        type: Sequelize.INTEGER
      },
      burrowSpeed: {
        type: Sequelize.INTEGER
      },
      hover: {
        type: Sequelize.BOOLEAN
      },
      proficiencyBonus: {
        type: Sequelize.INTEGER
      },
      challengeRating: {
        type: Sequelize.INTEGER
      },
      resistances: {
        type: Sequelize.JSON
      },
      passivePerception: {
        type: Sequelize.INTEGER
      },
      senses: {
        type: Sequelize.JSON
      },
      languages: {
        type: Sequelize.JSON
      },
      actionPatterns: {
        type: Sequelize.JSON
      },
      reactions: {
        type: Sequelize.JSON
      },
      str: {
        type: Sequelize.INTEGER
      },
      dex: {
        type: Sequelize.INTEGER
      },
      con: {
        type: Sequelize.INTEGER
      },
      int: {
        type: Sequelize.INTEGER
      },
      wis: {
        type: Sequelize.INTEGER
      },
      cha: {
        type: Sequelize.INTEGER
      },
      size: {
        type: Sequelize.STRING
      },
      skills: {
        type: Sequelize.JSON
      },
      saves: {
        type: Sequelize.JSON
      },
      spellcasting: {
        type: Sequelize.STRING
      },
      innateSpells: {
        type: Sequelize.JSON
      },
      spellSlots: {
        type: Sequelize.JSON
      },
      legendaryActions: {
        type: Sequelize.JSON
      },
      legendaryResistances: {
        type: Sequelize.INTEGER
      },
      lairActions: {
        type: Sequelize.JSON
      },
      regionalEffects: {
        type: Sequelize.JSON
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