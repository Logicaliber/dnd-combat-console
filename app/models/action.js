const {
  Op,
  Model,
} = require('sequelize');

const {
  MIN_DESCRIPTION,
  MAX_DESCRIPTION,
} = require('../variables');

module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    /**
     * @param {Action} action
     * @returns {Promise<Action>} a copy of the given action, with
     * `index` set to be the max + 1 over sibling instances.
     */
    static async cloneInstance(action) {
      delete action.id;
      action.index = Math.max(...(await Action.findAll({
        where: { actionPatternId: action.actionPatternId },
        attributes: { include: ['index'] },
      }))
        .map((ap) => ap.index))
        + 1;
      // Return a copy of the action after reloading the original action in-place
      return Action.scope('defaultScope').create({ ...action.dataValues })
        .then(async (newAction) => {
          await action.reload();
          return newAction.reload();
        });
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Weapon, Spell, ActionPattern }) {
      Action.belongsTo(Weapon, { foreignKey: 'weaponId', as: 'weapon' });
      Action.belongsTo(Spell, { foreignKey: 'spellId', as: 'spell' });
      Action.belongsTo(ActionPattern, { foreignKey: 'actionPatternId', as: 'actionPattern' });

      Action.addScope('defaultScope', {
        include: [{
          model: Weapon,
          as: 'weapon',
        }, {
          model: Spell,
          as: 'spell',
        }],
      });
    }

    static optionsSchema = {
      // required, searchable, updateable
      actionPatternId: sequelize.modelOptsObject(true, true, false),
      index: sequelize.modelOptsObject(false, true, true),
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
    scopes: {
      actionPatternId(actionPatternId) {
        return {
          attributes: { include: ['actionPatternId'] },
          where: { actionPatternId },
        };
      },
      actionPatternIds(actionPatternIds) {
        return {
          attributes: { include: ['actionPatternId'] },
          where: { actionPatternId: { [Op.in]: actionPatternIds } },
        };
      },
    },
    sequelize,
    modelName: 'Action',
  });
  return Action;
};
