const {
  Weapon,
  CreatureType,
  CreatureTypeWeapon,
} = require('../../models');

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
  generateDummyCreatureType: async (
    name = null,
    hitDie = null,
    numDice = null,
    maxHP = null,
    actionPatterns = null,
    weaponId = null,
  ) => {
    if (!name) name = 'dog';
    const creatureTypeExists = await CreatureType.findOne({ where: { name } });
    if (creatureTypeExists) return creatureTypeExists;
    if (!hitDie) hitDie = 6;
    if (!numDice) numDice = 1;
    if (!maxHP) maxHP = 4;
    if (!weaponId) weaponId = (await module.exports.generateDummyWeapon()).dataValues.id;
    if (!actionPatterns) {
      actionPatterns = `[[{"other":"","restrictions":"","spellId":0,"times":1,"weaponId":${weaponId}}]]`;
    }
    const creatureType = await CreatureType.create({
      name,
      hitDie,
      numDice,
      maxHP,
      actionPatterns,
    });
    await CreatureTypeWeapon.create({
      creatureTypeId: creatureType.dataValues.id,
      weaponId,
    });
    return creatureType;
  },
};
