const {
  CreatureType,
  Creature,
  CreatureTypeSpell,
  CreatureTypeWeapon,
} = require('../models');
const { missingRequiredParams, nonUpdateableParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} creatureTypeObject
   * @returns {Object} new CreatureType
   */
  createCreatureType: async (creatureTypeObject) => {
    const missingParams = missingRequiredParams(creatureTypeObject, CreatureType.optionsSchema);
    if (missingParams.length) throw new Error(`creatureType creation failed, fields missing: ${missingParams.join()}`);

    const { count } = await CreatureType.findAndCountAll({
      where: {
        name: creatureTypeObject.name,
      },
    });
    if (count) throw new Error(`creatureType with name ${creatureTypeObject.name} already exists`);
    return CreatureType.create(creatureTypeObject);
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
    const badParams = nonUpdateableParams(creatureTypeObject, CreatureType.optionsSchema);
    if (badParams.length) throw new Error(`CreatureType update failed, fields are not updateable: ${badParams.join()}`);
    return CreatureType.update(creatureTypeObject, {
      where: {
        id: creatureTypeId,
      },
    });
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
