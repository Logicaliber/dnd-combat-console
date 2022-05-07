const { Model } = require('sequelize');

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
    creatureTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxHP: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },
    currentHP: DataTypes.INTEGER,
    slotsFirst: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsSecond: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsThird: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsFourth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsFifth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsSixth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsSeventh: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsEigth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    slotsNinth: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    currentLegendaryResistances: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
  }, {
    sequelize,
    modelName: 'Creature',
  });
  return Creature;
};
