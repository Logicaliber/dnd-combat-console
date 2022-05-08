const { Model } = require('sequelize');

const { isArrayOfDamageObjects, isArrayOfAlphabeticalStrings } = require('../services/validationHelpers');

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
    damages: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfDamageObjects,
      },
    },
    properties: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfAlphabeticalStrings,
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
        in: [['str', 'dex', 'con', 'int', 'wis', 'cha', null]],
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
