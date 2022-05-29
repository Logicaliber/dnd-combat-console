const {
  Armor,
  Spell,
  Weapon,
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
  createCreatureType: async (creatureTypeObject, spellIds = null, weaponIds = null) => {
    const strippedCreatureType = stripInvalidParams(creatureTypeObject, CreatureType.allowedParams);

    const missingParams = missingRequiredParams(strippedCreatureType, CreatureType.requiredParams);
    if (missingParams.length) throw new Error(`CreatureType creation failed, fields missing: ${missingParams.join()}`);

    const { count } = await CreatureType.findAndCountAll({
      where: { name: strippedCreatureType.name },
    });
    if (count) throw new Error(`CreatureType with name ${strippedCreatureType.name} already exists`);

    // Check that the indicated Armor exists
    if (strippedCreatureType.armorId) {
      const armorExists = await Armor.findOne({ where: { id: strippedCreatureType.armorId } });
      if (!armorExists) throw new Error(`CreatureType creation failed, unable to find Armor with ID: ${strippedCreatureType.armorId}`);
    }

    // Check that the indicated Spells exist
    if (spellIds) {
      if (!Array.isArray(spellIds)) throw new Error('CreatureType creation failed, spellIds must be an Array');
      const failed = (await Promise.allSettled(spellIds.map((id) => {
        return new Promise((resolve, reject) => {
          Spell.findAndCountAll({ where: { id } })
            .then(({ count: spellCount, spells }) => {
              if (!spellCount) reject(id);
              resolve(id);
            })
            .catch((err) => reject(id));
        });
      }))).filter((result) => result.status === 'rejected').map((result) => result.reason);
      if (failed.length) throw new Error(`CreatureType creation failed, unable to find Spells with IDs: ${failed.join(',')}`);
    }

    // Check that the indicated Weapons exist
    if (weaponIds) {
      if (!Array.isArray(weaponIds)) throw new Error('CreatureType creation failed, weaponIds must be an Array');
      const failed = (await Promise.allSettled(weaponIds.map((id) => {
        return new Promise((resolve, reject) => {
          Weapon.findAndCountAll({ where: { id } })
            .then(({ count: weaponCount, weapons }) => {
              if (!weaponCount) reject(id);
              resolve(id);
            })
            .catch((err) => reject(id));
        });
      }))).filter((result) => result.status === 'rejected').map((result) => result.reason);
      if (failed.length) throw new Error(`CreatureType creation failed, unable to find Weapons with IDs: ${failed.join(',')}`);
    }

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
    const creatureTypeSpells = await CreatureTypeSpell.findAll({ where: { creatureTypeId } });
    await Promise.allSettled(creatureTypeSpells.map(async (creatureTypeSpell) => {
      creatureTypeSpell.destroy();
    }));
    // Delete all CreatureType - Weapon associations
    const creatureTypeWeapons = await CreatureTypeWeapon.findAll({ where: { creatureTypeId } });
    await Promise.allSettled(creatureTypeWeapons.map(async (creatureTypeWeapon) => {
      creatureTypeWeapon.destroy();
    }));
    // Delete all associated Creatures
    const creatures = await Creature.findAll({ where: { creatureTypeId } });
    await Promise.allSettled(creatures.map(async (creature) => {
      creature.destroy();
    }));
    // Finally, delete the CreatureType
    return CreatureType.destroy({ where: { id: creatureTypeId } });
  },
};
