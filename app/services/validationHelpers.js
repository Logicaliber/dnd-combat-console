module.exports = {
  MIN_DICE: 0,
  MAX_DICE: 20,
  MAX_DIE_SIZE: 12,
  MIN_DIE_SIZE: 0,
  MIN_INFORMATION: 4,
  MAX_INFORMATION: 50,
  MIN_DESCRIPTION: 8,
  MAX_DESCRIPTION: 500,

  /**
   * for example ['ammunition','heavy','loading','two-handed']
   */
  isArrayOfAlphabeticalStrings(array) {
    if (array === null) return;
    module.exports.isArrayOfStrings(array, true);
  },

  /**
   * specialAbilities, reactions, etc. [{
   *   label: string,
   *   description: string
   * }]
   * @param {Array} array
   * @throws
   */
  isArrayOfLabeledDescriptions(array) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    if (!array.isArray()) throw new Error('array must be an array');
    if (array.length <= 0) throw new Error('array should not be length 0');
    array.forEach((object) => {
      if (typeof object !== 'object') throw new Error('array must contain objects');
      const objectKeys = Object.keys(object);
      if (
        objectKeys.length !== 2
        || !objectKeys.includes('title')
        || !objectKeys.includes('description')
      ) throw new Error('array object must contain a title, description pair');
      if (typeof object.title !== 'string' || typeof object.description !== 'string') throw new Error('title and description must be strings');
    });
  },

  isArrayOfStrings(array, alphabetical = false) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    let prevLetter = 'a';
    if (!array.isArray()) throw new Error('array must be an array');
    if (array.length <= 0) throw new Error('array should not be length 0');
    array.forEach((element) => {
      if (typeof element !== 'string' || !/^ [a_z]$ /.test(element)) throw new Error('array elements must be strings of lowercase letters');
      if (alphabetical) {
        if (element.charAt(0) < prevLetter) throw new Error('array must be in alphabetical order');
        prevLetter = element.charAt(0);
      }
    });
  },

  /**
   *  damage {
   *    num: [0,i],                 // if 0, damage is 0.
   *    die: [1,2,...,12],          // Size of dice to roll
   *    bonus: [0,3],               // Any bonus to the damage.
   *    type: string,               // if '', damage is 0.
   *    effect: string,             // 'stunned for 1 round'.
   *      --  below are optional --
   *    damageRequirement: string,  // any requirements for the damage.
   *    requirement: string,        // any requirements for the effect.
   *    save: [0,10,11,...,30],     // The save DC the target need to pass to prevent the effect.
   *    saveType: string,           // One of 'str', 'dex', ... , 'cha'.
   *    saveStillHalf: false,       // Local override if negation of Weapon or Spell .saveStillHalf
   *  }
   */
  isDamageObject(object) {
    if (typeof object !== 'object') throw new Error('damages must be an array of objects');
    const objectKeys = Object.keys(object);
    if (
      !objectKeys.includes('num')
      || !objectKeys.includes('die')
      || !objectKeys.includes('bonus')
      || !objectKeys.includes('type')
      || !objectKeys.includes('effect')) throw new Error('damage object must have keys num, die, bonus, type, and effect');
    if (
      typeof object.num !== 'number'
      || !([...Array(this.MAX_DICE + 1).keys()]
        .includes(object.num))
      || typeof object.die !== 'number'
      || !([...Array(this.MAX_DIE_SIZE + 1).keys()]
        .includes(object.die))
      || typeof object.bonus !== 'number'
      || !([...Array(4).keys()]
        .includes(object.bonus))
      || typeof object.type !== 'string'
      || object.type.length < this.MIN_INFORMATION
      || object.type.length > this.MAX_INFORMATION
      || typeof object.effect !== 'string'
      || object.effect.length < this.MIN_INFORMATION
      || object.effect.length > this.MAX_INFORMATION
    ) {
      throw new Error(`damage object ${JSON.stringify(object)} failed validation`);
    }
  },

  isValidStat(num) {
    if (typeof num !== 'number') throw new Error('stats must be numbers');
    if (num < 0 || num > 30) throw new Error('stats must be greater than 0 and no greater than 30');
  },
};
