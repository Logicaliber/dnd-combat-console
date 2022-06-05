const { assert } = require('chai');
const actionService = require('../services/actionService');
const {
  generateDummyWeapon,
  generateDummyActionPattern,
} = require('./helpers/dummyModelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  Weapon,
  Action,
} = require('../models');

const relevantModels = [
  Weapon,
  Action,
];

let expectedActions = 0;
let action = null;
let weaponId = null;

describe('Action Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    weaponId = (await generateDummyWeapon('bite', '[{"num":1,"die":4,"bonus":0,"type":"piercing","effect":""}]')).dataValues.id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createAction', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if ((await actionService.createAction({}))) throw new Error('createAction should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Action creation failed, fields missing: index');
      }
    });

    it('Should create a action if all valid fields are passed', async () => {
      action = await actionService.createAction({
        index: 0,
        weaponId,
      });
      expectedActions += 1;
      // Check that one action was created
      assert.lengthOf((await Action.findAll()), expectedActions);
    });

    it('Should not allow creating an action with an actionPattern already chosen', async () => {
      action = await actionService.createAction({
        index: 1,
        weaponId,
        actionPatternId: 1,
      });
      expectedActions += 1;
      // Check that one action was created
      assert.lengthOf((await Action.findAll()), expectedActions);
      // Check that the action has no actionPattern
      assert.isNull(action.dataValues.actionPatternId);
      assert.isNull(await action.getActionPattern());
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
      assert.hasAllKeys(result.dataValues, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, action.dataValues.id);
      assert.equal(result.dataValues.index, action.dataValues.index);
      assert.equal(result.dataValues.weaponId, action.dataValues.weaponId);
      assert.equal(result.dataValues.times, action.dataValues.times);
    });
  });

  describe('updateAction', () => {
    it('Should update a action if all valid fields are passed', async () => {
      await actionService.updateAction(action.dataValues.id, {
        times: 2,
      });
      // Check that the action was updated
      await action.reload();
      assert.equal(action.dataValues.times, 2);
    });
  });

  describe('attachActionsToActionPattern', () => {
    it('Should throw an error if the indicated actionPattern doesn\'t exist', async () => {
      try {
        if ((await actionService.attachActionsToActionPattern([action.dataValues.id], 99999))) {
          throw new Error('attachActionsToActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'attachActions failed, no actionPattern found with ID: 99999');
      }
    });

    it('Should update the indicated actions if given valid arguments', async () => {
      const actionPatternId = (await generateDummyActionPattern()).dataValues.id;
      await actionService.attachActionsToActionPattern([action.dataValues.id], actionPatternId);
      // Check that the action was updated
      await action.reload();
      assert.equal(action.dataValues.actionPatternId, actionPatternId);
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
