const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CreatureTypeWeapon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CreatureTypeWeapon.init({
    creatureTypeId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    weaponId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'CreatureTypeWeapon',
  });
  return CreatureTypeWeapon;
};
