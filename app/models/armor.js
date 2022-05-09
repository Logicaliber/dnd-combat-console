const { Model } = require('sequelize');

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
    type: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['light', 'medium', 'heavy', 'natural']],
          msg: 'armor type must be one of: light, medium, heavy, or natural',
        },
      },
    },
    baseAC: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
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
