const {
  CreatureType,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

const CREATE_FAIL = 'Creature creation failed,';
const UPDATE_FAIL = 'Creature update failed,';
const DELETE_FAIL = 'Creature deletion failed,';
const NAME_EXISTS = 'a creature with the given name already exists';
const NO_CREATURE = 'no creature found for the given ID';
const NO_TYPE = 'no creatureType found for the given ID';

module.exports = {
  /**
   * @param {Object} creatureObject
   * @returns {Promise<Creature>} the new creature, with its creatureType included
   */
  createCreature: async (creatureObject) => {
    // Filter out disallowed params
    creatureObject = stripInvalidParams(creatureObject, Creature.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(creatureObject, Creature.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the indicated creatureType exists
    if (!(await CreatureType.count({ where: { id: creatureObject.creatureTypeId } }))) {
      throw new Error(`${CREATE_FAIL} ${NO_TYPE}`);
    }
    // Check that the provided creature name is unique
    if (await Creature.count({ where: { name: creatureObject.name } })) {
      throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    }
    // Create the creature, returning it with its creatureType
    return Creature.create(creatureObject)
      .then((creature) => creature.reload({
        include: [{ model: CreatureType, as: 'creatureType' }],
      }));
  },

  /**
   * @param {Integer} creatureId
   * @returns {Promise<Creature>} the creature with its creatureType
   */
  getCreature: async (creatureId) => {
    creatureId = parseInt(creatureId, 10);
    if (Number.isNaN(creatureId)) return null;
    return Creature.findByPk(creatureId, { include: [{ model: CreatureType, as: 'creatureType' }] });
  },

  /**
   * @param {Integer} creatureId
   * @param {Object} updateFields
   * @returns {Creature} the updated creature, with its creatureType
   */
  updateCreature: async (creatureId, updateFields) => {
    creatureId = parseInt(creatureId, 10);
    if (Number.isNaN(creatureId)) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE}`);
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, Creature.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated creature exists
    const creature = await Creature.findByPk(creatureId);
    if (!creature) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE}`);
    // Update the creature, returning it with its creatureType
    return creature.set(updateFields).save()
      .then(() => creature.reload({
        include: [{ model: CreatureType, as: 'creatureType' }],
      }));
  },

  /**
   * @param {Integer} creatureId
   * @returns {Promise<1|0>} if the creature was deleted
   */
  deleteCreature: async (creatureId) => {
    creatureId = parseInt(creatureId, 10);
    if (Number.isNaN(creatureId)) throw new Error(`${DELETE_FAIL} ${NO_CREATURE}`);
    // Check that the indicated creature exists
    const creature = await Creature.findByPk(creatureId);
    if (!creature) throw new Error(`${DELETE_FAIL} ${NO_CREATURE}`);
    // Delete the creature
    return creature.destroy();
  },
};
