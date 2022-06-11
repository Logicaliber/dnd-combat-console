const { withTs } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [weapons] = (await queryInterface.sequelize.query('SELECT * FROM "Weapons";'));
    // Create an action for each weapon, which is just attacking with that weapon once
    await queryInterface.bulkInsert('Actions', withTs(weapons.map((weapon) => {
      return {
        index: 0,
        weaponId: weapon.id,
        times: 1,
      };
    })));
    let [actions] = (await queryInterface.sequelize.query('SELECT * FROM "Actions";'));

    // Create an actionPattern for each action
    await queryInterface.bulkInsert('ActionPatterns', withTs(actions.map(() => {
      return { priority: 0 };
    })));

    // Update each existing action to point to a different actionPattern
    await Promise.allSettled(actions.map(async (action) => {
      // Setting the actionPatternId to the action's own id should accomplish this
      await queryInterface.sequelize.query(`UPDATE "Actions" SET "actionPatternId"=${action.id} WHERE id=${action.id};`);
    }));
    // Re-fetch the actions
    [actions] = (await queryInterface.sequelize.query('SELECT * FROM "Actions";'));

    // Update the existing creatureType to have the scimitar actionPattern
    const goblinId = (await queryInterface.sequelize.query('SELECT * FROM "CreatureTypes";'))[0][0].id;
    const [scimitarId] = weapons
      .filter((weapon) => weapon.name === 'scimitar')
      .map((weapon) => weapon.id);
    const [scimitarAction] = actions
      .filter((action) => action.weaponId === scimitarId);
    await queryInterface.sequelize.query(`UPDATE "ActionPatterns" SET "creatureTypeId"=${goblinId} WHERE "id"=${scimitarAction.actionPatternId};`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Actions', null, {});
    await queryInterface.bulkDelete('ActionPatterns', null, {});
  },
};
