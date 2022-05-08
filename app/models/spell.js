const { Model } = require('sequelize');

const { MAX_DESCRIPTION, MAX_INFORMATION, isDamageObject } = require('../services/validationHelpers');

module.exports = (sequelize, DataTypes) => {
  class Spell extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spell.belongsToMany(models.CreatureType, { through: models.CreatureTypeSpell });
    }
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
        in: [['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation']],
      },
    },
    castingTime: {
      defaultValue: '1 action',
      type: DataTypes.STRING,
      validate: {
        len: [8, MAX_INFORMATION],
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
        len: [1, MAX_INFORMATION],
      },
    },
    saveType: {
      type: DataTypes.STRING,
      validate: {
        in: [['str', 'dex', 'con', 'int', 'wis', 'cha', null]],
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
        len: [12, MAX_DESCRIPTION],
      },
    },
    damages: {
      type: DataTypes.JSON,
      validate: {
        isValidSpellDamagesArray(array) {
          if (array === null) return;
          if (typeof array === 'string') {
            array = JSON.parse(array);
          }
          if (!array.isArray()) throw new Error('spell damages array must be an array');
          array.forEach((subArray) => {
            if (typeof subArray !== 'object'
              || !subArray.isArray()
              || !subArray.length) throw new Error('spell damages array must be an array of arrays');
            subArray.forEach((spellDamage) => {
              if (typeof spellDamage !== 'object') throw new Error('spell damages array must be an array of arrays of objects');
              const objectKeys = Object.keys(spellDamage);
              if (objectKeys.length !== 4
                || !objectKeys.includes('caster')
                || typeof spellDamage.caster !== 'number'
                || spellDamage.caster < 0
                || spellDamage.caster > 20
                || !objectKeys.includes('damage')
                || typeof spellDamage.damage !== 'object'
                || !objectKeys.includes('effect')
                || typeof spellDamage.effect !== 'string'
                || spellDamage.effect.length < 0
                || spellDamage.effect.length > MAX_INFORMATION
                || !objectKeys.includes('slot')
              ) throw new Error(`spellDamage object ${JSON.stringify(spellDamage)} failed validation`);
              isDamageObject(spellDamage.damage);
            });
          });
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Spell',
  });
  return Spell;
};
