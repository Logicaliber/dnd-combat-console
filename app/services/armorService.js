const { Armor, CreatureType } = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} armorObject
   * @returns {Object} new Armor
   */
  createArmor: async (armorObject) => {
    // Remove disallowed params
    armorObject = stripInvalidParams(armorObject, Armor.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(armorObject, Armor.requiredParams);
    if (missingParams.length) throw new Error(`Armor creation failed, fields missing: ${missingParams.join()}`);
    // Check that the armor name is unique
    if ((await Armor.findAll({ where: { name: armorObject.name } })).length) {
      throw new Error(`Armor with name ${armorObject.name} already exists`);
    }
    return Armor.create(armorObject);
  },

  /**
   * @param {Integer} armorId
   * @returns {Object} Armor
   */
  getArmor: async (armorId) => {
    return Armor.findByPk(armorId);
  },

  /**
   * @param {Object} armorObject
   * @returns {Object} updated Armor
   */
  updateArmor: async (armorId, armorObject) => {
    // Remove disallowed params
    armorObject = stripInvalidParams(armorObject, Armor.updateableParams);
    if (!(await Armor.findByPk(armorId))) throw new Error(`Armor update failed, no armor found with ID: ${armorId}`);
    // Update the armor
    return Armor.update(armorObject, { where: { id: armorId } });
  },

  /**
   * @param {Integer} armorId
   */
  deleteArmor: async (armorId) => {
    // Check that the armor exists
    const armor = await Armor.findByPk(armorId);
    if (!armor) throw new Error(`Armor deletion failed, no armor found with ID: ${armorId}`);
    // For each creatureType that uses this armor, set its armorId to null
    await Promise.allSettled((await CreatureType.findAll({ where: { armorId } }))
      .map(async (creatureType) => {
        creatureType.armorId = null;
        return creatureType.save();
      }));
    // Delete the armor
    return armor.destroy();
  },
};
