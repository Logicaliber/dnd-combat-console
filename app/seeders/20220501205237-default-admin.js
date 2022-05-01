'use strict';

const { timeStamps } = require('./helpers/seederHelpers');

module.exports = {
  async up (queryInterface, Sequelize) {

     await queryInterface.bulkInsert('Users', [{
      email: 'defaultAdmin@email.test',
      password: 'initPassToChange',
      ...timeStamps,
     }], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Users', null, {});
  }
};
