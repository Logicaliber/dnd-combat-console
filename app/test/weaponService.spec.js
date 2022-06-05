const { assert } = require('chai');
const weaponService = require('../services/weaponService');
const { MIN_INFORMATION, MAX_INFORMATION } = require('../variables');
const { syncModels } = require('./helpers/modelSync');

const {
  Weapon,
} = require('../models');

const relevantModels = [
  Weapon,
];

const rubberDaggerDamages = '[{"num":1,"die":0,"bonus":0,"type":"bludgeoning","effect":""}]';
let expectedWeapons = 0;
let weapon = null;

describe('Weapon Service', () => {
  before(async () => {
    await syncModels(relevantModels);
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createWeapon', () => {
    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if ((await weaponService.createWeapon({
          name: 'rubber dagger',
          damages: '["valid json","invalid damages array"]',
        }))) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: damage object must be an object, got type string');
      }
    });

    it('Should throw an error if an invalid properties array is passed', async () => {
      try {
        if ((await weaponService.createWeapon({
          name: 'rubber dagger',
          properties: '["valid json","invalid properties array"]',
        }))) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `Validation error: array elements must be strings of ${MIN_INFORMATION} to ${MAX_INFORMATION} characters, and only lowercase letters or dashes`);
      }
    });

    it('Should create a weapon if all valid fields are passed', async () => {
      weapon = await weaponService.createWeapon({
        name: 'rubber dagger',
        damages: rubberDaggerDamages,
        properties: '["finesse","light","thrown"]',
      });
      expectedWeapons += 1;
      // Check that one weapon was created
      assert.lengthOf((await Weapon.findAll()), expectedWeapons);
    });

    it('Should throw an error if a duplicate weapon name is used', async () => {
      try {
        if ((await weaponService.createWeapon({
          name: 'rubber dagger',
          damages: rubberDaggerDamages,
          properties: '["finesse"]',
        }))) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon with name rubber dagger already exists');
      }
    });
  });

  describe('getWeapon', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await weaponService.getWeapon('invalid'))) throw new Error('getWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await weaponService.getWeapon(99999)));
    });

    it('Should return the correct weapon for the given id', async () => {
      const result = await weaponService.getWeapon(weapon.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, weapon.dataValues.id);
      assert.equal(result.dataValues.name, weapon.dataValues.name);
      assert.equal(result.dataValues.normalRange, weapon.dataValues.normalRange);
    });
  });

  describe('updateWeapon', () => {
    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if ((await weaponService.updateWeapon(weapon.dataValues.id, {
          damages: '["valid json","invalid damages array"]',
        }))) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: damage object must be an object, got type string');
      }
    });

    it('Should throw an error if an invalid properties array is passed', async () => {
      try {
        if ((await weaponService.updateWeapon(weapon.dataValues.id, {
          properties: '["valid json","invalid properties array"]',
        }))) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `Validation error: array elements must be strings of ${MIN_INFORMATION} to ${MAX_INFORMATION} characters, and only lowercase letters or dashes`);
      }
    });

    it('Should update a weapon if all valid fields are passed', async () => {
      await weaponService.updateWeapon(weapon.dataValues.id, {
        name: 'rubber shortsword',
        damages: rubberDaggerDamages,
        properties: '["finesse","light"]',
      });
      // Check that the number of weapons hasn't changed
      assert.lengthOf((await Weapon.findAll()), expectedWeapons);
      // Check that the weapon was updated
      await weapon.reload();
      assert.equal(weapon.dataValues.name, 'rubber shortsword');
    });
  });

  describe('deleteWeapon', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await weaponService.deleteWeapon('invalid'))) throw new Error('deleteWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if ((await weaponService.deleteWeapon(99999))) throw new Error('deleteWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon deletion failed, no weapon found with ID: 99999');
      }
    });

    it('Should delete the weapon with the given id', async () => {
      await weaponService.deleteWeapon(weapon.dataValues.id);
      expectedWeapons -= 1;
      // Check that one weapon was deleted
      assert.lengthOf((await Weapon.findAll()), expectedWeapons);
    });
  });
});
