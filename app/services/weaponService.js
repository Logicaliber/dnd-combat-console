const {
  Weapon,
} = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} weaponObject
   * @returns {Promise<Weapon>} the new weapon
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
    // Create the weapon
    return Weapon.create(weaponObject);
  },

  /**
   * @param {Integer} weaponId
   * @returns {Promise<Weapon>} the weapon
   */
  getWeapon: async (weaponId) => {
    return Weapon.findByPk(weaponId);
  },

  /**
   * @param {Integer} weaponId
   * @param {Object} updateFields
   * @returns {Promise<Weapon>} the updated weapon
   */
  updateWeapon: async (weaponId, updateFields) => {
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, Weapon.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('Weapon update failed, no valid update fields found');
    // Check that the indicated weapon exists
    if (!(await Weapon.findByPk(weaponId))) throw new Error(`Weapon update failed, no weapon found with ID: ${weaponId}`);
    // Update the weapon
    return Weapon.update(updateFields, { where: { id: weaponId } });
  },

  /**
   * @param {Integer} weaponId
   * @returns {Promise<1|0>} if the weapon was deleted
   */
  deleteWeapon: async (weaponId) => {
    // Check that the indicated weapon exists
    const weapon = await Weapon.findByPk(weaponId);
    if (!weapon) throw new Error(`Weapon deletion failed, no weapon found with ID: ${weaponId}`);

    // Delete the weapon
    return weapon.destroy();
  },
};
