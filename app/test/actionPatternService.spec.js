const { assert } = require('chai');
const actionPatternService = require('../services/actionPatternService');
const {
  generateDummyWeapon,
  generateDummyAction,
  generateDummyCreatureType,
} = require('./helpers/dummyModelGenerators');
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

let expectedActionPatterns = 0;
let action = null;
let actionPattern = null;
let creatureTypeId = null;

describe('ActionPattern Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    const biteId = (await generateDummyWeapon('bite', '[{"num":1,"die":4,"bonus":0,"type":"piercing","effect":""}]')).dataValues.id;
    action = await generateDummyAction(0, biteId, 1);
    creatureTypeId = (await generateDummyCreatureType('dog')).dataValues.id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createActionPattern', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if ((await actionPatternService.createActionPattern({}))) throw new Error('createActionPattern should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'ActionPattern creation failed, fields missing: priority');
      }
    });

    it('Should create a actionPattern if all valid fields are passed, attaching the indicated action to it', async () => {
      actionPattern = await actionPatternService.createActionPattern({
        priority: 0,
        creatureTypeId,
      }, [action.dataValues.id]);
      expectedActionPatterns += 1;
      // Check that one actionPattern was created
      assert.lengthOf((await ActionPattern.findAll()), expectedActionPatterns);
      // Check that the action was attached to it
      await action.reload();
      assert.equal(action.dataValues.actionPatternId, actionPattern.dataValues.id);
    });
  });

  describe('getActionPattern', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await actionPatternService.getActionPattern('invalid'))) {
          throw new Error('getActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await actionPatternService.getActionPattern(99999)));
    });

    it('Should return the correct actionPattern for the given id', async () => {
      const result = await actionPatternService.getActionPattern(actionPattern.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'creatureTypeId', 'priority', 'createdAt', 'updatedAt', 'actions']);
      assert.equal(result.dataValues.id, actionPattern.dataValues.id);
      assert.equal(result.dataValues.name, actionPattern.dataValues.name);
      assert.equal(result.dataValues.maxHP, actionPattern.dataValues.maxHP);
    });
  });

  describe('updateActionPattern', () => {
    it('Should update a actionPattern if all valid fields are passed', async () => {
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
          throw new Error('createActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if (await actionPatternService.deleteActionPattern(99999)) {
          throw new Error('createActionPattern should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'ActionPattern deletion failed, no actionPattern found with ID: 99999');
      }
    });

    it('Should delete the actionPattern with the given id, updating its actions to have no actionPattern', async () => {
      await actionPatternService.deleteActionPattern(actionPattern.dataValues.id);
      expectedActionPatterns -= 1;
      // Check that one actionPattern was deleted
      assert.lengthOf((await ActionPattern.findAll()), expectedActionPatterns);
      // Check that no actions point to this actionPattern anymore
      assert.lengthOf((await Action.findAll({
        where: { actionPatternId: actionPattern.dataValues.id },
      })), 0);
    });
  });
});
