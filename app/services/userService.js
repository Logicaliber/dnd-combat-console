const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} userObject
   * @returns {Object} new User
   */
  createUser: async (userObject) => {
    const strippedUser = stripInvalidParams(userObject, User.allowedParams);
    const missingParams = missingRequiredParams(strippedUser, User.requiredParams);
    if (missingParams.length) throw new Error(`User creation failed, fields missing: ${missingParams.join()}`);

    if ((await User.findAndCountAll({ where: { email: strippedUser.email } })).count) throw new Error(`user with email ${strippedUser.email} already exists`);

    const passwordIsValid = User.validatePassword(strippedUser.password);
    if (!passwordIsValid) throw new Error('password must contain at least one number, lowercase letter, uppercase letter, one symbol, and be at least eight characters long');

    const hashedPassword = await bcrypt.hash(strippedUser.password, 10);
    strippedUser.password = hashedPassword;
    return User.create(strippedUser);
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
    const strippedUser = stripInvalidParams(userObject, User.updateableParams);
    if (!Object.keys(strippedUser).length) throw new Error('User update failed, no valid update fields found');
    return User.update(strippedUser, { where: { id: userId } });
  },

  /**
   * @param {Integer} userId
   */
  deleteUser: async (userId) => {
    return User.destroy({ where: { id: userId } });
  },
};
