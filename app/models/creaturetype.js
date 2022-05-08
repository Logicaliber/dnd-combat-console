const { Model } = require('sequelize');

const {
  isArrayOfActionPatterns,
  isArrayOfAlignmentStrings,
  isArrayOfStrings,
  isArrayOfLabeledDescriptions,
  isArrayOfSkillObjects,
  isValidResistancesObject,
  isValidSavingThrowsObject,
  isValidSpellSlotArray,
  isValidInnateSpellArray,
  isValidStat,
} = require('../services/validationHelpers');

module.exports = (sequelize, DataTypes) => {
  class CreatureType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CreatureType.hasMany(models.Creature);
      CreatureType.belongsTo(models.Armor);
      CreatureType.belongsToMany(models.Spell, { through: models.CreatureTypeSpell });
      CreatureType.belongsToMany(models.Weapon, { through: models.CreatureTypeWeapon });
    }
  }
  CreatureType.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    size: {
      defaultValue: 'medium',
      type: DataTypes.STRING,
      in: [['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']],
    },
    type: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStrings,
      },
    },
    tags: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStrings,
      },
    },
    alignment: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfAlignmentStrings,
      },
    },
    armorId: DataTypes.INTEGER,
    hasShield: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    hitDie: {
      type: DataTypes.INTEGER,
      validate: {
        in: [[1, 4, 6, 8, 10, 12]],
      },
    },
    numDice: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },
    maxHP: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },
    speed: {
      defaultValue: 30,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    flySpeed: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    swimSpeed: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    climbSpeed: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    burrowSpeed: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    hover: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    str: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        isValidStat,
      },
    },
    dex: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        isValidStat,
      },
    },
    con: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        isValidStat,
      },
    },
    int: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        isValidStat,
      },
    },
    wis: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        isValidStat,
      },
    },
    cha: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        isValidStat,
      },
    },
    savingThrows: {
      type: DataTypes.JSON,
      validate: {
        isValidSavingThrowsObject,
      },
    },
    skills: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfSkillObjects,
      },
    },
    resistances: {
      type: DataTypes.JSON,
      validate: {
        isValidResistancesObject,
      },
    },
    senses: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStrings,
      },
    },
    passivePerception: {
      defaultValue: 10,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    languages: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfStrings,
      },
    },
    challengeRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: -3,
        max: 30,
      },
    },
    proficiencyBonus: {
      defaultValue: 2,
      type: DataTypes.INTEGER,
      validate: {
        min: 2,
        max: 9,
      },
    },
    legendaryResistances: {
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    specialAbilities: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfLabeledDescriptions,
      },
    },
    spellcasting: {
      type: DataTypes.STRING,
      validate: {
        in: [['int', 'wis', 'cha', null]],
      },
    },
    spellSlots: {
      type: DataTypes.JSON,
      validate: {
        isValidSpellSlotArray,
      },
    },
    innateSpells: {
      type: DataTypes.JSON,
      validate: {
        isValidInnateSpellArray,
      },
    },
    actionPatterns: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfActionPatterns,
      },
    },
    legendaryActions: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfLabeledDescriptions,
      },
    },
    reactions: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfLabeledDescriptions,
      },
    },
    lairActions: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfLabeledDescriptions,
      },
    },
    regionalEffects: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfLabeledDescriptions,
      },
    },
  }, {
    sequelize,
    modelName: 'CreatureType',
  });
  return CreatureType;
};
