const bcrypt = require('bcryptjs');
const { timeStamps } = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash = await bcrypt.hash('initPassToChange', 10);
    await queryInterface.bulkInsert('Users', [{
      email: 'defaultAdmin@email.test',
      password: hash,
      ...timeStamps,
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
