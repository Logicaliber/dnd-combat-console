const { Armor, CreatureType } = require('../models');

module.exports = {
  /**
   * @param {Object} armorObject
   * @returns {Object} new Armor
   */
  createArmor: async (armorObject) => {
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
  updateArmor: async (armorObject) => {
    return Armor.update(armorObject);
  },

  /**
   * @param {Integer} armorId
   */
  deleteArmor: async (armorId) => {
    const creatureTypes = await CreatureType.findAll({
      where: {
        armorId,
      },
    });
    await Promise.allSettled(creatureTypes.map(async (creatureType) => {
      creatureType.armorId = null;
      return creatureType.save();
    }));
    return Armor.destroy(armorId);
  },
};
