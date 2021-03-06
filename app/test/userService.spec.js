const { assert } = require('chai');
const bcrypt = require('bcryptjs');
const userService = require('../services/userService');
const { generateUser } = require('./helpers/modelGenerators');
const { syncModels } = require('./helpers/modelSync');

const { User } = require('../models');

const relevantModels = [User];

let existingUserEmail = null;
const validPassword = 'Valid$15Password';
const validEmail = 'email@email.test';
const secondValidEmail = 'second@email.test';
let expectedUsers = 0;
let user = null;

describe('User Service', () => {
  before(async () => {
    await syncModels(relevantModels);
    existingUserEmail = (await generateUser()).email;
    expectedUsers += 1;
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createUser', () => {
    it('Should throw an error if fields are missing', async () => {
      try {
        if (await userService.createUser({})) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User creation failed, fields missing: email,password');
      }
    });

    it('Should throw an error if an invalid password is passed', async () => {
      try {
        if (await userService.createUser({
          email: validEmail,
          password: 'invalid',
        })) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'password must contain at least one number, lowercase letter, uppercase letter, one symbol, and be at least eight characters long');
      }
    });

    it('Should throw an error if an invalid email is passed', async () => {
      try {
        if (await userService.createUser({
          email: 'email',
          password: validPassword,
        })) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation is on email failed');
      }
    });

    it('Should create a user if all valid fields are passed, hashing the password before creation, and return it without its password', async () => {
      user = await userService.createUser({
        email: validEmail,
        password: validPassword,
      });
      expectedUsers += 1;

      // Check that the returned instance does not have its password
      assert.hasAnyKeys(user, 'dataValues');
      const values = user.dataValues;
      assert.hasAllKeys(values, ['id', 'email', 'createdAt', 'updatedAt']);

      // Check that one user was created
      assert.lengthOf(await User.findAll(), expectedUsers);

      // Check that the password was hashed before creation
      user = await User.unscoped().findByPk(user.id);
      assert.notEqual(user.password, validPassword);
      assert(bcrypt.compareSync(validPassword, user.password));
    });

    it('Should throw an error if a duplicate user email is used', async () => {
      try {
        if (await userService.createUser({
          email: validEmail,
          password: validPassword,
        })) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User creation failed, a user with the given email already exists');
      }
    });
  });

  describe('getUser', () => {
    it('Should return null if an invalid id is passed', async () => {
      assert.isNull(await userService.getUser('invalid'));
      assert.isNull(await userService.getUser(99999));
    });

    it('Should return the correct user for the given id', async () => {
      const result = await userService.getUser(user.id);
      assert.hasAnyKeys(result, 'dataValues');
      const values = result.dataValues;
      // In particular, the password should not be here
      assert.hasAllKeys(values, ['id', 'email', 'createdAt', 'updatedAt']);
      assert.equal(values.id, user.id);
    });
  });

  describe('updateUser', () => {
    it('Should throw an error if an invalid userId is passed', async () => {
      try {
        if (await userService.updateUser('invalid', {
          email: secondValidEmail,
        })) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User update failed, no user found for the given ID');
      }
      try {
        if (await userService.updateUser(99999, {
          email: secondValidEmail,
        })) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User update failed, no user found for the given ID');
      }
    });

    it('Should throw an error if the new email is not unique', async () => {
      try {
        if (await userService.updateUser(user.id, {
          email: existingUserEmail,
        })) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User update failed, a user with the given email already exists');
      }
    });

    it('Should throw an error if an invalid email is passed', async () => {
      try {
        if (await userService.updateUser(user.id, {
          email: 'invalid email',
        })) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation is on email failed');
      }
    });

    it('Should not allow updating the password by this method', async () => {
      try {
        if (await userService.updateUser(user.id, {
          password: validPassword,
        })) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User update failed, no valid update fields found');
      }
    });

    it('Should update a user if all valid fields are passed', async () => {
      await userService.updateUser(user.id, {
        email: secondValidEmail,
      });
      // Check that the number of users hasn't changed
      assert.lengthOf((await User.findAll()), expectedUsers);
      // Check that the user was updated
      await user.reload();
      assert.equal(user.email, secondValidEmail);
    });
  });

  describe('deleteUser', () => {
    it('Should throw an error if an invalid id is passed', async () => {
      try {
        if (await userService.deleteUser('invalid')) throw new Error('deleteUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User deletion failed, no user found for the given ID');
      }
      try {
        if (await userService.deleteUser(99999)) throw new Error('deleteUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User deletion failed, no user found for the given ID');
      }
    });

    it('Should delete the user with the given id', async () => {
      await userService.deleteUser(user.id);
      expectedUsers -= 1;
      // Check that one user was deleted
      assert.lengthOf((await User.findAll()), expectedUsers);
    });
  });
});
