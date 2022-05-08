const { Model } = require('sequelize');

const { MAX_LEGENDARY_RESISTANCES, MAX_SPELL_SLOTS } = require('../variables');

module.exports = (sequelize, DataTypes) => {
  class Creature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Creature.belongsTo(models.CreatureType);
    }
  }
  Creature.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    creatureTypeId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    maxHP: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },
    currentHP: DataTypes.INTEGER,
    slotsFirst: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsSecond: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsThird: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsFourth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsFifth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsSixth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsSeventh: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsEigth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    slotsNinth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_SPELL_SLOTS,
      },
    },
    currentLegendaryResistances: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: MAX_LEGENDARY_RESISTANCES,
      },
    },
  }, {
    sequelize,
    modelName: 'Creature',
  });
  return Creature;
};
