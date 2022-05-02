'use strict';

const { timeStamps } = require('./helpers/seederHelpers');
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hash = await bcrypt.hash('initPassToChange', 10);
     await queryInterface.bulkInsert('Users', [{
      email: 'defaultAdmin@email.test',
      password: hash,
      ...timeStamps,
     }], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Users', null, {});
  }
};
