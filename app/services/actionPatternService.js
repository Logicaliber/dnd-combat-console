const {
  CreatureType,
  ActionPattern,
  Action,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

// Declare scoped models
const CreatureTypeId = (id) => CreatureType.scope({ method: ['id', id] });
const ActionPatternId = (id) => ActionPattern.scope({ method: ['id', id] });
const ActionWithActionPatternId = (actionPatternId) => Action.scope({ method: ['actionPatternId', actionPatternId] });
// ActionPattern with creatureTypeId for a given creatureType ID
const ActionPatternCreatureTypeId = (creatureTypeId) => ActionPattern.scope({ method: ['creatureTypeId', creatureTypeId] });

// Error message building blocks
const CREATE_FAIL = 'ActionPattern creation failed,';
const CLONE_FAIL = 'ActionPattern clone failed,';
const UPDATE_FAIL = 'ActionPattern update failed,';
const DELETE_FAIL = 'ActionPattern deletion failed,';
const NO_CREATURE_TYPE = 'no creatureType found for the given ID';
const NO_ACTION_PATTERN = 'no actionPattern found for the given ID';

module.exports = {
  /**
   * @param {Object} actionPatternObject
   * @returns {Promise<ActionPattern>} the new actionPattern
   */
  createActionPattern: async (actionPatternObject) => {
    // Filter out disallowed params
    actionPatternObject = stripInvalidParams(actionPatternObject, ActionPattern.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(actionPatternObject, ActionPattern.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the indicated creatureType exists
    const creatureTypeId = parseInt(actionPatternObject.creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId) || !(await CreatureTypeId(creatureTypeId).count())) {
      throw new Error(`${CREATE_FAIL} ${NO_CREATURE_TYPE}`);
    }
    actionPatternObject.creatureTypeId = creatureTypeId;
    // Create the actionPattern
    return ActionPattern.create(actionPatternObject)
      .then((actionPattern) => actionPattern.reload());
  },

  /**
   * @param {Integer} id of the actionPattern to clone
   * @returns {Promise<ActionPattern>} a copy of the actionPattern,
   * with priority 1 + the max over sibling instances.
   */
  cloneActionPattern: async (id) => {
    // Check that the indicated actionPattern exists
    id = parseInt(id, 10);
    if (!id) throw new Error(`${CLONE_FAIL} ${NO_ACTION_PATTERN}`);
    const actionPattern = await ActionPattern.unscoped().findByPk(id);
    if (!actionPattern) throw new Error(`${CLONE_FAIL} ${NO_ACTION_PATTERN}`);
    // Clear the actionPattern instance ID, and set the priority
    // to be 1 + the max of priorities over sibling instances
    delete actionPattern.dataValues.id;
    actionPattern.priority = 1 + Math.max(...(
      await ActionPatternCreatureTypeId(actionPattern.creatureTypeId).findAll({
        attributes: { include: ['priority'] },
      })).map((ap) => ap.priority));
    // Return a copy of the actionPattern with its actions, weapons, and spells
    return ActionPattern.create({ ...actionPattern.dataValues })
      .then((actionPatternClone) => actionPatternClone.reload());
  },

  /**
   * @param {Integer} actionPatternId
   * @returns {Promise<ActionPattern>} the actionPattern with actions, weapons, and spells
   */
  getActionPattern: async (actionPatternId) => {
    actionPatternId = parseInt(actionPatternId, 10);
    if (Number.isNaN(actionPatternId)) return null;
    return ActionPattern.findByPk(actionPatternId);
  },

  /**
   * @param {Integer} actionPatternId
   * @param {Object} updateFields
   * @returns {Promise<ActionPattern>} the updated actionPattern, with actions, weapons, and spells
   */
  updateActionPattern: async (actionPatternId, updateFields) => {
    actionPatternId = parseInt(actionPatternId, 10);
    if (Number.isNaN(actionPatternId)) throw new Error(`${UPDATE_FAIL} ${NO_ACTION_PATTERN}`);
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, ActionPattern.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated actionPattern exists
    const actionPattern = await ActionPattern.findByPk(actionPatternId);
    if (!actionPattern) throw new Error(`${UPDATE_FAIL} ${NO_ACTION_PATTERN}`);
    // Update the actionPattern and return it with its actions, weapons, and spells
    return actionPattern.set(updateFields).save();
  },

  /**
   * Deletes the indicated actionPattern, and any actions attached to it
   * @param {Integer} actionPatternId
   * @returns {Promise<0 | 1>} 1 if the actionPattern was deleted
   */
  deleteActionPattern: async (actionPatternId) => {
    actionPatternId = parseInt(actionPatternId, 10);
    if (Number.isNaN(actionPatternId)) throw new Error(`${DELETE_FAIL} ${NO_ACTION_PATTERN}`);
    // Check that the indicated actionPattern exists
    const actionPattern = await ActionPatternId(actionPatternId).findOne();
    if (!actionPattern) throw new Error(`${DELETE_FAIL} ${NO_ACTION_PATTERN}`);
    // Delete all actions belonging to this actionPattern
    await ActionWithActionPatternId(actionPatternId).destroy();
    // Delete the actionPattern
    return actionPattern.destroy();
  },
};
