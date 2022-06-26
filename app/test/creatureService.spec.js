const { assert } = require('chai');
const creatureService = require('../services/creatureService');
const {
  generateWeapon,
  generateCreatureType,
  generateActionPattern,
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

let existingCreatureName = null;
let expectedCreatures = 0;
let creature = null;
let creatureTypeId = null;

describe('Creature Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    creatureTypeId = (await generateCreatureType('dog')).id;
    const weaponId = (await generateWeapon()).id;
    const actionPatternId = (await generateActionPattern(0, creatureTypeId)).id;
    await generateAction(0, weaponId, 1, actionPatternId);
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createCreature', () => {
    it('Should throw an error if required fields are missing', async () => {
      try {
        if (await creatureService.createCreature({
          name: 'cat',
        })) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Creature creation failed, fields missing: creatureTypeId,maxHP');
      }
    });

    it('Should throw an error if an invalid maxHP is passed', async () => {
      try {
        if (await creatureService.createCreature({
          name: 'name',
          maxHP: 'invalid',
          creatureTypeId,
        })) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should create a creature if all valid fields are passed, returning it with its creatureType, armor, actionPatterns, actions, weapons, and spells', async () => {
      creature = await creatureService.createCreature({
        name: 'dog',
        maxHP: 4,
        creatureTypeId,
      });
      expectedCreatures += 1;

      // Check that the returned instance has its creatureType,
      // armor, actionPatterns, actions, weapons, and spells
      assert.hasAnyKeys(creature, 'dataValues');
      const values = creature.dataValues;
      assert.hasAllKeys(values, ['id', 'creatureTypeId', 'name', 'maxHP', 'currentHP', 'currentLegendaryResistances', 'slotsFirst', 'slotsSecond', 'slotsThird', 'slotsFourth', 'slotsFifth', 'slotsSixth', 'slotsSeventh', 'slotsEigth', 'slotsNinth', 'createdAt', 'updatedAt', 'creatureType']);
      assert.equal(values.id, creature.id);
      assert.equal(values.name, creature.name);
      assert.equal(values.maxHP, creature.maxHP);
      const { creatureType } = values;
      assert.hasAnyKeys(creatureType, 'dataValues');
      const creatureTypeValues = creatureType.dataValues;
      assert.hasAllKeys(creatureTypeValues, ['id', 'name', 'size', 'type', 'tags', 'alignment', 'armorId', 'hasShield', 'hitDie', 'numDice', 'maxHP', 'speed', 'flySpeed', 'swimSpeed', 'climbSpeed', 'burrowSpeed', 'hover', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'savingThrows', 'skills', 'resistances', 'senses', 'passivePerception', 'languages', 'challengeRating', 'proficiencyBonus', 'legendaryResistances', 'specialAbilities', 'spellcasting', 'spellSlots', 'innateSpells', 'legendaryActions', 'reactions', 'lairActions', 'regionalEffects', 'createdAt', 'updatedAt', 'actionPatterns', 'armor']);
      assert.equal(creatureTypeValues.id, creatureTypeId);
      const { actionPatterns, armor } = creatureTypeValues;
      assert.isNull(armor);
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

      // Check that one creature was created
      assert.lengthOf(await Creature.findAll(), expectedCreatures);
    });

    it('Should throw an error if a duplicate creature name is used', async () => {
      try {
        if (await creatureService.createCreature({
          name: 'dog',
          maxHP: 4,
          creatureTypeId,
        })) throw new Error('createCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Creature creation failed, a creature with the given name already exists');
      }
    });
  });

  describe('spawnCreature', () => {
    it('Should throw an error if an invaid creatureTypeId is passed', async () => {
      try {
        if (await creatureService.spawnCreature('invalid')) {
          throw new Error('spawnCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature spawn failed, no creatureType found for the given ID');
      }
      try {
        if (await creatureService.spawnCreature(99999)) {
          throw new Error('spawnCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature spawn failed, no creatureType found for the given ID');
      }
    });

    it('Should spawn a creature with name with number suffix 1 plus the max of number suffixes over sibling instances', async () => {
      const result = await creatureService.spawnCreature(creatureTypeId);
      expectedCreatures += 1;
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'creatureTypeId', 'name', 'maxHP', 'currentHP', 'currentLegendaryResistances', 'slotsFirst', 'slotsSecond', 'slotsThird', 'slotsFourth', 'slotsFifth', 'slotsSixth', 'slotsSeventh', 'slotsEigth', 'slotsNinth', 'createdAt', 'updatedAt', 'creatureType']);
      assert.notEqual(values.id, creature.id);
      assert.equal(values.name, `${creature.name} 1`);
      existingCreatureName = values.name;
    });
  });

  describe('getCreature', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await creatureService.getCreature('invalid'));
      assert.isNull(await creatureService.getCreature(99999));
    });

    it('Should return the correct creature for the given id, with its creatureType, armor, actionPatterns, actions, weapons, and spells', async () => {
      const result = await creatureService.getCreature(creature.id);
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'creatureTypeId', 'name', 'maxHP', 'currentHP', 'currentLegendaryResistances', 'slotsFirst', 'slotsSecond', 'slotsThird', 'slotsFourth', 'slotsFifth', 'slotsSixth', 'slotsSeventh', 'slotsEigth', 'slotsNinth', 'createdAt', 'updatedAt', 'creatureType']);
      assert.equal(values.id, creature.id);
      assert.equal(values.name, creature.name);
      assert.equal(values.maxHP, creature.maxHP);
      const { creatureType } = values;
      assert.hasAnyKeys(creatureType, 'dataValues');
      const creatureTypeValues = creatureType.dataValues;
      assert.hasAllKeys(creatureTypeValues, ['id', 'name', 'size', 'type', 'tags', 'alignment', 'armorId', 'hasShield', 'hitDie', 'numDice', 'maxHP', 'speed', 'flySpeed', 'swimSpeed', 'climbSpeed', 'burrowSpeed', 'hover', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'savingThrows', 'skills', 'resistances', 'senses', 'passivePerception', 'languages', 'challengeRating', 'proficiencyBonus', 'legendaryResistances', 'specialAbilities', 'spellcasting', 'spellSlots', 'innateSpells', 'legendaryActions', 'reactions', 'lairActions', 'regionalEffects', 'createdAt', 'updatedAt', 'actionPatterns', 'armor']);
      assert.equal(creatureTypeValues.id, creatureTypeId);
      const { actionPatterns, armor } = creatureTypeValues;
      assert.isNull(armor);
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

  describe('updateCreature', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await creatureService.updateCreature('invalid', {
          name: existingCreatureName,
        })) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature update failed, no creature found for the given ID');
      }
      try {
        if (await creatureService.updateCreature(99999, {
          name: existingCreatureName,
        })) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature update failed, no creature found for the given ID');
      }
    });

    it('Should throw an error if the new name is not unique', async () => {
      try {
        if (await creatureService.updateCreature(creature.id, {
          name: existingCreatureName,
        })) throw new Error('updateCreature should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Creature update failed, a creature with the given name already exists');
      }
    });

    it('Should update a creature if all valid fields are passed', async () => {
      await creatureService.updateCreature(creature.id, {
        name: 'big dog',
        maxHP: 26,
      });
      // Check that the creature was updated
      await creature.reload();
      assert.equal(creature.name, 'big dog');
      assert.equal(creature.maxHP, 26);
    });
  });

  describe('deleteCreature', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await creatureService.deleteCreature('invalid')) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature deletion failed, no creature found for the given ID');
      }
      try {
        if (await creatureService.deleteCreature(99999)) {
          throw new Error('createCreature should have thrown an error');
        }
      } catch (error) {
        assert.equal(error.message, 'Creature deletion failed, no creature found for the given ID');
      }
    });

    it('Should delete the creature with the given id', async () => {
      await creatureService.deleteCreature(creature.id);
      expectedCreatures -= 1;
      // Check that one creature was deleted
      assert.lengthOf(await Creature.findAll(), expectedCreatures);
    });
  });
});
