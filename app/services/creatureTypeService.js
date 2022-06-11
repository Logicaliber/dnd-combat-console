const {
  Armor,
  CreatureType,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

const CREATE_FAIL = 'CreatureType creation failed,';
const UPDATE_FAIL = 'CreatureType update failed,';
const DELETE_FAIL = 'CreatureType deletion failed,';
const NAME_EXISTS = 'a creatureType with the given name already exists';
const NO_ARMOR = 'no armor found for the given ID';
const NO_CREATURE_TYPE = 'no creatureType found for the given ID';

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
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the provided creatureType name is unique
    if (await CreatureType.count({ where: { name: creatureTypeObject.name } })) {
      throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    }
    // Check that the indicated Armor exists
    if (creatureTypeObject.armorId
      && !(await Armor.count({ where: { id: creatureTypeObject.armorId } }))) {
      throw new Error(`${CREATE_FAIL} ${NO_ARMOR}`);
    }
    // Create the creatureType, returning it with its armor
    return CreatureType.create(creatureTypeObject)
      .then((creatureType) => creatureType.reload({ include: [{ model: Armor, as: 'armor' }] }));
  },

  /**
   * @param {Integer} creatureTypeId
   * @returns {Promise<CreatureType>} the creatureType with its armor
   */
  getCreatureType: async (creatureTypeId) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)) return null;
    return CreatureType.findByPk(creatureTypeId, { include: [{ model: Armor, as: 'armor' }] });
  },

  /**
   * @param {Integer} creatureTypeId
   * @param {Object} updateFields
   * @returns {Promise<CreatureType>} the updated creatureType with its armor
   */
  updateCreatureType: async (creatureTypeId, updateFields) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE_TYPE}`);
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, CreatureType.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated creatureType exists
    const creatureType = await CreatureType.findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE_TYPE}`);
    // Update the creatureType
    return creatureType.set(updateFields).save()
      .then(() => creatureType.reload({ include: [{ model: Armor, as: 'armor' }] }));
  },

  /**
   * @param {Integer}
   * @returns {Promise<0 | 1>} 1 if the creatureType was deleted
   */
  deleteCreatureType: async (creatureTypeId) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)) throw new Error(`${DELETE_FAIL} ${NO_CREATURE_TYPE}`);
    // Check that the indicated creatureType exists
    const creatureType = await CreatureType.findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`CreatureType deletion failed, no creatureType found with ID: ${creatureTypeId}`);
    // Delete all associated Creatures
    await Creature.destroy({ where: { creatureTypeId } });
    // Delete the CreatureType
    return creatureType.destroy();
  },
};
