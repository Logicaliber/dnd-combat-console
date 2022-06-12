const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Password must contain at least one number, lowercase letter, uppercase letter,
     * one symbol, and be at least eight characters long.
     * @param {String} password
     * @returns Boolean
     */
    static validatePassword = (password) => {
      return typeof password === 'string'
        && /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password);
    };

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static optionsSchema = {
      // required, searchable, updateable
      email: sequelize.modelOptsObject(true, true, true),
      password: sequelize.modelOptsObject(true, false, false),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        // eslint-disable-next-line no-control-regex
        is: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
      },
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  }, {
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
    scopes: {
      email(email) {
        return {
          attributes: { include: ['email'] },
          where: { email },
        };
      },
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};
