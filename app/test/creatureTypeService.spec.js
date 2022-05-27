const { assert } = require('chai');

const {
  Weapon,
  Armor,
  Spell,
  CreatureType,
  Creature,
  CreatureTypeSpell,
  CreatureTypeWeapon,
} = require('../models');
const creatureTypeService = require('../services/creatureTypeService');
const generators = require('./helpers/dummyModelGenerators');
const { syncModels } = require('./helpers/modelSync');

const relevantModels = [
  Weapon,
  Armor,
  Spell,
  CreatureType,
  Creature,
  CreatureTypeSpell,
  CreatureTypeWeapon,
];

let validActionPatterns;
let bite;
let expectedCreatureTypes = 0;
let creatureType = null;

describe('CreatureType Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    bite = await generators.generateDummyWeapon('bite', '[{"num":1,"die":4,"bonus":0,"type":"piercing","effect":""}]');
    validActionPatterns = `[[{"other":"","restrictions":"","spellId":0,"times":1,"weaponId":${bite.dataValues.id}}]]`;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createCreatureType', () => {
    it('should throw an error if required fields are missing', async () => {
      try {
        const result = await creatureTypeService.createCreatureType({
          name: 'dog',
        });
        if (result) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'creatureType creation failed, fields missing: hitDie,numDice,maxHP,actionPatterns');
      }
    });

    it('should throw an error if an invalid size is passed', async () => {
      try {
        const result = await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'invalid',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: validActionPatterns,
        });
        if (result) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: creatureType size must be one of tiny, small, medium, large, huge, or gargantuan');
      }
    });

    it('should create a creatureType if all valid fields are passed', async () => {
      creatureType = await creatureTypeService.createCreatureType({
        name: 'dog',
        size: 'medium',
        hitDie: 6,
        numDice: 1,
        maxHP: 4,
        actionPatterns: validActionPatterns,
      });
      expectedCreatureTypes += 1;

      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);
    });

    it('should throw an error if a duplicate creatureType name is used', async () => {
      try {
        const result = await creatureTypeService.createCreatureType({
          name: 'dog',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: validActionPatterns,
        });
        if (result) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'creatureType with name dog already exists');
      }
    });
  });

  describe('getCreatureType', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await creatureTypeService.getCreatureType('invalid');
        if (result) throw new Error('getCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return null if a non-existant id is passed', async () => {
      const result = await creatureTypeService.getCreatureType(99999);
      assert.isNull(result);
    });

    it('should return the correct creatureType for the given id', async () => {
      const result = await creatureTypeService.getCreatureType(creatureType.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'size', 'type', 'tags', 'alignment', 'armorId', 'hasShield', 'hitDie', 'numDice', 'maxHP', 'speed', 'flySpeed', 'swimSpeed', 'climbSpeed', 'burrowSpeed', 'hover', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'savingThrows', 'skills', 'resistances', 'senses', 'passivePerception', 'languages', 'challengeRating', 'proficiencyBonus', 'legendaryResistances', 'specialAbilities', 'spellcasting', 'spellSlots', 'innateSpells', 'actionPatterns', 'legendaryActions', 'reactions', 'lairActions', 'regionalEffects']);
      assert.equal(result.dataValues.id, creatureType.dataValues.id);
      assert.equal(result.dataValues.name, creatureType.dataValues.name);
      assert.equal(result.dataValues.hitDie, creatureType.dataValues.hitDie);
      assert.equal(result.dataValues.numDice, creatureType.dataValues.numDice);
      assert.equal(result.dataValues.maxHP, creatureType.dataValues.maxHP);
      assert.deepEqual(result.dataValues.actionPatterns, creatureType.dataValues.actionPatterns);
    });
  });

  describe('updateCreatureType', () => {
    it('should throw an error if an invalid actionPatterns is passed', async () => {
      try {
        const result = await creatureTypeService.updateCreatureType(creatureType.dataValues.id, {
          name: 'dog',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: 'invalid',
        });
        if (result) throw new Error('updateCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: action patterns array must be an array');
      }
    });

    it('should update a creatureType if all valid fields are passed', async () => {
      await creatureTypeService.updateCreatureType(creatureType.dataValues.id, {
        name: 'big dog',
        hitDie: 12,
        numDice: 4,
        maxHP: 26,
      });

      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);

      await creatureType.reload();

      assert.equal(creatureType.dataValues.name, 'big dog');
      assert.equal(creatureType.dataValues.hitDie, 12);
      assert.equal(creatureType.dataValues.numDice, 4);
      assert.equal(creatureType.dataValues.maxHP, 26);
    });
  });

  describe('deleteCreatureType', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await creatureTypeService.deleteCreatureType('invalid');
        if (result) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return 0 if the id is non-existant', async () => {
      const result = await creatureTypeService.deleteCreatureType(99999);
      assert.equal(result, 0);
    });

    it('should delete the creatureType with the given id', async () => {
      await creatureTypeService.deleteCreatureType(creatureType.dataValues.id);
      expectedCreatureTypes -= 1;
      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);
    });
  });
});
