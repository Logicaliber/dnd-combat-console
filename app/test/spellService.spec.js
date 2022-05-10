const { assert } = require('chai');

const { CreatureType, CreatureTypeSpell, Spell } = require('../models');
const spellService = require('../services/spellService');

const { acidSplash, waterSplash } = require('./helpers/fixtures');

const syncRelevantModels = async () => {
  await CreatureType.sync({ force: true });
  await CreatureTypeSpell.sync({ force: true });
  await Spell.sync({ force: true });
};

let expectedSpells = 0;
let spell = null;

describe('Spell Service', () => {
  before(async () => {
    await syncRelevantModels();
  });

  after(async () => {
    await syncRelevantModels();
  });

  describe('createSpell', () => {
    it('should throw an error if an invalid level is passed', async () => {
      try {
        const result = await spellService.createSpell({
          name: 'negative spell',
          level: -1,
          description: 'basic description',
        });
        if (result) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation min on level failed');
      }
    });

    it('should throw an error if an invalid school is passed', async () => {
      try {
        const result = await spellService.createSpell({
          name: 'backyard',
          school: 'yard',
          description: 'basic description',
        });
        if (result) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: school must be one of abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, or transmutation');
      }
    });

    it('should throw an error if an invalid damages array is passed', async () => {
      try {
        const result = await spellService.createSpell({
          name: 'backyard',
          school: 'conjuration',
          description: 'basic description',
          damages: '["valid json", "invalid spell damages array"]',
        });
        if (result) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: spell damages array must be an array of arrays');
      }
    });

    it('should create a spell if all valid fields are passed', async () => {
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

      assert.lengthOf((await Spell.findAll()), expectedSpells);
    });

    it('should throw an error if a duplicate spell name is used', async () => {
      try {
        const result = await spellService.createSpell({
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
        if (result) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'spell with name Acid Splash already exists');
      }
    });
  });

  describe('getSpell', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await spellService.getSpell('invalid');
        if (result) throw new Error('getSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return null if a non-existant id is passed', async () => {
      const result = await spellService.getSpell(99999);
      assert.isNull(result);
    });

    it('should return the correct spell for the given id', async () => {
      const result = await spellService.getSpell(spell.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'name', 'level', 'school', 'castingTime', 'range', 'components', 'duration', 'saveType', 'saveStillHalf', 'description', 'damages', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.id, spell.id);
      assert.equal(result.dataValues.name, spell.name);
      assert.equal(result.dataValues.school, spell.school);
    });
  });

  describe('updateSpell', () => {
    it('should throw an error if an invalid damages array is passed', async () => {
      try {
        const result = await spellService.updateSpell({
          id: spell.id,
          damages: '["valid json","invalid damages array"]',
        });
        if (result) throw new Error('updateSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: spell damages array must be an array of arrays');
      }
    });

    it('should update a spell if all valid fields are passed', async () => {
      await spellService.updateSpell({
        id: spell.id,
        name: 'water splash',
        description: waterSplash.description,
        damages: waterSplash.damages,
      });

      assert.lengthOf((await Spell.findAll()), expectedSpells);

      await spell.reload();

      assert.equal(spell.name, 'water splash');
    });
  });

  describe('deleteSpell', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await spellService.deleteSpell('invalid');
        if (result) throw new Error('createSpell should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return 0 if the id is non-existant', async () => {
      const result = await spellService.deleteSpell(99999);
      assert.equal(result, 0);
    });

    it('should delete the spell with the given id', async () => {
      await spellService.deleteSpell(spell.id);
      expectedSpells -= 1;
      assert.lengthOf((await Spell.findAll()), expectedSpells);
    });
  });
});
