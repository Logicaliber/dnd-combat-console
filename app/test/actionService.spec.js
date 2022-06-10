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
  Action,
} = require('../models');

const relevantModels = [
  Weapon,
  Spell,
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
        if ((await actionService.createAction({}))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, fields missing: actionPatternId,index');
      }
    });

    it('Should throw an error if no weaponId, spellId, or other are passed', async () => {
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should throw an error if two or more of weaponId, spellId, and other all passed', async () => {
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          other: 'other',
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          spellId,
          other: 'other',
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          spellId,
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          spellId,
          other: 'other',
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should throw an error if a non-existant weaponId is passed', async () => {
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId: 99999,
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, no weapon found for the given ID');
      }
    });

    it('Should throw an error if a non-existant spellId is passed', async () => {
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          spellId: 99999,
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, no spell found for the given ID');
      }
    });

    it('Should create an action if all valid fields are passed', async () => {
      action = await actionService.createAction({
        actionPatternId,
        index: 0,
        weaponId,
        times: 2,
      });
      expectedActions += 1;
      // Check that one action was created
      assert.lengthOf((await Action.findAll()), expectedActions);
    });
  });

  describe('getAction', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull((await actionService.getAction('invalid')));
      assert.isNull((await actionService.getAction(99999)));
    });

    it('Should return the correct action instance for the given id', async () => {
      const result = await actionService.getAction(action.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      assert.equal(result.id, action.id);
      assert.equal(result.index, action.index);
      assert.equal(result.weaponId, action.weaponId);
      assert.equal(result.times, action.times);
      const { weapon } = result.dataValues;
      assert.hasAnyKeys(weapon, 'dataValues');
      assert.hasAllKeys(weapon.dataValues, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
      assert.equal(weapon.id, weaponId);
    });
  });

  describe('updateAction', () => {
    it('Should not allow updating the actionPatternId', async () => {
      try {
        if ((await actionService.updateAction(action.id, {
          actionPatternId: secondActionPatternId,
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, no valid update fields found');
      }
    });

    it('Should not allow updating the actionPattern to have more than one of weapon, spell, or other', async () => {
      try {
        if ((await actionService.updateAction(action.id, {
          weaponId,
          spellId,
          other: 'other',
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if ((await actionService.updateAction(action.id, {
          weaponId,
          spellId,
          other: '',
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if ((await actionService.updateAction(action.id, {
          weaponId,
          spellId: null,
          other: 'other',
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
      try {
        if ((await actionService.updateAction(action.id, {
          weaponId: null,
          spellId,
          other: 'other',
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should not allow updating the actionPattern to have no weapon, spell, or other', async () => {
      try {
        if ((await actionService.updateAction(action.id, {
          weaponId: null,
          spellId: null,
          other: '',
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, action must be one of weapon, spell, or other');
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
      assert.equal(action.spell.id, spellId);
    });
  });

  describe('deleteAction', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await actionService.deleteAction('invalid'))) {
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
      assert.lengthOf((await Action.findAll()), expectedActions);
    });
  });
});
