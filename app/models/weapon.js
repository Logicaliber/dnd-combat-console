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
    }
  }
  Weapon.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    properties: DataTypes.JSON,
    normalRange: DataTypes.INTEGER,
    longRange: DataTypes.INTEGER,
    attackShape: DataTypes.STRING,
    save: DataTypes.INTEGER,
    saveType: DataTypes.STRING,
    saveHalf: DataTypes.BOOLEAN,
    damage: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Weapon',
  });
  return Weapon;
};