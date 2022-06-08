const { assert } = require('chai');
const {
  wd, // Weapon Damages
} = require('../seeders/helpers/seederHelpers');
const actionPatternService = require('../services/actionPatternService');
const {
  generateWeapon,
  generateAction,
  generateCreatureType,
} = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  Weapon,
  Action,
  CreatureType,
  ActionPattern,
} = require('../models');

const relevantModels = [
  Weapon,
  Action,
  CreatureType,
  ActionPattern,
];

let expectedActions = 0;
let expectedActionPatterns = 0;
let creatureTypeId = null;
let actionPattern = null;
let action = null;

describe('ActionPattern Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    creatureTypeId = (await generateCreatureType('dog')).dataValues.id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createActionPattern', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if ((await actionPatternService.createActionPattern({}))) {
          throw new Error('createActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern creation failed, fields missing: creatureTypeId,priority');
      }
    });

    it('Should throw an error if an invalid creatureTypeId is passed', async () => {
      try {
        if ((await actionPatternService.createActionPattern({
          priority: 0,
          creatureTypeId: 'invalid',
        }))) {
          throw new Error('createActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern creation failed, no creatureType found for the given ID');
      }
    });

    it('Should throw an error if a non-existant creatureTypeId is passed', async () => {
      try {
        if ((await actionPatternService.createActionPattern({
          priority: 0,
          creatureTypeId: 9999,
        }))) {
          throw new Error('createActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern creation failed, no creatureType found for the given ID');
      }
    });

    it('Should throw an error if a negative priority is passed', async () => {
      try {
        if ((await actionPatternService.createActionPattern({
          priority: -1,
          creatureTypeId,
        }))) {
          throw new Error('createActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on priority failed');
      }
    });

    it('Should create an actionPattern if all valid fields are passed', async () => {
      actionPattern = await actionPatternService.createActionPattern({
        priority: 0,
        creatureTypeId,
      });
      expectedActionPatterns += 1;
      // Check that one actionPattern was created
      assert.lengthOf((await ActionPattern.findAll()), expectedActionPatterns);

      // Create an action for this actionPattern, for use in the deleteActionPattern test
      const biteId = (await generateWeapon('bite', wd.d4.piercing)).dataValues.id;
      action = await generateAction(0, biteId, 1, actionPattern.dataValues.id);
      expectedActions += 1;
    });
  });

  describe('getActionPattern', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull((await actionPatternService.getActionPattern('invalid')));
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await actionPatternService.getActionPattern(99999)));
    });

    it('Should return the correct actionPattern for the given id, with its actions', async () => {
      const result = await actionPatternService.getActionPattern(actionPattern.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      const { dataValues } = result;
      assert.hasAllKeys(dataValues, ['id', 'creatureTypeId', 'priority', 'createdAt', 'updatedAt', 'actions']);
      assert.equal(dataValues.id, actionPattern.dataValues.id);
      assert.equal(dataValues.creatureTypeId, actionPattern.dataValues.creatureTypeId);
      assert.equal(dataValues.priority, actionPattern.dataValues.priority);
      const { actions } = dataValues;
      assert.lengthOf(actions, expectedActions);
      assert.hasAnyKeys(actions[0], 'dataValues');
      assert.equal(actions[0].dataValues.id, action.dataValues.id);
    });
  });

  describe('updateActionPattern', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await actionPatternService.updateActionPattern('invalid', {
          priority: 10,
        }))) {
          throw new Error('updateActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern update failed, no actionPattern found for the given ID');
      }
    });

    it('Should throw an error if a non-existant id is passed', async () => {
      try {
        if ((await actionPatternService.updateActionPattern(9999, {
          priority: 10,
        }))) {
          throw new Error('updateActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern update failed, no actionPattern found for the given ID');
      }
    });

    it('Should throw an error if a negative priority is passed', async () => {
      try {
        if ((await actionPatternService.updateActionPattern(actionPattern.dataValues.id, {
          priority: -1,
        }))) {
          throw new Error('updateActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on priority failed');
      }
    });

    it('Should update an actionPattern if all valid fields are passed', async () => {
      await actionPatternService.updateActionPattern(actionPattern.dataValues.id, {
        priority: 1,
      });
      // Check that the actionPattern was updated
      await actionPattern.reload();
      assert.equal(actionPattern.dataValues.priority, 1);
    });
  });

  describe('deleteActionPattern', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await actionPatternService.deleteActionPattern('invalid'))) {
          throw new Error('deleteActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern deletion failed, no actionPattern found for the given ID');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if (await actionPatternService.deleteActionPattern(99999)) {
          throw new Error('deleteActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern deletion failed, no actionPattern found for the given ID');
      }
    });

    it('Should delete the actionPattern with the given id, as well as its actions', async () => {
      await actionPatternService.deleteActionPattern(actionPattern.dataValues.id);
      expectedActions -= 1;
      expectedActionPatterns -= 1;
      // Check that one actionPattern was deleted
      assert.lengthOf((await ActionPattern.findAll()), expectedActionPatterns);
      // Check that one action was deleted
      assert.lengthOf((await Action.findAll()), expectedActions);
    });
  });
});
