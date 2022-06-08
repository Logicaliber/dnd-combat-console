const {
  Weapon,
  Spell,
  Action,
  CreatureType,
  ActionPattern,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

const creationFailed = 'ActionPattern creation failed,';
const updateFailed = 'ActionPattern update failed,';
const deleteFailed = 'ActionPattern deletion failed,';
const noCreatureTypeFound = 'no creatureType found for the given ID';
const noActionPatternFound = 'no actionPattern found for the given ID';

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
   * @returns {Promise<ActionPattern>} the new actionPattern
   */
  createActionPattern: async (actionPatternObject) => {
    // Filter out disallowed params
    actionPatternObject = stripInvalidParams(actionPatternObject, ActionPattern.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(actionPatternObject, ActionPattern.requiredParams);
    if (missingParams.length) throw new Error(`${creationFailed} fields missing: ${missingParams.join()}`);
    // Check that the indicated creatureType exists
    const creatureTypeId = parseInt(actionPatternObject.creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)
        || !(await CreatureType.findOne({ where: { id: creatureTypeId } }))) {
      throw new Error(`${creationFailed} ${noCreatureTypeFound}`);
    }
    actionPatternObject.creatureTypeId = creatureTypeId;
    // Create the actionPattern
    return ActionPattern.create(actionPatternObject);
  },

  /**
   * @param {Integer} actionPatternId
   * @returns {Promise<ActionPattern>} the actionPattern with its actions, weapons, and spells
   */
  getActionPattern: async (actionPatternId) => {
    actionPatternId = parseInt(actionPatternId, 10);
    if (Number.isNaN(actionPatternId)) return null;
    return ActionPattern.findByPk(actionPatternId, {
      include: actionPatternDefaultIncludes,
    });
  },

  /**
   * @param {Integer} actionPatternId
   * @param {Object} updateFields
   * @returns {Promise<ActionPattern>} the updated actionPattern
   */
  updateActionPattern: async (actionPatternId, updateFields) => {
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, ActionPattern.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${updateFailed} no valid update fields found`);

    // Check that the indicated actionPattern exists
    actionPatternId = parseInt(actionPatternId, 10);
    if (Number.isNaN(actionPatternId)) throw new Error(`${updateFailed} ${noActionPatternFound}`);
    const actionPattern = await ActionPattern.findByPk(actionPatternId);
    if (!actionPattern) throw new Error(`${updateFailed} ${noActionPatternFound}`);

    // Update the actionPattern
    actionPattern.set(updateFields);
    return actionPattern.save();
  },

  /**
   * Deletes the indicated actionPattern, and any actions attached to it
   * @param {Integer} actionPatternId
   * @returns {Promise<0 | 1>} 1 if the actionPattern was deleted
   */
  deleteActionPattern: async (actionPatternId) => {
    actionPatternId = parseInt(actionPatternId, 10);
    if (Number.isNaN(actionPatternId)) throw new Error(`${deleteFailed} ${noActionPatternFound}`);
    // Check that the indicated actionPattern exists
    const actionPattern = await ActionPattern.findByPk(actionPatternId);
    if (!actionPattern) throw new Error(`${deleteFailed} ${noActionPatternFound}`);
    // Delete all actions belonging to this actionPattern
    await Action.destroy({ where: { actionPatternId } });
    // Delete the actionPattern
    return actionPattern.destroy();
  },
};
