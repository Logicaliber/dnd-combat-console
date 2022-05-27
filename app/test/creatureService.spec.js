const { assert } = require('chai');

const {
  CreatureType,
  Creature,
} = require('../models');
const creatureService = require('../services/creatureService');
const generators = require('./helpers/dummyModelGenerators');
const { syncModels } = require('./helpers/modelSync');

const relevantModels = [
  CreatureType,
  Creature,
];

let validActionPatterns;
let expectedCreatures = 0;
let creature = null;
let creatureTypeId = null;

describe('Creature Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    const biteId = (await generators.generateDummyWeapon('bite', '[{"num":1,"die":4,"bonus":0,"type":"piercing","effect":""}]')).dataValues.id;
    validActionPatterns = `[[{"other":"","restrictions":"","spellId":0,"times":1,"weaponId":${biteId}}]]`;
    creatureTypeId = (await generators
      .generateDummyCreatureType('dog', null, null, null, validActionPatterns, biteId)
    ).dataValues.id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createCreature', () => {
    it('should throw an error if required fields are missing', async () => {
      try {
        const result = await creatureService.createCreature({
          name: 'cat',
        });
        if (result) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'creature creation failed, fields missing: creatureTypeId,maxHP');
      }
    });

    it('should throw an error if an invalid maxHP is passed', async () => {
      try {
        const result = await creatureService.createCreature({
          name: 'name',
          maxHP: 'invalid',
          creatureTypeId,
        });
        if (result) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should create a creature if all valid fields are passed', async () => {
      creature = await creatureService.createCreature({
        name: 'dog',
        maxHP: 4,
        creatureTypeId,
      });
      expectedCreatures += 1;

      assert.lengthOf((await Creature.findAll()), expectedCreatures);
    });

    it('should throw an error if a duplicate creature name is used', async () => {
      try {
        const result = await creatureService.createCreature({
          name: 'dog',
          maxHP: 4,
          creatureTypeId,
        });
        if (result) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'creature with name dog already exists');
      }
    });
  });

  describe('getCreature', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await creatureService.getCreature('invalid');
        if (result) throw new Error('getCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return null if a non-existant id is passed', async () => {
      const result = await creatureService.getCreature(99999);
      assert.isNull(result);
    });

    it('should return the correct creature for the given id', async () => {
      const result = await creatureService.getCreature(creature.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'creatureTypeId', 'name', 'maxHP', 'currentHP', 'currentLegendaryResistances', 'slotsFirst', 'slotsSecond', 'slotsThird', 'slotsFourth', 'slotsFifth', 'slotsSixth', 'slotsSeventh', 'slotsEigth', 'slotsNinth', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, creature.dataValues.id);
      assert.equal(result.dataValues.name, creature.dataValues.name);
      assert.equal(result.dataValues.maxHP, creature.dataValues.maxHP);
    });
  });

  describe('updateCreature', () => {
    it('should update a creature if all valid fields are passed', async () => {
      await creatureService.updateCreature(creature.dataValues.id, {
        name: 'big dog',
        maxHP: 26,
      });

      assert.lengthOf((await Creature.findAll()), expectedCreatures);

      await creature.reload();

      assert.equal(creature.dataValues.name, 'big dog');
      assert.equal(creature.dataValues.maxHP, 26);
    });
  });

  describe('deleteCreature', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await creatureService.deleteCreature('invalid');
        if (result) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return 0 if the id is non-existant', async () => {
      const result = await creatureService.deleteCreature(99999);
      assert.equal(result, 0);
    });

    it('should delete the creature with the given id', async () => {
      await creatureService.deleteCreature(creature.dataValues.id);
      expectedCreatures -= 1;
      assert.lengthOf((await Creature.findAll()), expectedCreatures);
    });
  });
});
