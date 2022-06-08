const {
  Weapon,
  Spell,
  Action,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

const createFailed = 'Action creation failed,';
const updateFailed = 'Action update failed,';
const deleteFailed = 'Action deletion failed,';
const noActionPatternFound = 'no actionPattern found for the given ID';
const weaponSpellOrOther = 'action must be one of weapon, spell, or other';
const noActionFound = 'no action found for the given ID';
const noWeaponFound = 'no weapon found for the given ID';
const noSpellFound = 'no spell found for the given ID';

const defaultActionIncludes = [{
  model: Weapon,
  as: 'weapon',
}, {
  model: Spell,
  as: 'spell',
}];

module.exports = {
  /**
   * @param {Object} actionObject
   * @returns {Promise<Action>} the new action, with its weapon and/or spell included
   */
  createAction: async (actionObject) => {
    // Filter out disallowed params
    actionObject = stripInvalidParams(actionObject, Action.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(actionObject, Action.requiredParams);
    if (missingParams.length) throw new Error(`${createFailed} fields missing: ${missingParams.join()}`);
    // An action must be one of weapon, spell, or other
    if (actionObject.weaponId && actionObject.spellId) {
      throw new Error(`${createFailed} ${weaponSpellOrOther}`);
    }
    // An action with neither a weapon or a spell must have an 'other' field
    if (!actionObject.weaponId && !actionObject.spellId && !actionObject.other) {
      throw new Error(`${createFailed} ${weaponSpellOrOther}`);
    }
    // Check that the indicated weapon exists
    if (actionObject.weaponId) {
      if (!(await Weapon.findOne({ where: { id: actionObject.weaponId } }))) {
        throw new Error(`${createFailed} ${noWeaponFound}`);
      }
    // Check that the indicated spell exists
    } else if (actionObject.spellId) {
      if (!(await Spell.findOne({ where: { id: actionObject.spellId } }))) {
        throw new Error(`${createFailed} ${noSpellFound}`);
      }
    }
    // Create the action, then return it with its weapon and/or spell included
    const action = await Action.create(actionObject);
    if (!action) throw new Error(`${createFailed} (database error)`);
    return action.reload({ include: defaultActionIncludes });
  },

  /**
   * @param {Integer} actionId
   * @returns {Promise<Action>} the action
   */
  getAction: async (actionId) => {
    actionId = parseInt(actionId, 10);
    if (Number.isNaN(actionId)) return null;
    return Action.findByPk(actionId, {
      include: defaultActionIncludes,
    });
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
