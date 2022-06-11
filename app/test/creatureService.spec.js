const { assert } = require('chai');
const creatureService = require('../services/creatureService');
const {
  generateCreatureType,
} = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  CreatureType,
  Creature,
} = require('../models');

const relevantModels = [
  CreatureType,
  Creature,
];

let expectedCreatures = 0;
let creature = null;
let creatureTypeId = null;

describe('Creature Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    creatureTypeId = (await generateCreatureType('dog')).id;
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
        assert.equal(error.message, 'Creature creation failed, a creature with the given name already exists');
      }
    });
  });

  describe('getCreature', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull((await creatureService.getCreature('invalid')));
      assert.isNull((await creatureService.getCreature(99999)));
    });

    it('Should return the correct creature for the given id, with its creatureType', async () => {
      const result = await creatureService.getCreature(creature.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'creatureTypeId', 'name', 'maxHP', 'currentHP', 'currentLegendaryResistances', 'slotsFirst', 'slotsSecond', 'slotsThird', 'slotsFourth', 'slotsFifth', 'slotsSixth', 'slotsSeventh', 'slotsEigth', 'slotsNinth', 'createdAt', 'updatedAt', 'creatureType']);
      assert.equal(result.id, creature.id);
      assert.equal(result.name, creature.name);
      assert.equal(result.maxHP, creature.maxHP);
    });
  });

  describe('updateCreature', () => {
    it('Should update a creature if all valid fields are passed', async () => {
      await creatureService.updateCreature(creature.id, {
        name: 'big dog',
        maxHP: 26,
      });
      // Check that the creature was updated
      await creature.reload();
      assert.equal(creature.name, 'big dog');
      assert.equal(creature.maxHP, 26);
    });
  });

  describe('deleteCreature', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await creatureService.deleteCreature('invalid'))) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature deletion failed, no creature found for the given ID');
      }
      try {
        if (await creatureService.deleteCreature(99999)) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature deletion failed, no creature found for the given ID');
      }
    });

    it('Should delete the creature with the given id', async () => {
      await creatureService.deleteCreature(creature.id);
      expectedCreatures -= 1;
      // Check that one creature was deleted
      assert.lengthOf((await Creature.findAll()), expectedCreatures);
    });
  });
});
