const { withIdAndTs } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const armors = withIdAndTs([{
      // id: 1
      name: 'Padded', type: 'light', baseAC: 11, disadvantage: true,
    }, {
      // id: 2
      name: 'Leather', type: 'light', baseAC: 11,
    }, {
      // id: 3
      name: 'Studded Leather', type: 'light', baseAC: 12,
    }, {
      // id: 4
      name: 'Hide', type: 'medium', baseAC: 12,
    }, {
      // id: 5
      name: 'Chain Shirt', type: 'medium', baseAC: 13,
    }, {
      // id: 6
      name: 'Scale Mail', type: 'medium', baseAC: 14, disadvantage: true,
    }, {
      // id: 7
      name: 'Breastplate', type: 'medium', baseAC: 14,
    }, {
      // id: 8
      name: 'Half Plate', type: 'medium', baseAC: 15, disadvantage: true,
    }, {
      // id: 9
      name: 'Ring Mail', type: 'heavy', baseAC: 14, disadvantage: true,
    }, {
      // id: 10
      name: 'Chain Mail', type: 'heavy', baseAC: 16, disadvantage: true,
    }, {
      // id: 11
      name: 'Splint', type: 'heavy', baseAC: 17, disadvantage: true,
    }, {
      // id: 12
      name: 'Plate', type: 'heavy', baseAC: 18, disadvantage: true,
    }]);
    await queryInterface.bulkInsert('Armors', armors, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Armors', null, {});
  },
};
