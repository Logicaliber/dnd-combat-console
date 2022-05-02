'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('Weapons', [{
    name: 'club',
    properties: `["light"]`,
    normalRange: 0,
    longRange: 0,
    attackShape: null,
    save: 0,
    saveType: null,
    saveHalf: null,
    damage: `[{"num":1,"die":4,"type":"bludgeoning"}]`,
   }, {
     // TODO: Rest of the weapons in the basic weapon list
   }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Weapons', null, {});
  }
};
