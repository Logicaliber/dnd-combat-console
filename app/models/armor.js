'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Armor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Armor.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: DataTypes.STRING,
    baseAC: DataTypes.INTEGER,
    stealthDisadvantage: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Armor',
  });
  return Armor;
};