const { Spell, CreatureTypeSpell } = require('../models');

module.exports = {
  /**
   * @param {Object} spellObject
   * @returns {Object} new Spell
   */
  createSpell: async (spellObject) => {
    const { count } = await Spell.findAndCountAll({
      where: {
        name: spellObject.name,
      },
    });
    if (count) throw new Error(`spell with name ${spellObject.name} already exists`);
    return Spell.create(spellObject);
  },

  /**
   * @param {Integer} spellId
   * @returns {Object} Spell
   */
  getSpell: async (spellId) => {
    return Spell.findByPk(spellId);
  },

  /**
   * @param {Object} spellObject
   * @returns {Object} updated Spell
   */
  updateSpell: async (spellObject) => {
    return Spell.update(spellObject, {
      where: {
        id: spellObject.id,
      },
    });
  },

  /**
   * @param {Integer} spellId
   */
  deleteSpell: async (spellId) => {
    const creatureTypeSpells = await CreatureTypeSpell.findAll({
      where: {
        spellId,
      },
    });
    await Promise.allSettled(creatureTypeSpells.map(async (creatureTypeSpell) => {
      creatureTypeSpell.destroy();
    }));
    return Spell.destroy({
      where: {
        id: spellId,
      },
    });
  },
};
