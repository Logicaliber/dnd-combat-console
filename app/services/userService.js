const bcrypt = require('bcryptjs');
const { User } = require('../models');

module.exports = {
  /**
   * @param {Object} userObject
   * @returns {Object} new User
   */
  createUser: async (userObject) => {
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
   * @param {Object} userObject
   * @returns {Object} updated User
   */
  updateUser: async (userObject) => {
    // TODO Build out proper field restrictions (required, updateable, searchable)
    if (userObject.password) throw new Error('fields were not updateable: password');
    return User.update(userObject, {
      where: {
        id: userObject.id,
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
