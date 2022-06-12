const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { missingRequiredParams, stripInvalidParams } = require('./validationHelpers');

// Declare scoped models
const UserId = (id) => User.scope({ method: ['id', id] });
const UserEmail = (email) => User.scope({ method: ['email', email] });

// Error message building blocks
const CREATE_FAIL = 'User creation failed,';
const UPDATE_FAIL = 'User update failed,';
const DELETE_FAIL = 'User deletion failed,';
const EMAIL_EXISTS = 'a user with the given email already exists';
const NO_USER = 'no user found for the given ID';
const PASSWORD_REQ = 'password must contain at least one number, lowercase letter, uppercase letter, one symbol, and be at least eight characters long';

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
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the provided email is unique
    if (await UserEmail(userObject.email).count()) {
      throw new Error(`${CREATE_FAIL} ${EMAIL_EXISTS}`);
    }
    // Validate the password
    if (!User.validatePassword(userObject.password)) throw new Error(PASSWORD_REQ);
    // Hash the password
    userObject.password = await bcrypt.hash(userObject.password, 10);
    // Create the user, and return it in its defaultScope
    return User.create(userObject)
      .then((user) => user.reload());
  },

  /**
   * @param {Integer} userId
   * @returns {Promise<User>} the user
   */
  getUser: async (userId) => {
    userId = parseInt(userId, 10);
    if (Number.isNaN(userId)) return null;
    return User.findByPk(userId);
  },

  /**
   * @param {Integer} userId
   * @param {Object} updateFields
   * @returns {Promise<User>} the updated user
   */
  updateUser: async (userId, updateFields) => {
    userId = parseInt(userId, 10);
    if (Number.isNaN(userId)) throw new Error(`${UPDATE_FAIL} ${NO_USER}`);
    // Filter out non-updateable params
    updateFields = stripInvalidParams(updateFields, User.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error('User update failed, no valid update fields found');
    // Check that the indicated user exists
    const user = await User.findByPk(userId);
    if (!user) throw new Error(`${UPDATE_FAIL} ${NO_USER}`);
    // If the email is being updated, check that it is still unique
    const { email } = updateFields;
    if (email !== undefined && email !== user.email && await UserEmail(email).count()) {
      throw new Error(`${UPDATE_FAIL} ${EMAIL_EXISTS}`);
    }
    // Update the user
    return user.set(updateFields).save();
  },

  /**
   * @param {Integer} userId
   * @returns {Promise<0 | 1>} 1 if the user was deleted
   */
  deleteUser: async (userId) => {
    userId = parseInt(userId, 10);
    if (Number.isNaN(userId)) throw new Error(`${DELETE_FAIL} ${NO_USER}`);
    // Check that the indicated user exists
    const user = await UserId(userId).findOne();
    if (!user) throw new Error(`${DELETE_FAIL} ${NO_USER}`);
    // Delete the user
    return user.destroy();
  },
};
