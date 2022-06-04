const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

module.exports = {
  /**
   * @param {Object} userObject
   * @returns {Promise<User>} the new user
   */
  createUser: async (userObject) => {
    // Filter out disallowed params
    userObject = stripInvalidParams(userObject, User.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(userObject, User.requiredParams);
    if (missingParams.length) throw new Error(`User creation failed, fields missing: ${missingParams.join()}`);
    // Check that the provided email is unique
    if ((await User.findAndCountAll({ where: { email: userObject.email } })).count) throw new Error(`user with email ${userObject.email} already exists`);
    // Validate the password
    const passwordIsValid = User.validatePassword(userObject.password);
    if (!passwordIsValid) throw new Error('password must contain at least one number, lowercase letter, uppercase letter, one symbol, and be at least eight characters long');
    // Hash the password
    const hashedPassword = await bcrypt.hash(userObject.password, 10);
    userObject.password = hashedPassword;
    // Create the user
    return User.create(userObject);
  },

  /**
   * @param {Integer} userId
   * @returns {Promise<User>} the user
   */
  getUser: async (userId) => {
    return User.findByPk(userId);
  },

  /**
   * @param {Integer} userId
   * @param {Object} updateFields
   * @returns {Promise<User>} the updated user
   */
  updateUser: async (userId, updateFields) => {
    // Filter out non-updateable params
    updateFields = stripInvalidParams(updateFields, User.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('User update failed, no valid update fields found');
    // Check that the indicated user exists
    if (!(await User.findByPk(userId))) throw new Error(`User update failed, no user found with ID: ${userId}`);
    // Update the user
    return User.update(updateFields, { where: { id: userId } });
  },

  /**
   * @param {Integer} userId
   * @returns {Promise<1|0>} if the user was deleted
   */
  deleteUser: async (userId) => {
    // Check that the indicated user exists
    const user = await User.findByPk(userId);
    if (!user) throw new Error(`User deletion failed, no user found with ID: ${userId}`);
    // Delete the user
    return user.destroy();
  },
};
