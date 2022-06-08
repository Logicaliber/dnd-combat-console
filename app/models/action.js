const {
  Model,
} = require('sequelize');

const {
  MIN_DESCRIPTION,
  MAX_DESCRIPTION,
} = require('../variables');

module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Action.belongsTo(models.Weapon, { foreignKey: 'weaponId', as: 'weapon' });
      Action.belongsTo(models.Spell, { foreignKey: 'spellId', as: 'spell' });
      Action.belongsTo(models.ActionPattern, { foreignKey: 'actionPatternId', as: 'actionPattern' });
    }

    static optionsSchema = {
      // required, searchable, updateable
      actionPatternId: sequelize.modelOptsObject(true, true, false),
      index: sequelize.modelOptsObject(true, true, true),
      weaponId: sequelize.modelOptsObject(false, true, true),
      times: sequelize.modelOptsObject(false, true, true),
      spellId: sequelize.modelOptsObject(false, true, true),
      restrictions: sequelize.modelOptsObject(false, true, true),
      other: sequelize.modelOptsObject(false, true, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  Action.init({
    actionPatternId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    index: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: { min: 0 },
    },
    weaponId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    times: {
      defaultValue: 1,
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 9 },
    },
    spellId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    restrictions: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: { len: [MIN_DESCRIPTION, MAX_DESCRIPTION] },
    },
    other: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: { len: [MIN_DESCRIPTION, MAX_DESCRIPTION] },
    },
  }, {
    sequelize,
    modelName: 'Action',
  });
  return Action;
};
