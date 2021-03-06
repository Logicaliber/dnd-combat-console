const {
  Armor,
  CreatureType,
} = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

// Declare scoped models
const ArmorId = (id) => Armor.scope({ method: ['id', id] });
const ArmorName = (name) => Armor.scope({ method: ['name', name] });
const CreatureTypeArmorId = (armorId) => CreatureType.scope({ method: ['armorId', armorId] });

// Error message building blocks
const CREATE_FAIL = 'Armor creation failed,';
const CLONE_FAIL = 'Armor clone failed,';
const UPDATE_FAIL = 'Armor update failed,';
const DELETE_FAIL = 'Armor deletion failed,';
const NAME_EXISTS = 'an armor with the given name already exists';
const NO_ARMOR = 'no armor found for the given ID';

module.exports = {
  /**
   * @param {Object} armorObject
   * @returns {Promise<Armor>} the new armor
   */
  createArmor: async (armorObject) => {
    // Remove disallowed params
    armorObject = stripInvalidParams(armorObject, Armor.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(armorObject, Armor.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the armor name is unique
    if (await ArmorName(armorObject.name).count()) throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    // Create the armor
    return Armor.create(armorObject);
  },

  /**
   * @param {Armor} armor
   * @returns {Promise<Armor>} a copy of the given armor with `${name} (copy)`.
   */
  cloneArmor: async (id) => {
    // Check that the indicated armor exists
    id = parseInt(id, 10);
    if (!id) throw new Error(`${CLONE_FAIL} ${NO_ARMOR}`);
    const armor = await Armor.findByPk(id);
    if (!armor) throw new Error(`${CLONE_FAIL} ${NO_ARMOR}`);
    // Clear the armor instance ID, and set name to 'name (copy)'
    delete armor.dataValues.id;
    armor.name = `${armor.name} (copy)`;
    // Return a copy of the armor
    return Armor.create({ ...armor.dataValues });
  },

  /**
   * @param {Integer} armorId
   * @returns {Promise<Armor>} the armor
   */
  getArmor: async (armorId) => {
    armorId = parseInt(armorId, 10);
    if (Number.isNaN(armorId)) return null;
    return Armor.findByPk(armorId);
  },

  /**
   * @param {Integer} armorId
   * @param {Object} updateFields
   * @returns {Promise<Armor>} the updated armor
   */
  updateArmor: async (armorId, updateFields) => {
    armorId = parseInt(armorId, 10);
    if (Number.isNaN(armorId)) throw new Error(`${UPDATE_FAIL} ${NO_ARMOR}`);
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, Armor.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated armor exists
    const armor = await Armor.findByPk(armorId);
    if (!armor) throw new Error(`${UPDATE_FAIL} ${NO_ARMOR}`);
    // If the name is being updated, check that it is still unique
    const { name } = updateFields;
    if (name !== undefined && name !== armor.name && await ArmorName(name).count()) {
      throw new Error(`${UPDATE_FAIL} ${NAME_EXISTS}`);
    }
    // Update the armor
    return armor.set(updateFields).save();
  },

  /**
   * @param {Integer} armorId
   * @returns {Promise<0 | 1>} 1 if the armor was deleted
   */
  deleteArmor: async (armorId) => {
    armorId = parseInt(armorId, 10);
    if (Number.isNaN(armorId)) throw new Error(`${DELETE_FAIL} ${NO_ARMOR}`);
    // Check that the armor exists
    const armor = await ArmorId(armorId).findOne();
    if (!armor) throw new Error(`${DELETE_FAIL} ${NO_ARMOR}`);
    // For each creatureType that uses this armor, set its armorId to null
    await CreatureTypeArmorId(armorId).update({ armorId: null });
    // Delete the armor
    return armor.destroy();
  },
};
