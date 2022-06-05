const {
  Armor,
  CreatureType,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

module.exports = {
  /**
   * Given the parameters for a CreatureType object, creates a new CreatureType after checking
   * for the following conditions:
   *   1. No required parameters are missing
   *   2. The provided name is unique
   *   3. The indicated armorId points to an existing Armor
   * All other input validations happen during the `create` operation, see `models/creaturetype.js`.
   *
   * @param {Object} creatureTypeObject
   * @returns {Promise<CreatureType>} new creatureType, with its armor included
   */
  createCreatureType: async (creatureTypeObject) => {
    // Filter out disallowed params
    creatureTypeObject = stripInvalidParams(creatureTypeObject, CreatureType.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(creatureTypeObject, CreatureType.requiredParams);
    if (missingParams.length) throw new Error(`CreatureType creation failed, fields missing: ${missingParams.join()}`);
    // Check that the provided creatureType name is unique
    if ((await CreatureType.findAll({ where: { name: creatureTypeObject.name } })).length) {
      throw new Error(`CreatureType with name "${creatureTypeObject.name}" already exists`);
    }
    // Check that the indicated Armor exists
    if (creatureTypeObject.armorId && !(await Armor.findByPk(creatureTypeObject.armorId))) {
      throw new Error(`CreatureType creation "${creatureTypeObject.name}" failed, unable to find Armor with ID: ${creatureTypeObject.armorId}`);
    }
    // Create the creatureType
    const createdCreatureType = await CreatureType.create(creatureTypeObject);
    if (!createdCreatureType) throw new Error(`Failed to create CreatureType with name "${creatureTypeObject.name}" (database error)`);
    // Return the new creatureType with its armor included
    return CreatureType.findByPk(createdCreatureType.dataValues.id, {
      include: [{
        model: Armor,
        as: 'armor',
      }],
    });
  },

  /**
   * @param {Integer} creatureTypeId
   * @returns {Promise<CreatureType>} CreatureType
   */
  getCreatureType: async (creatureTypeId) => {
    return CreatureType.findByPk(creatureTypeId);
  },

  /**
   * @param {Integer} creatureTypeId
   * @param {Object} updateFields
   * @returns {Promise<CreatureType>} updated CreatureType
   */
  updateCreatureType: async (creatureTypeId, updateFields) => {
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, CreatureType.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('CreatureType update failed, no valid update fields found');
    // Check that the indicated creatureType exists
    if (!(await CreatureType.findByPk(creatureTypeId))) throw new Error(`CreatureType update failed, no creatureType found with ID: ${creatureTypeId}`);
    // Update the creatureType
    return CreatureType.update(updateFields, { where: { id: creatureTypeId } });
  },

  /**
   * @param {Integer}
   * @returns {Promise<1|0>} if the creatureType was deleted
   */
  deleteCreatureType: async (creatureTypeId) => {
    // Check that the indicated creatureType exists
    const creatureType = await CreatureType.findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`CreatureType deletion failed, no creatureType found with ID: ${creatureTypeId}`);
    // Delete all associated Creatures
    await Creature.destroy({ where: { creatureTypeId } });
    // Delete the CreatureType
    return creatureType.destroy();
  },
};
