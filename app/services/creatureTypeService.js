const {
  Armor,
  Weapon,
  Spell,
  CreatureType,
  CreatureTypeWeapon,
  CreatureTypeSpell,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

module.exports = {
  /**
   * Given the parameters for a CreatureType object, as well as arrays containing the weapons
   * and spells that CreatureType should have access to, creates a new CreatureType after checking
   * for the following conditions:
   *   1. No required parameters are missing
   *   2. The provided name is unique
   *   3. The indicated armorId points to an existing Armor
   *   4. The indicated weaponIds point to existing Weapons
   *   5. The indicated spellIds point to existing Spells
   * All other input validations happen during the `create` operation, see `models/creaturetype.js`.
   *
   * Notably, neither this function or the validators check that the weapon or spell IDs used in the
   * provided `actionPatterns` array actually point to the weapon or spell IDs listed. Mapping of
   * weapon or spell IDs will instead happen during rendering.
   *
   * One idea to get around this is to create an `ActionPattern` model in the database. Then instead
   * of passing weaponIds and spellIds here, we just pass an `actionPatternIds` array.
   *
   * This would mean that for a user to create a new CreatureType, they'd have to create the
   * ActionPatterns first. However, the frontend action to create a CreatureType could be configured
   * to allow either passing an array of existing ActionPatterns to use, or an array of new
   * ActionPattern objects to add the DB.
   *
   * @param {Object} creatureTypeObject
   * @param {Array<Integer>} weaponIds
   * @param {Array<Integer>} spellIds
   * @returns {Object} new CreatureType
   */
  createCreatureType: async (creatureTypeObject, weaponIds = null, spellIds = null) => {
    const strippedCreatureType = stripInvalidParams(creatureTypeObject, CreatureType.allowedParams);

    const missingParams = missingRequiredParams(strippedCreatureType, CreatureType.requiredParams);
    if (missingParams.length) throw new Error(`CreatureType creation failed, fields missing: ${missingParams.join()}`);

    const { count } = await CreatureType.findAndCountAll({
      where: { name: strippedCreatureType.name },
    });
    if (count) throw new Error(`CreatureType with name "${strippedCreatureType.name}" already exists`);

    // Check that the indicated Armor exists
    if (strippedCreatureType.armorId) {
      const armorExists = await Armor.findOne({ where: { id: strippedCreatureType.armorId } });
      if (!armorExists) throw new Error(`CreatureType creation "${strippedCreatureType.name}" failed, unable to find Armor with ID: ${strippedCreatureType.armorId}`);
    }

    // Check that the indicated Weapons exist
    if (weaponIds) {
      if (!Array.isArray(weaponIds)) throw new Error(`CreatureType creation "${strippedCreatureType.name}" failed, weaponIds must be an Array`);
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
      if (failed.length) throw new Error(`CreatureType creation "${strippedCreatureType.name}" failed, unable to find Weapons with IDs: ${failed.join(',')}`);
    }

    // Check that the indicated Spells exist
    if (spellIds) {
      if (!Array.isArray(spellIds)) throw new Error(`CreatureType creation "${strippedCreatureType.name}" failed, spellIds must be an Array`);
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
      if (failed.length) throw new Error(`CreatureType creation "${strippedCreatureType.name}" failed, unable to find Spells with IDs: ${failed.join(',')}`);
    }

    const createdCreatureType = await CreatureType.create(strippedCreatureType);
    if (!createdCreatureType) throw new Error(`Failed to create CreatureType with name "${strippedCreatureType.name}" (database error)`);
    const { id } = createdCreatureType.dataValues;

    // Create the CreatureTypeWeapon junctions
    if (weaponIds) {
      const failedWeaponIds = (await Promise
        .allSettled(weaponIds.map((weaponId) => {
          return new Promise((resolve, reject) => {
            CreatureTypeWeapon.create({
              creatureTypeId: id,
              weaponId,
            })
              .then(() => resolve(weaponId))
              .catch((err) => reject(weaponId));
          });
        })))
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason);
      if (failedWeaponIds.length) throw new Error(`Failed to create CreatureTypeWeapons for "${strippedCreatureType.name}" with creatureTypeId: ${id} and weaponIds: ${failedWeaponIds.join(',')}`);
    }

    // Create the CreatureTypeSpell junctions
    if (spellIds) {
      const failedSpellIds = (await Promise
        .allSettled(spellIds.map((spellId) => {
          return new Promise((resolve, reject) => {
            CreatureTypeSpell.create({
              creatureTypeId: id,
              spellId,
            })
              .then(() => resolve(spellId))
              .catch((err) => reject(spellId));
          });
        })))
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason);
      if (failedSpellIds.length) throw new Error(`Failed to create CreatureTypeSpells for "${strippedCreatureType.name}" with creatureTypeId: ${id} and spellIds: ${failedSpellIds.join(',')}`);
    }
    return CreatureType.findOne({
      where: { id },
      include: [{
        model: Weapon,
        as: 'weapons',
      }, {
        model: Spell,
        as: 'spells',
      }],
    });
  },

  /**
   * @param {Integer} creatureTypeId
   * @returns {Object} CreatureType
   */
  getCreatureType: async (creatureTypeId) => {
    return CreatureType.findByPk(creatureTypeId);
  },

  /**
   * @param {Object} updateFields
   * @returns {Object} updated CreatureType
   */
  updateCreatureType: async (creatureTypeId, updateFields) => {
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, CreatureType.updateableParams);
    return CreatureType.update(updateFields, { where: { id: creatureTypeId } });
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
