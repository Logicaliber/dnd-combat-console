'use strict';
const {
  Model
} = require('sequelize');
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
    level: DataTypes.INTEGER,
    school: DataTypes.STRING,
    castingTime: DataTypes.STRING,
    range: DataTypes.INTEGER,
    components: DataTypes.STRING,
    duration: DataTypes.STRING,
    saveType: DataTypes.STRING,
    saveHalf: DataTypes.BOOLEAN,
    description: DataTypes.TEXT,
    damage: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Spell',
  });
  return Spell;
};