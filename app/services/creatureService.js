const {
  CreatureType,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

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
    if (missingParams.length) throw new Error(`Creature creation failed, fields missing: ${missingParams.join()}`);
    // Check that the indicated creatureType exists
    if (!(await CreatureType.findOne({ where: { id: creatureObject.creatureTypeId } }))) {
      throw new Error(`Creature creation failed, no creatureType found with ID: ${creatureObject.creatureTypeId}`);
    }
    // Check that the provided creature name is unique
    if ((await Creature.findAll({ where: { name: creatureObject.name } })).length) {
      throw new Error(`Creature with name ${creatureObject.name} already exists`);
    }
    // Create the creature
    const creatureId = (await Creature.create(creatureObject)).dataValues.id;
    return Creature.findByPk(creatureId, {
      include: [{
        model: CreatureType,
        as: 'creatureType',
      }],
    });
  },

  /**
   * @param {Integer} creatureId
   * @returns {Promise<Creature>} the creature
   */
  getCreature: async (creatureId) => {
    return Creature.findByPk(creatureId);
  },

  /**
   * @param {Integer} creatureId
   * @param {Object} updateFields
   * @returns {Creature} the updated creature
   */
  updateCreature: async (creatureId, updateFields) => {
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, Creature.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('Creature update failed, no valid update fields found');
    // Check that the indicated creature exists
    if (!(await Creature.findByPk(creatureId))) {
      throw new Error(`Creature update failed, no creature found with ID: ${creatureId}`);
    }
    // Update the creature
    return Creature.update(updateFields, { where: { id: creatureId } });
  },

  /**
   * @param {Integer} creatureId
   * @returns {Promise<1|0>} if the creature was deleted
   */
  deleteCreature: async (creatureId) => {
    // Check that the indicated creature exists
    const creature = await Creature.findByPk(creatureId);
    if (!creature) throw new Error(`Creature deletion failed, no creature found with ID: ${creatureId}`);
    // Delete the creature
    return creature.destroy();
  },
};
