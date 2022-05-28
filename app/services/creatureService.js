const {
  CreatureType,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} creatureObject
   * @returns {Object} new Creature
   */
  createCreature: async (creatureObject) => {
    const strippedCreature = stripInvalidParams(creatureObject, Creature.allowedParams);

    const missingParams = missingRequiredParams(strippedCreature, Creature.requiredParams);
    if (missingParams.length) throw new Error(`creature creation failed, fields missing: ${missingParams.join()}`);

    const creatureTypeExists = await CreatureType.findOne({
      where: { id: strippedCreature.creatureTypeId },
    });
    if (!creatureTypeExists) throw new Error(`failed to find CreatureType with id ${strippedCreature.creatureTypeId}`);

    const { count } = await Creature.findAndCountAll({ where: { name: strippedCreature.name } });
    if (count) throw new Error(`creature with name ${strippedCreature.name} already exists`);

    return Creature.create(strippedCreature);
  },

  /**
   * @param {Integer} creatureId
   * @returns {Object} Creature
   */
  getCreature: async (creatureId) => {
    return Creature.findByPk(creatureId);
  },

  /**
   * @param {Integer} creatureId
   * @param {Object} creatureObject
   * @returns {Object} updated Creature
   */
  updateCreature: async (creatureId, creatureObject) => {
    const strippedCreature = stripInvalidParams(creatureObject, Creature.updateableParams);
    return Creature.update(strippedCreature, {
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
