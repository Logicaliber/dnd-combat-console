const { withTs } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const spells = withTs([{
      name: 'Acid Splash',
      level: 0,
      school: 'conjuration',
      castingTime: '1 action',
      range: 60,
      components: 'V, S',
      duration: 'instantaneous',
      saveType: 'dex',
      saveStillHalf: false,
      description: 'You hurl a bubble of acid. Choose one creature you can see within range, or choose two creatures you can see within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.\n\nAt Higher Levels. This spell\'s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)',
      damage: '[[{"caster":0,"slot":0,"die":6,"num":1}],[{"caster":5,"slot":0,"die":6,"num":2}],[{"caster":11,"slot":0,"die":6,"num":3}],[{"caster":17,"slot":0,"die":6,"num":4}]]',
    }]);
    await queryInterface.bulkInsert('Spells', spells, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Spells', null, {});
  },
};
