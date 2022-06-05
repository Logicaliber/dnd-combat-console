const { Op } = require('sequelize');
const {
  Weapon,
  Spell,
  Action,
  ActionPattern,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} actionObject
   * @returns {Promise<Action>} the new action, with its weapon and/or included
   */
  createAction: async (actionObject) => {
    // Filter out disallowed params
    actionObject = stripInvalidParams(actionObject, Action.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(actionObject, Action.requiredParams);
    if (missingParams.length) throw new Error(`Action creation failed, fields missing: ${missingParams.join()}`);
    // Don't allow actions to have both a weapon and a spell
    if (actionObject.weaponId && actionObject.spellId) {
      throw new Error('Action creation failed, cannot be both a weapon and spell action');
    }
    // An action with neither a weapon or a spell must have an 'other' field
    if (!actionObject.weaponId && !actionObject.spellId && !actionObject.other) {
      throw new Error('Action creation failed, action must be one of weapon, spell, or other');
    }
    // Check that the indicated weapon exists
    if (actionObject.weaponId) {
      if (!(await Weapon.findOne({ where: { id: actionObject.weaponId } }))) {
        throw new Error(`Action creation failed, no weapon found with ID: ${actionObject.weaponId}`);
      }
    // Check that the indicated spell exists
    } else if (actionObject.spellId) {
      if (!(await Spell.findOne({ where: { id: actionObject.spellId } }))) {
        throw new Error(`Action creation failed, no spell found with ID: ${actionObject.spellId}`);
      }
    }
    // Create the action, then return it with its weapon and/or spell included
    const actionId = (await Action.create(actionObject)).dataValues.id;
    return Action.findByPk(actionId, {
      include: [{
        model: Weapon,
        as: 'weapon',
      }, {
        model: Spell,
        as: 'spell',
      }],
    });
  },

  /**
   * @param {Integer} actionId
   * @returns {Promise<Action>} the action
   */
  getAction: async (actionId) => {
    return Action.findByPk(actionId);
  },

  /**
   * @param {Integer} actionId
   * @param {Object} updateFields
   * @returns {Action} the updated action
   */
  updateAction: async (actionId, updateFields) => {
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, Action.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('Action update failed, no valid update fields found');
    // Check that the indicated action exists
    if (!(await Action.findByPk(actionId))) {
      throw new Error(`Action update failed, no action found with ID: ${actionId}`);
    }
    // Update the action
    return Action.update(updateFields, { where: { id: actionId } });
  },

  /**
   * Given an array of actionIds and actionPatternId, should
   * update each action to point to the indicated actionPattern.
   * @param {Action} action
   * @param {ActionPattern} actionPattern
   * @returns {Action} the updated action
   */
  attachActionsToActionPattern: async (actionIds, actionPatternId) => {
    // Check that the indicated actionPattern exists
    if (!(await ActionPattern.findByPk(actionPatternId))) {
      throw new Error(`attachActions failed, no actionPattern found with ID: ${actionPatternId}`);
    }
    return Action.update({ actionPatternId }, {
      where: { id: { [Op.in]: actionIds } },
    });
  },

  /**
   * @param {Integer} actionId
   * @returns {Promise<1|0>} if the action was deleted
   */
  deleteAction: async (actionId) => {
    // Check that the indicated action exists
    const action = await Action.findByPk(actionId);
    if (!action) throw new Error(`Action deletion failed, no action found with ID: ${actionId}`);
    // Delete the action
    return action.destroy();
  },
};
