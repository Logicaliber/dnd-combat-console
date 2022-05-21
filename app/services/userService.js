const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { missingRequiredParams, nonUpdateableParams } = require('./serviceHelpers');

module.exports = {
  /**
   * @param {Object} userObject
   * @returns {Object} new User
   */
  createUser: async (userObject) => {
    const missingParams = missingRequiredParams(userObject, User.optionsSchema);
    if (missingParams.length) throw new Error(`User creation failed, fields missing: ${missingParams.join()}`);

    if ((await User.findAndCountAll({
      where: {
        email: userObject.email,
      },
    })).count) throw new Error(`user with email ${userObject.email} already exists`);

    const passwordIsValid = User.validatePassword(userObject.password);
    if (!passwordIsValid) throw new Error('password must contain at least one number, lowercase letter, uppercase letter, one symbol, and be at least eight characters long');

    const hashedPassword = await bcrypt.hash(userObject.password, 10);
    userObject.password = hashedPassword;
    return User.create(userObject);
  },

  /**
   * @param {Integer} userId
   * @returns {Object} User
   */
  getUser: async (userId) => {
    return User.findByPk(userId);
  },

  /**
   * @param {Integer} userId
   * @param {Object} userObject
   * @returns {Object} updated User
   */
  updateUser: async (userId, userObject) => {
    const badParams = nonUpdateableParams(userObject, User.optionsSchema);
    if (badParams.length) throw new Error(`User update failed, fields are not updateable: ${badParams.join()}`);
    return User.update(userObject, {
      where: {
        id: userId,
      },
    });
  },

  /**
   * @param {Integer} userId
   */
  deleteUser: async (userId) => {
    return User.destroy({
      where: {
        id: userId,
      },
    });
  },
};
