const { assert } = require('chai');
const creatureTypeService = require('../services/creatureTypeService');
const {
  generateArmor,
  generateCreature,
  generateActionPattern,
  generateWeapon,
  generateAction,
} = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const {
  Armor,
  Weapon,
  Spell,
  CreatureType,
  Creature,
  ActionPattern,
  Action,
} = require('../models');

const relevantModels = [
  Armor,
  Weapon,
  Spell,
  CreatureType,
  Creature,
  ActionPattern,
  Action,
];

let armorId;
let creatureType = null;
let expectedActionPatterns = 0;
let expectedActions = 0;
let expectedCreatureTypes = 0;
let expectedCreatures = 0;

describe('CreatureType Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    armorId = (await generateArmor('fur', 'natural', 9)).id;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createCreatureType', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if (await creatureTypeService.createCreatureType({
          name: 'dog',
        })) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation failed, fields missing: hitDie,numDice,maxHP');
      }
    });

    it('Should throw an error if an invalid size is passed', async () => {
      try {
        if (await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'invalid',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
        })) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: creatureType size must be one of tiny, small, medium, large, huge, or gargantuan');
      }
    });

    it('Should throw an error if an invalid armorId is passed', async () => {
      try {
        if (await creatureTypeService.createCreatureType({
          name: 'name',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
          armorId: 1234,
        })) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation failed, no armor found for the given ID');
      }
    });

    it('Should create a creatureType if all valid fields are passed', async () => {
      creatureType = await creatureTypeService.createCreatureType({
        name: 'dog',
        size: 'medium',
        hitDie: 6,
        numDice: 1,
        maxHP: 4,
        armorId,
      });
      expectedCreatureTypes += 1;
      // Check that one creatureType was created
      assert.lengthOf(await CreatureType.findAll(), expectedCreatureTypes);
      // Check that the creatureType has the correct armor
      assert.equal(creatureType.armor.id, armorId);
      assert.equal(creatureType.armor.name, 'fur');

      // Create a creature that is this creatureType, for use in other tests
      await generateCreature(null, creatureType.id);
      expectedCreatures += 1;
      // Create an actionPattern for this creatureType, for use in other tests
      const actionPatternId = (await generateActionPattern(0, creatureType.id)).id;
      expectedActionPatterns += 1;
      const weaponId = (await generateWeapon()).id;
      await generateAction(0, weaponId, 1, actionPatternId);
      expectedActions += 1;
    });

    it('Should throw an error if a duplicate creatureType name is used', async () => {
      try {
        if (await creatureTypeService.createCreatureType({
          name: 'dog',
          size: 'medium',
          hitDie: 6,
          numDice: 1,
          maxHP: 4,
        })) throw new Error('createCreatureType should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'CreatureType creation failed, a creatureType with the given name already exists');
      }
    });
  });

  describe('getCreatureType', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await creatureTypeService.getCreatureType('invalid'));
      assert.isNull(await creatureTypeService.getCreatureType(99999));
    });

    it('Should return the correct creatureType for the given id, with its armor, actionPatterns, actions, weapons, and spells', async () => {
      const result = await creatureTypeService.getCreatureType(creatureType.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'name', 'size', 'type', 'tags', 'alignment', 'armorId', 'hasShield', 'hitDie', 'numDice', 'maxHP', 'speed', 'flySpeed', 'swimSpeed', 'climbSpeed', 'burrowSpeed', 'hover', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'savingThrows', 'skills', 'resistances', 'senses', 'passivePerception', 'languages', 'challengeRating', 'proficiencyBonus', 'legendaryResistances', 'specialAbilities', 'spellcasting', 'spellSlots', 'innateSpells', 'legendaryActions', 'reactions', 'lairActions', 'regionalEffects', 'createdAt', 'updatedAt', 'actionPatterns', 'armor']);
      const { actionPatterns, armor } = values;
      assert.equal(values.id, creatureType.id);
      assert.equal(values.name, creatureType.name);
      assert.equal(values.hitDie, creatureType.hitDie);
      assert.equal(values.numDice, creatureType.numDice);
      assert.equal(values.maxHP, creatureType.maxHP);
      assert.hasAnyKeys(armor, 'dataValues');
      const armorValues = armor.dataValues;
      assert.hasAllKeys(armorValues, ['id', 'name', 'type', 'baseAC', 'disadvantage', 'createdAt', 'updatedAt']);
      assert(Array.isArray(actionPatterns));
      assert.lengthOf(actionPatterns, 1);
      assert.hasAnyKeys(actionPatterns[0], 'dataValues');
      const actionPatternValues = actionPatterns[0].dataValues;
      assert.hasAllKeys(actionPatternValues, ['id', 'creatureTypeId', 'priority', 'createdAt', 'updatedAt', 'actions']);
      const { actions } = actionPatternValues;
      assert(Array.isArray(actions));
      assert.lengthOf(actions, 1);
      assert.hasAnyKeys(actions[0], 'dataValues');
      const actionValues = actions[0].dataValues;
      assert.hasAllKeys(actionValues, ['id', 'actionPatternId', 'index', 'weaponId', 'times', 'spellId', 'restrictions', 'other', 'createdAt', 'updatedAt', 'weapon', 'spell']);
      const { weapon, spell } = actionValues;
      assert.isNull(spell);
      assert.hasAnyKeys(weapon, 'dataValues');
      const weaponValues = weapon.dataValues;
      assert.hasAllKeys(weaponValues, ['id', 'name', 'damages', 'properties', 'normalRange', 'longRange', 'attackShape', 'save', 'saveType', 'saveStillHalf', 'createdAt', 'updatedAt']);
    });
  });

  describe('updateCreatureType', () => {
    it('Should update a creatureType if all valid fields are passed', async () => {
      await creatureTypeService.updateCreatureType(creatureType.id, {
        name: 'big dog',
        hitDie: 12,
        numDice: 4,
        maxHP: 26,
      });
      // Check that no new creatureType was created
      assert.lengthOf(await CreatureType.findAll(), expectedCreatureTypes);
      // Check that the creatureType was updated
      await creatureType.reload();
      assert.equal(creatureType.name, 'big dog');
      assert.equal(creatureType.hitDie, 12);
      assert.equal(creatureType.numDice, 4);
      assert.equal(creatureType.maxHP, 26);
    });
  });

  describe('deleteCreatureType', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await creatureTypeService.deleteCreatureType('invalid')) {
          throw new Error('deleteCreatureType should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'CreatureType deletion failed, no creatureType found for the given ID');
      }
      try {
        if (await creatureTypeService.deleteCreatureType(99999)) {
          throw new Error('deleteCreatureType should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'CreatureType deletion failed, no creatureType found for the given ID');
      }
    });

    it('Should delete the creatureType with the given id, as well as all related creatures, actionPatterns, and actions', async () => {
      await creatureTypeService.deleteCreatureType(creatureType.id);
      expectedCreatureTypes -= 1;
      expectedCreatures -= 1;
      expectedActions -= 1;
      expectedActionPatterns -= 1;
      // Check that one creatureType was deleted
      assert.lengthOf((await CreatureType.findAll()), expectedCreatureTypes);
      // Check that one creature was deleted
      assert.lengthOf((await Creature.findAll()), expectedCreatures);
      // Check that one action was deleted
      assert.lengthOf((await Action.findAll()), expectedActions);
      // Check that one creature was deleted
      assert.lengthOf((await ActionPattern.findAll()), expectedActionPatterns);
    });
  });
});
