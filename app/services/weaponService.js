const {
  Weapon,
} = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

// Declare scoped models
const WeaponId = (id) => Weapon.scope({ method: ['id', id] });
const WeaponName = (name) => Weapon.scope({ method: ['name', name] });

// Error message building blocks
const CREATE_FAIL = 'Weapon creation failed,';
const UPDATE_FAIL = 'Weapon update failed,';
const DELETE_FAIL = 'Weapon deletion failed,';
const NAME_EXISTS = 'a weapon with the given name already exists';
const NO_WEAPON = 'no weapon found for the given ID';

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
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the weapon name is unique
    if (await WeaponName(weaponObject.name).count()) throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    // Create the weapon
    return Weapon.create(weaponObject);
  },

  /**
   * @param {Integer} weaponId
   * @returns {Promise<Weapon>} the weapon
   */
  getWeapon: async (weaponId) => {
    weaponId = parseInt(weaponId, 10);
    if (Number.isNaN(weaponId)) return null;
    return Weapon.findByPk(weaponId);
  },

  /**
   * @param {Integer} weaponId
   * @param {Object} updateFields
   * @returns {Promise<Weapon>} the updated weapon
   */
  updateWeapon: async (weaponId, updateFields) => {
    weaponId = parseInt(weaponId, 10);
    if (Number.isNaN(weaponId)) throw new Error(`${UPDATE_FAIL} ${NO_WEAPON}`);
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, Weapon.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated weapon exists
    const weapon = await Weapon.findByPk(weaponId);
    if (!weapon) throw new Error(`${UPDATE_FAIL} ${NO_WEAPON}`);
    // If the name is being updated, check that it is still unique
    const { name } = updateFields;
    if (name !== undefined && name !== weapon.name && await WeaponName(name).count()) {
      throw new Error(`${UPDATE_FAIL} ${NAME_EXISTS}`);
    }
    // Update the weapon
    return weapon.set(updateFields).save();
  },

  /**
   * @param {Integer} weaponId
   * @returns {Promise<0 | 1>} 1 if the weapon was deleted
   */
  deleteWeapon: async (weaponId) => {
    weaponId = parseInt(weaponId, 10);
    if (Number.isNaN(weaponId)) throw new Error(`${DELETE_FAIL} ${NO_WEAPON}`);
    // Check that the indicated weapon exists
    const weapon = await WeaponId(weaponId).findOne();
    if (!weapon) throw new Error(`${DELETE_FAIL} ${NO_WEAPON}`);
    // Delete the weapon
    return weapon.destroy();
  },
};
