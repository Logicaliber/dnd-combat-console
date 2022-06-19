const { withTs } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [weapons] = (await queryInterface.sequelize.query('SELECT * FROM "Weapons";'));
    const goblinId = (await queryInterface.sequelize.query('SELECT * FROM "CreatureTypes";'))[0][0].id;

    // Find the ID of the 'scimitar' weapon
    const [scimitarId] = weapons
      .filter((weapon) => weapon.name === 'scimitar')
      .map((weapon) => weapon.id);

    // Give the goblin one actionPattern, and find its ID
    await queryInterface.bulkInsert('ActionPatterns', withTs(
      [{ creatureTypeId: goblinId, priority: 0 }],
    ));
    const actionPatternId = (await queryInterface.sequelize.query('SELECT * FROM "ActionPatterns";'))[0][0].id;

    // Create one action for this actionPattern
    await queryInterface.bulkInsert('Actions', withTs([
      {
        actionPatternId,
        index: 0,
        weaponId: scimitarId,
        times: 1,
      },
    ]));
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Actions', null, {});
    await queryInterface.bulkDelete('ActionPatterns', null, {});
  },
};
