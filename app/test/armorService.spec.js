const { assert } = require('chai');

const { Armor, CreatureType } = require('../models');
const armorService = require('../services/armorService');

const syncRelevantModels = async () => {
  await Armor.sync({ force: true });
  await CreatureType.sync({ force: true });
};

let expectedArmors = 0;
let armor = null;

describe('Armor Service', () => {
  before(async () => {
    await syncRelevantModels();
  });

  after(async () => {
    await syncRelevantModels();
  });

  describe('createArmor', () => {
    it('should throw an error if an invalid type is passed', async () => {
      try {
        const result = await armorService.createArmor({
          name: 'name',
          type: 'invalid',
          baseAC: 12,
        });
        if (result) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: armor type must be one of: light, medium, heavy, or natural');
      }
    });

    it('should throw an error if a negative baseAC is passed', async () => {
      try {
        const result = await armorService.createArmor({
          name: 'name',
          type: 'light',
          baseAC: -1,
        });
        if (result) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on baseAC failed');
      }
    });

    it('should create an armor if all valid fields are passed', async () => {
      armor = await armorService.createArmor({
        name: 'Extreme Plate',
        type: 'heavy',
        baseAC: 20,
        disadvantage: true,
      });
      expectedArmors += 1;

      assert.lengthOf((await Armor.findAll()), expectedArmors);
    });

    it('should throw an error if a duplicate armor name is used', async () => {
      try {
        const result = await armorService.createArmor({
          name: 'Extreme Plate',
          type: 'light',
          baseAC: 12,
        });
        if (result) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'armor with name Extreme Plate already exists');
      }
    });
  });

  describe('getArmor', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await armorService.getArmor('invalid');
        if (result) throw new Error('getArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return null if a non-existant id is passed', async () => {
      const result = await armorService.getArmor(99999);
      assert.isNull(result);
    });

    it('should return the correct armor for the given id', async () => {
      const result = await armorService.getArmor(armor.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'type', 'baseAC', 'disadvantage', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, armor.id);
      assert.equal(result.dataValues.name, armor.name);
      assert.equal(result.dataValues.type, armor.type);
      assert.equal(result.dataValues.baseAC, armor.baseAC);
      assert.equal(result.dataValues.disadvantage, armor.disadvantage);
    });
  });

  describe('updateArmor', () => {
    it('should throw an error if an invalid type is passed', async () => {
      try {
        const result = await armorService.updateArmor({
          id: armor.id,
          name: 'Super Extreme Plate',
          type: 'still invalid',
          baseAC: 22,
        });
        if (result) throw new Error('updateArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: armor type must be one of: light, medium, heavy, or natural');
      }
    });

    it('should throw an error if a negative baseAC is passed', async () => {
      try {
        const result = await armorService.updateArmor({
          id: armor.id,
          name: 'name',
          type: 'light',
          baseAC: -1,
        });
        if (result) throw new Error('updateArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on baseAC failed');
      }
    });

    it('should update an armor if all valid fields are passed', async () => {
      await armorService.updateArmor({
        id: armor.id,
        name: 'Super Extreme Plate',
        type: 'heavy',
        baseAC: 22,
        disadvantage: false,
      });

      assert.lengthOf((await Armor.findAll()), expectedArmors);

      await armor.reload();

      assert.equal(armor.name, 'Super Extreme Plate');
      assert.equal(armor.type, 'heavy');
      assert.equal(armor.baseAC, 22);
      assert.equal(armor.disadvantage, false);
    });
  });

  describe('deleteArmor', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await armorService.deleteArmor('invalid');
        if (result) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return 0 if the id is non-existant', async () => {
      const result = await armorService.deleteArmor(99999);
      assert.equal(result, 0);
    });

    it('should delete the armor with the given id', async () => {
      await armorService.deleteArmor(armor.id);
      expectedArmors -= 1;
      assert.lengthOf((await Armor.findAll()), expectedArmors);
    });
  });
});
