const { Weapon } = require('../../models');

module.exports = {
  generateDummyWeapon: async (
    name = null,
    damages = null,
    properties = null,
    normalRange = 0,
    longRange = 0,
    attackShape = null,
    save = null,
    saveType = null,
    saveStillHalf = null,
  ) => {
    if (!name) name = 'mace';
    if (!damages) damages = '[{"num":1,"die":6,"bonus":0,"type":"bludgeoning","effect":""}]';
    const weaponExists = await Weapon.findOne({
      where: {
        name,
      },
    });
    if (weaponExists) return weaponExists;
    return Weapon.create({
      name,
      damages,
      properties,
      normalRange,
      longRange,
      attackShape,
      save,
      saveType,
      saveStillHalf,
    });
  },
};
