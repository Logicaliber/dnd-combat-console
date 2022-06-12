const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActionPattern extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Action, CreatureType }) {
      ActionPattern.hasMany(Action, { foreignKey: 'actionPatternId', as: 'actions' });
      ActionPattern.belongsTo(CreatureType, { foreignKey: 'creatureTypeId', as: 'creatureType' });

      ActionPattern.addScope('defaultScope', {
        include: [{
          model: Action,
          as: 'actions',
          order: [['index', 'ASC']],
        }],
      });
    }

    static optionsSchema = {
      // required, searchable, updateable
      creatureTypeId: sequelize.modelOptsObject(true, true, false),
      priority: sequelize.modelOptsObject(true, true, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  ActionPattern.init({
    creatureTypeId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    priority: {
      type: DataTypes.INTEGER,
      validate: { min: 0 },
    },
  }, {
    scopes: {
      creatureTypeId(creatureTypeId) {
        return {
          attributes: { include: ['creatureTypeId'] },
          where: { creatureTypeId },
        };
      },
    },
    sequelize,
    modelName: 'ActionPattern',
  });
  return ActionPattern;
};
