const { assert } = require('chai');
const { Spell, CreatureType, CreatureTypeSpell } = require('../models');
const spellService = require('../services/spellService');
const { acidSplash, waterSplash } = require('./helpers/fixtures');
const { generateDummyCreatureType } = require('./helpers/dummyModelGenerators');

const syncRelevantModels = async () => {
  await Spell.sync({ force: true });
  await CreatureType.sync({ force: true });
  await CreatureTypeSpell.sync({ force: true });
};

let expectedSpells = 0;
let spell = null;
let creatureType = null;

describe('Spell Service', () => {
  before(async () => {
    await syncRelevantModels();
  });

  after(async () => {
    await syncRelevantModels();
  });

  describe('createSpell', () => {
    it('Should throw an error if an invalid level is passed', async () => {
      try {
        if ((await spellService.createSpell({
          name: 'negative spell',
          level: -1,
          school: 'illusion',
          description: 'basic description',
        }))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on level failed');
      }
    });

    it('Should throw an error if an invalid school is passed', async () => {
      try {
        if ((await spellService.createSpell({
          name: 'backyard',
          school: 'yard',
          description: 'basic description',
        }))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: school must be one of abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, or transmutation');
      }
    });

    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if ((await spellService.createSpell({
          name: 'backyard',
          school: 'conjuration',
          description: 'basic description',
          damages: '["valid json", "invalid spell damages array"]',
        }))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: spell damages array must be an array of arrays');
      }
    });

    it('Should throw an error if required params are missing', async () => {
      try {
        if ((await spellService.createSpell({}))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell creation failed, fields missing: name,school,description');
      }
    });

    it('Should create a spell if all valid fields are passed', async () => {
      spell = await spellService.createSpell({
        name: 'Acid Splash',
        level: 0,
        school: 'conjuration',
        castingTime: '1 action',
        range: 60,
        components: 'V, S',
        duration: 'instantaneous',
        saveType: 'dex',
        saveStillHalf: false,
        description: acidSplash.description,
        damages: acidSplash.damages,
      });
      expectedSpells += 1;
      // Check that one spell was created
      assert.lengthOf((await Spell.findAll()), expectedSpells);

      // Create a creatureType that uses this spell, for use in the deleteSpell tests
      creatureType = await generateDummyCreatureType(
        null, null, null, null, null, null, 0, spell.dataValues.id,
      );
    });

    it('Should throw an error if a duplicate spell name is used', async () => {
      try {
        if ((await spellService.createSpell({
          name: spell.dataValues.name,
          school: 'conjuration',
          description: acidSplash.description,
        }))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `Spell with name ${spell.dataValues.name} already exists`);
      }
    });
  });

  describe('getSpell', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await spellService.getSpell('invalid'))) throw new Error('getSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should return null if a non-existant id is passed', async () => {
      assert.isNull((await spellService.getSpell(99999)));
    });

    it('Should return the correct spell for the given id', async () => {
      const result = await spellService.getSpell(spell.dataValues.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'level', 'school', 'castingTime', 'range', 'components', 'duration', 'saveType', 'saveStillHalf', 'description', 'damages', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, spell.dataValues.id);
      assert.equal(result.dataValues.name, spell.dataValues.name);
      assert.equal(result.dataValues.school, spell.dataValues.school);
    });
  });

  describe('updateSpell', () => {
    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if ((await spellService.updateSpell(spell.dataValues.id, {
          damages: '["valid json","invalid spell damages array"]',
        }))) throw new Error('updateSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: spell damages array must be an array of arrays');
      }
    });

    it('Should update a spell if all valid fields are passed', async () => {
      await spellService.updateSpell(spell.dataValues.id, {
        name: 'water splash',
        description: waterSplash.description,
        damages: waterSplash.damages,
      });
      // Check that the number of spells hasn't changed
      assert.lengthOf((await Spell.findAll()), expectedSpells);
      // Check that the spell was updated
      await spell.reload();
      assert.equal(spell.dataValues.name, 'water splash');
    });
  });

  describe('deleteSpell', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if ((await spellService.deleteSpell('invalid'))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('Should throw an error if the id is non-existant', async () => {
      try {
        if ((await spellService.deleteSpell(99999))) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell deletion failed, no spell found with ID: 99999');
      }
    });

    it('Should delete the spell with the given id', async () => {
      await spellService.deleteSpell(spell.dataValues.id);
      expectedSpells -= 1;
      // Check that one spell was deleted
      assert.lengthOf((await Spell.findAll()), expectedSpells);
      // Check that the creature that was using this spell now has no spells
      const spells = await creatureType.getSpells();
      assert.lengthOf(spells, 0);
    });
  });
});
