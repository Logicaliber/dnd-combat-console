const { Weapon, CreatureTypeWeapon } = require('../models');

module.exports = {
  /**
   * @param {Object} weaponObject
   * @returns {Object} new Weapon
   */
  createWeapon: async (weaponObject) => {
    const { count } = await Weapon.findAndCountAll({
      where: {
        name: weaponObject.name,
      },
    });
    if (count) throw new Error(`weapon with name ${weaponObject.name} already exists`);
    return Weapon.create(weaponObject);
  },

  /**
   * @param {Integer} weaponId
   * @returns {Object} Weapon
   */
  getWeapon: async (weaponId) => {
    return Weapon.findByPk(weaponId);
  },

  /**
   * @param {Object} weaponObject
   * @returns {Object} updated Weapon
   */
  updateWeapon: async (weaponObject) => {
    return Weapon.update(weaponObject, {
      where: {
        id: weaponObject.id,
      },
    });
  },

  /**
   * @param {Integer} weaponId
   */
  deleteWeapon: async (weaponId) => {
    const creatureTypeWeapons = await CreatureTypeWeapon.findAll({
      where: {
        weaponId,
      },
    });
    await Promise.allSettled(creatureTypeWeapons.map(async (creatureTypeWeapon) => {
      creatureTypeWeapon.destroy();
    }));
    return Weapon.destroy({
      where: {
        id: weaponId,
      },
    });
  },
};
