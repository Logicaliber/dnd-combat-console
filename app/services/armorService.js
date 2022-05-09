const { Armor, CreatureType } = require('../models');

module.exports = {
  /**
   * @param {Object} armorObject
   * @returns {Object} new Armor
   */
  createArmor: async (armorObject) => {
    const { count } = await Armor.findAndCountAll({
      where: {
        name: armorObject.name,
      },
    });
    if (count) throw new Error(`armor with name ${armorObject.name} already exists`);
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
    return Armor.update(armorObject, {
      where: {
        id: armorObject.id,
      },
    });
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
    return Armor.destroy({
      where: {
        id: armorId,
      },
    });
  },
};
