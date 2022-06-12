const {
  Spell,
} = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

// Declare scoped models
const SpellId = Spell.scope('idOnly');

const SpellName = (name) => {
  return Spell.scope({ method: ['nameOnly', name] });
};

// Error message building blocks
const CREATE_FAIL = 'Spell creation failed,';
const UPDATE_FAIL = 'Spell update failed,';
const DELETE_FAIL = 'Spell deletion failed,';
const NAME_EXISTS = 'a spell with the given name already exists';
const NO_SPELL = 'no spell found for the given ID';

module.exports = {
  /**
   * @param {Object} spellObject
   * @returns {Promise<Spell>} the new spell
   */
  createSpell: async (spellObject) => {
    // Remove disallowed params
    spellObject = stripInvalidParams(spellObject, Spell.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(spellObject, Spell.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the spell name is unique
    if (await SpellName(spellObject.name).count()) {
      throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    }
    // Create the spell
    return Spell.create(spellObject);
  },

  /**
   * @param {Integer} spellId
   * @returns {Promise<Spell>} the spell
   */
  getSpell: async (spellId) => {
    spellId = parseInt(spellId, 10);
    if (Number.isNaN(spellId)) return null;
    return Spell.findByPk(spellId);
  },

  /**
   * @param {Integer} spellId
   * @param {Object} updateFields
   * @returns {Promise<Spell>} the updated spell
   */
  updateSpell: async (spellId, updateFields) => {
    spellId = parseInt(spellId, 10);
    if (Number.isNaN(spellId)) throw new Error(`${UPDATE_FAIL} ${NO_SPELL}`);
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, Spell.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated spell exists
    const spell = await Spell.findByPk(spellId);
    if (!spell) throw new Error(`${UPDATE_FAIL} ${NO_SPELL}`);
    // If the name is being updated, check that it is still unique
    const { name } = updateFields;
    if (name !== undefined && name !== spell.name
      && await SpellName(name).count()) {
      throw new Error(`${UPDATE_FAIL} ${NAME_EXISTS}`);
    }
    // Update the spell
    return spell.set(updateFields).save();
  },

  /**
   * @param {Integer} spellId
   * @returns {Promise<1|0>} 1 if the spell was deleted
   */
  deleteSpell: async (spellId) => {
    spellId = parseInt(spellId, 10);
    if (Number.isNaN(spellId)) throw new Error(`${DELETE_FAIL} ${NO_SPELL}`);
    // Check that the indicated spell exists
    const spell = await SpellId.findByPk(spellId);
    if (!spell) throw new Error(`${DELETE_FAIL} ${NO_SPELL}`);
    // Delete the spell
    return spell.destroy();
  },
};
