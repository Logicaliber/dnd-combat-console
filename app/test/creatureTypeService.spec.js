const { assert } = require('chai');

const {
  Weapon,
  Armor,
  Spell,
  CreatureType,
  CreatureTypeSpell,
  CreatureTypeWeapon,
  Creature,
} = require('../models');
const creatureTypeService = require('../services/creatureTypeService');
const {
  generateDummyArmor, generateDummyWeapon, generateDummySpell, generateDummyCreature,
} = require('./helpers/dummyModelGenerators');
const { syncModels } = require('./helpers/modelSync');

const relevantModels = [
  Weapon,
  Armor,
  Spell,
  CreatureType,
  CreatureTypeSpell,
  CreatureTypeWeapon,
  Creature,
];

let armorId;
let biteId;
let spellId;
let validActionPatterns;
let creatureType = null;
let expectedCreatureTypes = 0;
let expectedCreatureTypeWeapons = 0;
let expectedCreatureTypeSpells = 0;
let expectedCreatures = 0;

describe('CreatureType Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    armorId = (await generateDummyArmor('fur', 'natural', 9)).dataValues.id;
    biteId = (await generateDummyWeapon('bite', '[{"num":1,"die":4,"bonus":0,"type":"piercing","effect":""}]')).dataValues.id;
    spellId = (await generateDummySpell()).dataValues.id;
    validActionPatterns = `[[{"other":"","restrictions":"","spellId":0,"times":1,"weaponId":${biteId}}],[{"other":"","restrictions":"","spellId":${spellId},"times":1,"weaponId":0}]]`;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createCreatureType', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if ((await creatureTypeService.createCreatureType({
          name: 'dog',
        }))) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation failed, fields missing: hitDie,numDice,maxHP,actionPatterns');
      }
    });

    it('Should throw an error if an invalid size is passed', async () => {
      try {
        if ((await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'invalid',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: validActionPatterns,
        }))) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: creatureType size must be one of tiny, small, medium, large, huge, or gargantuan');
      }
    });

    it('Should throw an error if an invalid armorId is passed', async () => {
      try {
        if ((await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          armorId: 1234,
          actionPatterns: validActionPatterns,
        }))) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation "name" failed, unable to find Armor with ID: 1234');
      }
    });

    it('Should throw an error if invalid spellIds are passed', async () => {
      try {
        if ((await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: validActionPatterns,
        }, null, [1234]))) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation "name" failed, unable to find Spells with IDs: 1234');
      }
    });

    it('Should throw an error if invalid weaponIds are passed', async () => {
      try {
        if ((await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: validActionPatterns,
        }, [1234]))) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation "name" failed, unable to find Weapons with IDs: 1234');
      }
    });

    it('Should create a creatureType if all valid fields are passed', async () => {
      creatureType = await creatureTypeService.createCreatureType({
        name: 'dog',
        size: 'medium',
        hitDie: 6,
        numDice: 1,
        maxHP: 4,
        armorId,
        actionPatterns: validActionPatterns,
      }, [biteId], [spellId]);
      expectedCreatureTypes += 1;
      expectedCreatureTypeWeapons += 1;
      expectedCreatureTypeSpells += 1;
      // Check that one creatureType was created
      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);
      // Check that one creatureTypeWeapon was created
      assert.lengthOf((await CreatureTypeWeapon.findAll()), expectedCreatureTypeWeapons);
      // Check that one creatureTypeSpell was created
      assert.lengthOf((await CreatureTypeSpell.findAll()), expectedCreatureTypeSpells);
      // Check that the creatureType has the correct armor
      assert.equal(creatureType.dataValues.armor.dataValues.id, armorId);
      assert.equal(creatureType.dataValues.armor.dataValues.name, 'fur');

      // Create a creature that is this creatureType, for use in the deleteCreatureType tests
      await generateDummyCreature(null, creatureType.dataValues.id);
      expectedCreatures += 1;
    });

    it('Should throw an error if a duplicate creatureType name is used', async () => {
      try {
        if ((await creatureTypeService.createCreatureType({
          name: 'dog',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: validActionPatterns,
        }))) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType with name "dog" already exists');
      }
    });
  });

  describe('getCreatureType', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await creatureTypeService.getCreatureType('invalid'))) throw new Error('getCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await creatureTypeService.getCreatureType(99999)));
    });

    it('Should return the correct creatureType for the given id', async () => {
      const result = await creatureTypeService.getCreatureType(creatureType.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'size', 'type', 'tags', 'alignment', 'armorId', 'hasShield', 'hitDie', 'numDice', 'maxHP', 'speed', 'flySpeed', 'swimSpeed', 'climbSpeed', 'burrowSpeed', 'hover', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'savingThrows', 'skills', 'resistances', 'senses', 'passivePerception', 'languages', 'challengeRating', 'proficiencyBonus', 'legendaryResistances', 'specialAbilities', 'spellcasting', 'spellSlots', 'innateSpells', 'actionPatterns', 'legendaryActions', 'reactions', 'lairActions', 'regionalEffects', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, creatureType.dataValues.id);
      assert.equal(result.dataValues.name, creatureType.dataValues.name);
      assert.equal(result.dataValues.hitDie, creatureType.dataValues.hitDie);
      assert.equal(result.dataValues.numDice, creatureType.dataValues.numDice);
      assert.equal(result.dataValues.maxHP, creatureType.dataValues.maxHP);
      assert.deepEqual(result.dataValues.actionPatterns, creatureType.dataValues.actionPatterns);
    });
  });

  describe('updateCreatureType', () => {
    it('Should throw an error if an invalid actionPatterns is passed', async () => {
      try {
        const result = await creatureTypeService.updateCreatureType(creatureType.dataValues.id, {
          name: 'dog',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          actionPatterns: '{"validJson":"invalidArray"}',
        });
        if (result) throw new Error('updateCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: action patterns array must be an array');
      }
    });

    it('Should update a creatureType if all valid fields are passed', async () => {
      await creatureTypeService.updateCreatureType(creatureType.dataValues.id, {
        name: 'big dog',
        hitDie: 12,
        numDice: 4,
        maxHP: 26,
      });
      // Check that no new creatureType was created
      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);
      // Check that the creatureType was updated
      await creatureType.reload();
      assert.equal(creatureType.dataValues.name, 'big dog');
      assert.equal(creatureType.dataValues.hitDie, 12);
      assert.equal(creatureType.dataValues.numDice, 4);
      assert.equal(creatureType.dataValues.maxHP, 26);
    });
  });

  describe('deleteCreatureType', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await creatureTypeService.deleteCreatureType('invalid'))) {
          throw new Error('deleteCreatureType should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if ((await creatureTypeService.deleteCreatureType(99999))) {
          throw new Error('deleteCreatureType should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'CreatureType deletion failed, no creatureType found with ID: 99999');
      }
    });

    it('Should delete the creatureType with the given id, as well as all related creatures, and all creatureTypeWeapon and creatureTypeSpell associations', async () => {
      await creatureTypeService.deleteCreatureType(creatureType.dataValues.id);
      expectedCreatureTypes -= 1;
      expectedCreatureTypeSpells -= 1;
      expectedCreatureTypeWeapons -= 1;
      expectedCreatures -= 1;
      // Check that one creatureType was deleted
      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);
      // Check that one creatureTypeWeapon was deleted
      assert.lengthOf((await CreatureTypeWeapon.findAll()), expectedCreatureTypeWeapons);
      // Check that one creatureTypeSpell was deleted
      assert.lengthOf((await CreatureTypeSpell.findAll()), expectedCreatureTypeSpells);
      // Check that one creatureType was deleted
      assert.lengthOf((await Creature.findAll()), expectedCreatures);
    });
  });
});
