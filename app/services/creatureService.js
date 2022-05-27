const {
  CreatureType,
  Creature,
} = require('../models');
const { missingRequiredParams, nonUpdateableParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} creatureObject
   * @returns {Object} new Creature
   */
  createCreature: async (creatureObject) => {
    const missingParams = missingRequiredParams(creatureObject, Creature.optionsSchema);
    if (missingParams.length) throw new Error(`creature creation failed, fields missing: ${missingParams.join()}`);

    const creatureType = await CreatureType.findOne({
      where: { id: creatureObject.creatureTypeId },
    });
    if (!creatureType) throw new Error(`failed to find CreatureType with id ${creatureObject.creatureTypeId}`);

    const { count } = await Creature.findAndCountAll({
      where: {
        name: creatureObject.name,
      },
    });
    if (count) throw new Error(`creature with name ${creatureObject.name} already exists`);
    return Creature.create(creatureObject);
  },

  /**
   * @param {Integer} creatureId
   * @returns {Object} Creature
   */
  getCreature: async (creatureId) => {
    return Creature.findByPk(creatureId);
  },

  /**
   * @param {Object} creatureObject
   * @returns {Object} updated Creature
   */
  updateCreature: async (creatureId, creatureObject) => {
    const badParams = nonUpdateableParams(creatureObject, Creature.optionsSchema);
    if (badParams.length) throw new Error(`Creature update failed, fields are not updateable: ${badParams.join()}`);
    return Creature.update(creatureObject, {
      where: {
        id: creatureId,
      },
    });
  },

  /**
   * @param {Integer} creatureId
   */
  deleteCreature: async (creatureId) => {
    return Creature.destroy({
      where: {
        id: creatureId,
      },
    });
  },
};
