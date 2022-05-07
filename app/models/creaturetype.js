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
      CreatureType.belongsToMany(models.Spell, { through: models.CreatureTypeSpell });
      CreatureType.belongsToMany(models.Weapon, { through: models.CreatureTypeWeapon });
      // We could potentially use a many-to-many relationship like this for innate spells or even weapons as well; look into later
    }
  }
  CreatureType.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    size: {
      type: DataTypes.STRING,
      defaultValue: 'medium'
    },
    type: DataTypes.JSON,
    tags: DataTypes.JSON,
    alignment: DataTypes.JSON,
    armorId: DataTypes.INTEGER,
    hasShield: DataTypes.BOOLEAN,
    hitDie: DataTypes.INTEGER,
    numDice: DataTypes.INTEGER,
    maxHP: DataTypes.INTEGER,
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    flySpeed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    swimSpeed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    climbSpeed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    burrowSpeed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    hover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    str: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    dex: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    con: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    int: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    wis: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    cha: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    savingThrows: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    skills: DataTypes.JSON,
    resistances: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    senses: DataTypes.JSON,
    passivePerception: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    languages: DataTypes.JSON,
    challengeRating: DataTypes.INTEGER,
    proficiencyBonus: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    legendaryResistances: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    specialAbilities: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    spellcasting: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    spellSlots: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    innateSpells: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    actionPatterns: DataTypes.JSON,
    legendaryActions: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    reactions: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    lairActions: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    regionalEffects: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: 'CreatureType',
  });
  return CreatureType;
};