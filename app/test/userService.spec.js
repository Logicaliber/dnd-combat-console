const { assert } = require('chai');
const bcrypt = require('bcryptjs');

const { User } = require('../models');
const userService = require('../services/userService');
const { syncModels } = require('./helpers/modelSync');

const relevantModels = [User];

const validPassword = 'Valid$15Password';
const validEmail = 'email@email.test';
const secondValidEmail = 'second@email.test';
let expectedUsers = 0;
let user = null;

describe('User Service', () => {
  before(async () => {
    await syncModels(relevantModels);
  });

  after(async () => {
    await syncModels(relevantModels);
  });

  describe('createUser', () => {
    it('should throw an error if fields are missing', async () => {
      try {
        const result = await userService.createUser({});
        if (result) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User creation failed, fields missing: email,password');
      }
    });

    it('should throw an error if an invalid password is passed', async () => {
      try {
        const result = await userService.createUser({
          email: validEmail,
          password: 'invalid',
        });
        if (result) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'password must contain at least one number, lowercase letter, uppercase letter, one symbol, and be at least eight characters long');
      }
    });

    it('should throw an error if an invalid email is passed', async () => {
      try {
        const result = await userService.createUser({
          email: 'email',
          password: validPassword,
        });
        if (result) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation is on email failed');
      }
    });

    it('should create a user if all valid fields are passed', async () => {
      user = await userService.createUser({
        email: validEmail,
        password: validPassword,
      });
      expectedUsers += 1;
      assert.lengthOf((await User.findAll()), expectedUsers);
    });

    it('should hash the users password', async () => {
      await user.reload();
      assert.notEqual(user.dataValues.password, validPassword);
      assert(bcrypt.compareSync(validPassword, user.dataValues.password));
    });

    it('should throw an error if a duplicate user name is used', async () => {
      try {
        const result = await userService.createUser({
          email: validEmail,
          password: validPassword,
        });
        if (result) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, `user with email ${validEmail} already exists`);
      }
    });
  });

  describe('getUser', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await userService.getUser('invalid');
        if (result) throw new Error('getUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return null if a non-existant id is passed', async () => {
      const result = await userService.getUser(99999);
      assert.isNull(result);
    });

    it('should return the correct user for the given id', async () => {
      const result = await userService.getUser(user.id);
      assert.hasAnyKeys(result, 'dataValues');
      assert.hasAllKeys(result.dataValues, ['id', 'email', 'password', 'createdAt', 'updatedAt']);
      assert.equal(result.dataValues.email, user.dataValues.email);
      assert.equal(result.dataValues.password, user.dataValues.password);
    });
  });

  describe('updateUser', () => {
    it('should throw an error if an invalid email is passed', async () => {
      try {
        const result = await userService.updateUser(user.dataValues.id, {
          email: 'email',
        });
        if (result) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'Validation error: Validation is on email failed');
      }
    });

    it('should not allow updating the password by this method', async () => {
      try {
        const result = await userService.updateUser(user.dataValues.id, {
          password: validPassword,
        });
        if (result) throw new Error('updateUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'User update failed, no valid update fields found');
      }
    });

    it('should update a user if all valid fields are passed', async () => {
      await userService.updateUser(user.dataValues.id, {
        email: secondValidEmail,
      });
      assert.lengthOf((await User.findAll()), expectedUsers);
      await user.reload();
      assert.equal(user.dataValues.email, secondValidEmail);
    });
  });

  describe('deleteUser', () => {
    it('should throw an error if an invalid id is passed', async () => {
      try {
        const result = await userService.deleteUser('invalid');
        if (result) throw new Error('createUser should have thrown an error');
      } catch (error) {
        assert.equal(error.message, 'invalid input syntax for type integer: "invalid"');
      }
    });

    it('should return 0 if the id is non-existant', async () => {
      const result = await userService.deleteUser(99999);
      assert.equal(result, 0);
    });

    it('should delete the user with the given id', async () => {
      await userService.deleteUser(user.dataValues.id);
      expectedUsers -= 1;
      assert.lengthOf((await User.findAll()), expectedUsers);
    });
  });
});
