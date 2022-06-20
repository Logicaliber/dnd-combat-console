const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Armor extends Model {
    /**
     * @param {Armor} armor
     * @returns {Promise<Armor>} a copy of the given armor with `${name} (copy)`.
     */
    static async cloneInstance(armor) {
      delete armor.id;
      armor.name = `${armor.name} (copy)`;
      // Return a copy of the armor after reloading the original armor in-place
      return Armor.scope('defaultScope').create({ ...armor.dataValues })
        .then(async (newArmor) => {
          await armor.reload();
          return newArmor.reload();
        });
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Armor.hasMany(models.CreatureType, { foreignKey: 'armorId', as: 'creatureTypes' });
    }

    static optionsSchema = {
      // required, searchable, updateable
      name: sequelize.modelOptsObject(true, true, true),
      type: sequelize.modelOptsObject(true, true, true),
      baseAC: sequelize.modelOptsObject(true, true, true),
      disadvantage: sequelize.modelOptsObject(false, true, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  Armor.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['light', 'medium', 'heavy', 'natural']],
          msg: 'armor type must be one of: light, medium, heavy, or natural',
        },
      },
    },
    baseAC: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    disadvantage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    scopes: {
      name(name) {
        return {
          attributes: { include: ['name'] },
          where: { name },
        };
      },
    },
    sequelize,
    modelName: 'Armor',
  });
  return Armor;
};
