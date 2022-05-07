'use strict';
const {
  Model
} = require('sequelize');
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
    damage: DataTypes.JSON,
    properties: DataTypes.JSON,
    normalRange: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    longRange: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    attackShape: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    save: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    saveType: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    saveStillHalf: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: 'Weapon',
  });
  return Weapon;
};