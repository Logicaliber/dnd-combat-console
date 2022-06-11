const { assert } = require('chai');
const {
  wd, // Weapon Damages
  wp, // Weapon Properties
} = require('../seeders/helpers/seederHelpers');
const weaponService = require('../services/weaponService');
const { MIN_INFORMATION, MAX_INFORMATION } = require('../variables');
const { syncModels } = require('./helpers/modelSync');

const {
  Weapon,
} = require('../models');

const relevantModels = [
  Weapon,
];

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
        if (await weaponService.createWeapon({
          name: 'rubber dagger',
          damages: '["valid json","invalid damages array"]',
        })) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: damage object must be an object, got type string');
      }
    });

    it('Should throw an error if an invalid properties array is passed', async () => {
      try {
        if (await weaponService.createWeapon({
          name: 'rubber dagger',
          properties: '["valid json","invalid properties array"]',
        })) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `Validation error: array elements must be strings of ${MIN_INFORMATION} to ${MAX_INFORMATION} characters, and only lowercase letters or dashes`);
      }
    });

    it('Should create a weapon if all valid fields are passed', async () => {
      weapon = await weaponService.createWeapon({
        name: 'rubber dagger',
        damages: wd.d0.bludgeoning,
        properties: wp.finesseLightThrown,
      });
      expectedWeapons += 1;
      // Check that one weapon was created
      assert.lengthOf(await Weapon.findAll(), expectedWeapons);
    });

    it('Should throw an error if a duplicate weapon name is used', async () => {
      try {
        if (await weaponService.createWeapon({
          name: 'rubber dagger',
          damages: wd.d0.bludgeoning,
          properties: wp.finesse,
        })) throw new Error('createWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon creation failed, a weapon with the given name already exists');
      }
    });
  });

  describe('getWeapon', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await weaponService.getWeapon('invalid'));
      assert.isNull(await weaponService.getWeapon(99999));
    });

    it('Should return the correct weapon for the given id', async () => {
      const result = await weaponService.getWeapon(weapon.id);
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
      assert.equal(values.id, weapon.id);
      assert.equal(values.name, weapon.name);
      assert.equal(values.normalRange, weapon.normalRange);
    });
  });

  describe('updateWeapon', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await weaponService.updateWeapon('invalid', {
          name: 'rubber shortsword',
        })) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon update failed, no weapon found for the given ID');
      }
      try {
        if (await weaponService.updateWeapon(99999, {
          name: 'rubber shortsword',
        })) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon update failed, no weapon found for the given ID');
      }
    });

    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if (await weaponService.updateWeapon(weapon.id, {
          damages: '["valid json","invalid damages array"]',
        })) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: damage object must be an object, got type string');
      }
    });

    it('Should throw an error if an invalid properties array is passed', async () => {
      try {
        if (await weaponService.updateWeapon(weapon.id, {
          properties: '["valid json","invalid properties array"]',
        })) throw new Error('updateWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `Validation error: array elements must be strings of ${MIN_INFORMATION} to ${MAX_INFORMATION} characters, and only lowercase letters or dashes`);
      }
    });

    it('Should update a weapon if all valid fields are passed', async () => {
      await weaponService.updateWeapon(weapon.id, {
        name: 'rubber shortsword',
        damages: wd.d0.bludgeoning,
        properties: wp.finesseLight,
      });
      // Check that the number of weapons hasn't changed
      assert.lengthOf(await Weapon.findAll(), expectedWeapons);
      // Check that the weapon was updated
      await weapon.reload();
      assert.equal(weapon.name, 'rubber shortsword');
    });
  });

  describe('deleteWeapon', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await weaponService.deleteWeapon('invalid')) throw new Error('deleteWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon deletion failed, no weapon found for the given ID');
      }
      try {
        if (await weaponService.deleteWeapon(99999)) throw new Error('deleteWeapon should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Weapon deletion failed, no weapon found for the given ID');
      }
    });

    it('Should delete the weapon with the given id', async () => {
      await weaponService.deleteWeapon(weapon.id);
      expectedWeapons -= 1;
      // Check that one weapon was deleted
      assert.lengthOf(await Weapon.findAll(), expectedWeapons);
    });
  });
});
