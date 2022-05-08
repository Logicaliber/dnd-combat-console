const { assert } = require('chai');

const { Armor, CreatureType } = require('../models');
const armorService = require('../services/armorService');

const syncAllModels = async () => {
  await Armor.sync({ force: true });
  await CreatureType.sync({ force: true });
};

describe('Armor Service', () => {
  before(async () => {
    await syncAllModels();
  });

  after(async () => {
    await syncAllModels();
  });

  describe('createArmor', () => {
    it('should throw an error if an invalid type is passed', async () => {
      try {
        const armor = await armorService.createArmor({
          name: 'name',
          type: 'invalid',
          baseAC: 12,
        });
        if (armor) throw new Error('createArmor should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation isIn on type failed');
      }
    });
  });

  describe('getArmor', () => {
    it('should return true', () => {
      assert.isString('string');
    });
  });

  describe('updateArmor', () => {
    it('should return true', () => {
      assert.isString('string');
    });
  });

  describe('deleteArmor', () => {
    it('should return true', () => {
      assert.isString('string');
    });
  });
});
