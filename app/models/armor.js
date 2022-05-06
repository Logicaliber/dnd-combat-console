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
      Armor.hasMany(models.CreatureType);
    }
  }
  Armor.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: DataTypes.STRING,
    baseAC: DataTypes.INTEGER,
    disadvantage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Armor',
  });
  return Armor;
};