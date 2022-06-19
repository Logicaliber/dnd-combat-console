const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActionPattern extends Model {
    /**
     * @param {ActionPattern} actionPattern
     * @returns {Promise<ActionPattern>} a copy of the given actionPattern, with
     * `priority` set to be the max + 1 over sibling instances.
     */
    static async cloneInstance(actionPattern) {
      delete actionPattern.id;
      actionPattern.priority = Math.max(...(await ActionPattern.findAll({
        where: { creatureTypeId: actionPattern.creatureTypeId },
        attributes: { include: ['priority'] },
      }))
        .map((ap) => ap.priority))
        + 1;
      // Return a copy of the actionPattern after reloading the original actionPattern in-place
      return ActionPattern.scope('defaultScope').create({ ...actionPattern.dataValues })
        .then(async (newActionPattern) => {
          await actionPattern.reload();
          return newActionPattern.reload();
        });
    }

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
      priority: sequelize.modelOptsObject(false, true, true),
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
      defaultValue: 0,
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
