const { assert } = require('chai');
const {
  wd, // Weapon Damages
} = require('../seeders/helpers/seederHelpers');
const actionService = require('../services/actionService');
const {
  generateWeapon,
  generateActionPattern,
} = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  Weapon,
  Action,
} = require('../models');

const relevantModels = [
  Weapon,
  Action,
];

let weaponId = null;
let actionPatternId = null;
let action = null;
let expectedActions = 0;

describe('Action Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    weaponId = (await generateWeapon('bite', wd.d4.piercing)).dataValues.id;
    actionPatternId = (await generateActionPattern()).dataValues.id;
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

    it('Should throw an error if both a weaponId and spellId are passed', async () => {
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
          weaponId,
          spellId: 1,
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, cannot be both a weapon and spell action');
      }
    });

    it('Should throw an error if none of weaponId, spellId, or other are passed', async () => {
      try {
        if ((await actionService.createAction({
          actionPatternId,
          index: 0,
        }))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, action must be one of weapon, spell, or other');
      }
    });

    it('Should create an action if all valid fields are passed', async () => {
      action = await actionService.createAction({
        actionPatternId,
        index: 0,
        weaponId,
      });
      expectedActions += 1;
      // Check that one action was created
      assert.lengthOf((await Action.findAll()), expectedActions);
    });
  });

  describe('getAction', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await actionService.getAction('invalid'))) {
          throw new Error('getAction should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await actionService.getAction(99999)));
    });

    it('Should return the correct action for the given id', async () => {
      const result = await actionService.getAction(action.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      assert.equal(result.dataValues.id, action.dataValues.id);
      assert.equal(result.dataValues.index, action.dataValues.index);
      assert.equal(result.dataValues.weaponId, action.dataValues.weaponId);
      assert.equal(result.dataValues.times, action.dataValues.times);
    });
  });

  describe('updateAction', () => {
    it('Should update an action if all valid fields are passed', async () => {
      await actionService.updateAction(action.dataValues.id, {
        times: 2,
      });
      // Check that the action was updated
      await action.reload();
      assert.equal(action.dataValues.times, 2);
    });

    it('Should not allow updating the actionPatternId with this function', async () => {
      try {
        if ((await actionService.updateAction(action.dataValues.id, {
          actionPatternId: 1,
        }))) throw new Error('updateAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action update failed, no valid update fields found');
      }
    });
  });

  describe('deleteAction', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await actionService.deleteAction('invalid'))) {
          throw new Error('createAction should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if (await actionService.deleteAction(99999)) {
          throw new Error('createAction should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Action deletion failed, no action found with ID: 99999');
      }
    });

    it('Should delete the action with the given id', async () => {
      await actionService.deleteAction(action.dataValues.id);
      expectedActions -= 1;
      // Check that one action was deleted
      assert.lengthOf((await Action.findAll()), expectedActions);
    });
  });
});
