const { assert } = require('chai');

const { CreatureType, CreatureTypeWeapon, Weapon } = require('../models');
const weaponService = require('../services/weaponService');

const syncRelevantModels = async () => {
  await Weapon.sync({ force: true });
  await CreatureType.sync({ force: true });
  await CreatureTypeWeapon.sync({ force: true });
};

let expectedWeapons = 0;
let weapon = null;

describe('Weapon Service', () => {
  before(async () => {
    await syncRelevantModels();
  });

  after(async () => {
    await syncRelevantModels();
  });

  describe('createWeapon', () => {
    it('should throw an error if an invalid damages is passed', async () => {
      try {
        const result = await weaponService.createWeapon({
          name: 'rubber dagger',
          damages: '["valid json","invalid damages array"]',
        });
        if (result) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: damage object must be an object');
      }
    });

    it('should throw an error if an invalid properties array is passed', async () => {
      try {
        const result = await weaponService.createWeapon({
          name: 'rubber dagger',
          properties: '["valid json","invalid properties array"]',
        });
        if (result) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: array elements must be strings of lowercase letters or dashes');
      }
    });

    it('should create a weapon if all valid fields are passed', async () => {
      weapon = await weaponService.createWeapon({
        name: 'rubber dagger',
        damages: '[{"num":1,"die":0,"bonus":0,"type":"bludgeoning","effect":""}]',
        properties: '["finesse","light","thrown"]',
      });
      expectedWeapons += 1;

      assert.lengthOf((await Weapon.findAll()), expectedWeapons);
    });

    it('should throw an error if a duplicate weapon name is used', async () => {
      try {
        const result = await weaponService.createWeapon({
          name: 'rubber dagger',
          damages: '[{"num":1,"die":0,"bonus":0,"type":"bludgeoning","effect":""}]',
          properties: '["finesse"]',
        });
        if (result) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'weapon with name rubber dagger already exists');
      }
    });
  });

  describe('getWeapon', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await weaponService.getWeapon('invalid');
        if (result) throw new Error('getWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return null if a non-existant id is passed', async () => {
      const result = await weaponService.getWeapon(99999);
      assert.isNull(result);
    });

    it('should return the correct weapon for the given id', async () => {
      const result = await weaponService.getWeapon(weapon.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, weapon.id);
      assert.equal(result.dataValues.name, weapon.name);
      assert.equal(result.dataValues.normalRange, weapon.normalRange);
    });
  });

  describe('updateWeapon', () => {
    it('should throw an error if an invalid damages is passed', async () => {
      try {
        const result = await weaponService.updateWeapon({
          id: weapon.id,
          damages: '["valid json","invalid damages array"]',
        });
        if (result) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: damage object must be an object');
      }
    });

    it('should throw an error if an invalid properties array is passed', async () => {
      try {
        const result = await weaponService.updateWeapon({
          id: weapon.id,
          properties: '["valid json","invalid properties array"]',
        });
        if (result) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: array elements must be strings of lowercase letters or dashes');
      }
    });

    it('should update a weapon if all valid fields are passed', async () => {
      await weaponService.updateWeapon({
        id: weapon.id,
        name: 'rubber shortsword',
        damages: '[{"num":1,"die":0,"bonus":0,"type":"bludgeoning","effect":""}]',
        properties: '["finesse","light"]',
      });

      assert.lengthOf((await Weapon.findAll()), expectedWeapons);

      await weapon.reload();

      assert.equal(weapon.name, 'rubber shortsword');
    });
  });

  describe('deleteWeapon', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await weaponService.deleteWeapon('invalid');
        if (result) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return 0 if the id is non-existant', async () => {
      const result = await weaponService.deleteWeapon(99999);
      assert.equal(result, 0);
    });

    it('should delete the weapon with the given id', async () => {
      await weaponService.deleteWeapon(weapon.id);
      expectedWeapons -= 1;
      assert.lengthOf((await Weapon.findAll()), expectedWeapons);
    });
  });
});
