const { Model } = require('sequelize');

const { isDamageObject } = require('../services/validationHelpers');
const {
  MIN_INFORMATION,
  MAX_INFORMATION,
  MIN_DESCRIPTION,
  MAX_DESCRIPTION,
} = require('../variables');

module.exports = (sequelize, DataTypes) => {
  class Spell extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spell.hasMany(models.Action, { foreignKey: 'spellId', as: 'actions' });
    }

    static optionsSchema = {
      // required, searchable, updateable
      name: sequelize.modelOptsObject(true, true, true),
      level: sequelize.modelOptsObject(false, true, true),
      school: sequelize.modelOptsObject(true, true, true),
      castingTime: sequelize.modelOptsObject(false, true, true),
      range: sequelize.modelOptsObject(false, true, true),
      components: sequelize.modelOptsObject(false, true, true),
      duration: sequelize.modelOptsObject(false, true, true),
      saveType: sequelize.modelOptsObject(false, true, true),
      saveStillHalf: sequelize.modelOptsObject(false, true, true),
      description: sequelize.modelOptsObject(true, true, true),
      damages: sequelize.modelOptsObject(false, false, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  Spell.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    level: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 9,
      },
    },
    school: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation']],
          msg: 'school must be one of abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, or transmutation',
        },
      },
    },
    castingTime: {
      defaultValue: '1 action',
      type: DataTypes.STRING,
      validate: {
        len: [MIN_INFORMATION, MAX_INFORMATION],
      },
    },
    range: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    components: {
      defaultValue: 'V, S',
      type: DataTypes.STRING,
      validate: {
        len: [1, MAX_INFORMATION],
      },
    },
    duration: {
      defaultValue: 'instantaneous',
      type: DataTypes.STRING,
      validate: {
        len: [MIN_INFORMATION, MAX_INFORMATION],
      },
    },
    saveType: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['str', 'dex', 'con', 'int', 'wis', 'cha', null]],
      },
    },
    saveStillHalf: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        len: [MIN_DESCRIPTION, MAX_DESCRIPTION],
      },
    },
    damages: {
      type: DataTypes.JSON,
      validate: {
        isSpellDamagesArray(array) {
          if (array === null) return;
          if (typeof array === 'string') {
            array = JSON.parse(array);
          }
          if (!Array.isArray(array)) throw new Error('spell damages array must be an array');
          if (!array.length) throw new Error('array should not be empty');
          array.forEach((subArray) => {
            if (typeof subArray !== 'object'
              || !Array.isArray(subArray)
              || !subArray.length) throw new Error('spell damages array must be an array of arrays');
            subArray.forEach((spellDamage) => {
              if (typeof spellDamage !== 'object') throw new Error('spell damages array must be an array of arrays of objects');

              const objectKeys = Object.keys(spellDamage);

              if (objectKeys.length !== 4
                || !objectKeys.includes('caster')
                || !objectKeys.includes('damage')
                || !objectKeys.includes('effect')
                || !objectKeys.includes('slot')) throw new Error('spellDamage object must have keys: caster, damage, effect, and slot');

              if (typeof spellDamage.caster !== 'number'
                || spellDamage.caster < 0
                || spellDamage.caster > 20) throw new Error('spellDamage.caster must be a number between 0 and 20');

              if (typeof spellDamage.damage !== 'object') throw new Error('spellDamage.damage must be an object');
              isDamageObject(spellDamage.damage);

              if (typeof spellDamage.effect !== 'string'
                || spellDamage.effect.length > MAX_INFORMATION) throw new Error('spellDamage.effect must be a string');
            });
          });
        },
      },
    },
  }, {
    scopes: {
      nameOnly(name) {
        return {
          attributes: { include: ['name'] },
          where: { name },
        };
      },
    },
    sequelize,
    modelName: 'Spell',
  });
  return Spell;
};
