const {
  CreatureType,
  CreatureTypeSpell,
  CreatureTypeWeapon,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} creatureTypeObject
   * @returns {Object} new CreatureType
   */
  createCreatureType: async (creatureTypeObject) => {
    const strippedCreatureType = stripInvalidParams(creatureTypeObject, CreatureType.allowedParams);

    const missingParams = missingRequiredParams(strippedCreatureType, CreatureType.requiredParams);
    if (missingParams.length) throw new Error(`creatureType creation failed, fields missing: ${missingParams.join()}`);

    const { count } = await CreatureType.findAndCountAll({
      where: {
        name: strippedCreatureType.name,
      },
    });
    if (count) throw new Error(`creatureType with name ${strippedCreatureType.name} already exists`);
    return CreatureType.create(strippedCreatureType);
  },

  /**
   * @param {Integer} creatureTypeId
   * @returns {Object} CreatureType
   */
  getCreatureType: async (creatureTypeId) => {
    return CreatureType.findByPk(creatureTypeId);
  },

  /**
   * @param {Object} creatureTypeObject
   * @returns {Object} updated CreatureType
   */
  updateCreatureType: async (creatureTypeId, creatureTypeObject) => {
    const strippedCreature = stripInvalidParams(creatureTypeObject, CreatureType.updateableParams);

    return CreatureType.update(strippedCreature, { where: { id: creatureTypeId } });
  },

  /**
   * @param {Integer} creatureTypeId
   */
  deleteCreatureType: async (creatureTypeId) => {
    // Delete all CreatureType - Spell associations
    const creatureTypeSpells = await CreatureTypeSpell.findAll({
      where: {
        creatureTypeId,
      },
    });
    await Promise.allSettled(creatureTypeSpells.map(async (creatureTypeSpell) => {
      creatureTypeSpell.destroy();
    }));
    // Delete all CreatureType - Weapon associations
    const creatureTypeWeapons = await CreatureTypeWeapon.findAll({
      where: {
        creatureTypeId,
      },
    });
    await Promise.allSettled(creatureTypeWeapons.map(async (creatureTypeWeapon) => {
      creatureTypeWeapon.destroy();
    }));
    // Delete all associated Creatures
    const creatures = await Creature.findAll({
      where: {
        creatureTypeId,
      },
    });
    await Promise.allSettled(creatures.map(async (creature) => {
      creature.destroy();
    }));
    // Finally, delete the CreatureType
    return CreatureType.destroy({
      where: {
        id: creatureTypeId,
      },
    });
  },
};
