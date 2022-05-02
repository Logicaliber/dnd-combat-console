'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Creature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Creature.belongsTo(models.CreatureType);
    }
  }
  Creature.init({
    name: DataTypes.STRING,
    maxHP: DataTypes.INTEGER,
    currentHP: DataTypes.INTEGER,
    slotsFirst: DataTypes.INTEGER,
    slotsSecond: DataTypes.INTEGER,
    slotsThird: DataTypes.INTEGER,
    slotsFourth: DataTypes.INTEGER,
    slotsFifth: DataTypes.INTEGER,
    slotsSixth: DataTypes.INTEGER,
    slotsSeventh: DataTypes.INTEGER,
    slotsEigth: DataTypes.INTEGER,
    slotsNinth: DataTypes.INTEGER,
    currentLegendaryResistances: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Creature',
  });
  return Creature;
};