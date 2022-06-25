const { assert } = require('chai');
const {
  wd, // Weapon Damages
} = require('../seeders/helpers/seederHelpers');
const actionService = require('../services/actionService');
const {
  generateWeapon,
  generateSpell,
  generateActionPattern,
} = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  Weapon,
  Spell,
  ActionPattern,
  Action,
} = require('../models');

const relevantModels = [
  Weapon,
  Spell,
  ActionPattern,
  Action,
];

const defaultActionIncludes = [{
  model: Weapon,
  as: 'weapon',
}, {
  model: Spell,
  as: 'spell',
}];

let weaponId = null;
let spellId = null;
let actionPatternId = null;
let secondActionPatternId = null;
let action = null;
let expectedActions = 0;

describe('Action Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    weaponId = (await generateWeapon('bite', wd.d4.piercing)).id;
    spellId = (await generateSpell()).id;
    actionPatternId = (await generateActionPattern()).id;
    secondActionPatternId = (await generateActionPattern(1)).id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createAction', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if (await actionService.createAction({})) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, fields missing: actionPatternId');
      }
    });

    it('Should throw an error if no weaponId, spellId, or other are passed', async () => {
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should throw an error if two or more of weaponId, spellId, and other all passed', async () => {
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          other: 'other',
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
          spellId,
          other: 'other',
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          spellId,
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          spellId,
          other: 'other',
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should throw an error if an invalid weaponId is passed', async () => {
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId: 99999,
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, no weapon found for the given ID');
      }
    });

    it('Should throw an error if an invalid spellId is passed', async () => {
      try {
        if (await actionService.createAction({
          actionPatternId,
          index: 0,
          spellId: 99999,
        })) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, no spell found for the given ID');
      }
    });

    it('Should create an action if all valid fields are passed, returning it with its weapon and spell', async () => {
      action = await actionService.createAction({
        actionPatternId,
        index: 0,
        weaponId,
        times: 2,
      });
      expectedActions += 1;

      // Check that the returned instance has a weapon and a null spell
      assert.hasAnyKeys(action, 'dataValues');
      const values = action.dataValues;
      assert.hasAllKeys(values, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      assert.equal(values.id, action.id);
      assert.equal(values.index, action.index);
      assert.equal(values.weaponId, action.weaponId);
      assert.equal(values.times, action.times);
      assert.isNull(values.spellId);
      assert.isNull(values.spell);
      const { weapon } = values;
      assert.hasAnyKeys(weapon, 'dataValues');
      const weaponValues = weapon.dataValues;
      assert.hasAllKeys(weaponValues, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
      assert.equal(weaponValues.id, weaponId);

      // Check that one action was created
      assert.lengthOf(await Action.findAll(), expectedActions);
    });
  });

  describe('cloneAction', () => {
    it('Should throw an error if an invalid ID is passed', async () => {
      try {
        await actionService.cloneAction('invalid');
        throw new Error('cloneAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action clone failed, no action found for the given ID');
      }
      try {
        await actionService.cloneAction(9999);
        throw new Error('cloneAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action clone failed, no action found for the given ID');
      }
    });

    it('Should return a copy of the action with index 1 + the max of index values over sibling instances', async () => {
      const result = await actionService.cloneAction(action.id);
      expectedActions += 1;
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      assert.notEqual(values.id, action.id);
      assert.equal(values.actionPatternId, action.actionPatternId);
      assert.equal(values.index, action.index + 1);

      // Check that one action was created
      assert.lengthOf(await Action.findAll(), expectedActions);
    });
  });

  describe('getAction', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await actionService.getAction('invalid'));
      assert.isNull(await actionService.getAction(99999));
    });

    it('Should return the correct action instance for the given id', async () => {
      const result = await actionService.getAction(action.id);
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      assert.equal(values.id, action.id);
      assert.equal(values.index, action.index);
      assert.equal(values.weaponId, action.weaponId);
      assert.equal(values.times, action.times);
      assert.isNull(values.spell);
      const { weapon } = values;
      assert.hasAnyKeys(weapon, 'dataValues');
      const weaponValues = weapon.dataValues;
      assert.hasAllKeys(weaponValues, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
      assert.equal(weaponValues.id, weaponId);
    });
  });

  describe('updateAction', () => {
    it('Should not allow updating the actionPatternId', async () => {
      try {
        if (await actionService.updateAction(action.id, {
          actionPatternId: secondActionPatternId,
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, no valid update fields found');
      }
    });

    it('Should not allow updating the actionPattern to have more than one of weapon, spell, or other', async () => {
      try {
        if (await actionService.updateAction(action.id, {
          weaponId,
          spellId,
          other: 'other',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.updateAction(action.id, {
          weaponId,
          spellId,
          other: '',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.updateAction(action.id, {
          weaponId,
          spellId: null,
          other: 'other',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.updateAction(action.id, {
          weaponId: null,
          spellId,
          other: 'other',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should not allow updating the actionPattern to have no weapon, spell, or other', async () => {
      try {
        if (await actionService.updateAction(action.id, {
          weaponId: null,
          spellId: null,
          other: '',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should throw an error if an invalid weaponId is passed', async () => {
      try {
        if (await actionService.updateAction(action.id, {
          actionPatternId,
          index: 0,
          weaponId: 'invalid',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.updateAction(action.id, {
          actionPatternId,
          index: 0,
          weaponId: 99999,
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, no weapon found for the given ID');
      }
    });

    it('Should throw an error if an invalid spellId is passed', async () => {
      try {
        if (await actionService.updateAction(action.id, {
          actionPatternId,
          index: 0,
          weaponId: null,
          spellId: 'invalid',
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if (await actionService.updateAction(action.id, {
          actionPatternId,
          index: 0,
          weaponId: null,
          spellId: 99999,
        })) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, no spell found for the given ID');
      }
    });

    it('Should update an action if all valid fields are passed', async () => {
      await actionService.updateAction(action.id, {
        spellId,
        weaponId: null,
      });
      // Check that the action was updated
      await action.reload({ include: defaultActionIncludes });
      assert.isNull(action.weaponId);
      assert.isNull(action.weapon);
      assert.equal(action.spellId, spellId);
      assert.equal(action.spell.id, spellId);
    });
  });

  describe('deleteAction', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await actionService.deleteAction('invalid')) {
          throw new Error('deleteAction should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Action deletion failed, no action found for the given ID');
      }
      try {
        if (await actionService.deleteAction(99999)) {
          throw new Error('deleteAction should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Action deletion failed, no action found for the given ID');
      }
    });

    it('Should delete the action with the given id', async () => {
      await actionService.deleteAction(action.id);
      expectedActions -= 1;
      // Check that one action was deleted
      assert.lengthOf(await Action.findAll(), expectedActions);
    });
  });
});
