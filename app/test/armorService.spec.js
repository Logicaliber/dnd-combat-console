const { assert } = require('chai');

const { Armor, CreatureType } = require('../models');
const armorService = require('../services/armorService');
const { generateDummyCreatureType } = require('./helpers/dummyModelGenerators');

const syncRelevantModels = async () => {
  await Armor.sync({ force: true });
  await CreatureType.sync({ force: true });
};

let expectedArmors = 0;
let armor = null;
let creatureType = null;

describe('Armor Service', () => {
  before(async () => {
    await syncRelevantModels();
  });

  after(async () => {
    await syncRelevantModels();
  });

  describe('createArmor', () => {
    it('Should throw an error if an invalid type is passed', async () => {
      try {
        if ((await armorService.createArmor({
          name: 'name',
          type: 'invalid',
          baseAC: 12,
        }))) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: armor type must be one of: light, medium, heavy, or natural');
      }
    });

    it('Should throw an error if a negative baseAC is passed', async () => {
      try {
        if ((await armorService.createArmor({
          name: 'name',
          type: 'light',
          baseAC: -1,
        }))) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on baseAC failed');
      }
    });

    it('Should create an armor if all valid fields are passed', async () => {
      armor = await armorService.createArmor({
        name: 'Extreme Plate',
        type: 'heavy',
        baseAC: 20,
        disadvantage: true,
      });
      expectedArmors += 1;

      assert.lengthOf((await Armor.findAll()), expectedArmors);

      // Create a creatureType that uses this armor, for use in a later test
      creatureType = await generateDummyCreatureType(
        null, null, null, null, armor.dataValues.id, null, null, 0,
      );
    });

    it('Should throw an error if a duplicate armor name is used', async () => {
      try {
        if ((await armorService.createArmor({
          name: armor.dataValues.name,
          type: 'light',
          baseAC: 12,
        }))) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `Armor with name ${armor.dataValues.name} already exists`);
      }
    });
  });

  describe('getArmor', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await armorService.getArmor('invalid'))) {
          throw new Error('getArmor should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await armorService.getArmor(99999)));
    });

    it('Should return the correct armor for the given id', async () => {
      const result = await armorService.getArmor(armor.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'type', 'baseAC', 'disadvantage', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, armor.dataValues.id);
      assert.equal(result.dataValues.name, armor.dataValues.name);
      assert.equal(result.dataValues.type, armor.dataValues.type);
      assert.equal(result.dataValues.baseAC, armor.dataValues.baseAC);
      assert.equal(result.dataValues.disadvantage, armor.dataValues.disadvantage);
    });
  });

  describe('updateArmor', () => {
    it('Should throw an error if an invalid type is passed', async () => {
      try {
        if ((await armorService.updateArmor(armor.dataValues.id, {
          name: 'Super Extreme Plate',
          type: 'still invalid',
          baseAC: 22,
        }))) throw new Error('updateArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: armor type must be one of: light, medium, heavy, or natural');
      }
    });

    it('Should throw an error if a negative baseAC is passed', async () => {
      try {
        if ((await armorService.updateArmor(armor.dataValues.id, {
          name: 'name',
          type: 'light',
          baseAC: -1,
        }))) throw new Error('updateArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on baseAC failed');
      }
    });

    it('Should update an armor if all valid fields are passed', async () => {
      await armorService.updateArmor(armor.dataValues.id, {
        name: 'Super Extreme Plate',
        type: 'heavy',
        baseAC: 22,
        disadvantage: false,
      });

      // Check that the number of armors hasn't changed
      assert.lengthOf((await Armor.findAll()), expectedArmors);

      // Check that the armor was updated
      await armor.reload();
      assert.equal(armor.dataValues.name, 'Super Extreme Plate');
      assert.equal(armor.dataValues.type, 'heavy');
      assert.equal(armor.dataValues.baseAC, 22);
      assert.equal(armor.dataValues.disadvantage, false);
    });
  });

  describe('deleteArmor', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await armorService.deleteArmor('invalid'))) {
          throw new Error('createArmor should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if ((await armorService.deleteArmor(99999))) throw new Error('deleteArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Armor deletion failed, no armor found with ID: 99999');
      }
    });

    it('Should delete the armor with the given id', async () => {
      await armorService.deleteArmor(armor.dataValues.id);
      expectedArmors -= 1;
      // Check that one armor was deleted
      assert.lengthOf((await Armor.findAll()), expectedArmors);
      // Check that the creatureType using this armor now has no armor
      await creatureType.reload();
      assert.isNull(creatureType.dataValues.armorId);
    });
  });
});
