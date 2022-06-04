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
   * @returns {CreatureType} new creatureType, with its armor, weapons, and spells included
   */
  createCreatureType: async (creatureTypeObject, weaponIds = null, spellIds = null) => {
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
    // Check that the indicated Weapons exist
    if (weaponIds) {
      if (!Array.isArray(weaponIds)) throw new Error(`CreatureType creation "${creatureTypeObject.name}" failed, weaponIds must be an Array`);
      const failedFindWeapons = (await Promise.allSettled(weaponIds.map((id) => {
        return new Promise((resolve, reject) => {
          Weapon.findByPk(id, { attributes: ['id'] })
            .then((weapon) => {
              if (!weapon) reject(id);
              resolve(id);
            })
            .catch((err) => reject(id));
        });
      }))).filter((result) => result.status === 'rejected').map((result) => result.reason);
      if (failedFindWeapons.length) {
        throw new Error(`CreatureType creation "${creatureTypeObject.name}" failed, unable to find Weapons with IDs: ${failedFindWeapons.join(',')}`);
      }
    }
    // Check that the indicated Spells exist
    if (spellIds) {
      if (!Array.isArray(spellIds)) throw new Error(`CreatureType creation "${creatureTypeObject.name}" failed, spellIds must be an Array`);
      const failedFindSpells = (await Promise.allSettled(spellIds.map((id) => {
        return new Promise((resolve, reject) => {
          Spell.findByPk(id, { attributes: ['id'] })
            .then((spell) => {
              if (!spell) reject(id);
              resolve(id);
            })
            .catch((err) => reject(id));
        });
      }))).filter((result) => result.status === 'rejected').map((result) => result.reason);
      if (failedFindSpells.length) {
        throw new Error(`CreatureType creation "${creatureTypeObject.name}" failed, unable to find Spells with IDs: ${failedFindSpells.join(',')}`);
      }
    }

    // Create the creatureType
    const createdCreatureType = await CreatureType.create(creatureTypeObject);
    if (!createdCreatureType) throw new Error(`Failed to create CreatureType with name "${creatureTypeObject.name}" (database error)`);
    const { id: creatureTypeId, name } = createdCreatureType.dataValues;

    // Create the CreatureTypeWeapon junctions
    if (weaponIds) {
      const failedCreateCreatureTypeWeaons = (await Promise.allSettled(weaponIds.map((weaponId) => {
        return new Promise((resolve, reject) => {
          CreatureTypeWeapon.create({ creatureTypeId, weaponId })
            .then(() => resolve(weaponId))
            .catch((err) => reject(weaponId));
        });
      }))).filter((result) => result.status === 'rejected').map((result) => result.reason);
      if (failedCreateCreatureTypeWeaons.length) {
        throw new Error(`Failed to create CreatureTypeWeapons for "${name}" with creatureTypeId: ${creatureTypeId} and weaponIds: ${failedCreateCreatureTypeWeaons.join(',')}`);
      }
    }
    // Create the CreatureTypeSpell junctions
    if (spellIds) {
      const failedCreatureCreatureTypeSpells = (await Promise.allSettled(spellIds.map((spellId) => {
        return new Promise((resolve, reject) => {
          CreatureTypeSpell.create({ creatureTypeId, spellId })
            .then(() => resolve(spellId))
            .catch((err) => reject(spellId));
        });
      }))).filter((result) => result.status === 'rejected').map((result) => result.reason);
      if (failedCreatureCreatureTypeSpells.length) {
        throw new Error(`Failed to create CreatureTypeSpells for "${name}" with creatureTypeId: ${creatureTypeId} and spellIds: ${failedCreatureCreatureTypeSpells.join(',')}`);
      }
    }

    // Return the new creatureType with its armor, weapons, and spells included
    return CreatureType.findByPk(creatureTypeId, {
      include: [{
        model: Armor,
        as: 'armor',
      }, {
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
   * @returns {CreatureType} CreatureType
   */
  getCreatureType: async (creatureTypeId) => {
    return CreatureType.findByPk(creatureTypeId);
  },

  /**
   * @param {Integer} creatureTypeId
   * @param {Object} updateFields
   * @returns {CreatureType} updated CreatureType
   */
  updateCreatureType: async (creatureTypeId, updateFields) => {
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, CreatureType.updateableParams);
    // Check that the indicated creatureType exists
    if (!(await CreatureType.findByPk(creatureTypeId))) throw new Error(`CreatureType update failed, no creatureType found with ID: ${creatureTypeId}`);
    // Update the creatureType
    return CreatureType.update(updateFields, { where: { id: creatureTypeId } });
  },

  /**
   * @param {Integer} creatureTypeId
   */
  deleteCreatureType: async (creatureTypeId) => {
    // Check that the indicated creatureType exists
    const creatureType = await CreatureType.findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`CreatureType deletion failed, no creatureType found with ID: ${creatureTypeId}`);
    // Delete all CreatureType - Weapon associations
    await CreatureTypeWeapon.destroy({ where: { creatureTypeId } });
    // Delete all CreatureType - Spell associations
    await CreatureTypeSpell.destroy({ where: { creatureTypeId } });
    // Delete all associated Creatures
    await Creature.destroy({ where: { creatureTypeId } });
    // Delete the CreatureType
    return creatureType.destroy();
  },
};
