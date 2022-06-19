const { Model } = require('sequelize');
const { incrementNumSuffix } = require('../services/validationHelpers');
const { MAX_LEGENDARY_RESISTANCES, MAX_SPELL_SLOTS } = require('../variables');

module.exports = (sequelize, DataTypes) => {
  class Creature extends Model {
    /**
     * @param {Creature} creature
     * @returns {Promise<Creature>} a copy of the given creature, with
     * `name` set to be the max + 1 over sibling instances.
     */
    static async cloneInstance(creature) {
      delete creature.id;

      creature.name = incrementNumSuffix(creature.name);

      // Return a copy of the creature after reloading the original creature in-place
      return Creature.scope('defaultScope').create({ ...creature.dataValues })
        .then(async (newCreature) => {
          await creature.reload();
          return newCreature.reload();
        });
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ CreatureType }) {
      // define association here
      Creature.belongsTo(CreatureType, { foreignKey: 'creatureTypeId', as: 'creatureType' });

      Creature.addScope('defaultScope', {
        include: [{
          model: CreatureType,
          as: 'creatureType',
        }],
      });
    }

    static optionsSchema = {
      // required, searchable, updateable
      name: sequelize.modelOptsObject(true, true, true),
      creatureTypeId: sequelize.modelOptsObject(true, true, false),
      maxHP: sequelize.modelOptsObject(true, true, true),
      currentHP: sequelize.modelOptsObject(false, true, true),
      slotsFirst: sequelize.modelOptsObject(false, false, true),
      slotsSecond: sequelize.modelOptsObject(false, false, true),
      slotsThird: sequelize.modelOptsObject(false, false, true),
      slotsFourth: sequelize.modelOptsObject(false, false, true),
      slotsFifth: sequelize.modelOptsObject(false, false, true),
      slotsSixth: sequelize.modelOptsObject(false, false, true),
      slotsSeventh: sequelize.modelOptsObject(false, false, true),
      slotsEigth: sequelize.modelOptsObject(false, false, true),
      slotsNinth: sequelize.modelOptsObject(false, false, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
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
    scopes: {
      name(name) {
        return {
          attributes: { include: ['name'] },
          where: { name },
        };
      },
      creatureTypeId(creatureTypeId) {
        return {
          attributes: { include: ['creatureTypeId'] },
          where: { creatureTypeId },
        };
      },
    },
    sequelize,
    modelName: 'Creature',
  });
  return Creature;
};
