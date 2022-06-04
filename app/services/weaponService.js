const { Weapon, CreatureType, CreatureTypeWeapon } = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} weaponObject
   * @returns {Weapon} the new weapon
   */
  createWeapon: async (weaponObject) => {
    // Remove disallowed params
    weaponObject = stripInvalidParams(weaponObject, Weapon.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(weaponObject, Weapon.requiredParams);
    if (missingParams.length) throw new Error(`Weapon creation failed, fields missing: ${missingParams.join()}`);
    // Check that the weapon name is unique
    if ((await Weapon.findAll({ where: { name: weaponObject.name } })).length) {
      throw new Error(`Weapon with name ${weaponObject.name} already exists`);
    }
    return Weapon.create(weaponObject);
  },

  /**
   * @param {Integer} weaponId
   * @returns {Weapon} the weapon
   */
  getWeapon: async (weaponId) => {
    return Weapon.findByPk(weaponId);
  },

  /**
   * @param {Integer} weaponId
   * @param {Object} updateFields
   * @returns {Weapon} the updated weapon
   */
  updateWeapon: async (weaponId, updateFields) => {
    // Remove disallowed params
    updateFields = stripInvalidParams(updateFields, Weapon.updateableParams);
    // Check that the indicated weapon exists
    if (!(await Weapon.findByPk(weaponId))) throw new Error(`Weapon update failed, no weapon found with ID: ${weaponId}`);
    // Update the weapon
    return Weapon.update(updateFields, { where: { id: weaponId } });
  },

  /**
   * @param {Integer} weaponId
   */
  deleteWeapon: async (weaponId) => {
    // Check that the indicated weapon exists
    const weapon = await Weapon.findByPk(weaponId, {
      include: [{
        model: CreatureType,
        as: 'creatureTypes',
      }],
    });
    if (!weapon) throw new Error(`Weapon deletion failed, no weapon found with ID: ${weaponId}`);
    // Delete all relevant CreatureType - Weapon associations
    await Promise.allSettled(weapon.dataValues.creatureTypes.map(async (creatureType) => {
      return CreatureTypeWeapon.destroy({
        where: {
          creatureTypeId: creatureType.dataValues.id,
          weaponId: weapon.dataValues.id,
        },
      });
    }));
    // Delete the weapon
    return weapon.destroy();
  },
};
