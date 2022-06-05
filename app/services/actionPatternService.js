const {
  Weapon,
  Spell,
  Action,
  CreatureType,
  ActionPattern,
} = require('../models');
const actionService = require('./actionService');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

const actionPatternDefaultIncludes = [{
  model: Action,
  as: 'actions',
  order: [['index', 'ASC']],
  include: [{
    model: Weapon,
    as: 'weapon',
  }, {
    model: Spell,
    as: 'spell',
  }],
}];

module.exports = {
  /**
   * @param {Object} actionPatternObject
   * @returns {Promise<ActionPattern>} the new actionPattern, with its creatureType included
   */
  createActionPattern: async (actionPatternObject, actionIds = null) => {
    // Filter out disallowed params
    actionPatternObject = stripInvalidParams(actionPatternObject, ActionPattern.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(actionPatternObject, ActionPattern.requiredParams);
    if (missingParams.length) throw new Error(`ActionPattern creation failed, fields missing: ${missingParams.join()}`);
    // Check that the indicated creatureType exists
    if (actionPatternObject.creatureTypeId) {
      if (!(await CreatureType.findOne({ where: { id: actionPatternObject.creatureTypeId } }))) {
        throw new Error(`ActionPattern creation failed, no creatureType found with ID: ${actionPatternObject.creatureTypeId}`);
      }
    }
    // Create the actionPattern
    const actionPatternId = (await ActionPattern.create(actionPatternObject)).dataValues.id;
    // Attach the indicated actions to it
    if (actionIds) await actionService.attachActionsToActionPattern(actionIds, actionPatternId);
    // Return the actionPattern with its actions attached
    return ActionPattern.findByPk(actionPatternId, {
      include: actionPatternDefaultIncludes,
    });
  },

  /**
   * @param {Integer} actionPatternId
   * @returns {Promise<ActionPattern>} the actionPattern
   */
  getActionPattern: async (actionPatternId) => {
    return ActionPattern.findByPk(actionPatternId, {
      include: actionPatternDefaultIncludes,
    });
  },

  /**
   * @param {Integer} actionPatternId
   * @param {Object} updateFields
   * @returns {ActionPattern} the updated actionPattern
   */
  updateActionPattern: async (actionPatternId, updateFields) => {
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, ActionPattern.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('ActionPattern update failed, no valid update fields found');
    // Check that the indicated actionPattern exists
    if (!(await ActionPattern.findByPk(actionPatternId))) {
      throw new Error(`ActionPattern update failed, no actionPattern found with ID: ${actionPatternId}`);
    }
    // Update the actionPattern
    return ActionPattern.update(updateFields, { where: { id: actionPatternId } });
  },

  /**
   * @param {Integer} actionPatternId
   * @returns {Promise<1|0>} if the actionPattern was deleted
   */
  deleteActionPattern: async (actionPatternId) => {
    // Check that the indicated actionPattern exists
    const actionPattern = await ActionPattern.findByPk(actionPatternId);
    if (!actionPattern) throw new Error(`ActionPattern deletion failed, no actionPattern found with ID: ${actionPatternId}`);
    // Update the associated actions to have actionPatternId: null
    await Action.update({ actionPatternId: null }, { where: { actionPatternId } });
    // Delete the actionPattern
    return actionPattern.destroy();
  },
};
