const { normalizedCR, withTs } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const creatureTypes = withTs([{
      name: 'goblin',
      size: 'small',
      type: '["humanoid"]',
      tags: '["goblinoid"]',
      alignment: '["neutral","evil"]',
      armorId: 2, // Leather
      hasShield: true,
      hitDie: 6,
      numDice: 2,
      maxHP: 7,
      speed: 30,
      str: 8,
      dex: 14,
      con: 10,
      int: 10,
      wis: 8,
      cha: 8,
      skills: '[{"skill":"stealth","value":6}]',
      senses: '["darkvision 60ft"]',
      passivePerception: 9,
      languages: '["common","goblin"]',
      challengeRating: normalizedCR('1/4'),
      specialAbilities: '[{"name":"Nimble Escape","value":"The goblin can take the Disengage or Hide action as a bonus action on each of its turns."}]',
    }]);

    await queryInterface.bulkInsert('CreatureTypes', creatureTypes, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CreatureTypes', null, {});
  },
};
