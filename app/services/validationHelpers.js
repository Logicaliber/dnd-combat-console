const {
  MAX_ARRAY_LENGTH,
  MAX_DICE,
  MIN_INFORMATION,
  MAX_INFORMATION,
  MIN_DESCRIPTION,
  MAX_DESCRIPTION,
  VALID_DIE_SIZES,
} = require('../variables/index');

module.exports = {
  /**
   * @param {Object} inputObject
   * @param {Array<String>} allowedParams
   * @returns {Object} strippedInputObject
   */
  stripInvalidParams: (inputObject, allowedParams) => {
    const strippedInputObject = {};
    Object.keys(inputObject).forEach((key) => {
      if (allowedParams.includes(key)) strippedInputObject[key] = inputObject[key];
    });
    return strippedInputObject;
  },
  /**
   * @param {Object} inputObject
   * @param {Array<String>} requiredParams
   * @returns {Array<String>}
   */
  missingRequiredParams: (inputObject, requiredParams) => {
    return requiredParams.filter((key) => !{}.hasOwnProperty.call(inputObject, key));
  },
  /**
   * specialAbilities, reactions, etc. [{
   *   label: string,
   *   description: string
   * }]
   * @param {Array|String} array
   * @throws
   */
  isArrayOfLabeledDescriptions: (array) => {
    if (array === null) return;
    if (typeof array === 'string') array = JSON.parse(array);
    if (!Array.isArray(array)) throw new Error('labelled description array must be an array');
    if (!array.length) throw new Error('labelled description array should not be length 0');
    array.forEach((object) => {
      if (typeof object !== 'object') throw new Error('labelled description array must contain objects');
      const objectKeys = Object.keys(object);
      if (objectKeys.length !== 2
        || !objectKeys.includes('label')
        || !objectKeys.includes('description')
      ) throw new Error(`labelled description object must have keys label and description, got ${JSON.stringify(objectKeys)}`);
      if (typeof object.label !== 'string'
        || object.label.length < MIN_INFORMATION
        || object.label.length > MAX_INFORMATION
      ) throw new Error(`label must be a string between ${MIN_INFORMATION} and ${MAX_INFORMATION} characters, got type ${typeof object.label}`);
      if (typeof object.description !== 'string'
        || object.description.length < MIN_DESCRIPTION
        || object.description.length > MAX_DESCRIPTION
      ) throw new Error(`description must be a string between ${MIN_DESCRIPTION} and ${MAX_DESCRIPTION} characters, got type ${typeof object.description}`);
    });
  },

  /**
   * Only allows single-word strings, no spaces or characters other than '-'
   * @param {Array|String} array
   * @param {Boolean} alphabetical
   * @throws
   */
  isArrayOfStrings: (array, alphabetical = false) => {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    let prevLetter = 'a';
    if (!Array.isArray(array)) throw new Error('array must be an array');
    if (!array.length) throw new Error('array should not be length 0');
    if (array.length > MAX_ARRAY_LENGTH) throw new Error('maximum array length exceeded');
    array.forEach((element) => {
      if (
        typeof element !== 'string'
        || !/^[a-z-]+$/.test(element)
        || element.length < MIN_INFORMATION
        || element.length > MAX_INFORMATION
      ) throw new Error(`array elements must be strings of ${MIN_INFORMATION} to ${MAX_INFORMATION} characters, and only lowercase letters or dashes`);
      if (alphabetical) {
        if (element.charAt(0) < prevLetter) throw new Error('array must be in alphabetical order');
        prevLetter = element.charAt(0);
      }
    });
  },

  /**
   * for example ['ammunition','heavy','loading','two-handed']
   */
  isArrayOfStringsAlphabetical: (array) => {
    if (array === null) return;
    module.exports.isArrayOfStrings(array, true);
  },

  /**
   * isDamageObject
   * @param {Object|String} damage {
   *    num: [0,i],                 // if 0, damage is 0.
   *    die: [1,2,...,12],          // Size of dice to roll
   *    bonus: [0,3],               // Any bonus to the damage.
   *    type: string,               // if '', damage is 0.
   *    effect: string,             // 'stunned for 1 round'.
   *      --  below are optional --
   *    damageRequirement: string,  // any requirements for the damage.
   *    effectRequirement: string,  // any requirements for the effect.
   *    save: [0,10,11,...,30],     // The save DC the target need to pass to prevent the effect.
   *    saveType: string,           // One of 'str', 'dex', ... , 'cha'.
   *    saveStillHalf: false,       // Local override if negation of Weapon or Spell .saveStillHalf
   *  }
   * @throws
   *
   * If 'effect' is an empty string, AND save is non-zero, AND saveType not an empty string,
   * then the save is for avoiding the damage, rather than the effect
   */
  isDamageObject: (object) => {
    if (typeof object !== 'object') throw new Error(`damage object must be an object, got type ${typeof object}`);
    const objectKeys = Object.keys(object);

    if (!objectKeys.includes('num')
      || !objectKeys.includes('die')
      || !objectKeys.includes('bonus')
      || !objectKeys.includes('type')
      || !objectKeys.includes('effect')
    ) throw new Error('damage object must have keys num, die, bonus, type, and effect');

    if (typeof object.num !== 'number'
      || !([...Array(MAX_DICE + 1).keys()].includes(object.num))
    ) throw new Error(`damage.num must be a number between 0 and MAX_DICE, got type ${typeof object.num}`);

    if (typeof object.die !== 'number'
      || !(VALID_DIE_SIZES.includes(object.die))
    ) throw new Error(`damage.die must be a number in ${JSON.stringify(VALID_DIE_SIZES)}, got type ${typeof object.die}`);

    if (typeof object.bonus !== 'number'
      || !([0, 1, 2, 3].includes(object.bonus))
    ) throw new Error(`damage.bonus must be a number between 0 and 3, got type ${typeof object.bonus}`);

    if (typeof object.type !== 'string'
      || object.type.length > MAX_INFORMATION
    ) throw new Error('damage.type must be a string');

    if (typeof object.effect !== 'string'
      || object.effect.length > MAX_INFORMATION
    ) throw new Error('damage.effect must be a string');
  },

  isValidStat: (num) => {
    if (typeof num !== 'number') throw new Error('stats must be numbers');
    if (num < 0 || num > 30) throw new Error('stats must be greater than 0 and no greater than 30');
  },
};
