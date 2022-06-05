const {
  Spell,
} = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

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
    if (missingParams.length) throw new Error(`Spell creation failed, fields missing: ${missingParams.join()}`);
    // Check that the spell name is unique
    if ((await Spell.findAll({ where: { name: spellObject.name } })).length) {
      throw new Error(`Spell with name ${spellObject.name} already exists`);
    }
    // Create the spell
    return Spell.create(spellObject);
  },

  /**
   * @param {Integer} spellId
   * @returns {Promise<Spell>} the spell
   */
  getSpell: async (spellId) => {
    return Spell.findByPk(spellId);
  },

  /**
   * @param {Integer} spellId
   * @param {Object} updateFields
   * @returns {Promise<Spell>} the updated spell
   */
  updateSpell: async (spellId, updateFields) => {
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, Spell.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('Spell update failed, no valid update fields found');
    // Check that the indicated spell exists
    if (!(await Spell.findByPk(spellId))) throw new Error(`Spell update failed, no spell found with ID: ${spellId}`);
    // Update the spell
    return Spell.update(updateFields, { where: { id: spellId } });
  },

  /**
   * @param {Integer} spellId
   * @returns {Promise<1|0>} if the spell was deleted
   */
  deleteSpell: async (spellId) => {
    // Check that the indicated spell exists
    const spell = await Spell.findByPk(spellId);
    if (!spell) throw new Error(`Spell deletion failed, no spell found with ID: ${spellId}`);
    // Delete the spell
    return spell.destroy();
  },
};
