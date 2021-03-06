const {
  Weapon,
  Spell,
  ActionPattern,
  Action,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

// Declare scoped models
const WeaponId = (id) => Weapon.scope({ method: ['id', id] });
const SpellId = (id) => Spell.scope({ method: ['id', id] });
const ActionPatternId = (id) => ActionPattern.scope({ method: ['id', id] });
const ActionId = (id) => Action.scope({ method: ['id', id] });
const ActionWithActionPatternId = (actionPatternId) => Action.scope({ method: ['actionPatternId', actionPatternId] });

// Error message building blocks
const CREATE_FAIL = 'Action creation failed,';
const CLONE_FAIL = 'Action clone failed,';
const UPDATE_FAIL = 'Action update failed,';
const DELETE_FAIL = 'Action deletion failed,';
const WEAPON_SPELL_OTHER = 'action must be one of weapon, spell, or other';
const NO_WEAPON = 'no weapon found for the given ID';
const NO_SPELL = 'no spell found for the given ID';
const NO_ACTION_PATTERN = 'no actionPattern found for the given ID';
const NO_ACTION = 'no action found for the given ID';

/**
 * @param {*} number
 * @returns {0 | 1}
 */
const normalize = (number) => {
  if (!number) return 0;
  number = parseInt(number, 10);
  if (Number.isNaN(number)) return 0;
  if (!number) return 0;
  return parseInt(number / number, 10);
};

module.exports = {
  /**
   * @param {Object} actionObject
   * @returns {Promise<Action>} the new action, with its weapon or spell included
   */
  createAction: async (actionObject) => {
    // Filter out disallowed params
    actionObject = stripInvalidParams(actionObject, Action.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(actionObject, Action.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    const {
      actionPatternId, weaponId, spellId, other,
    } = actionObject;
    // Check that the indicated actionPattern exists
    if (Number.isNaN(parseInt(actionPatternId, 10))
        || !(await ActionPatternId(actionPatternId).count())) {
      throw new Error(`${CREATE_FAIL} ${NO_ACTION_PATTERN}`);
    }
    // An action must be one of weapon, spell, or other
    if (normalize(weaponId)
      + normalize(spellId)
      + normalize(other && typeof other === 'string'
        ? other.length
        : 0)
      !== 1) {
      throw new Error(`${CREATE_FAIL} ${WEAPON_SPELL_OTHER}`);
    }
    // Check that the indicated weapon exists
    if (weaponId !== undefined && weaponId !== null
      && (Number.isNaN(parseInt(weaponId, 10)) || !(await WeaponId(weaponId).count()))) {
      throw new Error(`${CREATE_FAIL} ${NO_WEAPON}`);
    // Check that the indicated spell exists
    } else if (spellId !== undefined && spellId !== null
      && (Number.isNaN(parseInt(spellId, 10)) || !(await SpellId(spellId).count()))) {
      throw new Error(`${CREATE_FAIL} ${NO_SPELL}`);
    }
    // Create the action, then return it with its weapon or spell
    return Action.create(actionObject)
      .then((action) => action.reload());
  },

  /**
   * @param {Integer} id of the action to clone
   * @returns {Promise<Action>} a copy of the action,
   * with index 1 + the max over sibling instances.
   */
  cloneAction: async (id) => {
    // Check that the indicated action exists
    id = parseInt(id, 10);
    if (!id) throw new Error(`${CLONE_FAIL} ${NO_ACTION}`);
    const action = await Action.unscoped().findByPk(id);
    if (!action) throw new Error(`${CLONE_FAIL} ${NO_ACTION}`);
    // Clear the action instance ID, and set the index to be
    // 1 + the max of index values over sibling instances
    delete action.dataValues.id;
    action.index = 1 + Math.max(...(
      await ActionWithActionPatternId(action.actionPatternId).findAll({
        attributes: { include: ['index'] },
      })).map((a) => a.index));
    // Return a copy of the action with its weapons, and spells
    return Action.create({ ...action.dataValues })
      .then((actionClone) => actionClone.reload());
  },

  /**
   * @param {Integer} actionId
   * @returns {Promise<Action>} the action with its weapon or spell
   */
  getAction: async (actionId) => {
    actionId = parseInt(actionId, 10);
    if (Number.isNaN(actionId)) return null;
    return Action.findByPk(actionId);
  },

  /**
   * @param {Integer} actionId
   * @param {Object} updateFields
   * @returns {Promise<Action>} the updated action, with its weapon or spell
   */
  updateAction: async (actionId, updateFields) => {
    actionId = parseInt(actionId, 10);
    if (Number.isNaN(actionId)) throw new Error(`${UPDATE_FAIL} ${NO_ACTION}`);
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, Action.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated action exists. Default scope includes weapon and spell
    const action = await Action.findByPk(actionId);
    if (!action) throw new Error(`${UPDATE_FAIL} ${NO_ACTION}`);
    // Allow updating weaponId, spellId, or other, just
    // don't allow the final product to have all three
    const { weaponId, spellId, other } = updateFields;
    const proposedWeaponId = ((weaponId === undefined) ? action.weaponId : weaponId);
    const proposedSpellId = ((spellId === undefined) ? action.spellId : spellId);
    const proposedOther = ((other === undefined) ? action.other : other);
    if (normalize(proposedWeaponId)
      + normalize(proposedSpellId)
      + normalize(proposedOther && typeof proposedOther === 'string'
        ? proposedOther.length
        : 0)
      !== 1) {
      throw new Error(`${UPDATE_FAIL} ${WEAPON_SPELL_OTHER}`);
    }
    if (weaponId !== undefined && weaponId !== null
      && (Number.isNaN(parseInt(weaponId, 10)) || !(await WeaponId(weaponId).count()))) {
      throw new Error(`${UPDATE_FAIL} ${NO_WEAPON}`);
    }
    if (spellId !== undefined && spellId !== null
      && (Number.isNaN(parseInt(spellId, 10)) || !(await SpellId(spellId).count()))) {
      throw new Error(`${UPDATE_FAIL} ${NO_SPELL}`);
    }
    // Update the action, returning it with its weapon or spell
    return action.set(updateFields).save();
  },

  /**
   * @param {Integer} actionId
   * @returns {Promise<0 | 1>} 1 if the action was deleted
   */
  deleteAction: async (actionId) => {
    actionId = parseInt(actionId, 10);
    if (Number.isNaN(actionId)) throw new Error(`${DELETE_FAIL} ${NO_ACTION}`);
    // Check that the indicated action exists
    const action = await ActionId(actionId).findOne();
    if (!action) throw new Error(`${DELETE_FAIL} ${NO_ACTION}`);
    // Delete the action
    return action.destroy();
  },
};
