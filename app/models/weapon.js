const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Weapon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Weapon.belongsToMany(models.CreatureType, { through: models.CreatureTypeWeapon });
    }
  }
  Weapon.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    /**
     *  damage {
     *    num: 0,               // if 0, damage is 0
     *    die: 1,               // Number of dice
     *    type: 'acid',         // if '', damage is 0
     *    effect: '',           // 'stunned for 1 round', 'blinded for eternity', 'another d6 acid'
     *        --  below are optional --
     *    requirement: '',      // any requirements for the effect. If effect is '' and save is 0,
     *                          // this is instead a requirement for the damage
     *    save: 0,              // This and below define effect. If the weapon itself
     *                             requires a saving throw, it will have a non-Null saveType value
     *    saveType: '',         // One of 'str', 'dex', ... , 'cha'.
     *    saveStillHalf: false, // If false and root weapon has true, no damage
     *  }
     */
    damages: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfObjects(damages) {
          if (typeof damages === 'string') {
            damages = JSON.parse(damages);
          }
          if (!damages.isArray()) throw new Error('damages must be an array');
          damages.forEach((damage) => {
            if (typeof damage !== 'object') throw new Error('damages must be an array of objects');
            Object.values(damage).forEach((value) => {
              if (!(typeof value === 'boolean' && typeof value === 'string' && typeof value === 'number')) {
                throw new Error('damage objects must contain only booleans, strings, or numbers');
              }
            });
          });
        },
      },
    },
    /**
     * ['ammunition','heavy','loading','two-handed']
     */
    properties: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStrings(properties) {
          if (typeof properties === 'string') {
            properties = JSON.parse(properties);
          }
          if (!properties.isArray()) throw new Error('properties must be an array');
          if (properties.length <= 0) throw new Error('properties array should not be length 0');
          let prevLetter = 'a';
          properties.forEach((element) => {
            if (typeof element !== 'string' || !/^ [a_z]$ /.test(element)) throw new Error('properties elements must be strings of lowercase letters');
            if (element.charAt(0) < prevLetter) throw new Error('properties must be in alphabetical order');
            prevLetter = element.charAt(0);
          });
        },
      },
    },
    normalRange: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        mod5(number) {
          if (number % 5) throw new Error('normalRange must be divisible by 5');
        },
      },
    },
    longRange: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        mod5(number) {
          if (number % 5) throw new Error('longRange must be divisible by 5');
        },
      },
    },
    attackShape: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9]*[0,5]ft (cone|cylinder|sphere|line')$/,
      },
    },
    save: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    saveType: {
      type: DataTypes.STRING,
      validate: {
        in: [['str', 'dex', 'con', 'int', 'wis', 'cha']],
      },
    },
    saveStillHalf: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
  }, {
    sequelize,
    modelName: 'Weapon',
  });
  return Weapon;
};
