const { assert } = require('chai');
const armorService = require('../services/armorService');
const { generateCreatureType } = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  Armor,
  CreatureType,
} = require('../models');

const relevantModels = [
  Armor,
  CreatureType,
];

let expectedArmors = 0;
let armor = null;
let creatureType = null;

describe('Armor Service', () => {
  before(async () => {
    await syncModels(relevantModels);
  });

  after(async () => {
    await syncModels(relevantModels);
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
      creatureType = await generateCreatureType(null, null, null, null, armor.id, null, null, 0);
    });

    it('Should throw an error if a duplicate armor name is used', async () => {
      try {
        if ((await armorService.createArmor({
          name: armor.name,
          type: 'light',
          baseAC: 12,
        }))) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Armor creation failed, an armor with the given name already exists');
      }
    });
  });

  describe('getArmor', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await armorService.getArmor('invalid'));
      assert.isNull(await armorService.getArmor(99999));
    });

    it('Should return the correct armor for the given id', async () => {
      const result = await armorService.getArmor(armor.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'type', 'baseAC', 'disadvantage', 'createdAt', 'updatedAt']);
      assert.equal(result.id, armor.id);
      assert.equal(result.name, armor.name);
      assert.equal(result.type, armor.type);
      assert.equal(result.baseAC, armor.baseAC);
      assert.equal(result.disadvantage, armor.disadvantage);
    });
  });

  describe('updateArmor', () => {
    it('Should throw an error if an invalid type is passed', async () => {
      try {
        if ((await armorService.updateArmor(armor.id, {
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
        if ((await armorService.updateArmor(armor.id, {
          name: 'name',
          type: 'light',
          baseAC: -1,
        }))) throw new Error('updateArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on baseAC failed');
      }
    });

    it('Should update an armor if all valid fields are passed', async () => {
      await armorService.updateArmor(armor.id, {
        name: 'Super Extreme Plate',
        type: 'heavy',
        baseAC: 22,
        disadvantage: false,
      });

      // Check that the number of armors hasn't changed
      assert.lengthOf((await Armor.findAll()), expectedArmors);

      // Check that the armor was updated
      await armor.reload();
      assert.equal(armor.name, 'Super Extreme Plate');
      assert.equal(armor.type, 'heavy');
      assert.equal(armor.baseAC, 22);
      assert.equal(armor.disadvantage, false);
    });
  });

  describe('deleteArmor', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await armorService.deleteArmor('invalid')) {
          throw new Error('createArmor should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Armor deletion failed, no armor found for the given ID');
      }
      try {
        if (await armorService.deleteArmor(99999)) {
          throw new Error('deleteArmor should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Armor deletion failed, no armor found for the given ID');
      }
    });

    it('Should delete the armor with the given id, and set any creatureTypes using this armor to have armorId: null', async () => {
      await armorService.deleteArmor(armor.id);
      expectedArmors -= 1;
      // Check that one armor was deleted
      assert.lengthOf((await Armor.findAll()), expectedArmors);
      // Check that the creatureType using this armor now has no armor
      await creatureType.reload();
      assert.isNull(creatureType.armorId);
    });
  });
});
