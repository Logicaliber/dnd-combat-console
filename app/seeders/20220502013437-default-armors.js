'use strict';

const { withTs } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const armors = withTs([{
      name: 'Padded', type: 'light', baseAC: 11, disadvantage: true,
     }, {
      name: 'Leather', type: 'light', baseAC: 11,
     }, {
      name: 'Studded Leather', type: 'light', baseAC: 12,
     }, {
      name: 'Hide', type: 'medium', baseAC: 12,
     }, {
      name: 'Chain Shirt', type: 'medium', baseAC: 13,
     }, {
      name: 'Scale Mail', type: 'medium', baseAC: 14, disadvantage: true,
     }, {
      name: 'Breastplate', type: 'medium', baseAC: 14,
     }, {
      name: 'Half Plate', type: 'medium', baseAC: 15, disadvantage: true,
     }, {
      name: 'Ring Mail', type: 'heavy', baseAC: 14, disadvantage: true,
     }, {
      name: 'Chain Mail', type: 'heavy', baseAC: 16, disadvantage: true,
     }, {
      name: 'Splint', type: 'heavy', baseAC: 17, disadvantage: true,
     }, {
      name: 'Plate', type: 'heavy', baseAC: 18, disadvantage: true,
     }]);

   await queryInterface.bulkInsert('Armors', armors, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Armors', null, {});
  }
};
