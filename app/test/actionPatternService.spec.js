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
let biteId = null;
let creatureTypeId = null;
let actionPattern = null;
let action = null;

describe('ActionPattern Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    creatureTypeId = (await generateCreatureType('dog')).id;
    biteId = (await generateWeapon('bite', wd.d4.piercing)).id;
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

      // Create an action for this actionPattern, for use in other tests
      action = await generateAction(0, biteId, 1, actionPattern.id);
      expectedActions += 1;
    });
  });

  describe('getActionPattern', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull((await actionPatternService.getActionPattern('invalid')));
      assert.isNull((await actionPatternService.getActionPattern(99999)));
    });

    it('Should return the correct actionPattern instance for the given id, with its actions, weapons, and spells', async () => {
      const result = await actionPatternService.getActionPattern(actionPattern.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'creatureTypeId', 'priority', 'createdAt', 'updatedAt', 'actions']);
      assert.equal(result.dataValues.id, actionPattern.id);
      assert.equal(result.dataValues.creatureTypeId, actionPattern.creatureTypeId);
      assert.equal(result.dataValues.priority, actionPattern.priority);
      const { actions } = result.dataValues;
      assert.lengthOf(actions, expectedActions);
      assert.hasAnyKeys(actions[0], 'dataValues');
      assert.hasAllKeys(actions[0].dataValues, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      assert.equal(actions[0].id, action.id);
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
        if ((await actionPatternService.updateActionPattern(actionPattern.id, {
          priority: -1,
        }))) {
          throw new Error('updateActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on priority failed');
      }
    });

    it('Should update an actionPattern if all valid fields are passed', async () => {
      await actionPatternService.updateActionPattern(actionPattern.id, {
        priority: 1,
      });
      // Check that the actionPattern was updated
      await actionPattern.reload();
      assert.equal(actionPattern.priority, 1);
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
      await actionPatternService.deleteActionPattern(actionPattern.id);
      expectedActions -= 1;
      expectedActionPatterns -= 1;
      // Check that one actionPattern was deleted
      assert.lengthOf((await ActionPattern.findAll()), expectedActionPatterns);
      // Check that one action was deleted
      assert.lengthOf((await Action.findAll()), expectedActions);
    });
  });
});
