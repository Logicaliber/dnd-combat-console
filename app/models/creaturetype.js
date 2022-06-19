const { Model } = require('sequelize');
const {
  incrementNumSuffix,
  isArrayOfStrings,
  isArrayOfLabeledDescriptions,
  isValidStat,
} = require('../services/validationHelpers');
const {
  MAX_ARRAY_LENGTH,
  MAX_DICE,
  VALID_HIT_DIE_SIZES,
  MIN_INFORMATION,
  MAX_INFORMATION,
} = require('../variables');

module.exports = (sequelize, DataTypes) => {
  class CreatureType extends Model {
    /**
     * @param {CreatureType} creatureType
     * @returns {Promise<CreatureType>} a copy of the given creatureType, with
     * `name` set to be the max + 1 over sibling instances.
     */
    static async cloneInstance(creatureType) {
      delete creatureType.id;

      creatureType.name = incrementNumSuffix(creatureType.name);

      // Return a copy of the creatureType after reloading the original creatureType in-place
      return CreatureType.scope('defaultScope').create({ ...creatureType.dataValues })
        .then(async (newCreatureType) => {
          await creatureType.reload();
          return newCreatureType.reload();
        });
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Armor, ActionPattern, Creature }) {
      // define association here
      CreatureType.hasMany(Creature, { foreignKey: 'creatureTypeId', as: 'creatures' });
      CreatureType.belongsTo(Armor, { foreignKey: 'armorId', as: 'armor' });
      CreatureType.hasMany(ActionPattern, { foreignKey: 'creatureTypeId', as: 'actionPatterns' });

      CreatureType.addScope('defaultScope', {
        include: [{
          model: ActionPattern.scope('defaultScope'),
          as: 'actionPatterns',
          order: [['priority', 'ASC']],
        }, {
          model: Armor,
          as: 'armor',
        }],
      });

      CreatureType.addScope('actionPatternIds', {
        include: [{
          model: ActionPattern.unscoped(),
          as: 'actionPatterns',
          attributes: { include: ['id'] },
        }],
      });
    }

    static optionsSchema = {
      // required, searchable, updateable
      name: sequelize.modelOptsObject(true, true, true),
      size: sequelize.modelOptsObject(false, true, true),
      type: sequelize.modelOptsObject(false, true, true),
      tags: sequelize.modelOptsObject(false, true, true),
      alignment: sequelize.modelOptsObject(false, true, true),
      armorId: sequelize.modelOptsObject(false, true, true),
      hasShield: sequelize.modelOptsObject(false, true, true),
      hitDie: sequelize.modelOptsObject(true, true, true),
      numDice: sequelize.modelOptsObject(true, true, true),
      maxHP: sequelize.modelOptsObject(true, true, true),
      speed: sequelize.modelOptsObject(false, true, true),
      flySpeed: sequelize.modelOptsObject(false, true, true),
      swimSpeed: sequelize.modelOptsObject(false, true, true),
      climbSpeed: sequelize.modelOptsObject(false, true, true),
      burrowSpeed: sequelize.modelOptsObject(false, true, true),
      hover: sequelize.modelOptsObject(false, true, true),
      str: sequelize.modelOptsObject(false, true, true),
      dex: sequelize.modelOptsObject(false, true, true),
      con: sequelize.modelOptsObject(false, true, true),
      int: sequelize.modelOptsObject(false, true, true),
      wis: sequelize.modelOptsObject(false, true, true),
      cha: sequelize.modelOptsObject(false, true, true),
      savingThrows: sequelize.modelOptsObject(false, true, true),
      skills: sequelize.modelOptsObject(false, true, true),
      resistances: sequelize.modelOptsObject(false, true, true),
      senses: sequelize.modelOptsObject(false, true, true),
      passivePerception: sequelize.modelOptsObject(false, true, true),
      languages: sequelize.modelOptsObject(false, true, true),
      challengeRating: sequelize.modelOptsObject(false, true, true),
      proficiencyBonus: sequelize.modelOptsObject(false, true, true),
      legendaryResistances: sequelize.modelOptsObject(false, true, true),
      specialAbilities: sequelize.modelOptsObject(false, true, true),
      spellcasting: sequelize.modelOptsObject(false, true, true),
      spellSlots: sequelize.modelOptsObject(false, true, true),
      innateSpells: sequelize.modelOptsObject(false, true, true),
      legendaryActions: sequelize.modelOptsObject(false, true, true),
      reactions: sequelize.modelOptsObject(false, true, true),
      lairActions: sequelize.modelOptsObject(false, true, true),
      regionalEffects: sequelize.modelOptsObject(false, true, true),
    };

    static allowedParams = Object.keys(this.optionsSchema);

    static requiredParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].required);

    static updateableParams = Object.keys(this.optionsSchema)
      .filter((key) => this.optionsSchema[key].updateable);
  }
  CreatureType.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    size: {
      defaultValue: 'medium',
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', null]],
          msg: 'creatureType size must be one of tiny, small, medium, large, huge, or gargantuan',
        },
      },
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
        isArrayOfAlignmentStrings: (array) => {
          if (array === null) return;
          isArrayOfStrings(array);
          if (typeof array === 'string') array = JSON.parse(array);
          if (array.length !== 2) throw new Error('alignment array must be length two');
          if (!(array[0] === 'chaotic' || array[0] === 'neutral' || array[0] === 'lawful')
            || !(array[1] === 'evil' || array[1] === 'neutral' || array[1] === 'good')
          ) {
            throw new Error('first alignment must be on ethical axis, second alignment on moral axis');
          }
        },
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
        isIn: [VALID_HIT_DIE_SIZES],
      },
    },
    numDice: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: MAX_DICE,
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
        isSavingThrowsObject: (object) => {
          if (object === null) return;
          if (typeof object === 'string') {
            object = JSON.parse(object);
          }
          const objectKeys = Object.keys(object);
          if (objectKeys.length !== 6
            || !objectKeys.includes('str')
            || !objectKeys.includes('dex')
            || !objectKeys.includes('str')
            || !objectKeys.includes('int')
            || !objectKeys.includes('wis')
            || !objectKeys.includes('cha')) throw new Error('saving throws object must contain each ability as a key');
          if (
            typeof object.str !== 'number'
            || object.str < 0 || object.str > 19
            || typeof object.dex !== 'number'
            || object.dex < 0 || object.dex > 19
            || typeof object.con !== 'number'
            || object.con < 0 || object.con > 19
            || typeof object.int !== 'number'
            || object.int < 0 || object.int > 19
            || typeof object.wis !== 'number'
            || object.wis < 0 || object.wis > 19
            || typeof object.cha !== 'number'
            || object.cha < 0 || object.cha > 19
            // 19: +10 from stat, +9 from proficiency
          ) throw new Error('saving throws must be numbers between 0 and 19');
        },
      },
    },
    skills: {
      type: DataTypes.JSON,
      validate: {
        isArrayOfSkillObjects: (array) => {
          if (array === null) return;
          if (typeof array === 'string') {
            array = JSON.parse(array);
          }
          if (!Array.isArray(array)) throw new Error('skill array must be an array');
          if (!array.length) throw new Error('skill array should not be length 0');
          if (array.length > MAX_ARRAY_LENGTH) throw new Error('maximum array length exceeded');
          array.forEach((object) => {
            if (typeof object !== 'object') throw new Error('skill array must contain objects');
            const objectKeys = Object.keys(object);
            if (
              objectKeys.length !== 2
              || !objectKeys.includes('skill')
              || !objectKeys.includes('value')
              || typeof object.skill !== 'string'
              || object.skill.length < MIN_INFORMATION
              || object.skill.length > MAX_INFORMATION
              || typeof object.value !== 'number'
              || object.skill.value < 0
              || object.skill.value > 28 // 10 from ability score, 18 from expertise
            ) throw new Error('skill array object must contain a skill, value pair');
          });
        },
      },
    },
    resistances: {
      type: DataTypes.JSON,
      validate: {
        isResistancesObject: (object) => {
          if (object === null) return;
          if (typeof object === 'string') {
            object = JSON.parse(object);
          }
          const objectKeys = Object.keys(object);
          if (objectKeys.length !== 6
            || !objectKeys.includes('resistant')
            || !objectKeys.includes('vulnerable')
            || !objectKeys.includes('immune')
          ) throw new Error('resistances object must have resistant, vulnerable, and immune as keys');
          isArrayOfStrings(object.resistant);
          isArrayOfStrings(object.vulnerable);
          isArrayOfStrings(object.immune);
        },
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
        /**
         * for example [0,5,2,0,0,0,0,0,0,0]
         * @param {Array} array
         * @throws
         */
        isSpellSlotArray: (array) => {
          if (array === null) return;
          if (typeof array === 'string') {
            array = JSON.parse(array);
          }
          if (!Array.isArray(array)) throw new Error('spell slot array must be an array');
          if (array.length !== 10) throw new Error('spell slot array should be length 10');
          if (array[0] !== 0) throw new Error('index 0 of spell slot array should be 0');
          array.forEach((number) => {
            if (typeof number !== 'number' || number < 0 || number > 10) {
              throw new Error('spell slot array must contain only numbers between 0 and 10');
            }
          });
        },
      },
    },
    innateSpells: {
      type: DataTypes.JSON,
      validate: {
        /**
         * innateSpell: {
         *   spellId: integer,
         *   perDay: [0-9], // perDay 0 => "at will"
         *   restrictions: string,
         * }
         * @param {Array} array
         * @throws
         */
        isInnateSpellArray: (array) => {
          if (array === null) return;
          if (typeof array === 'string') {
            array = JSON.parse(array);
          }
          if (!Array.isArray(array)) throw new Error('innate spell array must be an array');
          if (!array.length) throw new Error('innate spell array cannot be empty');
          if (array.length > MAX_ARRAY_LENGTH) throw new Error('maximum array length exceeded');
          array.forEach((innateSpell) => {
            if (typeof innateSpell !== 'object') throw new Error('innate spell array must be an array of objects');
            const objectKeys = Object.keys(innateSpell);
            if (
              objectKeys.length !== 3
              || !objectKeys.includes('spellId')
              || !objectKeys.includes('perDay')
              || !objectKeys.includes('restrictions')
              || typeof innateSpell.spellId !== 'number'
              || innateSpell.spellId < 1
              || typeof innateSpell.perDay !== 'number'
              || innateSpell.perDay < 0
              || typeof innateSpell.restrictions !== 'string'
              || innateSpell.restrictions.length > MAX_INFORMATION
            ) throw new Error('innate spell object must contain a spellId, a perDay, and a restrictions');
          });
        },
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
    scopes: {
      name(name) {
        return {
          attributes: { include: ['name'] },
          where: { name },
        };
      },
      armorId(armorId) {
        return {
          attributes: { include: ['armorId'] },
          where: { armorId },
        };
      },
    },
    sequelize,
    modelName: 'CreatureType',
    validate: {
      maxHPBoundedByHitDice: () => {
        if (this.maxHP > (this.numDice * (this.hitDie + ((this.con - 10) / 2)))) throw new Error('maxHP field cannot be greater than hit dice allow');
      },
    },
  });
  return CreatureType;
};
