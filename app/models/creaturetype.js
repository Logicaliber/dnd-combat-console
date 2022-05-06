'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CreatureType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CreatureType.hasOne(models.Armor);
      CreatureType.hasMany(models.Creature);
      CreatureType.belongsTo(models.Armor); // "belonging" to an armor seems a bit odd, but this is just a semantic definition
      CreatureType.belongsToMany(models.Spell, { through: 'CreatureTypeSpell' });
      CreatureType.belongsToMany(models.Weapon, { through: 'CreatureTypeWeapon' });
      // We could potentially use a many-to-many relationship like this for innate spells or even weapons as well; look into later
    }
  }
  CreatureType.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    type: DataTypes.JSON,
    tags: DataTypes.JSON,
    alignment: DataTypes.JSON,
    hitDie: DataTypes.INTEGER,
    numDice: DataTypes.INTEGER,
    maxHP: DataTypes.INTEGER,
    hasShield: DataTypes.BOOLEAN,
    speed: DataTypes.INTEGER,
    flySpeed: DataTypes.INTEGER,
    swimSpeed: DataTypes.INTEGER,
    climbSpeed: DataTypes.INTEGER,
    burrowSpeed: DataTypes.INTEGER,
    hover: DataTypes.BOOLEAN,
    proficiencyBonus: DataTypes.INTEGER,
    challengeRating: DataTypes.INTEGER,
    resistances: DataTypes.JSON,
    passivePerception: DataTypes.INTEGER,
    senses: DataTypes.JSON,
    languages: DataTypes.JSON,
    actionPatterns: DataTypes.JSON,
    reactions: DataTypes.JSON,
    str: DataTypes.INTEGER,
    dex: DataTypes.INTEGER,
    con: DataTypes.INTEGER,
    int: DataTypes.INTEGER,
    wis: DataTypes.INTEGER,
    cha: DataTypes.INTEGER,
    size: DataTypes.STRING,
    skills: DataTypes.JSON,
    saves: DataTypes.JSON,
    spellcasting: DataTypes.STRING,
    innateSpells: DataTypes.JSON,
    spellSlots: DataTypes.JSON,
    legendaryActions: DataTypes.JSON,
    legendaryResistances: DataTypes.INTEGER,
    lairActions: DataTypes.JSON,
    regionalEffects: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'CreatureType',
  });
  return CreatureType;
};