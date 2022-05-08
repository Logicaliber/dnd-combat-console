const { Armor, CreatureType } = require('../models');

module.exports = {
  /**
   * @param {Object} armorObject
   * @returns {Object} new Armor
   */
  async createArmor(armorObject) {
    return Armor.create(armorObject);
  },

  /**
   * @param {Integer} armorId
   * @returns {Object} Armor
   */
  async getArmor(armorId) {
    return Armor.findByPk(armorId);
  },

  /**
   * @param {Object} armorObject
   * @returns {Object} updated Armor
   */
  async updateArmor(armorObject) {
    return Armor.update(armorObject);
  },

  /**
   * @param {Integer} armorId
   */
  async deleteArmor(armorId) {
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
