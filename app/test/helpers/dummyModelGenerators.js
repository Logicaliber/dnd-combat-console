const {
  Armor,
  Weapon,
  Spell,
  Creature,
  CreatureType,
  CreatureTypeWeapon,
  CreatureTypeSpell,
} = require('../../models');
const { acidSplash } = require('./fixtures');

module.exports = {
  generateDummyArmor: async (name = null, type = null, baseAC = null, disadvantage = null) => {
    if (!name) name = 'leather';
    if (!type) type = 'light';
    if (!baseAC) baseAC = 11;
    if (!disadvantage) disadvantage = false;
    const armorExists = await Armor.findOne({ where: { name } });
    if (armorExists) return armorExists;
    return Armor.create({
      name, type, baseAC, disadvantage,
    });
  },
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
    const weaponExists = await Weapon.findOne({ where: { name } });
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
  generateDummySpell: async (
    name = null,
    level = null,
    school = null,
    castingTime = null,
    range = null,
    components = null,
    duration = null,
    saveType = null,
    saveStillHalf = null,
    description = null,
    damages = null,
  ) => {
    if (!name) name = 'Acid Splash';
    const spellExists = await Spell.findOne({ where: { name } });
    if (spellExists) return spellExists;
    if (!level) level = 0;
    if (!school) school = 'conjuration';
    if (!castingTime) castingTime = '1 action';
    if (!range) range = 60;
    if (!components) components = 'V; S';
    if (!duration) duration = 'instantaneous';
    if (!saveType) saveType = 'dex';
    if (!saveStillHalf) saveStillHalf = false;
    if (!description) description = acidSplash.description;
    if (!damages) damages = acidSplash.damages;
    return Spell.create({
      name,
      level,
      school,
      castingTime,
      range,
      components,
      duration,
      saveType,
      saveStillHalf,
      description,
      damages,
    });
  },
  generateDummyCreatureType: async (
    name = null,
    hitDie = null,
    numDice = null,
    maxHP = null,
    armorId = null,
    actionPatterns = null,
    weaponId = 0,
    spellId = 0,
  ) => {
    if (!name) name = 'dog';
    const creatureTypeExists = await CreatureType.findOne({ where: { name } });
    if (creatureTypeExists) return creatureTypeExists;
    if (!hitDie) hitDie = 6;
    if (!numDice) numDice = 1;
    if (!maxHP) maxHP = 4;
    if (!armorId) armorId = (await module.exports.generateDummyArmor()).dataValues.id;
    // If neither weaponId or spellId are passed, just use a weapon
    if (weaponId === null) weaponId = (await module.exports.generateDummyWeapon()).dataValues.id;
    else if (spellId === null) spellId = (await module.exports.generateDummySpell()).dataValues.id;
    if (!actionPatterns) {
      actionPatterns = `[[{"other":"","restrictions":"","spellId":${spellId},"times":1,"weaponId":${weaponId}}]]`;
    }
    const creatureType = await CreatureType.create({
      name,
      hitDie,
      numDice,
      maxHP,
      armorId,
      actionPatterns,
    });
    if (weaponId) {
      await CreatureTypeWeapon.create({
        creatureTypeId: creatureType.dataValues.id,
        weaponId,
      });
    }
    if (spellId) {
      await CreatureTypeSpell.create({
        creatureTypeId: creatureType.dataValues.id,
        spellId,
      });
    }
    return creatureType;
  },
  generateDummyCreature: async (name = null, creatureTypeId = null, maxHP = null) => {
    let creatureTypeName;
    let creatureTypeMaxHP;
    if (!creatureTypeId) {
      ({
        id: creatureTypeId, name: creatureTypeName, maxHP: creatureTypeMaxHP,
      } = (await module.exports.generateDummyCreatureType()));
    }
    if (!name) name = `${creatureTypeName} 1`;
    const creatureExists = await Creature.findOne({
      where: { name },
      include: [{
        model: CreatureType,
        as: 'creatureType',
      }],
    });
    if (creatureExists) return creatureExists;
    if (!maxHP) maxHP = creatureTypeMaxHP;
    const creatureId = (await Creature.create({
      name,
      creatureTypeId,
      maxHP,
    })).dataValues.id;
    return Creature.findByPk(creatureId, {
      include: [{
        model: CreatureType,
        as: 'creatureType',
      }],
    });
  },
};
