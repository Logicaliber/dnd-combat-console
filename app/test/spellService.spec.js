const { assert } = require('chai');
const spellService = require('../services/spellService');
const { acidSplash, waterSplash } = require('./helpers/fixtures');
const { syncModels } = require('./helpers/modelSync');

const {
  Spell,
} = require('../models');
const { generateSpell } = require('./helpers/modelGenerators');

const relevantModels = [
  Spell,
];

let existingSpellName = null;
let expectedSpells = 0;
let spell = null;

describe('Spell Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    existingSpellName = (await generateSpell('Magic Missile')).name;
    expectedSpells += 1;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createSpell', () => {
    it('Should throw an error if an invalid level is passed', async () => {
      try {
        if (await spellService.createSpell({
          name: 'negative spell',
          level: -1,
          school: 'illusion',
          description: 'basic description',
        })) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on level failed');
      }
    });

    it('Should throw an error if an invalid school is passed', async () => {
      try {
        if (await spellService.createSpell({
          name: 'backyard',
          school: 'yard',
          description: 'basic description',
        })) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: school must be one of abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, or transmutation');
      }
    });

    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if (await spellService.createSpell({
          name: 'backyard',
          school: 'conjuration',
          description: 'basic description',
          damages: '["valid json", "invalid spell damages array"]',
        })) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: spell damages array must be an array of arrays');
      }
    });

    it('Should throw an error if required params are missing', async () => {
      try {
        if (await spellService.createSpell({})) throw new Error('createSpell should have thrown an error');
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
      assert.lengthOf(await Spell.findAll(), expectedSpells);
    });

    it('Should throw an error if a duplicate spell name is used', async () => {
      try {
        if (await spellService.createSpell({
          name: spell.name,
          school: 'conjuration',
          description: acidSplash.description,
        })) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell creation failed, a spell with the given name already exists');
      }
    });
  });

  describe('getSpell', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await spellService.getSpell('invalid'));
      assert.isNull(await spellService.getSpell(99999));
    });

    it('Should return the correct spell for the given id', async () => {
      const result = await spellService.getSpell(spell.id);
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      assert.hasAllKeys(values, ['id', 'name', 'level', 'school', 'castingTime', 'range', 'components', 'duration', 'saveType', 'saveStillHalf', 'description', 'damages', 'createdAt', 'updatedAt']);
      assert.equal(values.id, spell.id);
      assert.equal(values.name, spell.name);
      assert.equal(values.school, spell.school);
    });
  });

  describe('updateSpell', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await spellService.updateSpell('invalid', {
          name: 'water splash',
        })) throw new Error('updateSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell update failed, no spell found for the given ID');
      }
      try {
        if (await spellService.updateSpell(99999, {
          name: 'water splash',
        })) throw new Error('updateSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell update failed, no spell found for the given ID');
      }
    });

    it('Should throw an error if the new name is not unique', async () => {
      try {
        if (await spellService.updateSpell(spell.id, {
          name: existingSpellName,
        })) throw new Error('updateSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell update failed, a spell with the given name already exists');
      }
    });

    it('Should throw an error if an invalid damages array is passed', async () => {
      try {
        if (await spellService.updateSpell(spell.id, {
          damages: '["valid json","invalid spell damages array"]',
        })) throw new Error('updateSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: spell damages array must be an array of arrays');
      }
    });

    it('Should update a spell if all valid fields are passed', async () => {
      await spellService.updateSpell(spell.id, {
        name: 'water splash',
        description: waterSplash.description,
        damages: waterSplash.damages,
      });
      // Check that the number of spells hasn't changed
      assert.lengthOf(await Spell.findAll(), expectedSpells);
      // Check that the spell was updated
      await spell.reload();
      assert.equal(spell.name, 'water splash');
    });
  });

  describe('deleteSpell', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await spellService.deleteSpell('invalid')) throw new Error('deleteSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell deletion failed, no spell found for the given ID');
      }
      try {
        if (await spellService.deleteSpell(99999)) throw new Error('deleteSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Spell deletion failed, no spell found for the given ID');
      }
    });

    it('Should delete the spell with the given id', async () => {
      await spellService.deleteSpell(spell.id);
      expectedSpells -= 1;
      // Check that one spell was deleted
      assert.lengthOf(await Spell.findAll(), expectedSpells);
    });
  });
});
