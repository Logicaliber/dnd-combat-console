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
    damage: {
      type: DataTypes.JSON,
      validate: {
      },
    },
    properties: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStrings(properties) {
          if (typeof properties === 'string') {
            properties = JSON.parse(properties);
          }
          if (!properties.isArray()) throw new Error('properties must be an array');
          if (properties.length <= 0) throw new Error('properties array should not be length 0');
          if (properties.length === 1) return;
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
