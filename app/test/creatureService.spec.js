const { assert } = require('chai');

const {
  CreatureType,
  Creature,
} = require('../models');
const creatureService = require('../services/creatureService');
const { generateDummyWeapon, generateDummyCreatureType } = require('./helpers/dummyModelGenerators');
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
    const biteId = (await generateDummyWeapon('bite', '[{"num":1,"die":4,"bonus":0,"type":"piercing","effect":""}]')).dataValues.id;
    validActionPatterns = `[[{"other":"","restrictions":"","spellId":0,"times":1,"weaponId":${biteId}}]]`;
    creatureTypeId = (await generateDummyCreatureType('dog', null, null, null, null, validActionPatterns, biteId, 0)
    ).dataValues.id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createCreature', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if ((await creatureService.createCreature({
          name: 'cat',
        }))) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Creature creation failed, fields missing: creatureTypeId,maxHP');
      }
    });

    it('Should throw an error if an invalid maxHP is passed', async () => {
      try {
        if ((await creatureService.createCreature({
          name: 'name',
          maxHP: 'invalid',
          creatureTypeId,
        }))) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should create a creature if all valid fields are passed', async () => {
      creature = await creatureService.createCreature({
        name: 'dog',
        maxHP: 4,
        creatureTypeId,
      });
      expectedCreatures += 1;
      // Check that one creature was created
      assert.lengthOf((await Creature.findAll()), expectedCreatures);
    });

    it('Should throw an error if a duplicate creature name is used', async () => {
      try {
        if ((await creatureService.createCreature({
          name: 'dog',
          maxHP: 4,
          creatureTypeId,
        }))) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Creature with name dog already exists');
      }
    });
  });

  describe('getCreature', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await creatureService.getCreature('invalid'))) {
          throw new Error('getCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await creatureService.getCreature(99999)));
    });

    it('Should return the correct creature for the given id', async () => {
      const result = await creatureService.getCreature(creature.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'creatureTypeId', 'name', 'maxHP', 'currentHP', 'currentLegendaryResistances', 'slotsFirst', 'slotsSecond', 'slotsThird', 'slotsFourth', 'slotsFifth', 'slotsSixth', 'slotsSeventh', 'slotsEigth', 'slotsNinth', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, creature.dataValues.id);
      assert.equal(result.dataValues.name, creature.dataValues.name);
      assert.equal(result.dataValues.maxHP, creature.dataValues.maxHP);
    });
  });

  describe('updateCreature', () => {
    it('Should update a creature if all valid fields are passed', async () => {
      await creatureService.updateCreature(creature.dataValues.id, {
        name: 'big dog',
        maxHP: 26,
      });
      // Check that the creature was updated
      await creature.reload();
      assert.equal(creature.dataValues.name, 'big dog');
      assert.equal(creature.dataValues.maxHP, 26);
    });
  });

  describe('deleteCreature', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await creatureService.deleteCreature('invalid'))) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if (await creatureService.deleteCreature(99999)) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature deletion failed, no creature found with ID: 99999');
      }
    });

    it('Should delete the creature with the given id', async () => {
      await creatureService.deleteCreature(creature.dataValues.id);
      expectedCreatures -= 1;
      // Check that one creature was deleted
      assert.lengthOf((await Creature.findAll()), expectedCreatures);
    });
  });
});
