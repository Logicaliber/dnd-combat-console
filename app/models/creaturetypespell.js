const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CreatureTypeSpell extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CreatureTypeSpell.init({
    creatureTypeId: DataTypes.INTEGER,
    spellId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'CreatureTypeSpell',
  });
  return CreatureTypeSpell;
};
