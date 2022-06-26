const { Model } = require('sequelize');

const {
  isArrayOfStringsAlphabetical,
  isDamageObject,
} = require('../services/validationHelpers');

module.exports = (sequelize, DataTypes) => {
  class Weapon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Weapon.hasMany(models.Action, { foreignKey: 'weaponId', as: 'actions' });
    }

    static optionsSchema = {
      // required, searchable, updateable
      name: sequelize.modelOptsObject(true, true, true),
      damages: sequelize.modelOptsObject(false, false, true),
      properties: sequelize.modelOptsObject(false, false, true),
      normalRange: sequelize.modelOptsObject(false, true, true),
      longRange: sequelize.modelOptsObject(false, true, true),
      attackShape: sequelize.modelOptsObject(false, true, true),
      save: sequelize.modelOptsObject(false, true, true),
      saveType: sequelize.modelOptsObject(false, true, true),
      saveStillHalf: sequelize.modelOptsObject(false, true, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  Weapon.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    damages: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfDamageObjects(damages) {
          if (damages === null) return;
          if (typeof damages === 'string') {
            damages = JSON.parse(damages);
          }
          if (typeof damages !== 'object') throw new Error('damages string failed to parse to an object');
          if (!Array.isArray(damages)) throw new Error('damages must be an array');
          damages.forEach((damage) => {
            isDamageObject(damage);
          });
        },
      },
    },
    properties: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStringsAlphabetical,
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
      allowNull: true,
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
        isIn: [['str', 'dex', 'con', 'int', 'wis', 'cha', null]],
      },
    },
    saveStillHalf: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
  }, {
    scopes: {
      name(name) {
        return {
          attributes: { include: ['name'] },
          where: { name },
        };
      },
    },
    sequelize,
    modelName: 'Weapon',
  });
  return Weapon;
};
